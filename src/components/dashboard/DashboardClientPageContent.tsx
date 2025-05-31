
"use client";

import { useEffect, useState } from 'react';
import type { BranchId, Trader, ParsedTraderData } from "@/types";
import { getTradersByBranch } from "@/lib/mock-data";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TraderTableClient } from "@/components/dashboard/TraderTableClient";
import { ProfitPartnerAgentClient } from "@/components/dashboard/ProfitPartnerAgentClient";
import type { z } from 'zod';
import type { traderFormSchema } from '@/components/dashboard/TraderForm';

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
  const [keyForTable, setKeyForTable] = useState(0); // Used to force re-render of table if needed

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBranchId = localStorage.getItem('branchId') as BranchId | null;
      setBranchId(storedBranchId);
      if (storedBranchId) {
        const initialTraders = getTradersByBranch(storedBranchId);
        setTraders(initialTraders.sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
      }
      setIsLoading(false);
    }
  }, []);
  
  // Re-fetch traders if branchId changes after initial load (e.g. programmatic change, though not typical here)
  useEffect(() => {
    if (branchId) {
      const currentTraders = getTradersByBranch(branchId);
      setTraders(currentTraders.sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
      setKeyForTable(prev => prev + 1); // Force re-render table with new initialTraders
    }
  }, [branchId]);


  const handleAdd = async (values: TraderFormValues): Promise<void> => {
    if (!branchId) {
      console.error("Branch ID not available for add action");
      return;
    }
    const newTrader = await addTraderAction(branchId, values);
    if (newTrader) {
      setTraders(prev => [...prev, newTrader].sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
    }
  };

  const handleUpdate = async (traderId: string, values: TraderFormValues): Promise<void> => {
     if (!branchId) {
      console.error("Branch ID not available for update action");
      return;
    }
    const updatedTrader = await updateTraderAction(branchId, traderId, values);
    if (updatedTrader) {
      setTraders(prev => prev.map(t => t.id === traderId ? updatedTrader : t).sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
    }
  };

  const handleDelete = async (traderId: string) => {
     if (!branchId) {
      console.error("Branch ID not available for delete action");
      return false;
    }
    const success = await deleteTraderAction(branchId, traderId);
    if (success) {
      setTraders(prev => prev.filter(t => t.id !== traderId));
    }
    return success;
  };

  const handleBulkAdd = async (tradersToCreate: ParsedTraderData[]) => {
    if (!branchId) {
      console.error("Branch ID not available for bulk add action");
      return null;
    }
    const newTraders = await bulkAddTradersAction(branchId, tradersToCreate);
    if (newTraders && newTraders.length > 0) {
      setTraders(prev => [...prev, ...newTraders].sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
    }
    return newTraders;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/4" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!branchId) {
    return <p>Error: Branch ID not found. Please ensure you are logged in.</p>;
  }
  
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Trader Overview</CardTitle>
            <CardDescription>Manage traders for branch: {branchId}</CardDescription>
          </CardHeader>
          <CardContent>
            <TraderTableClient 
              key={keyForTable} // Force re-mount if initialTraders logic changes due to branchId
              initialTraders={traders} 
              branchId={branchId}
              onAdd={handleAdd}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onBulkAdd={handleBulkAdd}
            />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-6">
         <ProfitPartnerAgentClient traders={traders} />
      </div>
    </div>
  );
}

