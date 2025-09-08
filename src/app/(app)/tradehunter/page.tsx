
import {
  addTraderAction,
  updateTraderAction,
  deleteTraderAction,
  bulkAddTradersAction,
  bulkDeleteTradersAction
} from './actions';
import { DashboardClientPageContent } from '@/components/dashboard/DashboardClientPageContent';

export default function TradeHunterDashboardPage() {
  return (
    <DashboardClientPageContent
      addTraderAction={addTraderAction}
      updateTraderAction={updateTraderAction}
      deleteTraderAction={deleteTraderAction}
      bulkAddTradersAction={bulkAddTradersAction}
      bulkDeleteTradersAction={bulkDeleteTradersAction}
    />
  );
}
