"use client";

import { useEffect, useState, useMemo } from 'react';
import { type BaseBranchId, type Trader, type ParsedTraderData, type BulkDeleteTradersResult, getBranchInfo, type BranchInfo, type BranchLoginId } from "@/types";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TraderTableClient } from "@/components/dashboard/TraderTableClient";
import { ProfitPartnerAgentClient } from "@/components/dashboard/ProfitPartnerAgentClient";
// SalesNavigatorAgentClient is removed from here, will be on its own page
import type { z } from 'zod';
import type { traderFormSchema } from '@/components/dashboard/TraderForm';
import { useToast } from "@/hooks/use-toast";
import { MiniDashboardStats } from './MiniDashboardStats';
import { parseISO } from 'date-fns';
import { getTradersAction } from '@/app/(app)/dashboard/actions'; 
import { InfoAccordion } from '@/components/common/InfoAccordion';
import { Users, Lightbulb, HelpCircle, ListChecks, BarChart } from 'lucide-react';

const dashboardInfoSections = [
  {
    id: "dashboard-capabilities",
    title: "Dashboard & Trader Management Capabilities",
    icon: ListChecks, // Changed from Users for variety
    defaultOpen: true,
    content: [
      "View & Manage Trader Database: Your branch's traders are listed in the main table (50 per page). Use pagination to navigate. Mini-stats at the top provide a quick overview (Active, Call-Backs, New Leads, Recently Active).",
      "Add New Trader: Click 'Add New Trader'. Fill in details like name, sales, status, contact info, notes, and call-back dates. Duplicate phone number warnings are provided.",
      "Edit Trader Information: Click the pencil icon (✏️) in the 'Actions' column to modify and save trader details.",
      "Delete Single/Multiple Traders: Click the trash icon (🗑️) for single deletion. Select multiple traders via checkboxes and use the 'Delete (X)' button for bulk removal. Confirmations are required.",
      "Bulk Add Traders (CSV): Use 'Bulk Add Traders (CSV)'. Upload a CSV with a header row (mandatory 'Name' header). The system uses header names flexibly for data mapping. Duplicates (by phone) are skipped.",
      "Search & Filter: Use the search bar for keywords across various fields. Filter by category using the dropdown.",
      "Sort Trader Data: Click column headers (e.g., 'Name', 'Total Sales', 'Call-Back Date') to sort data.",
      "Set Call-Back Reminders: Use the 'Call-Back Date' field (calendar picker) when adding/editing. View and sort by these dates in the 'Call-Back' column.",
      "Data Persistence & Security: Data is stored per-branch in Firebase Firestore, ensuring persistence and isolation. Access is via your Login ID.",
      "Download Trader Data (CSV): Click 'Download CSV' to export the current table view (respecting filters/search).",
    ],
  },
  {
    id: "branch-booster-dashboard-how-to",
    title: "How to Use Branch Booster (on Dashboard)",
    icon: HelpCircle,
    content: [
      "Locate the 'Branch Booster' section on this Dashboard page.",
      "Ask Questions: Type questions about your traders (e.g., 'List active traders with sales over £50k', 'Who are my top 3 bricklayer traders?') into the text area. Your branch's trader data is automatically used.",
      "Use Quick Actions: Click pre-defined buttons like 'New Customers' or 'Estimate Project Materials' to pre-fill common queries.",
      "Upload Customer/Contextual Data (Optional): Use 'Upload Additional Customer Data' (e.g., .txt, .csv of local prospects) for deeper, context-specific insights like upsell opportunities or multi-customer recommendations.",
      "Get Insights: Click 'Get Insights'. The analysis will appear below. The Branch Booster helps you analyse trader performance, identify trends, and get suggestions.",
      "Example Query: 'What is the average sales per active trader in the 'Plumbing' category?'",
    ],
  },
];


type TraderFormValues = z.infer<typeof traderFormSchema>;

