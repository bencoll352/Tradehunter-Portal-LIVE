
'use server';

import { z } from 'zod';
import {
  getTraders,
  addTrader,
  updateTrader,
  deleteTrader,
  bulkAddTraders,
  bulkDeleteTraders,
  createTask,
  updateTask,
  deleteTask,
} from '@/lib/trader-service';
import type { BaseBranchId, ParsedTraderData, Trader, Task } from '@/types';
import { traderFormSchema } from '@/components/dashboard/TraderForm';
import { TaskSchema } from '@/types';

type TraderFormValues = z.infer<typeof traderFormSchema>;

/**
 * Gets all traders for a given branch.
 */
export async function getTradersAction(
  branchId: BaseBranchId
): Promise<{ data: Trader[] | null; error: string | null }> {
  try {
    const traders = await getTraders(branchId);
    return { data: traders, error: null };
  } catch (error: any) {
    console.error(`[Action Error: getTradersAction]`, error);
    return { data: null, error: error.message };
  }
}

/**
 * Adds a new trader to a branch.
 */
export async function addTraderAction(
  branchId: BaseBranchId,
  traderData: TraderFormValues
): Promise<{ data: Trader | null; error: string | null }> {
  try {
    const newTrader = await addTrader(branchId, traderData);
    return { data: newTrader, error: null };
  } catch (error: any) {
    console.error(`[Action Error: addTraderAction]`, error);
    return { data: null, error: error.message };
  }
}

/**
 * Updates an existing trader.
 */
export async function updateTraderAction(
  branchId: BaseBranchId,
  traderId: string,
  traderData: TraderFormValues
): Promise<{ data: Trader | null; error: string | null }> {
  try {
    const updatedTrader = await updateTrader(branchId, traderId, traderData);
    return { data: updatedTrader, error: null };
  } catch (error: any) {
    console.error(`[Action Error: updateTraderAction]`, error);
    return { data: null, error: error.message };
  }
}

/**
 * Deletes a trader.
 */
export async function deleteTraderAction(
  branchId: BaseBranchId,
  traderId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    await deleteTrader(branchId, traderId);
    return { success: true, error: null };
  } catch (error: any) {
    console.error(`[Action Error: deleteTraderAction]`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Bulk adds traders from a parsed CSV file.
 */
export async function bulkAddTradersAction(
  branchId: BaseBranchId,
  tradersData: ParsedTraderData[]
): Promise<{ data: Trader[] | null; error: string | null; }> {
  try {
    const newTraders = await bulkAddTraders(branchId, tradersData);
    return { data: newTraders, error: null };
  } catch (error: any) {
    console.error(`[Action Error: bulkAddTradersAction]`, error);
    return { data: null, error: error.message };
  }
}

/**
 * Bulk deletes traders by their IDs.
 */
export async function bulkDeleteTradersAction(
  branchId: BaseBranchId,
  traderIds: string[]
): Promise<{ successCount: number, failureCount: number, error: string | null }> {
    try {
        const result = await bulkDeleteTraders(branchId, traderIds);
        return { ...result, error: null };
    } catch (error: any) {
        console.error(`[Action Error: bulkDeleteTradersAction]`, error);
        return { successCount: 0, failureCount: traderIds.length, error: error.message };
    }
}

/**
 * Creates a new task for a trader.
 */
export async function createTaskAction(
  branchId: BaseBranchId,
  taskData: Omit<Task, 'id'>
): Promise<{ data: Task | null; error: string | null }> {
  try {
    const newTask = await createTask(branchId, taskData);
    return { data: newTask, error: null };
  } catch (error: any) {
    console.error(`[Action Error: createTaskAction]`, error);
    return { data: null, error: error.message };
  }
}

/**
 * Updates an existing task.
 */
export async function updateTaskAction(
  branchId: BaseBranchId,
  traderId: string,
  taskId: string,
  taskData: Partial<Task>
): Promise<{ data: Task | null; error: string | null }> {
  try {
    const updatedTask = await updateTask(branchId, traderId, taskId, taskData);
    return { data: updatedTask, error: null };
  } catch (error: any) {
    console.error(`[Action Error: updateTaskAction]`, error);
    return { data: null, error: error.message };
  }
}

/**
 * Deletes a task.
 */
export async function deleteTaskAction(
  branchId: BaseBranchId,
  traderId: string,
  taskId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    await deleteTask(branchId, traderId, taskId);
    return { success: true, error: null };
  } catch (error: any) {
    console.error(`[Action Error: deleteTaskAction]`, error);
    return { success: false, error: error.message };
  }
}

    