
"use client";

import { useEffect, useState, useMemo } from 'react';
import type { BranchId, Trader, ParsedTraderData } from "@/types";
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
        setBranchId(storedBranchId);

        if (storedBranchId) {
          setIsLoading(true);
          try {
            const fetchedTraders = await getTradersAction(storedBranchId);
            if (fetchedTraders) {
              setTraders(fetchedTraders.sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
            } else {
              setTraders([]);
              toast({ variant: "destructive", title: "Error", description: "Could not load trader data." });
            }
          } catch (error) {
            console.error("Error fetching initial traders:", error);
            setTraders([]);
            toast({ variant: "destructive", title: "Error", description: "Failed to load trader data." });
          } finally {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false); // No branchId, not loading
        }
      }
    };
    initializeDashboard();
  }, []); // Run once on mount
  
  // This useEffect is to refresh traders if branchId somehow changes after initial load,
  // or if we need a general re-fetch mechanism later.
  // For now, primary data load is in the above useEffect.
  // If direct branch switching without page reload was a feature, this would be more critical.
  useEffect(() => {
    const refreshTradersForBranch = async () => {
      if (branchId) {
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
      }
    };
    // Avoid re-fetching on initial mount if branchId is already set by the first useEffect
    // This effect now primarily serves to re-fetch if branchId changes programmatically
    // For now, it will run if branchId is set, after the initial load.
    // If branchId is set by the first useEffect, this will trigger a fetch.
    // Consider if this double fetch is needed or if the first effect covers it.
    // For simplicity, initial load is covered. This can be for explicit refresh triggers later.
    // To prevent double fetch on mount, we can add a flag or check if traders array is already populated.
    // However, for now, let's keep it as is. It will effectively re-fetch once branchId is confirmed.

  }, [branchId, keyForTable]); // Re-run if branchId or keyForTable changes

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
    if (!branchId) {
      console.error("Branch ID not available for add action");
      toast({ variant: "destructive", title: "Error", description: "Branch ID not found." });
      return;
    }
    const newTrader = await addTraderAction(branchId, values);
    if (newTrader) {
      // Instead of directly modifying state, trigger a re-fetch by changing keyForTable
      setKeyForTable(prev => prev + 1); 
      toast({ title: "Success", description: `${newTrader.name} added successfully.`});
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to add trader." });
    }
  };

  const handleUpdate = async (traderId: string, values: TraderFormValues): Promise<void> => {
     if (!branchId) {
      console.error("Branch ID not available for update action");
      toast({ variant: "destructive", title: "Error", description: "Branch ID not found." });
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
     if (!branchId) {
      console.error("Branch ID not available for delete action");
      toast({ variant: "destructive", title: "Error", description: "Branch ID not found." });
      return false;
    }
    const success = await deleteTraderAction(branchId, traderId);
    if (success) {
      setKeyForTable(prev => prev + 1);
      // Toast for delete success is handled in TraderTableClient
    } else {
       toast({ variant: "destructive", title: "Error", description: "Failed to delete trader from server." });
    }
    return success;
  };

  const handleBulkAdd = async (tradersToCreate: ParsedTraderData[]) => {
    if (!branchId) {
      console.error("Branch ID not available for bulk add action");
      toast({ variant: "destructive", title: "Error", description: "Branch ID not found." });
      return null;
    }
    const newTraders = await bulkAddTradersAction(branchId, tradersToCreate);
    if (newTraders && newTraders.length > 0) {
      setKeyForTable(prev => prev + 1);
      // Toast for bulk add is handled in BulkAddTradersDialog
    } 
    return newTraders;
  };

  if (isLoading && !traders.length) { // Show skeleton only if truly loading initial data
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full md:w-1/2 lg:w-1/3" />
        <Skeleton className="h-12 w-1/4" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!branchId && !isLoading) { // If not loading and no branchId, show error
    return <p>Error: Branch ID not found. Please ensure you are logged in.</p>;
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
              {isLoading && traders.length === 0 ? ( // Show skeleton inside card if loading
                 <Skeleton className="h-64 w-full" />
              ) : (
                <TraderTableClient 
                  key={keyForTable} // This key ensures table re-renders when data source changes
                  initialTraders={traders} 
                  branchId={branchId!} // branchId should be set if we reach here
                  allBranchTraders={traders} // For duplicate checks (might need adjustment based on how duplicates are now checked)
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
