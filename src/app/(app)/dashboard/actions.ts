
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
      closedOn: undefined, 
      reviewKeywords: undefined,
    };
    return await addTraderToDb(newTraderData, branchId);
  } catch (error) {
    console.error("Failed to add trader:", error);
    return null;
  }
}

export async function updateTraderAction(branchId: BranchId, traderId: string, values: z.infer<typeof traderFormSchema>): Promise<Trader | null> {
  try {
    const existingTrader = await dbGetTraderById(traderId, branchId);
    
    if (!existingTrader) {
      console.error(`Trader with ID ${traderId} in branch ${branchId} not found for update.`);
      return null;
    }

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
      id: existingTrader.id,
      branchId: existingTrader.branchId,
      lastActivity: existingTrader.lastActivity, 
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

export async function bulkAddTradersAction(branchId: BranchId, tradersToCreate: ParsedTraderData[]): Promise<{ data: Trader[] | null; error: string | null; }> {
  try {
    const data = await bulkAddTradersToDb(tradersToCreate, branchId);
    return { data, error: null };
  } catch (error) {
    let errorMessage = "An unknown server error occurred during bulk add.";
    if (error instanceof Error && error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string' && error) {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'toString' in error) {
        const errorString = error.toString();
        if (errorString !== '[object Object]') {
            errorMessage = errorString;
        } else {
            try {
                // Attempt to get more detail from common error structures
                if ('code' in error && 'message' in error) {
                  errorMessage = `Error Code: ${error.code} - ${error.message}`;
                } else {
                  errorMessage = JSON.stringify(error);
                }
            } catch (e) {
                errorMessage = "Complex server error object encountered during bulk add.";
            }
        }
    }
    // Log the original error object for full details on the server
    console.error("Failed to bulk add traders (action level):", { originalError: error, processedMessage: errorMessage });
    return { data: null, error: errorMessage };
  }
}
