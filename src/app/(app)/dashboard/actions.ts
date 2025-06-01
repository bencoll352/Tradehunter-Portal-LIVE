
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
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      // Attempt to get a message property, common in error-like objects
      if ('message' in error && typeof (error as any).message === 'string') {
        errorMessage = (error as any).message;
        // Optionally append a code if it exists
        if ('code' in error) {
          errorMessage = `Error Code: ${(error as any).code} - ${errorMessage}`;
        }
      } else {
        // Fallback: try to stringify, but this can fail for complex objects or throw
        try {
          const errorString = JSON.stringify(error);
          // Avoid vague "[object Object]" or empty "{}" if that's what stringify produces
          if (errorString && errorString !== '{}' && errorString !== '[object Object]') {
            errorMessage = errorString;
          } else {
            errorMessage = "A non-standard error object was thrown on the server.";
          }
        } catch (stringifyError) {
          // If JSON.stringify fails (e.g., circular references)
          errorMessage = "A complex, non-serializable error object was encountered on the server.";
          // Log the original error on the server for better debugging if stringification fails
          console.error("Original error object from bulk add (failed to stringify):", error);
        }
      }
    }
    // Log the processed error message and the original error object for full context on the server
    console.error("Failed to bulk add traders (action level). Processed Error Message:", errorMessage, "Original Error Object:", error);
    return { data: null, error: errorMessage };
  }
}

