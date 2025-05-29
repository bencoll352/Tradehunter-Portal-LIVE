
// This file is a Server Component by default in Next.js App Router.
import type { BranchId, Trader, ParsedTraderData } from "@/types";
import { addTrader as dbAddTrader, updateTrader as dbUpdateTrader, deleteTrader as dbDeleteTrader, bulkAddTraders as dbBulkAddTraders } from "@/lib/mock-data";
import type { z } from 'zod';
import type { traderFormSchema } from '@/components/dashboard/TraderForm';
import { DashboardClientPageContent } from '@/components/dashboard/DashboardClientPageContent';

async function addTraderAction(branchId: BranchId, values: z.infer<typeof traderFormSchema>): Promise<Trader | null> {
  'use server';
  try {
    const newTraderData: Omit<Trader, 'id' | 'lastActivity'> = {
      name: values.name,
      branchId,
      totalSales: values.totalSales,
      tradesMade: values.tradesMade,
      status: values.status,
      // New optional fields from TraderForm could be added here if the form is updated
      // For now, they will be undefined and handled by addTrader in mock-data
    };
    return dbAddTrader(newTraderData);
  } catch (error) {
    console.error("Failed to add trader:", error);
    return null;
  }
}

async function updateTraderAction(branchId: BranchId, traderId: string, values: z.infer<typeof traderFormSchema>): Promise<Trader | null> {
  'use server';
  try {
    // Fetch existing trader to preserve fields not in TraderForm
    const existingTrader = dbBulkAddTraders([], branchId).find(t => t.id === traderId); // A bit hacky way to get a trader by ID
    
    const traderToUpdate: Trader = {
      ...(existingTrader || { id: traderId, branchId, lastActivity: new Date().toISOString() }), // Fallback if existing not found
      name: values.name,
      totalSales: values.totalSales,
      tradesMade: values.tradesMade,
      status: values.status,
      lastActivity: new Date().toISOString(), 
      // Ensure branchId is correctly set from the action's context, not potentially from existingTrader if it was from another branch
      branchId: branchId, 
    };
    return dbUpdateTrader(traderToUpdate);
  } catch (error) {
    console.error("Failed to update trader:", error);
    return null;
  }
}

async function deleteTraderAction(branchId: BranchId, traderId: string): Promise<boolean> {
  'use server';
   try {
    return dbDeleteTrader(traderId, branchId);
  } catch (error) {
    console.error("Failed to delete trader:", error);
    return false;
  }
}

async function bulkAddTradersAction(branchId: BranchId, tradersToCreate: ParsedTraderData[]): Promise<Trader[] | null> {
  'use server';
  try {
    return dbBulkAddTraders(tradersToCreate, branchId);
  } catch (error) {
    console.error("Failed to bulk add traders:", error);
    return null;
  }
}

export default function DashboardPage() {
  return (
    <DashboardClientPageContent
      addTraderAction={addTraderAction}
      updateTraderAction={updateTraderAction}
      deleteTraderAction={deleteTraderAction}
      bulkAddTradersAction={bulkAddTradersAction}
    />
  );
}
