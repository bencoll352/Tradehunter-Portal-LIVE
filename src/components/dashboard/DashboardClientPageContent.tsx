
"use client";

import { useEffect, useState, useMemo } from 'react';
import type { BranchId, Trader, ParsedTraderData } from "@/types";
import { VALID_BRANCH_IDS } from "@/types"; // Import VALID_BRANCH_IDS
// Removed direct import of getTradersByBranch from mock-data
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TraderTableClient } from "@/components/dashboard/TraderTableClient";
import { ProfitPartnerAgentClient } from "@/components/dashboard/ProfitPartnerAgentClient";
import type { z } from 'zod';
import type { traderFormSchema } from '@/components/dashboard/TraderForm';
import { useToast } from "@/hooks/use-toast";
import { MiniDashboardStats } from './MiniDashboardStats';
import { parseISO } from 'date-fns';
import { getTradersAction } from '@/app/(app)/dashboard/actions'; // Import the new action

type TraderFormValues = z.infer<typeof traderFormSchema>;

interface DashboardClientPageContentProps {
  addTraderAction: (branchId: BranchId, values: TraderFormValues) => Promise<Trader | null>;
  updateTraderAction: (branchId: BranchId, traderId: string, values: TraderFormValues) => Promise<Trader | null>;
  deleteTraderAction: (branchId: BranchId, traderId: string) => Promise<boolean>;
  bulkAddTradersAction: (branchId: BranchId, traders: ParsedTraderData[]) => Promise<Trader[] | null>;
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
  const [keyForTable, setKeyForTable] = useState(0); // Used to force re-render of table
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
            duration: 15000 // Longer duration for this important message
          });
          // Continue to set branchId to allow dashboard to load, but operations might fail
        }
        setBranchId(storedBranchId);

        if (storedBranchId) {
          setIsLoading(true);
          try {
            const fetchedTraders = await getTradersAction(storedBranchId);
            if (fetchedTraders) {
              setTraders(fetchedTraders.sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
            } else {
              // Only show "Could not load" if branch ID was considered valid or no specific invalid ID toast was shown
              if (!storedBranchId || VALID_BRANCH_IDS.includes(storedBranchId)) {
                setTraders([]);
                toast({ variant: "destructive", title: "Error", description: "Could not load trader data." });
              }
            }
          } catch (error) {
            console.error("Error fetching initial traders:", error);
            setTraders([]);
             if (!storedBranchId || VALID_BRANCH_IDS.includes(storedBranchId)) {
              toast({ variant: "destructive", title: "Error", description: "Failed to load trader data." });
            }
          } finally {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false); // No branchId, not loading
        }
      }
    };
    initializeDashboard();
  }, [toast]); // Added toast to dependency array as it's used in the effect
  
  // This useEffect is to refresh traders if branchId somehow changes after initial load,
  // or if we need a general re-fetch mechanism later.
  useEffect(() => {
    const refreshTradersForBranch = async () => {
      if (branchId && VALID_BRANCH_IDS.includes(branchId)) { // Only refresh if branchId is valid
        setIsLoading(true);
        try {
          const fetchedTraders = await getTradersAction(branchId);
          if (fetchedTraders) {
            setTraders(fetchedTraders.sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
            setKeyForTable(prev => prev + 1); 
          } else {
             toast({ variant: "destructive", title: "Error", description: `Could not refresh traders for ${branchId}.` });
          }
        } catch (error) {
          console.error(`Error refreshing traders for ${branchId}:`, error);
          toast({ variant: "destructive", title: "Error", description: "Failed to refresh trader data." });
        } finally {
          setIsLoading(false);
        }
      } else if (branchId && !VALID_BRANCH_IDS.includes(branchId)) {
        // If branchId is set but invalid, don't attempt to refresh, rely on the initial toast.
        // Clear traders if an invalid ID is present to avoid operating on stale/wrong data.
        setTraders([]);
        setIsLoading(false);
      }
    };
    refreshTradersForBranch();
  }, [branchId, keyForTable, toast]); // Added toast to dependency array

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

  const handleAdd = async (values: TraderFormValues): Promise<void> => {
    if (!branchId || !VALID_BRANCH_IDS.includes(branchId)) {
      toast({ variant: "destructive", title: "Operation Aborted", description: "Cannot add trader due to an invalid or missing Branch ID. Please re-login." });
      return;
    }
    const newTrader = await addTraderAction(branchId, values);
    if (newTrader) {
      setKeyForTable(prev => prev + 1); 
      toast({ title: "Success", description: `${newTrader.name} added successfully.`});
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to add trader." });
    }
  };

  const handleUpdate = async (traderId: string, values: TraderFormValues): Promise<void> => {
     if (!branchId || !VALID_BRANCH_IDS.includes(branchId)) {
      toast({ variant: "destructive", title: "Operation Aborted", description: "Cannot update trader due to an invalid or missing Branch ID. Please re-login." });
      return;
    }
    const updatedTrader = await updateTraderAction(branchId, traderId, values);
    if (updatedTrader) {
      setKeyForTable(prev => prev + 1);
      toast({ title: "Success", description: `${updatedTrader.name} updated successfully.`});
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to update trader." });
    }
  };

  const handleDelete = async (traderId: string) => {
     if (!branchId || !VALID_BRANCH_IDS.includes(branchId)) {
      toast({ variant: "destructive", title: "Operation Aborted", description: "Cannot delete trader due to an invalid or missing Branch ID. Please re-login." });
      return false;
    }
    const success = await deleteTraderAction(branchId, traderId);
    if (success) {
      setKeyForTable(prev => prev + 1);
    } else {
       toast({ variant: "destructive", title: "Error", description: "Failed to delete trader from server." });
    }
    return success;
  };

  const handleBulkAdd = async (tradersToCreate: ParsedTraderData[]) => {
    if (!branchId || !VALID_BRANCH_IDS.includes(branchId)) {
      toast({ variant: "destructive", title: "Operation Aborted", description: "Cannot bulk add traders due to an invalid or missing Branch ID. Please re-login." });
      return null;
    }
    const newTraders = await bulkAddTradersAction(branchId, tradersToCreate);
    if (newTraders && newTraders.length > 0) {
      setKeyForTable(prev => prev + 1);
    } 
    return newTraders;
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

