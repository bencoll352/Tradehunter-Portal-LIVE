
'use server';

// The dotenv/config import must be the very first line of the file
// to ensure that all environment variables are loaded from .env.local
// before any other code is executed, especially the Firestore client.
import 'dotenv/config';

import {
  getTradersByBranch,
  addTrader,
  updateTrader,
  deleteTrader,
  bulkAddTraders,
  bulkDeleteTraders,
  getTraderById,
} from '@/lib/trader-service';
import type { Trader, BaseBranchId, ParsedTraderData, BulkDeleteTradersResult } from "@/types";
import type { z } from 'zod';
import type { traderFormSchema } from '@/components/dashboard/TraderForm';

// ====================================================================
// Server Actions
// ====================================================================

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
    const traders = await getTradersByBranch(baseBranchId);
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
    const newTraderData: Omit<Trader, 'id' | 'lastActivity' | 'branchId'> = {
      name: values.name,
      status: values.status,
      description: values.description ?? null,
      rating: values.rating ?? null,
      website: values.website ?? null,
      phone: values.phone ?? null,
      address: values.address ?? null,
      mainCategory: values.mainCategory ?? null,
      ownerName: values.ownerName ?? null,
      ownerProfileLink: values.ownerProfileLink ?? null,
      categories: values.categories ?? null,
      workdayTiming: values.workdayTiming ?? null,
      notes: values.notes ?? null,
      callBackDate: values.callBackDate ?? null,
      estimatedAnnualRevenue: values.estimatedAnnualRevenue ?? null,
      estimatedCompanyValue: values.estimatedCompanyValue ?? null,
      employeeCount: values.employeeCount ?? null,
      closedOn: null, 
      reviewKeywords: null, 
    };
    const newTrader = await addTrader(newTraderData, baseBranchId);
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
    const existingTrader = await getTraderById(traderId, baseBranchId);
    
    if (!existingTrader) {
      const errorMessage = `Trader with ID ${traderId} in branch ${baseBranchId} not found for update.`;
      console.error(errorMessage);
      return { data: null, error: errorMessage };
    }

    // This ensures that values from the form are merged with existing data to prevent data loss.
    const traderToUpdate: Trader = {
      ...existingTrader, 
      name: values.name,
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
      notes: values.notes ?? existingTrader.notes,
      callBackDate: values.callBackDate ?? existingTrader.callBackDate,
      estimatedAnnualRevenue: values.estimatedAnnualRevenue ?? existingTrader.estimatedAnnualRevenue,
      estimatedCompanyValue: values.estimatedCompanyValue ?? existingTrader.estimatedCompanyValue,
      employeeCount: values.employeeCount ?? existingTrader.employeeCount,
    };
    const updatedTrader = await updateTrader(traderToUpdate);
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
    const success = await deleteTrader(traderId, baseBranchId);
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
    const data = await bulkAddTraders(tradersToCreate, baseBranchId);
    return { data, error: null };
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "An unknown server error occurred during bulk add.");
    console.error("Failed to bulk add traders (action level). Processed Error Message:", errorMessage, "Original Error Object:", error);
    return { data: null, error: errorMessage };
  }
}

// Action now expects BaseBranchId
export async function bulkDeleteTradersAction(baseBranchId: BaseBranchId, traderIds: string[]): Promise<BulkDeleteTradersResult> {
  try {
      const result = await bulkDeleteTraders(traderIds, baseBranchId);
      return result;
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "An unknown server error occurred during bulk delete.");
    console.error(`[TraderActions:bulkDeleteTradersAction] Error bulk deleting traders from branch ${baseBranchId}:`, error);
    return { successCount: 0, failureCount: traderIds.length, error: errorMessage };
  }
}
