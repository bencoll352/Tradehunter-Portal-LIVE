
'use server';

import type { BaseBranchId, Trader, ParsedTraderData, BulkDeleteTradersResult } from "@/types"; // Use BaseBranchId
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
import { db } from '@/lib/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';

const TRADERS_COLLECTION = 'traders';

function extractErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
    if ('code' in error) {
       return `Error Code: ${(error as any).code} - ${(error as any).message}`;
    }
    return (error as any).message;
  }
  try {
    const stringifiedError = JSON.stringify(error);
    if (stringifiedError && stringifiedError !== '{}' && stringifiedError !== '[object Object]') {
      return stringifiedError;
    }
  } catch (e) {
    // Ignore stringify error
  }
  return defaultMessage;
}

// Action now expects BaseBranchId
export async function getTradersAction(baseBranchId: BaseBranchId): Promise<{ data: Trader[] | null; error: string | null }> {
  try {
    const traders = await dbGetTradersByBranch(baseBranchId);
    return { data: traders, error: null };
  } catch (error) {
    const errorMessage = extractErrorMessage(error, `Failed to get traders for branch ${baseBranchId}.`);
    console.error(`getTradersAction for ${baseBranchId} failed:`, errorMessage, "Original error:", error);
    return { data: null, error: errorMessage };
  }
}

// Action now expects BaseBranchId
export async function addTraderAction(baseBranchId: BaseBranchId, values: z.infer<typeof traderFormSchema>): Promise<{ data: Trader | null; error: string | null }> {
  try {
    // The traderData for addTraderToDb should not include 'id', 'lastActivity', or 'branchId'
    // as these are handled by the service or are system-generated.
    // traderFormSchema already aligns with this mostly.
    const newTraderData: Omit<Trader, 'id' | 'lastActivity' | 'branchId'> = {
      name: values.name,
      // branchId is set by addTraderToDb using the passed baseBranchId
      totalSales: values.totalSales ?? 0, // Default to 0 if null or undefined
      tradesMade: values.tradesMade ?? 0, // Default to 0 if null or undefined
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
      callBackDate: values.callBackDate === undefined ? null : values.callBackDate,
      annualTurnover: values.annualTurnover === undefined ? null : values.annualTurnover,
      totalAssets: values.totalAssets === undefined ? null : values.totalAssets,
      closedOn: null, 
      reviewKeywords: null, 
    };
    const newTrader = await addTraderToDb(newTraderData, baseBranchId);
    return { data: newTrader, error: null };
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to add trader due to an unknown server error.");
    console.error("addTraderAction failed:", errorMessage, "Original error:", error);
    return { data: null, error: errorMessage };
  }
}

// Action now expects BaseBranchId
export async function updateTraderAction(baseBranchId: BaseBranchId, traderId: string, values: z.infer<typeof traderFormSchema>): Promise<{ data: Trader | null; error: string | null }> {
  try {
    const existingTrader = await dbGetTraderById(traderId, baseBranchId);
    
    if (!existingTrader) {
      const errorMessage = `Trader with ID ${traderId} in branch ${baseBranchId} not found for update.`;
      console.error(errorMessage);
      return { data: null, error: errorMessage };
    }

    // Construct the full Trader object for updateTraderInDb
    const traderToUpdate: Trader = {
      ...existingTrader, // Spread existing trader to preserve fields not in form (like id, branchId)
      name: values.name,
      totalSales: values.totalSales ?? existingTrader.totalSales, // Use existing if form value is null/undefined
      tradesMade: values.tradesMade ?? existingTrader.tradesMade, // Use existing if form value is null/undefined
      status: values.status,
      description: values.description === undefined ? existingTrader.description : values.description,
      rating: values.rating === undefined ? existingTrader.rating : values.rating,
      website: values.website === undefined ? existingTrader.website : values.website,
      phone: values.phone === undefined ? existingTrader.phone : values.phone,
      address: values.address === undefined ? existingTrader.address : values.address,
      mainCategory: values.mainCategory === undefined ? existingTrader.mainCategory : values.mainCategory,
      ownerName: values.ownerName === undefined ? existingTrader.ownerName : values.ownerName,
      ownerProfileLink: values.ownerProfileLink === undefined ? existingTrader.ownerProfileLink : values.ownerProfileLink,
      categories: values.categories === undefined ? existingTrader.categories : values.categories,
      workdayTiming: values.workdayTiming === undefined ? existingTrader.workdayTiming : values.workdayTiming,
      notes: values.notes === undefined ? existingTrader.notes : values.notes,
      callBackDate: values.callBackDate === undefined ? existingTrader.callBackDate : values.callBackDate,
      annualTurnover: values.annualTurnover === undefined ? existingTrader.annualTurnover : values.annualTurnover,
      totalAssets: values.totalAssets === undefined ? existingTrader.totalAssets : values.totalAssets,
      // branchId remains from existingTrader, ensuring it's the BaseBranchId
    };
    const updatedTrader = await updateTraderInDb(traderToUpdate);
    return { data: updatedTrader, error: null };
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to update trader due to an unknown server error.");
    console.error("updateTraderAction failed:", errorMessage, "Original error:", error);
    return { data: null, error: errorMessage };
  }
}

