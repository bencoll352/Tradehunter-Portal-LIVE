
"use client";

import { useEffect, useState, useMemo } from 'react';
import { type BaseBranchId, type Trader, type ParsedTraderData, type BulkDeleteTradersResult, getBranchInfo, type BranchInfo, type BranchLoginId } from "@/types";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TraderTableClient } from "@/components/dashboard/TraderTableClient";
import { ProfitPartnerAgentClient } from "@/components/dashboard/ProfitPartnerAgentClient";
import { SalesNavigatorAgentClient } from "./SalesNavigatorAgentClient"; // Import new agent
import type { z } from 'zod';
import type { traderFormSchema } from '@/components/dashboard/TraderForm';
import { useToast } from "@/hooks/use-toast";
import { MiniDashboardStats } from './MiniDashboardStats';
import { parseISO } from 'date-fns';
import { getTradersAction } from '@/app/(app)/dashboard/actions'; 

type TraderFormValues = z.infer<typeof traderFormSchema>;

interface DashboardClientPageContentProps {
  addTraderAction: (branchId: BaseBranchId, values: TraderFormValues) => Promise<{ data: Trader | null; error: string | null }>;
  updateTraderAction: (branchId: BaseBranchId, traderId: string, values: TraderFormValues) => Promise<{ data: Trader | null; error: string | null }>;
  deleteTraderAction: (branchId: BaseBranchId, traderId: string) => Promise<{ success: boolean; error: string | null }>;
  bulkAddTradersAction: (branchId: BaseBranchId, traders: ParsedTraderData[]) => Promise<{ data: Trader[] | null; error: string | null; }>;
  bulkDeleteTradersAction: (branchId: BaseBranchId, traderIds: string[]) => Promise<BulkDeleteTradersResult>;
}