interface DashboardClientPageContentProps {
  addTraderAction: (branchId: BaseBranchId, values: TraderFormValues) => Promise<{ data: Trader | null; error: string | null }>;
  updateTraderAction: (branchId: BaseBranchId, traderId: string, values: TraderFormValues) => Promise<{ data: Trader | null; error: string | null }>;
  deleteTraderAction: (branchId: BaseBranchId, traderId: string) => Promise<{ success: boolean; error: string | null }>;
  bulkAddTradersAction: (branchId: BaseBranchId, traders: ParsedTraderData[]) => Promise<{ data: Trader[] | null; error: string | null; }>;
  bulkDeleteTradersAction: (branchId: BaseBranchId, traderIds: string[]) => Promise<BulkDeleteTradersResult>;
}

export function DashboardClientPageContent({
  addTraderAction,
  updateTraderAction,
  deleteTraderAction,
  bulkAddTradersAction,
  bulkDeleteTradersAction,
}: DashboardClientPageContentProps) {
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyForTable, setKeyForTable] = useState(0); 
  const { toast } = useToast();

  useEffect(() => {
    const initializeDashboard = async () => {
      if (typeof window !== 'undefined') {
        const storedLoggedInId = localStorage.getItem('loggedInId') as BranchLoginId | null;
        const info = getBranchInfo(storedLoggedInId);
        setBranchInfo(info);

        if (info.baseBranchId && info.role !== 'unknown') {
          setIsLoading(true);
          try {
            const result = await getTradersAction(info.baseBranchId);
            if (result.data) {
              setTraders(result.data.sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
            } else {
              setTraders([]);
              toast({ variant: "destructive", title: "Error Loading Data", description: result.error || "Could not load trader data. Server might be busy or configuration issue." });
            }
          } catch (error) {
            console.error("Error fetching initial traders (client catch):", error);
            setTraders([]);
            toast({ variant: "destructive", title: "Error Loading Data", description: "Failed to load trader data due to an unexpected client-side error." });
          } finally {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false); 
        }
      }
    };
    initializeDashboard();
  }, [toast]); 
  
  useEffect(() => {
    const refreshTradersForBranch = async () => {
      if (branchInfo?.baseBranchId && branchInfo?.role !== 'unknown') { 
        setIsLoading(true);
        try {
          const result = await getTradersAction(branchInfo.baseBranchId);
          if (result.data) {
            setTraders(result.data.sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()));
          } else {
             toast({ variant: "destructive", title: "Error Refreshing Data", description: result.error || `Could not refresh traders for ${branchInfo.baseBranchId}.` });
          }
        } catch (error) {
          console.error(`Error refreshing traders for ${branchInfo.baseBranchId} (client catch):`, error);
          toast({ variant: "destructive", title: "Error Refreshing Data", description: "Failed to refresh trader data." });
        } finally {
          setIsLoading(false);
        }
      } else if (branchInfo && branchInfo.role === 'unknown') {
        setTraders([]);
        setIsLoading(false);
      }
    };
     refreshTradersForBranch();
  }, [branchInfo, keyForTable, toast]); 

  const activeTradersCount = useMemo(() => traders.filter(t => t.status === 'Active').length, [traders]);
  const callBackTradersCount = useMemo(() => traders.filter(t => t.status === 'Call-Back').length, [traders]);
  const newLeadTradersCount = useMemo(() => traders.filter(t => t.status === 'New Lead').length, [traders]);
  const recentlyActiveTradersCount = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return traders.filter(t => {
      try {
        return parseISO(t.lastActivity) >= thirtyDaysAgo;
      } catch (e) {
        console.warn(`Invalid date format for trader ID ${t.id}: ${t.lastActivity}`);
        return false; 
      }
    }).length;
  }, [traders]);

  const currentBaseBranchId = branchInfo?.baseBranchId;
  const currentUserRole = branchInfo?.role;

  const handleAdd = async (values: TraderFormValues): Promise<boolean> => {
    if (!currentBaseBranchId || currentUserRole === 'unknown') {
      toast({ variant: "destructive", title: "Operation Aborted", description: "Cannot add trader: Invalid Branch ID or Role. Please re-login." });
      return false;
    }
    const result = await addTraderAction(currentBaseBranchId, values);
    if (result.data) {
      setKeyForTable(prev => prev + 1); 
      toast({ title: "Success", description: `${result.data.name} added.`});
      return true;
    }
    toast({ variant: "destructive", title: "Error Adding Trader", description: result.error || "Failed to add trader." });
    return false;
  };

  const handleUpdate = async (traderId: string, values: TraderFormValues): Promise<boolean> => {
     if (!currentBaseBranchId || currentUserRole === 'unknown') {
      toast({ variant: "destructive", title: "Operation Aborted", description: "Cannot update trader: Invalid Branch ID or Role. Please re-login." });
      return false;
    }
    const result = await updateTraderAction(currentBaseBranchId, traderId, values);
    if (result.data) {
      setKeyForTable(prev => prev + 1);
      toast({ title: "Success", description: `${result.data.name} updated.`});
      return true;
    }
    toast({ variant: "destructive", title: "Error Updating Trader", description: result.error || "Failed to update trader." });
    return false;
  };

  const handleDelete = async (traderId: string): Promise<boolean> => {
     if (!currentBaseBranchId || currentUserRole === 'unknown') {
      toast({ variant: "destructive", title: "Operation Aborted", description: "Cannot delete trader: Invalid Branch ID or Role. Please re-login." });
      return false;
    }
    const result = await deleteTraderAction(currentBaseBranchId, traderId);
    if (result.success) {
      setKeyForTable(prev => prev + 1);
    } else {
       toast({ variant: "destructive", title: "Error Deleting Trader", description: result.error || "Failed to delete trader." });
    }
    return result.success;
  };

  const handleBulkAdd = async (tradersToCreate: ParsedTraderData[]): Promise<{ data: Trader[] | null; error: string | null; }> => {
    if (!currentBaseBranchId || currentUserRole === 'unknown') {
      toast({ variant: "destructive", title: "Operation Aborted", description: "Cannot bulk add: Invalid Branch ID or Role. Please re-login." });
      return { data: null, error: "Invalid or missing Branch ID/Role." };
    }
    const result = await bulkAddTradersAction(currentBaseBranchId, tradersToCreate); 
    if (result.data && result.data.length > 0) { 
      setKeyForTable(prev => prev + 1);
    } 
    return result;
  };

  const handleBulkDelete = async (traderIds: string[]): Promise<BulkDeleteTradersResult> => {
    if (!currentBaseBranchId || currentUserRole === 'unknown') {
      toast({ variant: "destructive", title: "Operation Aborted", description: "Cannot bulk delete: Invalid Branch ID or Role. Please re-login." });
      return { successCount: 0, failureCount: traderIds.length, error: "Invalid or missing Branch ID/Role." };
    }
    const result = await bulkDeleteTradersAction(currentBaseBranchId, traderIds);
    if (result.successCount > 0) {
      setKeyForTable(prev => prev + 1); 
    }
    return result;
  };

  if (isLoading && !traders.length && (!currentBaseBranchId || currentUserRole !== 'unknown')) { 
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full md:w-1/2 lg:w-1/3" />
        <Skeleton className="h-12 w-1/4" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!currentBaseBranchId && !isLoading) { 
    return <p>Error: Branch information not found. Please ensure you are logged in correctly.</p>;
  }
  
  return (
    <div className="space-y-6">
      <MiniDashboardStats 
        liveTradersCount={activeTradersCount}
        callBackTradersCount={callBackTradersCount}
        newLeadTradersCount={callBackTradersCount}
        newLeadTradersCount={newLeadTradersCount}
        recentlyActiveTradersCount={recentlyActiveTradersCount}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Trader Overview</CardTitle>
              <CardDescription>Manage traders for branch: {branchInfo?.displayLoginId || 'Loading...'} ({currentUserRole})</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && traders.length === 0 && (currentBaseBranchId && currentUserRole !== 'unknown') ? (
                 <Skeleton className="h-64 w-full" />
              ) : (
                <TraderTableClient 
                  key={keyForTable} 
                  initialTraders={traders} 
                  branchId={currentBaseBranchId!} 
                  allBranchTraders={traders} 
                  onAdd={handleAdd}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onBulkAdd={handleBulkAdd}
                  onBulkDelete={handleBulkDelete}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <ProfitPartnerAgentClient traders={traders} />
          {/* SalesNavigatorAgentClient is now on its own page, conditionally shown in AppHeader */}
        </div>
      </div>
      <InfoAccordion sections={dashboardInfoSections} className="mt-8 lg:col-span-3"/>
    </div>
  );
}
