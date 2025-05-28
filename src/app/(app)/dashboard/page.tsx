
// This file is a Server Component by default in Next.js App Router.
// No top-level "use server" directive is needed for a page component file.

import type { BranchId, Trader } from "@/types";
import { addTrader as dbAddTrader, updateTrader as dbUpdateTrader, deleteTrader as dbDeleteTrader } from "@/lib/mock-data";
import type { z } from 'zod';
import type { traderFormSchema } from '@/components/dashboard/TraderForm';
import { DashboardClientPageContent } from '@/components/dashboard/DashboardClientPageContent';

// Server action for adding a trader
// Defined within a Server Component and passed to a Client Component.
// Next.js handles making this callable from the client.
async function addTraderAction(branchId: BranchId, values: z.infer<typeof traderFormSchema>): Promise<Trader | null> {
  try {
    const newTraderData = {
      ...values,
      branchId,
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
    const traderToUpdate: Trader = {
      id: traderId,
      branchId,
      name: values.name,
      totalSales: values.totalSales,
      tradesMade: values.tradesMade,
      status: values.status,
      lastActivity: new Date().toISOString(), 
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
    return dbDeleteTrader(traderId, branchId);
  } catch (error) {
    console.error("Failed to delete trader:", error);
    return false;
  }
}

// The Page component itself is a Server Component.
// It can be async if you need to fetch data server-side before rendering.
export default function DashboardPage() {
  // In a real app, you might fetch initial data here or get session info.
  // For this example, branchId and initial traders are handled client-side
  // in DashboardClientPageContent using localStorage.

  return (
    <DashboardClientPageContent
      addTraderAction={addTraderAction}
      updateTraderAction={updateTraderAction}
      deleteTraderAction={deleteTraderAction}
    />
  );
}
