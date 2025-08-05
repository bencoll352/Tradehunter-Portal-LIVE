
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStatsAndGoals } from '@/components/dashboard/DashboardStatsAndGoals';
import { Bot } from "lucide-react"; 
import type { Trader, BranchInfo, BranchLoginId } from '@/types';
import { getBranchInfo } from '@/types';
import { getTradersAction } from '@/app/(app)/tradehunter/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardOverviewPage() {
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

  return (
    <div className="space-y-8">
      <Card className="shadow-lg w-full bg-gradient-to-br from-primary/5 via-background to-background border-primary/20">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
              <Bot className="h-12 w-12 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-primary">Welcome to your Portal</CardTitle>
              <CardDescription className="text-lg md:text-xl text-muted-foreground mt-1">
                Your command center for trade intelligence and sales growth.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground max-w-3xl">
            This is your central hub for managing customer relationships and analyzing market data. 
            Navigate to the Trader Database to view and manage your customers, or use the Insight & Assistance features to get a competitive edge.
          </p>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="shadow-lg w-full border-accent/30">
            <CardHeader>
                 <Skeleton className="h-8 w-1/2" />
                 <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                </div>
                <div className="space-y-4 pt-4 border-t">
                     <Skeleton className="h-6 w-1/3" />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <Skeleton className="h-16" />
                         <Skeleton className="h-16" />
                     </div>
                </div>
            </CardContent>
        </Card>
      ) : (
         <DashboardStatsAndGoals 
            newLeadsCount={newLeadsCount}
            hotLeadsCount={hotLeadsCount}
        />
      )}
    </div>
  );
}
