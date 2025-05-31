
'use server';

import type { BranchId, Trader, ParsedTraderData } from "@/types";
import { 
  getTradersByBranch as dbGetTradersByBranch,
  addTraderToDb, 
  updateTraderInDb, 
  deleteTraderFromDb, 
  bulkAddTradersToDb,
  getTraderById as dbGetTraderById
} from "@/lib/trader-service"; 
import type { z } from 'zod';
import type { traderFormSchema } from '@/components/dashboard/TraderForm';

export async function getTradersAction(branchId: BranchId): Promise<Trader[] | null> {
  try {
    const traders = await dbGetTradersByBranch(branchId);
    return traders;
  } catch (error) {
    console.error("Failed to get traders:", error);
    return null;
  }
}

export async function addTraderAction(branchId: BranchId, values: z.infer<typeof traderFormSchema>): Promise<Trader | null> {
  try {
    const newTraderData: Omit<Trader, 'id' | 'lastActivity'> = {
      name: values.name,
      branchId, // branchId is already part of the type Omit<Trader, 'id' | 'lastActivity'>
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
      closedOn: undefined, 
      reviewKeywords: undefined,
    };
    // addTraderToDb now expects branchId as a separate argument if not already in traderData
    return await addTraderToDb(newTraderData, branchId);
  } catch (error) {
    console.error("Failed to add trader:", error);
    // Consider re-throwing or returning a more specific error object
    return null;
  }
}

export async function updateTraderAction(branchId: BranchId, traderId: string, values: z.infer<typeof traderFormSchema>): Promise<Trader | null> {
  try {
    // Fetch the existing trader to ensure we have all fields, especially branchId and id
    const existingTrader = await dbGetTraderById(traderId, branchId);
    
    if (!existingTrader) {
      console.error(`Trader with ID ${traderId} in branch ${branchId} not found for update.`);
      return null;
    }

    const traderToUpdate: Trader = {
      ...existingTrader, // Start with existing data
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
      // id and branchId come from existingTrader, lastActivity will be set by updateTraderInDb
      id: existingTrader.id,
      branchId: existingTrader.branchId,
      lastActivity: existingTrader.lastActivity, // This will be overridden by the service
    };
    return await updateTraderInDb(traderToUpdate);
  } catch (error) {
    console.error("Failed to update trader:", error);
    return null;
  }
}

export async function deleteTraderAction(branchId: BranchId, traderId: string): Promise<boolean> {
   try {
    return await deleteTraderFromDb(traderId, branchId);
  } catch (error) {
    console.error("Failed to delete trader:", error);
    return false;
  }
}

export async function bulkAddTradersAction(branchId: BranchId, tradersToCreate: ParsedTraderData[]): Promise<Trader[] | null> {
  try {
    return await bulkAddTradersToDb(tradersToCreate, branchId);
  } catch (error) {
    console.error("Failed to bulk add traders:", error);
    return null;
  }
}
