
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react"; 
import { getBranchInfo, type BranchInfo, type Trader, type BranchLoginId } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { getTradersAction } from '@/app/(app)/tradehunter/actions';
import { DashboardStatsAndGoals } from '@/components/dashboard/DashboardStatsAndGoals';
import { BranchPerformanceChart } from '@/components/dashboard/BranchPerformanceChart';
import { MiniDashboardStats } from '@/components/dashboard/MiniDashboardStats';
import { parseISO } from 'date-fns';

export default function DashboardPage() {
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeData = async () => {
      if (typeof window !== 'undefined') {
        setIsLoading(true);
        const storedLoggedInId = localStorage.getItem('loggedInId') as BranchLoginId | null;
        const info = getBranchInfo(storedLoggedInId);
        setBranchInfo(info);

        if (info.baseBranchId && info.role !== 'unknown') {
          try {
            const result = await getTradersAction(info.baseBranchId);
            if (result.data) {
              setTraders(result.data);
            } else {
              toast({ variant: "destructive", title: "Error Loading Data", description: result.error || "Could not load trader data." });
            }
          } catch (error) {
            console.error("Failed to fetch initial traders:", error);
            toast({ variant: "destructive", title: "Network Error", description: "Could not connect to the server to load data." });
          }
          finally {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      }
    };
    initializeData();
  }, [toast]);
  
  const activeTradersCount = traders.filter(t => t.status === 'Active').length;
  const callBackTradersCount = traders.filter(t => t.status === 'Call-Back').length;
  const newLeadTradersCount = traders.filter(t => t.status === 'New Lead').length;
  const recentlyActiveTradersCount = traders.filter(t => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    try {
      return parseISO(t.lastActivity) >= thirtyDaysAgo;
    } catch (e) {
      return false; 
    }
  }).length;
  
  const inactiveCount = traders.length - activeTradersCount - callBackTradersCount - newLeadTradersCount;

  const chartData = [
    { name: "Active", count: activeTradersCount, fill: "hsl(var(--primary))" },
    { name: "Hot Leads", count: callBackTradersCount, fill: "hsl(var(--accent))" },
    { name: "New Leads", count: newLeadTradersCount, fill: "hsl(var(--secondary))" },
    { name: "Inactive", count: inactiveCount > 0 ? inactiveCount : 0, fill: "hsl(var(--muted))" },
  ];

  if (isLoading) {
      return (
          <div className="flex h-[80vh] w-full items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      );
  }

  if (!branchInfo || (branchInfo.role === 'manager' && !branchInfo.baseBranchId)) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Welcome, Manager</CardTitle>
                <CardDescription>This is your central dashboard overview. Please select a branch from the login screen to view specific trader data.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Global dashboard analytics are coming soon.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      <MiniDashboardStats 
        liveTradersCount={activeTradersCount}
        callBackTradersCount={callBackTradersCount}
        newLeadTradersCount={newLeadTradersCount}
        recentlyActiveTradersCount={recentlyActiveTradersCount}
      />
      <DashboardStatsAndGoals newLeadsCount={newLeadTradersCount} hotLeadsCount={callBackTradersCount} />
      <BranchPerformanceChart data={chartData} />
    </div>
  );
}
