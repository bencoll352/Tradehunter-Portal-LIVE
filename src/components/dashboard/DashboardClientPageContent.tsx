
"use client";

import { useEffect, useState } from 'react';
import type { BranchId, Trader, ParsedTraderData } from "@/types"; // Added ParsedTraderData
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
  bulkAddTradersAction: (branchId: BranchId, traders: ParsedTraderData[]) => Promise<Trader[] | null>; // Added prop
}

export function DashboardClientPageContent({
  addTraderAction,
  updateTraderAction,
  deleteTraderAction,
  bulkAddTradersAction, // Added prop
}: DashboardClientPageContentProps) {
  const [branchId, setBranchId] = useState<BranchId | null>(null);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBranchId = localStorage.getItem('branchId') as BranchId | null;
      setBranchId(storedBranchId);
      if (storedBranchId) {
        const initialTraders = getTradersByBranch(storedBranchId);
        setTraders(initialTraders);
      }
      setIsLoading(false);
    }
  }, []);

  const handleAdd = async (currentBranchId: BranchId, values: TraderFormValues) => {
    if (!branchId || currentBranchId !== branchId) {
      console.error("Branch ID mismatch or not available for add action");
      return null;
    }
    const newTrader = await addTraderAction(branchId, values);
    if (newTrader) {
      setTraders(prev => [...prev, newTrader]); // Update local state
    }
    return newTrader;
  };

  const handleUpdate = async (currentBranchId: BranchId, traderId: string, values: TraderFormValues) => {
     if (!branchId || currentBranchId !== branchId) {
      console.error("Branch ID mismatch or not available for update action");
      return null;
    }
    const updatedTrader = await updateTraderAction(branchId, traderId, values);
    if (updatedTrader) {
      setTraders(prev => prev.map(t => t.id === traderId ? updatedTrader : t)); // Update local state
    }
    return updatedTrader;
  };

  const handleDelete = async (currentBranchId: BranchId, traderId: string) => {
     if (!branchId || currentBranchId !== branchId) {
      console.error("Branch ID mismatch or not available for delete action");
      return false;
    }
    const success = await deleteTraderAction(branchId, traderId);
    if (success) {
      setTraders(prev => prev.filter(t => t.id !== traderId)); // Update local state
    }
    return success;
  };

  const handleBulkAdd = async (currentBranchId: BranchId, tradersToCreate: ParsedTraderData[]) => {
    if (!branchId || currentBranchId !== branchId) {
      console.error("Branch ID mismatch or not available for bulk add action");
      return null;
    }
    const newTraders = await bulkAddTradersAction(branchId, tradersToCreate);
    if (newTraders && newTraders.length > 0) {
      setTraders(prev => [...prev, ...newTraders]); // Update local state
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
              initialTraders={traders} 
              branchId={branchId}
              onAdd={(values) => handleAdd(branchId, values)} // Pass branchId directly
              onUpdate={(traderId, values) => handleUpdate(branchId, traderId, values)} // Pass branchId
              onDelete={(traderId) => handleDelete(branchId, traderId)} // Pass branchId
              onBulkAdd={(tradersToCreate) => handleBulkAdd(branchId, tradersToCreate)} // Pass branchId
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
