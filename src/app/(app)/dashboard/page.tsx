"use server"; // This directive makes functions in this file callable from client components

import { Suspense } from 'react';
import { TraderTableClient } from "@/components/dashboard/TraderTableClient";
import { ProfitPartnerAgentClient } from "@/components/dashboard/ProfitPartnerAgentClient";
import { getTradersByBranch, addTrader as dbAddTrader, updateTrader as dbUpdateTrader, deleteTrader as dbDeleteTrader } from "@/lib/mock-data";
import type { BranchId, Trader } from "@/types";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { z } from 'zod';
import type { traderFormSchema } from '@/components/dashboard/TraderForm';
import { headers } from 'next/headers'; // To simulate getting branchId on server

// Helper function to get branchId (simulated for server context)
// In a real app, this would come from user session or similar
async function getBranchIdFromSession(): Promise<BranchId | null> {
  // This is a placeholder. In a real app, you'd get this from an auth provider.
  // For now, let's assume it's passed via a mechanism or we need a client component wrapper.
  // Since this whole page is a server component, we can't use localStorage directly here.
  // This is a common challenge with RSC and client-side auth state.
  // For now, we'll fetch it on the client in a wrapper or pass it around.
  // Let's assume the (app)/layout.tsx already verified and we can somehow access it.
  // The simplest way for this scaffold is to make dashboard page a client component
  // or make server actions accept branchId. Let's make server actions accept branchId.
  return null; // This needs to be resolved.
}


// Server action for adding a trader
async function addTraderAction(branchId: BranchId, values: z.infer<typeof traderFormSchema>): Promise<Trader | null> {
  try {
    const newTraderData = {
      ...values,
      branchId, // ensure branchId is set from a secure source (e.g. session)
    };
    return dbAddTrader(newTraderData);
  } catch (error) {
    console.error("Failed to add trader:", error);
    return null;
  }
}

// Server action for updating a trader
async function updateTraderAction(branchId: BranchId, traderId: string, values: z.infer<typeof traderFormSchema>): Promise<Trader | null> {
  try {
    // In a real app, fetch existing trader to ensure it belongs to the branchId from session
    // For mock, dbUpdateTrader internally handles id and branchId check if designed so.
    // Our mock dbUpdateTrader doesn't strictly check branchId for update, let's assume it does.
    const traderToUpdate: Trader = {
      id: traderId,
      branchId,
      name: values.name,
      totalSales: values.totalSales,
      tradesMade: values.tradesMade,
      status: values.status,
      lastActivity: new Date().toISOString(), // Update last activity
    };
    return dbUpdateTrader(traderToUpdate);
  } catch (error) {
    console.error("Failed to update trader:", error);
    return null;
  }
}

// Server action for deleting a trader
async function deleteTraderAction(branchId: BranchId, traderId: string): Promise<boolean> {
   try {
    // Ensure traderId belongs to branchId (from session) before deleting
    return dbDeleteTrader(traderId, branchId);
  } catch (error) {
    console.error("Failed to delete trader:", error);
    return false;
  }
}


// Using a client component wrapper to handle localStorage access for branchId
export default function DashboardPage() {
  return <DashboardClientPageContent />;
}

// New client component to handle localStorage and pass branchId
function DashboardClientPageContent() {
  "use client";
  const [branchId, setBranchId] = useState<BranchId | null>(null);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBranchId = localStorage.getItem('branchId') as BranchId | null;
      setBranchId(storedBranchId);
      if (storedBranchId) {
        const initialTraders = getTradersByBranch(storedBranchId); // getTradersByBranch is client-side safe
        setTraders(initialTraders);
      }
      setIsLoading(false);
    }
  }, []);

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
     // This case should be handled by the layout, but as a fallback:
    return <p>Error: Branch ID not found. Please log in again.</p>;
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
              onAdd={addTraderAction}
              onUpdate={updateTraderAction}
              onDelete={deleteTraderAction}
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

// Add this at the beginning of the file if it's not there
import { useEffect, useState } from 'react';
