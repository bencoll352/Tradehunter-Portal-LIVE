
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStatsAndGoals } from '@/components/dashboard/DashboardStatsAndGoals';
import type { Trader, BranchInfo, BranchLoginId } from '@/types';
import { getBranchInfo } from '@/types';
import { getTradersAction } from '@/app/(app)/tradehunter/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { BranchPerformanceChart } from '@/components/dashboard/BranchPerformanceChart';

export default function DashboardOverviewPage() {
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeData = async () => {
      if (typeof window !== 'undefined') {
        const storedLoggedInId = localStorage.getItem('loggedInId') as BranchLoginId | null;
        const storedUser = localStorage.getItem('loggedInUser');
        const info = getBranchInfo(storedLoggedInId, storedUser);
        setBranchInfo(info);

        if (info.baseBranchId && info.role !== 'unknown') {
          try {
            const result = await getTradersAction(info.baseBranchId);
            if (result.data) {
              setTraders(result.data);
            } else {
              setTraders([]);
              toast({ variant: "destructive", title: "Error Loading Data", description: result.error || "Could not load trader data." });
            }
          } catch (error) {
             setTraders([]);
             toast({ variant: "destructive", title: "Error Loading Data", description: "Failed to load trader data." });
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
  const hotLeadsCount = traders.filter(t => t.status === 'Call-Back').length;
  const activeTradersCount = traders.filter(t => t.status === 'Active').length;
  const inactiveTradersCount = traders.filter(t => t.status === 'Inactive').length;

  const chartData = [
    { name: 'Active', count: activeTradersCount, fill: "hsl(var(--chart-2))" },
    { name: 'Hot Leads', count: hotLeadsCount, fill: "hsl(var(--chart-1))" },
    { name: 'New Leads', count: newLeadsCount, fill: "hsl(var(--chart-4))" },
    { name: 'Inactive', count: inactiveTradersCount, fill: "hsl(var(--muted))" },
  ];

  return (
    <div className="space-y-8">
       <div className="flex justify-start items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            {branchInfo?.branchName ?? 'Dashboard'} Overview
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {branchInfo?.role === 'manager' ? 'Manager' : 'Staff'}. DOMINATE YOUR TERRITORY.
          </p>
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-80 w-full" />
                </CardContent>
            </Card>
        </div>
      ) : (
        <>
         <DashboardStatsAndGoals 
            newLeadsCount={newLeadsCount}
            hotLeadsCount={hotLeadsCount}
        />
         <BranchPerformanceChart data={chartData} />
        </>
      )}
    </div>
  );
}
