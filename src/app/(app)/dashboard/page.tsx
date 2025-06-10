
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Eye, Briefcase, Calculator, Users, ArrowRight, Columns, Loader2 } from "lucide-react";
import Image from 'next/image';
import { getBranchInfo, type BranchInfo, type Trader, type BranchLoginId } from '@/types';
import { getTradersAction } from '@/app/(app)/tradehunter/actions'; // Adjusted path
import { useToast } from '@/hooks/use-toast';
import { DashboardStatsAndGoals } from '@/components/dashboard/DashboardStatsAndGoals';
import { parseISO } from 'date-fns';

export default function DashboardOverviewPage() {
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
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
        try {
          const result = await getTradersAction(branchInfo.baseBranchId);
          if (result.data) {
            setTraders(result.data);
          } else {
            setTraders([]);
            toast({ variant: "destructive", title: "Error Loading Stats Data", description: result.error || "Could not load trader data for dashboard stats." });
          }
        } catch (error) {
          console.error("Error fetching traders for dashboard stats:", error);
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

      {isLoadingStats && (!branchInfo || branchInfo.role === 'unknown') ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading branch data for stats...</p>
        </div>
      ) : branchInfo && branchInfo.role !== 'unknown' ? (
         <DashboardStatsAndGoals
            newLeadsCount={newLeadsCount}
            hotLeadsCount={hotLeadsCount}
            activeTradersGoalInitial={activeTradersCount} /* Pass current active count as potential initial value for goal */
          />
      ) : (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="text-lg text-muted-foreground">Branch Statistics & Goals</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Login to view branch-specific statistics and set goals.</p>
            </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          title="TradeHunter Hub"
          description="Manage your trader database, track performance, and get advanced insights with the Branch Booster. Access detailed trader information, add new traders, and perform bulk actions."
          icon={<Users className="h-8 w-8 text-accent" />}
          link="/tradehunter"
          imageSrc="https://placehold.co/600x400.png"
          imageHint="trader management"
        />
        <FeatureCard
          title="BuildWise Intel"
          description="Access specialised external data and insights from the BuildWise Intel portal. Use the integrated Branch Booster to analyse this information alongside your trader data."
          icon={<Briefcase className="h-8 w-8 text-accent" />}
          link="/buildwise-intel"
          imageSrc="https://placehold.co/600x400.png"
          imageHint="market intelligence"
        />
        <FeatureCard
          title="Materials Estimator"
          description="Utilise the external Building Materials Estimator tool to plan for projects. Estimate quantities for common construction tasks efficiently."
          icon={<Calculator className="h-8 w-8 text-accent" />}
          link="/estimator"
          imageSrc="https://placehold.co/600x400.png"
          imageHint="materials estimation"
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
  imageSrc: string;
  imageHint: string;
}

function FeatureCard({ title, description, icon, link, imageSrc, imageHint }: FeatureCardProps) {
  return (
    <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden border-border hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-3">
          {icon}
          <CardTitle className="text-xl text-primary">{title}</CardTitle>
        </div>
         <Image 
            src={imageSrc} 
            alt={title} 
            width={600} 
            height={400} 
            className="rounded-md aspect-[3/2] object-cover border" 
            data-ai-hint={imageHint}
        />
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
