
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, TrendingUp } from "lucide-react"; 
import { getBranchInfo, type BranchInfo, type Trader, type BranchLoginId } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { getTradersAction } from '@/app/(app)/tradehunter/actions';
import { DashboardStatsAndGoals } from '@/components/dashboard/DashboardStatsAndGoals';
import { MiniDashboardStats } from '@/components/dashboard/MiniDashboardStats';

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
  const hotLeadsCount = traders.filter(t => t.status === 'Call-Back').length;

  if (isLoading) {
      return (
          <div className="flex h-screen w-full items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              <div>
                  <CardTitle className="text-2xl text-primary">Welcome to your Portal</CardTitle>
                  <CardDescription>Your command centre for trade intelligence and sales growth.</CardDescription>
              </div>
          </div>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                This is your central hub for managing customer relationships and analysing market data. Navigate to the
                Trader Database to view and manage your customers, or use the Insight & Assistance features to get a
                competitive edge.
            </p>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl text-primary">Branch Pulse & Targets</CardTitle>
              </div>
              <CardDescription>Key performance indicators and goal setting for your branch.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
                          <UsersIcon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                          <div className="text-2xl font-bold">{newLeadsCount}</div>
                          <p className="text-xs text-muted-foreground">Traders currently in 'New Lead' status.</p>
                      </CardContent>
                  </Card>
                  <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
                          <FlameIcon className="h-4 w-4 text-destructive" />
                      </CardHeader>
                      <CardContent>
                          <div className="text-2xl font-bold">{hotLeadsCount}</div>
                          <p className="text-xs text-muted-foreground">Traders marked for 'Call-Back'.</p>
                      </CardContent>
                  </Card>
              </div>
              <DashboardStatsAndGoals newLeadsCount={newLeadsCount} hotLeadsCount={hotLeadsCount} />
          </CardContent>
      </Card>

    </div>
  );
}


function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }
  
  
  function FlameIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5-2 4.5-2 4.5-.5 1-1.5 2.5-1.5 2.5-1 2.304-1.5 4.493-1.5 6.5A2.5 2.5 0 0 0 8.5 14.5Z" />
        <path d="M14.5 14.5a2.5 2.5 0 0 1-2.5 2.5c-1.38 0-2.5-1.12-2.5-2.5 0-1.64.5-3 1.5-5 .5-1 .5-1.5-.5-2-.5-.5 0-1 .5-1a2 2 0 0 1 2.5 2.5c.5 1 1.5 2.5 1.5 2.5C14 11.5 14.5 13 14.5 14.5Z" />
      </svg>
    )
  }
