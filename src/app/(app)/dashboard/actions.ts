
'use server';

import type { BranchId, Trader, ParsedTraderData } from "@/types";
import { addTrader as dbAddTrader, updateTrader as dbUpdateTrader, deleteTrader as dbDeleteTrader, bulkAddTraders as dbBulkAddTraders, getTraderById as dbGetTraderById } from "@/lib/mock-data";
import type { z } from 'zod';
import type { traderFormSchema } from '@/components/dashboard/TraderForm';

export async function addTraderAction(branchId: BranchId, values: z.infer<typeof traderFormSchema>): Promise<Trader | null> {
  try {
    // All fields from traderFormSchema are expected to be passed to dbAddTrader
    const newTraderData: Omit<Trader, 'id' | 'lastActivity'> = {
      name: values.name,
      branchId,
      totalSales: values.totalSales,
      tradesMade: values.tradesMade,
      status: values.status,
      description: values.description,
      rating: values.rating,
      website: values.website,
      phone: values.phone,
      address: values.address,
      mainCategory: values.mainCategory,
      ownerName: values.ownerName,
      ownerProfileLink: values.ownerProfileLink,
      categories: values.categories,
      workdayTiming: values.workdayTiming,
      closedOn: values.closedOn,
      reviewKeywords: values.reviewKeywords,
    };
    return dbAddTrader(newTraderData);
  } catch (error) {
    console.error("Failed to add trader:", error);
    return null;
  }
}

export async function updateTraderAction(branchId: BranchId, traderId: string, values: z.infer<typeof traderFormSchema>): Promise<Trader | null> {
  try {
    const existingTrader = dbGetTraderById(traderId, branchId);
    
    if (!existingTrader) {
      console.error(`Trader with ID ${traderId} in branch ${branchId} not found for update.`);
      return null;
    }

    // Construct the trader to update by taking all existing fields
    // and then overlaying all fields from the form (values).
    // The traderFormSchema now includes all Trader fields as optional,
    // so `values` will contain the complete shape.
    const traderToUpdate: Trader = {
      ...existingTrader,
      ...values, // This will overwrite fields in existingTrader with those from values
      lastActivity: new Date().toISOString(), // Always update lastActivity
      branchId: existingTrader.branchId, // Ensure branchId is not changed
      id: existingTrader.id, // Ensure id is not changed
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

