
"use client";

import { useEffect, useState, useMemo } from 'react';
import type { BranchId, Trader, ParsedTraderData } from "@/types";
import { VALID_BRANCH_IDS } from "@/types"; 
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TraderTableClient } from "@/components/dashboard/TraderTableClient";
import { ProfitPartnerAgentClient } from "@/components/dashboard/ProfitPartnerAgentClient";
import type { z } from 'zod';
import type { traderFormSchema } from '@/components/dashboard/TraderForm';
import { useToast } from "@/hooks/use-toast";
import { MiniDashboardStats } from './MiniDashboardStats';
import { parseISO } from 'date-fns';
import { getTradersAction } from '@/app/(app)/dashboard/actions'; 

type TraderFormValues = z.infer<typeof traderFormSchema>;

interface DashboardClientPageContentProps {
  addTraderAction: (branchId: BranchId, values: TraderFormValues) => Promise<{ data: Trader | null; error: string | null }>;
  updateTraderAction: (branchId: BranchId, traderId: string, values: TraderFormValues) => Promise<{ data: Trader | null; error: string | null }>;
  deleteTraderAction: (branchId: BranchId, traderId: string) => Promise<{ success: boolean; error: string | null }>;
  bulkAddTradersAction: (branchId: BranchId, traders: ParsedTraderData[]) => Promise<{ data: Trader[] | null; error: string | null; }>;
}

