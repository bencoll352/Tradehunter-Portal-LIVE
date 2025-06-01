
// This file is a Server Component by default in Next.js App Router.
import { DashboardClientPageContent } from '@/components/dashboard/DashboardClientPageContent';
import { addTraderAction, updateTraderAction, deleteTraderAction, bulkAddTradersAction } from './actions';
import type { Trader, ParsedTraderData, BranchId } from '@/types';
import type { z } from 'zod';
import type { traderFormSchema } from '@/components/dashboard/TraderForm';

// Define more specific types for the action props
type AddTraderActionType = (branchId: BranchId, values: z.infer<typeof traderFormSchema>) => Promise<{ data: Trader | null; error: string | null }>;
type UpdateTraderActionType = (branchId: BranchId, traderId: string, values: z.infer<typeof traderFormSchema>) => Promise<{ data: Trader | null; error: string | null }>;
type DeleteTraderActionType = (branchId: BranchId, traderId: string) => Promise<{ success: boolean; error: string | null }>;
type BulkAddTradersActionType = (branchId: BranchId, traders: ParsedTraderData[]) => Promise<{ data: Trader[] | null; error: string | null; }>;


export default function DashboardPage() {
  return (
    <DashboardClientPageContent
      addTraderAction={addTraderAction as AddTraderActionType}
      updateTraderAction={updateTraderAction as UpdateTraderActionType}
      deleteTraderAction={deleteTraderAction as DeleteTraderActionType}
      bulkAddTradersAction={bulkAddTradersAction as BulkAddTradersActionType}
    />
  );
}
