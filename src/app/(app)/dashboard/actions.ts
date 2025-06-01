
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
      description: values.description === undefined ? null : values.description,
      rating: values.rating === undefined ? null : values.rating,
      website: values.website === undefined ? null : values.website,
      phone: values.phone === undefined ? null : values.phone,
      address: values.address === undefined ? null : values.address,
      mainCategory: values.mainCategory === undefined ? null : values.mainCategory,
      ownerName: values.ownerName === undefined ? null : values.ownerName,
      ownerProfileLink: values.ownerProfileLink === undefined ? null : values.ownerProfileLink,
      categories: values.categories === undefined ? null : values.categories,
      workdayTiming: values.workdayTiming === undefined ? null : values.workdayTiming,
      closedOn: null, // Not in form, default to null
      reviewKeywords: null, // Not in form, default to null
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
      description: values.description === undefined ? null : values.description,
      rating: values.rating === undefined ? null : values.rating,
      website: values.website === undefined ? null : values.website,
      phone: values.phone === undefined ? null : values.phone,
      address: values.address === undefined ? null : values.address,
      mainCategory: values.mainCategory === undefined ? null : values.mainCategory,
      ownerName: values.ownerName === undefined ? null : values.ownerName,
      ownerProfileLink: values.ownerProfileLink === undefined ? null : values.ownerProfileLink,
      categories: values.categories === undefined ? null : values.categories,
      workdayTiming: values.workdayTiming === undefined ? null : values.workdayTiming,
      // id, branchId, lastActivity are from existingTrader or system-set
      // closedOn, reviewKeywords are preserved from existingTrader if not in form
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
      if ('message' in error && typeof (error as any).message === 'string') {
        errorMessage = (error as any).message;
        if ('code' in error) {
          errorMessage = `Error Code: ${(error as any).code} - ${errorMessage}`;
        }
      } else {
        try {
          const errorString = JSON.stringify(error);
          if (errorString && errorString !== '{}' && errorString !== '[object Object]') {
            errorMessage = errorString;
          } else {
            errorMessage = "A non-standard error object was thrown on the server.";
          }
        } catch (stringifyError) {
          errorMessage = "A complex, non-serializable error object was encountered on the server.";
          console.error("Original error object from bulk add (failed to stringify):", error);
        }
      }
    }
    console.error("Failed to bulk add traders (action level). Processed Error Message:", errorMessage, "Original Error Object:", error);
    return { data: null, error: errorMessage };
  }
}