// Action now expects BaseBranchId
export async function deleteTraderAction(baseBranchId: BaseBranchId, traderId: string): Promise<{ success: boolean; error: string | null; }> {
   try {
    // deleteTraderFromDb now takes baseBranchId for logging/verification if needed, but primarily relies on traderId
    const success = await deleteTraderFromDb(traderId, baseBranchId);
    return { success, error: null };
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to delete trader due to an unknown server error.");
    console.error("deleteTraderAction failed:", errorMessage, "Original error:", error);
    return { success: false, error: errorMessage };
  }
}

// Action now expects BaseBranchId
export async function bulkAddTradersAction(baseBranchId: BaseBranchId, tradersToCreate: ParsedTraderData[]): Promise<{ data: Trader[] | null; error: string | null; }> {
  try {
    const data = await bulkAddTradersToDb(tradersToCreate, baseBranchId);
    return { data, error: null };
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "An unknown server error occurred during bulk add.");
    console.error("Failed to bulk add traders (action level). Processed Error Message:", errorMessage, "Original Error Object:", error);
    return { data: null, error: errorMessage };
  }
}

// Action now expects BaseBranchId
export async function bulkDeleteTradersAction(baseBranchId: BaseBranchId, traderIds: string[]): Promise<BulkDeleteTradersResult> {
  if (!db) {
    console.error("[TraderService:bulkDeleteTradersAction] Firestore not initialized. Aborting operation. Check Firebase configuration.");
    return { successCount: 0, failureCount: traderIds.length, error: "Firestore not initialized." };
  }
  if (!traderIds || traderIds.length === 0) {
    return { successCount: 0, failureCount: 0, error: "No trader IDs provided for deletion." };
  }

  if (traderIds.length > 499) {
     console.warn(`[TraderService:bulkDeleteTradersAction] Attempting to delete ${traderIds.length} traders from branch ${baseBranchId}, which exceeds the typical batch limit.`);
  }

  const batch = writeBatch(db);
  let successCount = 0;
  let failureCount = 0;

  console.log(`[TraderService:bulkDeleteTradersAction] Attempting to bulk delete ${traderIds.length} traders from branch ${baseBranchId}`);

  for (const traderId of traderIds) {
    const traderDocRef = doc(db, TRADERS_COLLECTION, traderId);
    // Before adding to batch, one could optionally fetch the doc to verify it belongs to baseBranchId if Firestore rules aren't strict enough.
    // However, for performance in a bulk operation, relying on rules or prior client-side filtering is common.
    batch.delete(traderDocRef);
  }

  try {
    await batch.commit();
    successCount = traderIds.length;
    console.log(`[TraderService:bulkDeleteTradersAction] Successfully bulk deleted ${successCount} traders from branch ${baseBranchId}.`);
    return { successCount, failureCount, error: null };
  } catch (error) {
    failureCount = traderIds.length;
    const errorMessage = extractErrorMessage(error, "An unknown server error occurred during bulk delete.");
    console.error(`[TraderService:bulkDeleteTradersAction] Error bulk deleting traders from branch ${baseBranchId}:`, error);
    return { successCount: 0, failureCount, error: errorMessage };
  }
}

