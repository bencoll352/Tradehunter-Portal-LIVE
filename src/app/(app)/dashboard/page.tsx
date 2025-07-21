
"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Eye, Briefcase, Calculator, Users, ArrowRight, Columns, Loader2 } from "lucide-react";
import { getBranchInfo, type BranchInfo, type Trader, type BranchLoginId } from '@/types';
import { getTradersAction } from '@/app/(app)/tradehunter/actions'; // Adjusted path
import { useToast } from '@/hooks/use-toast';
import { DashboardStatsAndGoals } from '@/components/dashboard/DashboardStatsAndGoals';
import { parseISO } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function DashboardOverviewPage() {
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializeBranchInfo = () => {
      if (typeof window !== 'undefined') {
        const storedLoggedInId = localStorage.getItem('loggedInId') as BranchLoginId | null;
        const info = getBranchInfo(storedLoggedInId);
        setBranchInfo(info);
      }
    };
    initializeBranchInfo();
  }, []);

  useEffect(() => {
    const fetchTraderData = async () => {
      if (branchInfo?.baseBranchId && branchInfo.role !== 'unknown') {
        setIsLoadingStats(true);
        setError(null);
        try {
          const result = await getTradersAction(branchInfo.baseBranchId);
          if (result.data) {
            setTraders(result.data);
          } else {
            setTraders([]);
            setError(result.error);
            toast({ variant: "destructive", title: "Error Loading Stats Data", description: result.error || "Could not load trader data for dashboard stats." });
          }
        } catch (error) {
          console.error("Error fetching traders for dashboard stats:", error);
          const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
          setError(errorMessage);
          setTraders([]);
          toast({ variant: "destructive", title: "Error Loading Stats Data", description: "Failed to load trader data for dashboard stats due to an unexpected error." });
        } finally {
          setIsLoadingStats(false);
        }
      } else if (branchInfo && branchInfo.role === 'unknown') {
        setIsLoadingStats(false); // No valid branch to fetch for
      }
    };

    if (branchInfo) { // Only fetch if branchInfo is resolved
      fetchTraderData();
    }
  }, [branchInfo, toast]);

  const newLeadsCount = useMemo(() => traders.filter(t => t.status === 'New Lead').length, [traders]);
  const hotLeadsCount = useMemo(() => traders.filter(t => t.status === 'Call-Back').length, [traders]);
  const activeTradersCount = useMemo(() => traders.filter(t => t.status === 'Active').length, [traders]);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg w-full bg-gradient-to-br from-primary/5 via-background to-background border-primary/20">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
              <Columns className="h-12 w-12 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-primary">Welcome to TradeHunter Pro</CardTitle>
              <CardDescription className="text-lg md:text-xl text-muted-foreground mt-1">
                Your central hub for managing traders, accessing market intelligence, and estimating materials.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground mb-4 text-center md:text-left">
            Navigate through the portal using the header tabs, sidebar, or the quick links below to access powerful tools designed to boost your branch's performance.
          </p>
          <p className="text-lg font-semibold text-accent text-center md:text-left italic px-4 py-2 bg-accent/10 rounded-md border border-accent/30">
            The precision intelligence system that enables builders merchants to identify, target, and engage with ALL construction professionals within their territories.
          </p>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Database Connection Error</AlertTitle>
          <AlertDescription>
            <p>Could not load branch data. The error is: <strong>{error}</strong></p>
            <p className="mt-2 text-xs">This usually means the Firebase configuration variables are missing or incorrect. Please check your hosting environment variables (e.g., in your `.env.local` file for local development) and ensure they are all set correctly. You may need to restart your development server after making changes.</p>
          </AlertDescription>
        </Alert>
      )}

      {isLoadingStats ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading branch data for stats...</p>
        </div>
      ) : !error && branchInfo && branchInfo.role !== 'unknown' ? (
         <DashboardStatsAndGoals
            newLeadsCount={newLeadsCount}
            hotLeadsCount={hotLeadsCount}
            activeTradersGoalInitial={activeTradersCount} /* Pass current active count as potential initial value for goal */
          />
      ) : !branchInfo || branchInfo.role === 'unknown' ? (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="text-lg text-muted-foreground">Branch Statistics & Goals</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Login to view branch-specific statistics and set goals.</p>
            </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          title="TradeHunter Hub"
          description="Manage your trader database, track performance, and get advanced insights with the Branch Booster. Access detailed trader information, add new traders, and perform bulk actions."
          icon={<Users className="h-8 w-8 text-accent" />}
          link="/tradehunter"
        />
        <FeatureCard
          title="BuildWise Intel"
          description="Access specialised external data and insights from the BuildWise Intel portal. Use the integrated Branch Booster to analyse this information alongside your trader data."
          icon={<Briefcase className="h-8 w-8 text-accent" />}
          link="/buildwise-intel"
        />
        <FeatureCard
          title="Materials Estimator"
          description="Utilise the external Building Materials Estimator tool to plan for projects. Estimate quantities for common construction tasks efficiently."
          icon={<Calculator className="h-8 w-8 text-accent" />}
          link="/estimator"
        />
      </div>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

function FeatureCard({ title, description, icon, link }: FeatureCardProps) {
  return (
    <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden border-border hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-3">
          {icon}
          <CardTitle className="text-xl text-primary">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
      </CardContent>
      <CardContent className="pt-0">
         <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={link}>
            Go to {title} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
