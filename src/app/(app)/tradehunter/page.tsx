
"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { type BaseBranchId, type Trader, type ParsedTraderData, type BulkDeleteTradersResult, getBranchInfo, type BranchInfo, type BranchLoginId } from "@/types";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TraderTableClient } from "@/components/dashboard/TraderTableClient";
import type { z } from 'zod';
import type { traderFormSchema } from '@/components/dashboard/TraderForm';
import { useToast } from "@/hooks/use-toast";
import { getTradersAction, addTraderAction, updateTraderAction, deleteTraderAction, bulkAddTradersAction, bulkDeleteTradersAction } from './actions';

type TraderFormValues = z.infer<typeof traderFormSchema>;

export default function TradeHunterDashboardPage() {
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTraders = useCallback(async (branchId: BaseBranchId) => {
    setIsLoading(true);
    try {
      const result = await getTradersAction(branchId);
      if (result.data) {
        // Sort data by lastActivity date, descending
        setTraders(result.data.sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
      } else {
        setTraders([]);
        toast({ 
          variant: "destructive", 
          title: "Error Loading Data", 
          description: result.error || "Could not load trader data.",
          duration: 10000,
        });
      }
    } catch (error) {
      console.error("Error fetching traders:", error);
      setTraders([]);
      const errorMessage = error instanceof Error ? error.message : "An unknown client error occurred.";
      toast({ variant: "destructive", title: "Client Error", description: `Could not get traders for branch ${branchId}. ${errorMessage}` });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Effect to initialize the dashboard on component mount
  useEffect(() => {
    const initializeDashboard = async () => {
      if (typeof window !== 'undefined') {
        const storedLoggedInId = localStorage.getItem('loggedInId') as BranchLoginId | null;
        const info = getBranchInfo(storedLoggedInId);
        setBranchInfo(info);
        if (info.baseBranchId && info.role !== 'unknown') {
          await fetchTraders(info.baseBranchId);
        } else {
          setIsLoading(false);
        }
      }
    };
    initializeDashboard();
  }, [fetchTraders]);

  const currentBaseBranchId = useMemo(() => branchInfo?.baseBranchId, [branchInfo]);
  const currentUserRole = useMemo(() => branchInfo?.role, [branchInfo]);

  const handleAdd = async (values: TraderFormValues): Promise<boolean> => {
    if (!currentBaseBranchId || currentUserRole === 'unknown') {
      toast({ variant: "destructive", title: "Error", description: "Cannot add trader: Invalid Branch ID or Role." });
      return false;
    }
    const result = await addTraderAction(currentBaseBranchId, values);
    if (result.data) {
      setTraders(prev => [result.data!, ...prev].sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
      toast({ title: "Success", description: `${result.data.name} added.`});
      return true; // Indicate success
    }
    // If there's an error, show it and indicate failure
    toast({ variant: "destructive", title: "Error Adding Trader", description: result.error || "Failed to add trader." });
    return false;
  };

  const handleUpdate = async (traderId: string, values: TraderFormValues): Promise<boolean> => {
     if (!currentBaseBranchId || currentUserRole === 'unknown') {
      toast({ variant: "destructive", title: "Error", description: "Cannot update trader: Invalid Branch ID or Role." });
      return false;
    }
    const result = await updateTraderAction(currentBaseBranchId, traderId, values);
    if (result.data) {
      setTraders(prev => prev.map(t => t.id === traderId ? result.data! : t).sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
      toast({ title: "Success", description: `${result.data.name} updated.`});
      return true;
    }
    toast({ variant: "destructive", title: "Error Updating Trader", description: result.error || "Failed to update trader." });
    return false;
  };

  const handleDelete = async (traderId: string): Promise<boolean> => {
     if (!currentBaseBranchId || currentUserRole === 'unknown') {
      toast({ variant: "destructive", title: "Error", description: "Cannot delete trader: Invalid Branch ID or Role." });
      return false;
    }
    const result = await deleteTraderAction(currentBaseBranchId, traderId);
    if (result.success) {
      setTraders(prev => prev.filter(t => t.id !== traderId));
      toast({ title: "Success", description: "Trader deleted." });
    } else {
       toast({ variant: "destructive", title: "Error Deleting Trader", description: result.error || "Failed to delete trader." });
    }
    return result.success;
  };

  const handleBulkAdd = async (tradersToCreate: ParsedTraderData[]): Promise<{ data: Trader[] | null; error: string | null; }> => {
    if (!currentBaseBranchId || currentUserRole === 'unknown') {
      return { data: null, error: "Invalid or missing Branch ID/Role." };
    }
    // Call the server action for bulk adding
    const result = await bulkAddTradersAction(currentBaseBranchId, tradersToCreate); 
    // If successful and we have a valid branch, refetch all traders to get a consistent state
    if (result.data && result.data.length > 0 && currentBaseBranchId) { 
      await fetchTraders(currentBaseBranchId);
    } 
    return result;
  };

  const handleBulkDelete = async (traderIds: string[]): Promise<BulkDeleteTradersResult> => {
    if (!currentBaseBranchId || currentUserRole === 'unknown') {
      return { successCount: 0, failureCount: traderIds.length, error: "Invalid or missing Branch ID/Role." };
    }
    const result = await bulkDeleteTradersAction(currentBaseBranchId, traderIds);
    if (result.successCount > 0) {
      // On success, update the local state to reflect the deletion
      setTraders(prev => prev.filter(t => !traderIds.includes(t.id)));
    }
    return result;
  };

  // Show a loading skeleton while fetching initial user/branch info
  if (isLoading && !branchInfo) { 
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  if (!currentBaseBranchId && currentUserRole === 'user' && !isLoading) { 
      return <p>Error: Branch information not found. Please ensure you are logged in correctly.</p>;
  }

  // Display a message for managers who haven't selected a branch
  if (currentUserRole === 'manager' && !currentBaseBranchId) {
      return (
          <div className="space-y-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Manager View</CardTitle>
                      <CardDescription>Select a branch from the login screen to view and manage its traders.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <p>As a manager, you can log in with any specific branch ID to see its data.</p>
                  </CardContent>
              </Card>
          </div>
      )
  }
  
  return (
    <div className="space-y-6"> 
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Trader Database</CardTitle>
          <CardDescription>Manage traders for branch: {branchInfo?.displayLoginId || 'Loading...'}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
              <Skeleton className="h-64 w-full" />
          ) : (
            <TraderTableClient 
              initialTraders={traders} 
              branchId={currentBaseBranchId!} 
              onAdd={handleAdd}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onBulkAdd={handleBulkAdd}
              onBulkDelete={handleBulkDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
