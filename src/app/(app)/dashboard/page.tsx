
// This file is a Server Component by default in Next.js App Router.
import { DashboardClientPageContent } from '@/components/dashboard/DashboardClientPageContent';
import { addTraderAction, updateTraderAction, deleteTraderAction, bulkAddTradersAction } from './actions';

export default function DashboardPage() {
  return (
    <DashboardClientPageContent
      addTraderAction={addTraderAction}
      updateTraderAction={updateTraderAction}
      deleteTraderAction={deleteTraderAction}
      bulkAddTradersAction={bulkAddTradersAction}
    />
  );
}
