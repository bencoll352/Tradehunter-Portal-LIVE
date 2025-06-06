
'use server';

import type { BranchId, Trader, ParsedTraderData, BulkDeleteTradersResult } from "@/types";
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
import { db } from '@/lib/firebase'; // Import db for direct Firestore access
import { collection, writeBatch, doc, deleteDoc } from 'firebase/firestore'; // Import Firestore batch operations

const TRADERS_COLLECTION = 'traders';

// Helper function to extract a string error message
function extractErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
    // Firestore errors sometimes come in this shape
    if ('code' in error) {
       return `Error Code: ${(error as any).code} - ${(error as any).message}`;
    }
    return (error as any).message;
  }
  try {
    const stringifiedError = JSON.stringify(error);
    // Avoid returning empty objects or generic "[object Object]"
    if (stringifiedError && stringifiedError !== '{}' && stringifiedError !== '[object Object]') {
      return stringifiedError;
    }
  } catch (e) {
    // Ignore stringify error if it fails (e.g., circular references)
  }
  return defaultMessage;
}


export async function getTradersAction(branchId: BranchId): Promise<{ data: Trader[] | null; error: string | null }> {
  try {
    const traders = await dbGetTradersByBranch(branchId);
    return { data: traders, error: null };
  } catch (error) {
    const errorMessage = extractErrorMessage(error, `Failed to get traders for branch ${branchId}.`);
    console.error(`getTradersAction for ${branchId} failed:`, errorMessage, "Original error:", error);
    return { data: null, error: errorMessage };
  }
}

export async function addTraderAction(branchId: BranchId, values: z.infer<typeof traderFormSchema>): Promise<{ data: Trader | null; error: string | null }> {
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
      notes: values.notes === undefined ? null : values.notes,
      callBackDate: values.callBackDate === undefined ? null : values.callBackDate, // Include callBackDate
      closedOn: null, 
      reviewKeywords: null, 
    };
    const newTrader = await addTraderToDb(newTraderData, branchId);
    return { data: newTrader, error: null };
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to add trader due to an unknown server error.");
    console.error("addTraderAction failed:", errorMessage, "Original error:", error);
    return { data: null, error: errorMessage };
  }
}

export async function updateTraderAction(branchId: BranchId, traderId: string, values: z.infer<typeof traderFormSchema>): Promise<{ data: Trader | null; error: string | null }> {
  try {
    const existingTrader = await dbGetTraderById(traderId, branchId);
    
    if (!existingTrader) {
      const errorMessage = `Trader with ID ${traderId} in branch ${branchId} not found for update.`;
      console.error(errorMessage);
      return { data: null, error: errorMessage };
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
      notes: values.notes === undefined ? null : values.notes,
      callBackDate: values.callBackDate === undefined ? null : values.callBackDate, // Include callBackDate
    };
    const updatedTrader = await updateTraderInDb(traderToUpdate);
    return { data: updatedTrader, error: null };
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to update trader due to an unknown server error.");
    console.error("updateTraderAction failed:", errorMessage, "Original error:", error);
    return { data: null, error: errorMessage };
  }
}

export async function deleteTraderAction(branchId: BranchId, traderId: string): Promise<{ success: boolean; error: string | null; }> {
   try {
    const success = await deleteTraderFromDb(traderId, branchId);
    return { success, error: null };
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to delete trader due to an unknown server error.");
    console.error("deleteTraderAction failed:", errorMessage, "Original error:", error);
    return { success: false, error: errorMessage };
  }
}

export async function bulkAddTradersAction(branchId: BranchId, tradersToCreate: ParsedTraderData[]): Promise<{ data: Trader[] | null; error: string | null; }> {
  try {
    const data = await bulkAddTradersToDb(tradersToCreate, branchId);
    return { data, error: null };
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "An unknown server error occurred during bulk add.");
    console.error("Failed to bulk add traders (action level). Processed Error Message:", errorMessage, "Original Error Object:", error);
    return { data: null, error: errorMessage };
  }
}

export async function bulkDeleteTradersAction(branchId: BranchId, traderIds: string[]): Promise<BulkDeleteTradersResult> {
  if (!db) {
    console.error("[TraderService:bulkDeleteTradersAction] Firestore not initialized. Aborting operation. Check Firebase configuration.");
    return { successCount: 0, failureCount: traderIds.length, error: "Firestore not initialized." };
  }
  if (!traderIds || traderIds.length === 0) {
    return { successCount: 0, failureCount: 0, error: "No trader IDs provided for deletion." };
  }

  // Firestore batch writes are limited (e.g., 500 operations). 
  // If more traders could be selected, chunking would be needed.
  // For typical page sizes (e.g., up to 50), a single batch is fine.
  if (traderIds.length > 499) {
     console.warn(`[TraderService:bulkDeleteTradersAction] Attempting to delete ${traderIds.length} traders, which exceeds the typical batch limit. Consider implementing chunking if this is a common scenario.`);
     // For now, we'll proceed but this is a note for future improvement if necessary.
  }

  const batch = writeBatch(db);
  let successCount = 0;
  let failureCount = 0;

  console.log(`[TraderService:bulkDeleteTradersAction] Attempting to bulk delete ${traderIds.length} traders from branch ${branchId}`);

  for (const traderId of traderIds) {
    // Basic validation for traderId, though server should ideally verify ownership if rules are strict.
    // For this app, branchId consistency is managed by client.
    const traderDocRef = doc(db, TRADERS_COLLECTION, traderId);
    batch.delete(traderDocRef);
  }

  try {
    await batch.commit();
    successCount = traderIds.length;
    console.log(`[TraderService:bulkDeleteTradersAction] Successfully bulk deleted ${successCount} traders from branch ${branchId}.`);
    return { successCount, failureCount, error: null };
  } catch (error) {
    failureCount = traderIds.length; // Assume all failed if batch commit fails
    const errorMessage = extractErrorMessage(error, "An unknown server error occurred during bulk delete.");
    console.error(`[TraderService:bulkDeleteTradersAction] Error bulk deleting traders from branch ${branchId}:`, error);
    return { successCount: 0, failureCount, error: errorMessage };
  }
}
