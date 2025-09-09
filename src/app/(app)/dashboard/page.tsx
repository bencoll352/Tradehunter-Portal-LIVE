
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react"; 
import { getBranchInfo, type BranchInfo, type Trader, type BranchLoginId } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { getTradersAction } from '@/app/(app)/tradehunter/actions';
import { DashboardStatsAndGoals } from '@/components/dashboard/DashboardStatsAndGoals';
import { BranchPerformanceChart } from '@/components/dashboard/BranchPerformanceChart';

export default function DashboardPage() {
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeData = async () => {
      if (typeof window !== 'undefined') {
        const storedLoggedInId = localStorage.getItem('loggedInId') as BranchLoginId | null;
        const info = getBranchInfo(storedLoggedInId);
        setBranchInfo(info);

        if (info.baseBranchId && info.role !== 'unknown') {
          setIsLoading(true);
          try {
            const result = await getTradersAction(info.baseBranchId);
            if (result.data) {
              setTraders(result.data);
            } else {
              toast({ variant: "destructive", title: "Error Loading Data", description: result.error || "Could not load trader data." });
            }
          } finally {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      }
    };
    initializeData();
  }, [toast]);
  
  const newLeadsCount = traders.filter(t => t.status === 'New Lead').length;
  const activeCount = traders.filter(t => t.status === 'Active').length;
  const inactiveCount = traders.filter(t => t.status === 'Inactive').length;
  const hotLeadsCount = traders.filter(t => t.status === 'Call-Back').length;

  const chartData = [
    { name: "Active", count: activeCount, fill: "var(--color-active)" },
    { name: "Hot Leads", count: hotLeadsCount, fill: "var(--color-hot-leads)" },
    { name: "New Leads", count: newLeadsCount, fill: "var(--color-new-leads)" },
    { name: "Inactive", count: inactiveCount, fill: "var(--color-inactive)" },
  ];

  if (isLoading) {
      return (
          <div className="flex h-screen w-full items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <DashboardStatsAndGoals newLeadsCount={newLeadsCount} hotLeadsCount={hotLeadsCount} />
      <BranchPerformanceChart data={chartData} />
    </div>
  );
}
