'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { type BaseBranchId, type Trader, type ParsedTraderData, type BulkDeleteTradersResult, getBranchInfo, type BranchInfo, type BranchLoginId } from "@/types";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TraderTableClient } from "@/components/dashboard/TraderTableClient";
import type { z } from 'zod';
import type { traderFormSchema } from '@/components/dashboard/TraderForm';
import { useToast } from "@/hooks/use-toast";
import { getTradersAction, addTraderAction, updateTraderAction, deleteTraderAction, bulkAddTradersAction, bulkDeleteTradersAction } from './actions';
import { Users, Flame, UserPlus, Loader2 } from 'lucide-react';

type TraderFormValues = z.infer<typeof traderFormSchema>;

function StatCard({ title, value, icon: Icon, description, iconBgColor }: { title: string, value: string | number, icon: React.ElementType, description: string, iconBgColor: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">{title}</CardTitle>
                <div className={`rounded-full p-1.5 ${iconBgColor}`}>
                  <Icon className="h-4 w-4 text-primary-foreground" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

export default function TradeHunterDashboardPage() {
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [nameFilter, setNameFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const currentBaseBranchId = useMemo(() => branchInfo?.baseBranchId, [branchInfo]);
  const currentUserRole = useMemo(() => branchInfo?.role, [branchInfo]);

  const fetchTraders = useCallback(async () => {
    if (!currentBaseBranchId) return;
    setIsLoading(true);
    try {
      const result = await getTradersAction(currentBaseBranchId);
      if (result && result.data) {
        setTraders(result.data);
      } else {
        setTraders([]);
        toast({ 
          variant: "destructive", 
          title: "Error Fetching Data", 
          description: result?.error || "Could not load trader data for an unknown reason.",
          duration: 10000,
        });
      }
    } catch (error: any) {
      console.error("Error fetching traders:", error);
      setTraders([]);
      const errorMessage = error?.message || "An unknown client error occurred.";
      toast({ variant: "destructive", title: "Client Error", description: `Could not get traders. Reason: ${errorMessage}` });
    } finally {
      setIsLoading(false);
    }
  }, [toast, currentBaseBranchId]);

  useEffect(() => {
    const initializeDashboard = () => {
      const storedLoggedInId = localStorage.getItem('loggedInId') as BranchLoginId | null;
      const info = getBranchInfo(storedLoggedInId);
      setBranchInfo(info);
      
      if (info && info.baseBranchId) {
          // fetchTraders will be called by the next useEffect
      } else {
          setIsLoading(false);
      }
    };
    initializeDashboard();
  }, []);

  useEffect(() => {
      if (currentBaseBranchId) {
          fetchTraders();
      }
  }, [currentBaseBranchId, fetchTraders]);
  
  const mainCategories = useMemo(() => {
    const categories = new Set(traders.map(t => t.mainCategory).filter(Boolean));
    return Array.from(categories) as string[];
  }, [traders]);

  const filteredTraders = useMemo(() => {
    return traders
      .filter(trader => {
        const lowerCaseSearch = nameFilter.toLowerCase();
        
        const nameMatch = trader.name?.toLowerCase().includes(lowerCaseSearch) || false;
        const ownerMatch = trader.ownerName?.toLowerCase().includes(lowerCaseSearch) || false;
        const descriptionMatch = trader.description?.toLowerCase().includes(lowerCaseSearch) || false;
        const categoryMatch = categoryFilter === 'all' || trader.mainCategory === categoryFilter;

        return (nameMatch || ownerMatch || descriptionMatch) && categoryMatch;
      });
  }, [traders, nameFilter, categoryFilter]);

  const stats = useMemo(() => {
    const activeTraders = traders.filter(t => t.status === 'Active').length;
    const hotLeads = traders.filter(t => t.status === 'Call-Back').length;
    const newLeads = traders.filter(t => t.status === 'New Lead').length;
    return { activeTraders, hotLeads, newLeads };
  }, [traders]);


  const handleAdd = async (values: TraderFormValues): Promise<boolean> => {
    if (!currentBaseBranchId || currentUserRole === 'unknown') {
      toast({ variant: "destructive", title: "Error", description: "Cannot add trader: Invalid Branch ID or Role." });
      return false;
    }
    const result = await addTraderAction(currentBaseBranchId, values);
    if (result && result.data) {
      await fetchTraders();
      toast({ title: "Success", description: `${result.data.name} added.`});
      return true;
    }
    toast({ variant: "destructive", title: "Error Adding Trader", description: result?.error || "Failed to add trader." });
    return false;
  };

  const handleUpdate = async (traderId: string, values: TraderFormValues): Promise<boolean> => {
     if (!currentBaseBranchId || currentUserRole === 'unknown') {
      toast({ variant: "destructive", title: "Error", description: "Cannot update trader: Invalid Branch ID or Role." });
      return false;
    }
    const result = await updateTraderAction(currentBaseBranchId, traderId, values);
    if (result && result.data) {
      await fetchTraders();
      toast({ title: "Success", description: `${result.data.name} updated.`});
      return true;
    }
    toast({ variant: "destructive", title: "Error Updating Trader", description: result?.error || "Failed to update trader." });
    return false;
  };

  const handleDelete = async (traderId: string): Promise<boolean> => {
     if (!currentBaseBranchId || currentUserRole === 'unknown') {
      toast({ variant: "destructive", title: "Error", description: "Cannot delete trader: Invalid Branch ID or Role." });
      return false;
    }
    const result = await deleteTraderAction(currentBaseBranchId, traderId);
    if (result && result.success) {
      await fetchTraders();
      toast({ title: "Success", description: "Trader deleted." });
      return true;
    } else {
       toast({ variant: "destructive", title: "Error Deleting Trader", description: result?.error || "Failed to delete trader." });
       return false;
    }
  };

 const handleBulkAdd = async (tradersToCreate: ParsedTraderData[]): Promise<{ data: Trader[] | null; error: string | null; }> => {
    if (!currentBaseBranchId || currentUserRole === 'unknown') {
      const error = "Invalid or missing Branch ID/Role.";
      toast({ variant: "destructive", title: "Bulk Add Failed", description: error });
      return { data: null, error };
    }
    
    const result = await bulkAddTradersAction(currentBaseBranchId, tradersToCreate); 
    
    if (!result) {
        const error = "Bulk add operation failed unexpectedly.";
        toast({ variant: "destructive", title: "Bulk Upload Failed", description: error, duration: 10000 });
        return { data: null, error };
    }

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Bulk Upload Failed",
        description: result.error,
        duration: 10000,
      });
      return { data: null, error: result.error };
    }
    
    if (result.data) { 
      const newCount = result.data?.length || 0;
      const skippedCount = tradersToCreate.length - newCount;
      let summaryMessages = [];
      if (newCount > 0) summaryMessages.push(`${newCount} new trader(s) added successfully.`);
      if (skippedCount > 0) summaryMessages.push(`${skippedCount} trader(s) were skipped as duplicates.`);
      if (summaryMessages.length === 0) summaryMessages.push("No new traders were added. They may already exist.");

      toast({
          title: "Bulk Upload Processed",
          description: <div className="flex flex-col gap-1">{summaryMessages.map((msg, i) => <span key={i}>{msg}</span>)}</div>,
          duration: 10000,
      });
      await fetchTraders(); 
    } 
    return { data: result.data, error: result.error };
  };

  const handleBulkDelete = async (traderIds: string[]): Promise<BulkDeleteTradersResult> => {
    if (!currentBaseBranchId || currentUserRole === 'unknown') {
      return { successCount: 0, failureCount: traderIds.length, error: "Invalid or missing Branch ID/Role." };
    }
    const result = await bulkDeleteTradersAction(currentBaseBranchId, traderIds);
    if (!result) {
        toast({ variant: "destructive", title: "Error", description: "Bulk delete operation failed." });
        return { successCount: 0, failureCount: traderIds.length, error: "Bulk delete operation failed." };
    }
    if (result.successCount > 0) {
      await fetchTraders();
    }
    toast({
        title: "Bulk Delete Processed",
        description: `${result.successCount} traders deleted successfully. ${result.failureCount} failed.`,
    });
    return result;
  };

  if (isLoading) { 
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (currentUserRole === 'manager' && !currentBaseBranchId) {
    return (
      <div className="space-y-6">
          <Card>
              <CardHeader>
                  <CardTitle>Manager View</CardTitle>
                  <CardDescription>To view and manage a branch's traders, please log out and sign in with a specific branch ID.</CardDescription>
              </CardHeader>
              <CardContent>
                  <p>As a manager, you have access rights, but you must select a branch context to see its data.</p>
              </CardContent>
          </Card>
      </div>
    )
  }
  
  if (!currentBaseBranchId && !isLoading) { 
      return (
        <Card>
            <CardHeader>
                <CardTitle>Access Error</CardTitle>
                <CardDescription>Could not determine your branch. Please try logging out and signing in again.</CardDescription>
            </CardHeader>
        </Card>
      );
  }
  
  return (
    <div className="space-y-4 md:space-y-6"> 
        <div className="grid gap-4 md:grid-cols-3">
            <StatCard 
                title="Active Traders" 
                value={stats.activeTraders} 
                icon={Users}
                description="Total traders with 'Active' status"
                iconBgColor="bg-primary"
            />
            <StatCard 
                title="Hot Leads" 
                value={stats.hotLeads} 
                icon={Flame}
                description="Traders marked for immediate 'Call-Back'"
                iconBgColor="bg-orange-500"
            />
            <StatCard 
                title="New Leads" 
                value={stats.newLeads} 
                icon={UserPlus}
                description="Recently identified traders to be qualified"
                iconBgColor="bg-blue-500"
            />
        </div>

        <TraderTableClient
            traders={filteredTraders}
            branchId={currentBaseBranchId!}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onBulkAdd={handleBulkAdd}
            onBulkDelete={handleBulkDelete}
            nameFilter={nameFilter}
            setNameFilter={setNameFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            mainCategories={mainCategories}
            isLoading={isLoading}
            existingTraders={traders}
        />
    </div>
  );
}
