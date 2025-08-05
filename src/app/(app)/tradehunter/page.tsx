
// This file is a Server Component by default in Next.js App Router.
import { DashboardClientPageContent } from '@/components/dashboard/DashboardClientPageContent';
import { addTraderAction, updateTraderAction, deleteTraderAction, bulkAddTradersAction, bulkDeleteTradersAction } from './actions';
import type { Trader, ParsedTraderData, BaseBranchId, BulkDeleteTradersResult } from '@/types';
import type { z } from 'zod';
import type { traderFormSchema } from '@/components/dashboard/TraderForm';

// Define more specific types for the action props using BaseBranchId
type AddTraderActionType = (branchId: BaseBranchId, values: z.infer<typeof traderFormSchema>) => Promise<{ data: Trader | null; error: string | null }>;
type UpdateTraderActionType = (branchId: BaseBranchId, traderId: string, values: z.infer<typeof traderFormSchema>) => Promise<{ data: Trader | null; error: string | null }>;
type DeleteTraderActionType = (branchId: BaseBranchId, traderId: string) => Promise<{ success: boolean; error: string | null }>;
type BulkAddTradersActionType = (branchId: BaseBranchId, traders: ParsedTraderData[]) => Promise<{ data: Trader[] | null; error: string | null; }>;
type BulkDeleteTradersActionType = (branchId: BaseBranchId, traderIds: string[]) => Promise<BulkDeleteTradersResult>;


export default function TradeHunterPage() { // Renamed function
  return (
    <DashboardClientPageContent 
      addTraderAction={addTraderAction as AddTraderActionType}
      updateTraderAction={updateTraderAction as UpdateTraderActionType}
      deleteTraderAction={deleteTraderAction as DeleteTraderActionType}
      bulkAddTradersAction={bulkAddTradersAction as BulkAddTradersActionType}
      bulkDeleteTradersAction={bulkDeleteTradersAction as BulkDeleteTradersActionType}
    />
  );
}
