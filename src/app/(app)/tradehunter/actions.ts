
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

export async function getTradersAction(branchId: BaseBranchId): Promise<{ data: Trader[] | null; error: string | null; }> {
    try {
        const traders = await getTradersFromDb(branchId);
        return { data: traders, error: null };
    } catch (error) {
        console.error(`[Action] Failed to get traders for ${branchId}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
        return { data: null, error: errorMessage };
    }
}

export async function addTraderAction(branchId: BaseBranchId, values: TraderFormValues): Promise<{ data: Trader | null; error:string | null; }> {
    try {
        const newTrader = await addTraderToDb(branchId, values);
        revalidatePath('/tradehunter');
        return { data: newTrader, error: null };
    } catch (error) {
        console.error(`[Action] Failed to add trader to ${branchId}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
        return { data: null, error: errorMessage };
    }
}

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

export async function bulkAddTradersAction(branchId: BaseBranchId, traders: ParsedTraderData[]): Promise<{ data: Trader[] | null; error: string | null; }> {
    try {
        const newTraders = await bulkAddTradersToDb(branchId, traders);
        revalidatePath('/tradehunter');
        return { data: newTraders, error: null };
    } catch (error) {
        console.error(`[Action] Failed to bulk add traders to ${branchId}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred during bulk add.";
        return { data: null, error: errorMessage };
    }
}

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
