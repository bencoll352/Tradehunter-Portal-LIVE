'use server';

import type { BranchId, Trader, ParsedTraderData } from "@/types";
import { addTrader as dbAddTrader, updateTrader as dbUpdateTrader, deleteTrader as dbDeleteTrader, bulkAddTraders as dbBulkAddTraders, getTraderById as dbGetTraderById } from "@/lib/mock-data";
import type { z } from 'zod';
import type { traderFormSchema } from '@/components/dashboard/TraderForm';

export async function addTraderAction(branchId: BranchId, values: z.infer<typeof traderFormSchema>): Promise<Trader | null> {
  try {
    // All fields from the expanded traderFormSchema are used here
    const newTraderData: Omit<Trader, 'id' | 'lastActivity'> = {
      name: values.name,
      branchId,
      totalSales: values.totalSales,
      tradesMade: values.tradesMade,
      status: values.status,
      description: values.description ?? undefined,
      rating: values.rating ?? undefined,
      website: values.website ?? undefined,
      phone: values.phone ?? undefined,
      address: values.address ?? undefined,
      mainCategory: values.mainCategory ?? undefined,
      ownerName: values.ownerName ?? undefined,
      ownerProfileLink: values.ownerProfileLink ?? undefined,
      categories: values.categories ?? undefined,
      workdayTiming: values.workdayTiming ?? undefined,
      // closedOn and reviewKeywords are not in the form, will be undefined
      closedOn: undefined, 
      reviewKeywords: undefined,
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
    const traderToUpdate: Trader = {
      ...existingTrader,
      name: values.name,
      totalSales: values.totalSales,
      tradesMade: values.tradesMade,
      status: values.status,
      description: values.description ?? existingTrader.description,
      rating: values.rating ?? existingTrader.rating,
      website: values.website ?? existingTrader.website,
      phone: values.phone ?? existingTrader.phone,
      address: values.address ?? existingTrader.address,
      mainCategory: values.mainCategory ?? existingTrader.mainCategory,
      ownerName: values.ownerName ?? existingTrader.ownerName,
      ownerProfileLink: values.ownerProfileLink ?? existingTrader.ownerProfileLink,
      categories: values.categories ?? existingTrader.categories,
      workdayTiming: values.workdayTiming ?? existingTrader.workdayTiming,
      // Ensure branchId and id are not changed by form values, and lastActivity is updated
      lastActivity: new Date().toISOString(),
      branchId: existingTrader.branchId, 
      id: existingTrader.id,
      // closedOn & reviewKeywords are not in form, keep existing values
      closedOn: existingTrader.closedOn,
      reviewKeywords: existingTrader.reviewKeywords,
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