export function DashboardClientPageContent({
  addTraderAction,
  updateTraderAction,
  deleteTraderAction,
  bulkAddTradersAction,
}: DashboardClientPageContentProps) {
  const [branchId, setBranchId] = useState<BranchId | null>(null);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyForTable, setKeyForTable] = useState(0); 
  const { toast } = useToast();

  useEffect(() => {
    const initializeDashboard = async () => {
      if (typeof window !== 'undefined') {
        const storedBranchId = localStorage.getItem('branchId') as BranchId | null;
        
        if (storedBranchId && !VALID_BRANCH_IDS.includes(storedBranchId)) {
          toast({
            variant: "destructive",
            title: "Invalid Branch ID Detected",
            description: `The Branch ID "${storedBranchId}" stored in your browser is no longer valid. This may cause errors. Please log out and log back in using a current valid ID (e.g., PURLEY, BRANCH_B, BRANCH_C, BRANCH_D).`,
            duration: 15000 
          });
        }
        setBranchId(storedBranchId);

        if (storedBranchId) {
          setIsLoading(true);
          try {
            const fetchedTraders = await getTradersAction(storedBranchId);
            if (fetchedTraders) {
              setTraders(fetchedTraders.sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
            } else {
              if (!storedBranchId || VALID_BRANCH_IDS.includes(storedBranchId)) {
                setTraders([]);
                toast({ variant: "destructive", title: "Error Loading Data", description: "Could not load trader data. The server might be busy or there's a configuration issue." });
              }
            }
          } catch (error) {
            console.error("Error fetching initial traders:", error);
            setTraders([]);
             if (!storedBranchId || VALID_BRANCH_IDS.includes(storedBranchId)) {
              toast({ variant: "destructive", title: "Error Loading Data", description: "Failed to load trader data due to an unexpected error." });
            }
          } finally {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false); 
        }
      }
    };
    initializeDashboard();
  }, [toast]); 
  
  useEffect(() => {
    const refreshTradersForBranch = async () => {
      if (branchId && VALID_BRANCH_IDS.includes(branchId)) { 
        setIsLoading(true);
        try {
          const fetchedTraders = await getTradersAction(branchId);
          if (fetchedTraders) {
            setTraders(fetchedTraders.sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
          } else {
             toast({ variant: "destructive", title: "Error Refreshing Data", description: `Could not refresh traders for ${branchId}.` });
          }
        } catch (error) {
          console.error(`Error refreshing traders for ${branchId}:`, error);
          toast({ variant: "destructive", title: "Error Refreshing Data", description: "Failed to refresh trader data." });
        } finally {
          setIsLoading(false);
        }
      } else if (branchId && !VALID_BRANCH_IDS.includes(branchId)) {
        setTraders([]);
        setIsLoading(false);
      }
    };
     refreshTradersForBranch();
  }, [branchId, keyForTable, toast]); 

  const liveTradersCount = useMemo(() => {
    return traders.filter(t => t.status === 'Active').length;
  }, [traders]);

  const recentlyActiveTradersCount = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return traders.filter(t => {
      try {
        const lastActivityDate = parseISO(t.lastActivity);
        return lastActivityDate >= thirtyDaysAgo;
      } catch (e) {
        console.warn(`Invalid date format for trader ID ${t.id}: ${t.lastActivity}`);
        return false; 
      }
    }).length;
  }, [traders]);

  const handleAdd = async (values: TraderFormValues): Promise<boolean> => {
    if (!branchId || !VALID_BRANCH_IDS.includes(branchId)) {
      toast({ variant: "destructive", title: "Operation Aborted", description: "Cannot add trader due to an invalid or missing Branch ID. Please re-login." });
      return false;
    }
    const result = await addTraderAction(branchId, values);
    if (result.data) {
      setKeyForTable(prev => prev + 1); 
      toast({ title: "Success", description: `${result.data.name} added successfully.`});
      return true;
    } else {
      toast({ variant: "destructive", title: "Error Adding Trader", description: result.error || "Failed to add trader." });
      return false;
    }
  };

  const handleUpdate = async (traderId: string, values: TraderFormValues): Promise<boolean> => {
     if (!branchId || !VALID_BRANCH_IDS.includes(branchId)) {
      toast({ variant: "destructive", title: "Operation Aborted", description: "Cannot update trader due to an invalid or missing Branch ID. Please re-login." });
      return false;
    }
    const result = await updateTraderAction(branchId, traderId, values);
    if (result.data) {
      setKeyForTable(prev => prev + 1);
      toast({ title: "Success", description: `${result.data.name} updated successfully.`});
      return true;
    } else {
      toast({ variant: "destructive", title: "Error Updating Trader", description: result.error || "Failed to update trader." });
      return false;
    }
  };

  const handleDelete = async (traderId: string): Promise<boolean> => {
     if (!branchId || !VALID_BRANCH_IDS.includes(branchId)) {
      toast({ variant: "destructive", title: "Operation Aborted", description: "Cannot delete trader due to an invalid or missing Branch ID. Please re-login." });
      return false;
    }
    const result = await deleteTraderAction(branchId, traderId);
    if (result.success) {
      setKeyForTable(prev => prev + 1);
      // Toast for delete success/failure is handled by DeleteTraderDialog based on the return value.
      // Toasting here would be redundant.
    } else {
       toast({ variant: "destructive", title: "Error Deleting Trader", description: result.error || "Failed to delete trader from server." });
    }
    return result.success;
  };

  const handleBulkAdd = async (tradersToCreate: ParsedTraderData[]): Promise<{ data: Trader[] | null; error: string | null; }> => {
    if (!branchId || !VALID_BRANCH_IDS.includes(branchId)) {
      toast({ variant: "destructive", title: "Operation Aborted", description: "Cannot bulk add traders due to an invalid or missing Branch ID. Please re-login." });
      return { data: null, error: "Invalid or missing Branch ID." };
    }
    const result = await bulkAddTradersAction(branchId, tradersToCreate);
    if (result.data && result.data.length > 0) { 
      setKeyForTable(prev => prev + 1);
    } 
    return result;
  };

  if (isLoading && !traders.length && (!branchId || VALID_BRANCH_IDS.includes(branchId))) { 
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full md:w-1/2 lg:w-1/3" />
        <Skeleton className="h-12 w-1/4" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!branchId && !isLoading) { 
    return <p>Error: Branch ID not found. Please ensure you are logged in with a valid Branch ID.</p>;
  }
  
  return (
    <div className="space-y-6">
      <MiniDashboardStats 
        liveTradersCount={liveTradersCount}
        recentlyActiveTradersCount={recentlyActiveTradersCount}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Trader Overview</CardTitle>
              <CardDescription>Manage traders for branch: {branchId || 'Loading...'}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && traders.length === 0 && (!branchId || VALID_BRANCH_IDS.includes(branchId)) ? (
                 <Skeleton className="h-64 w-full" />
              ) : (
                <TraderTableClient 
                  key={keyForTable} 
                  initialTraders={traders} 
                  branchId={branchId!} 
                  allBranchTraders={traders} 
                  onAdd={handleAdd}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onBulkAdd={handleBulkAdd} 
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <ProfitPartnerAgentClient traders={traders} />
        </div>
      </div>
    </div>
  );
}
