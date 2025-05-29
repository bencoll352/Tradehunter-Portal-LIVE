
'use server';

import type { BranchId, Trader, ParsedTraderData } from "@/types";
import { addTrader as dbAddTrader, updateTrader as dbUpdateTrader, deleteTrader as dbDeleteTrader, bulkAddTraders as dbBulkAddTraders } from "@/lib/mock-data";
import type { z } from 'zod';
import type { traderFormSchema } from '@/components/dashboard/TraderForm';

export async function addTraderAction(branchId: BranchId, values: z.infer<typeof traderFormSchema>): Promise<Trader | null> {
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

export async function updateTraderAction(branchId: BranchId, traderId: string, values: z.infer<typeof traderFormSchema>): Promise<Trader | null> {
  try {
    // Fetch existing trader to preserve fields not in TraderForm
    // Ensure dbBulkAddTraders is available or adjust how existingTrader is fetched if it's problematic
    const existingTradersInBranch = dbBulkAddTraders([], branchId); // This might be inefficient if it always re-seeds.
                                                              // Consider a getTraderById function if available.
    const existingTrader = existingTradersInBranch.find(t => t.id === traderId);
    
    const traderToUpdate: Trader = {
      ...(existingTrader || { id: traderId, branchId, lastActivity: new Date().toISOString(), name: '', totalSales: 0, tradesMade: 0, status: 'Active' }), // Fallback if existing not found
      name: values.name,
      totalSales: values.totalSales,
      tradesMade: values.tradesMade,
      status: values.status,
      lastActivity: new Date().toISOString(), 
      branchId: branchId, 
    };
    return dbUpdateTrader(traderToUpdate);
  } catch (error) {
    console.error("Failed to update trader:", error);
    return null;
  }
}

export async function deleteTraderAction(branchId: BranchId, traderId: string): Promise<boolean> {
   try {
    return dbDeleteTrader(traderId, branchId);
  } catch (error) {
    console.error("Failed to delete trader:", error);
    return false;
  }
}

export async function bulkAddTradersAction(branchId: BranchId, tradersToCreate: ParsedTraderData[]): Promise<Trader[] | null> {
  try {
    return dbBulkAddTraders(tradersToCreate, branchId);
  } catch (error) {
    console.error("Failed to bulk add traders:", error);
    return null;
  }
}
