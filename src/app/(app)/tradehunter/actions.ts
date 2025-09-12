
'use server';

import { 
    getTraders as getTradersFromDb,
    addTrader as addTraderToDb,
    updateTrader as updateTraderInDb,
    deleteTrader as deleteTraderFromDb,
    bulkAddTraders as bulkAddTradersToDb,
    bulkDeleteTraders as bulkDeleteTradersInDb
} from '@/lib/trader-service';
import { type Trader, type BaseBranchId, type ParsedTraderData, type BulkDeleteTradersResult } from '@/types';
import type { z } from 'zod';
import type { traderFormSchema } from '@/components/dashboard/TraderForm';
import { revalidatePath } from 'next/cache';

type TraderFormValues = z.infer<typeof traderFormSchema>;

/**
 * Server action to fetch all traders for a given branch.
 * @param branchId - The ID of the branch to fetch traders for.
 * @returns An object containing the trader data or an error message.
 */
export async function getTradersAction(branchId: BaseBranchId): Promise<{ data: Trader[] | null; error: string | null; }> {
    try {
        const traders = await getTradersFromDb(branchId);
        return { data: traders, error: null };
    } catch (error) {
        console.error(`[Action] Failed to get traders for ${branchId}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
        return { data: null, error: `TRADER_SERVICE_ERROR: Could not get traders. Reason: ${errorMessage}` };
    }
}

/**
 * Server action to add a new trader.
 * @param branchId - The branch to add the trader to.
 * @param values - The data for the new trader.
 * @returns An object containing the newly created trader or an error message.
 */
export async function addTraderAction(branchId: BaseBranchId, values: TraderFormValues): Promise<{ data: Trader | null; error:string | null; }> {
    try {
        const newTrader = await addTraderToDb(branchId, values);
        revalidatePath('/tradehunter'); // Invalidate the cache for the dashboard page
        return { data: newTrader, error: null };
    } catch (error) {
        console.error(`[Action] Failed to add trader to ${branchId}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
        return { data: null, error: errorMessage };
    }
}

/**
 * Server action to update an existing trader.
 * @param branchId - The branch where the trader exists.
 * @param traderId - The ID of the trader to update.
 * @param values - The new data for the trader.
 * @returns An object containing the updated trader or an error message.
 */
export async function updateTraderAction(branchId: BaseBranchId, traderId: string, values: TraderFormValues): Promise<{ data: Trader | null; error: string | null; }> {
    try {
        const updatedTrader = await updateTraderInDb(branchId, traderId, values);
        revalidatePath('/tradehunter');
        return { data: updatedTrader, error: null };
    } catch (error) {
        console.error(`[Action] Failed to update trader ${traderId} in ${branchId}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
        return { data: null, error: errorMessage };
    }
}

/**
 * Server action to delete a trader.
 * @param branchId - The branch where the trader exists.
 * @param traderId - The ID of the trader to delete.
 * @returns An object indicating success or failure.
 */
export async function deleteTraderAction(branchId: BaseBranchId, traderId: string): Promise<{ success: boolean; error: string | null; }> {
     try {
        await deleteTraderFromDb(branchId, traderId);
        revalidatePath('/tradehunter');
        return { success: true, error: null };
    } catch (error) {
        console.error(`[Action] Failed to delete trader ${traderId} from ${branchId}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
        return { success: false, error: errorMessage };
    }
}

/**
 * Server action to bulk add traders from a parsed CSV.
 * @param branchId - The branch to add traders to.
 * @param traders - An array of parsed trader data.
 * @returns An object containing the newly created traders or an error message.
 */
export async function bulkAddTradersAction(branchId: BaseBranchId, traders: ParsedTraderData[]): Promise<{ data: Trader[] | null; error: string | null; }> {
    try {
        const newTraders = await bulkAddTradersToDb(branchId, traders);
        if (newTraders.length > 0) {
            revalidatePath('/tradehunter');
        }
        return { data: newTraders, error: null };
    } catch (error) {
        console.error(`[Action] Failed to bulk add traders to ${branchId}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred during bulk add.";
        return { data: null, error: `TRADER_SERVICE_ERROR: Could not save traders. Reason: ${errorMessage}` };
    }
}


/**
 * Server action to bulk delete traders.
 * @param branchId - The branch to delete traders from.
 * @param traderIds - An array of trader IDs to delete.
 * @returns An object with the results of the bulk deletion.
 */
export async function bulkDeleteTradersAction(branchId: BaseBranchId, traderIds: string[]): Promise<BulkDeleteTradersResult> {
    try {
        const result = await bulkDeleteTradersInDb(branchId, traderIds);
        if (result.successCount > 0) {
            revalidatePath('/tradehunter');
        }
        return result;
    } catch (error) {
        console.error(`[Action] Failed to bulk delete traders from ${branchId}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred during bulk delete.";
        return { successCount: 0, failureCount: traderIds.length, error: errorMessage };
    }
}
