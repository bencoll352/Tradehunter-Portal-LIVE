
"use client";

import { useEffect, useState } from 'react';
import type { BranchId, Trader } from "@/types";
import { getTradersByBranch } from "@/lib/mock-data";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TraderTableClient } from "@/components/dashboard/TraderTableClient";
import { ProfitPartnerAgentClient } from "@/components/dashboard/ProfitPartnerAgentClient";
import type { z } from 'zod';
import type { traderFormSchema } from '@/components/dashboard/TraderForm';

// Define the types for the action props passed from the Server Component
type TraderFormValues = z.infer<typeof traderFormSchema>;

interface DashboardClientPageContentProps {
  addTraderAction: (branchId: BranchId, values: TraderFormValues) => Promise<Trader | null>;
  updateTraderAction: (branchId: BranchId, traderId: string, values: TraderFormValues) => Promise<Trader | null>;
  deleteTraderAction: (branchId: BranchId, traderId: string) => Promise<boolean>;
}

export function DashboardClientPageContent({
  addTraderAction,
  updateTraderAction,
  deleteTraderAction,
}: DashboardClientPageContentProps) {
  const [branchId, setBranchId] = useState<BranchId | null>(null);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This code runs only on the client side
    if (typeof window !== 'undefined') {
      const storedBranchId = localStorage.getItem('branchId') as BranchId | null;
      setBranchId(storedBranchId);
      if (storedBranchId) {
        // getTradersByBranch is client-side safe as it reads from a simple array
        const initialTraders = getTradersByBranch(storedBranchId);
        setTraders(initialTraders);
      }
      setIsLoading(false);
    }
  }, []);

  // These handler functions ensure the correct branchId (from client state) is used
  // when invoking the server actions passed as props.
  const handleAdd = async (currentBranchId: BranchId, values: TraderFormValues) => {
    if (!branchId || currentBranchId !== branchId) {
      console.error("Branch ID mismatch or not available for add action");
      // Potentially show a toast or error message to the user
      return null;
    }
    return addTraderAction(branchId, values);
  };

  const handleUpdate = async (currentBranchId: BranchId, traderId: string, values: TraderFormValues) => {
     if (!branchId || currentBranchId !== branchId) {
      console.error("Branch ID mismatch or not available for update action");
      return null;
    }
    return updateTraderAction(branchId, traderId, values);
  };

  const handleDelete = async (currentBranchId: BranchId, traderId: string) => {
     if (!branchId || currentBranchId !== branchId) {
      console.error("Branch ID mismatch or not available for delete action");
      return false;
    }
    return deleteTraderAction(branchId, traderId);
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
     // This case should ideally be rare if AppLayout redirects unauthenticated users.
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
              branchId={branchId} // Pass the client-side determined branchId
              onAdd={handleAdd}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
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