export function DashboardClientPageContent({
  addTraderAction,
  updateTraderAction,
  deleteTraderAction,
  bulkAddTradersAction,
  bulkDeleteTradersAction,
}: DashboardClientPageContentProps) {
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyForTable, setKeyForTable] = useState(0); 
  const { toast } = useToast();

  useEffect(() => {
    const initializeDashboard = async () => {
      if (typeof window !== 'undefined') {
        const storedLoggedInId = localStorage.getItem('loggedInId') as BranchLoginId | null;
        const info = getBranchInfo(storedLoggedInId);
        setBranchInfo(info);

        if (info.baseBranchId && info.role !== 'unknown') {
          setIsLoading(true);
          try {
            const result = await getTradersAction(info.baseBranchId);
            if (result.data) {
              setTraders(result.data.sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
            } else {
              setTraders([]);
              toast({ variant: "destructive", title: "Error Loading Data", description: result.error || "Could not load trader data. Server might be busy or configuration issue." });
            }
          } catch (error) {
            console.error("Error fetching initial traders (client catch):", error);
            setTraders([]);
            toast({ variant: "destructive", title: "Error Loading Data", description: "Failed to load trader data due to an unexpected client-side error." });
          } finally {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false); 
          // Redirection to login should be handled by AppLayout
        }
      }
    };
    initializeDashboard();
  }, [toast]); 
  
  useEffect(() => {
    const refreshTradersForBranch = async () => {
      if (branchInfo?.baseBranchId && branchInfo?.role !== 'unknown') { 
        setIsLoading(true);
        try {
          const result = await getTradersAction(branchInfo.baseBranchId);
          if (result.data) {
            setTraders(result.data.sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
          } else {
             toast({ variant: "destructive", title: "Error Refreshing Data", description: result.error || `Could not refresh traders for ${branchInfo.baseBranchId}.` });
          }
        } catch (error) {
          console.error(`Error refreshing traders for ${branchInfo.baseBranchId} (client catch):`, error);
          toast({ variant: "destructive", title: "Error Refreshing Data", description: "Failed to refresh trader data." });
        } finally {
          setIsLoading(false);
        }
      } else if (branchInfo && branchInfo.role === 'unknown') {
        setTraders([]);
        setIsLoading(false);
      }
    };
     refreshTradersForBranch();
  }, [branchInfo, keyForTable, toast]); 

  const activeTradersCount = useMemo(() => traders.filter(t => t.status === 'Active').length, [traders]);
  const callBackTradersCount = useMemo(() => traders.filter(t => t.status === 'Call-Back').length, [traders]);
  const newLeadTradersCount = useMemo(() => traders.filter(t => t.status === 'New Lead').length, [traders]);
  const recentlyActiveTradersCount = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return traders.filter(t => {
      try {
        return parseISO(t.lastActivity) >= thirtyDaysAgo;
      } catch (e) {
        console.warn(`Invalid date format for trader ID ${t.id}: ${t.lastActivity}`);
        return false; 
      }
    }).length;
  }, [traders]);

  const currentBaseBranchId = branchInfo?.baseBranchId;
  const currentUserRole = branchInfo?.role;

  const handleAdd = async (values: TraderFormValues): Promise<boolean> => {
    if (!currentBaseBranchId || currentUserRole === 'unknown') {
      toast({ variant: "destructive", title: "Operation Aborted", description: "Cannot add trader: Invalid Branch ID or Role. Please re-login." });
      return false;
    }
    const result = await addTraderAction(currentBaseBranchId, values);
    if (result.data) {
      setKeyForTable(prev => prev + 1); 
      toast({ title: "Success", description: `${result.data.name} added.`});
      return true;
    }
    toast({ variant: "destructive", title: "Error Adding Trader", description: result.error || "Failed to add trader." });
    return false;
  };

  const handleUpdate = async (traderId: string, values: TraderFormValues): Promise<boolean> => {
     if (!currentBaseBranchId || currentUserRole === 'unknown') {
      toast({ variant: "destructive", title: "Operation Aborted", description: "Cannot update trader: Invalid Branch ID or Role. Please re-login." });
      return false;
    }
    const result = await updateTraderAction(currentBaseBranchId, traderId, values);
    if (result.data) {
      setKeyForTable(prev => prev + 1);
      toast({ title: "Success", description: `${result.data.name} updated.`});
      return true;
    }
    toast({ variant: "destructive", title: "Error Updating Trader", description: result.error || "Failed to update trader." });
    return false;
  };

  const handleDelete = async (traderId: string): Promise<boolean> => {
     if (!currentBaseBranchId || currentUserRole === 'unknown') {
      toast({ variant: "destructive", title: "Operation Aborted", description: "Cannot delete trader: Invalid Branch ID or Role. Please re-login." });
      return false;
    }
    const result = await deleteTraderAction(currentBaseBranchId, traderId);
    if (result.success) {
      setKeyForTable(prev => prev + 1);
    } else {
       toast({ variant: "destructive", title: "Error Deleting Trader", description: result.error || "Failed to delete trader." });
    }
    return result.success;
  };

  const handleBulkAdd = async (tradersToCreate: ParsedTraderData[]): Promise<{ data: Trader[] | null; error: string | null; }> => {
    if (!currentBaseBranchId || currentUserRole === 'unknown') {
      toast({ variant: "destructive", title: "Operation Aborted", description: "Cannot bulk add: Invalid Branch ID or Role. Please re-login." });
      return { data: null, error: "Invalid or missing Branch ID/Role." };
    }
    // The bulkAddTradersAction from props expects BaseBranchId, which currentBaseBranchId is.
    const result = await bulkAddTradersAction(currentBaseBranchId, tradersToCreate); 
    if (result.data && result.data.length > 0) { 
      setKeyForTable(prev => prev + 1);
    } 
    return result;
  };

  const handleBulkDelete = async (traderIds: string[]): Promise<BulkDeleteTradersResult> => {
    if (!currentBaseBranchId || currentUserRole === 'unknown') {
      toast({ variant: "destructive", title: "Operation Aborted", description: "Cannot bulk delete: Invalid Branch ID or Role. Please re-login." });
      return { successCount: 0, failureCount: traderIds.length, error: "Invalid or missing Branch ID/Role." };
    }
    const result = await bulkDeleteTradersAction(currentBaseBranchId, traderIds);
    if (result.successCount > 0) {
      setKeyForTable(prev => prev + 1); 
    }
    return result;
  };

  if (isLoading && !traders.length && (!currentBaseBranchId || currentUserRole !== 'unknown')) { 
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full md:w-1/2 lg:w-1/3" />
        <Skeleton className="h-12 w-1/4" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!currentBaseBranchId && !isLoading) { 
    return <p>Error: Branch information not found. Please ensure you are logged in correctly.</p>;
  }
  
  return (
    <div className="space-y-6">
      <MiniDashboardStats 
        liveTradersCount={activeTradersCount}
        callBackTradersCount={callBackTradersCount}
        newLeadTradersCount={newLeadTradersCount}
        recentlyActiveTradersCount={recentlyActiveTradersCount}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Trader Overview</CardTitle>
              <CardDescription>Manage traders for branch: {branchInfo?.displayLoginId || 'Loading...'} ({currentUserRole})</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && traders.length === 0 && (currentBaseBranchId && currentUserRole !== 'unknown') ? (
                 <Skeleton className="h-64 w-full" />
              ) : (
                <TraderTableClient 
                  key={keyForTable} 
                  initialTraders={traders} 
                  branchId={currentBaseBranchId!} 
                  allBranchTraders={traders} 
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

        <div className="lg:col-span-1 space-y-6">
          <ProfitPartnerAgentClient traders={traders} />
          {currentUserRole === 'manager' && currentBaseBranchId && (
            <SalesNavigatorAgentClient traders={traders} baseBranchId={currentBaseBranchId} />
          )}
        </div>
      </div>
    </div>
  );
}
