
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Loader2 } from "lucide-react";
import { ProfitPartnerAgentClient } from '@/components/dashboard/ProfitPartnerAgentClient';
import { getTradersAction } from '@/app/(app)/dashboard/actions';
import { getBranchInfo, type BranchInfo, type Trader, type BranchLoginId } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function BuildwiseIntelPage() {
  const intelAppUrl = "https://studio--buildwise-intel.us-central1.hosted.app/";
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoadingTraders, setIsLoadingTraders] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeData = async () => {
      if (typeof window !== 'undefined') {
        const storedLoggedInId = localStorage.getItem('loggedInId') as BranchLoginId | null;
        const info = getBranchInfo(storedLoggedInId);
        setBranchInfo(info);

        if (info.baseBranchId && info.role !== 'unknown') {
          setIsLoadingTraders(true);
          try {
            const result = await getTradersAction(info.baseBranchId);
            if (result.data) {
              setTraders(result.data);
            } else {
              setTraders([]);
              toast({ variant: "destructive", title: "Error Loading Trader Data", description: result.error || "Could not load trader data for the Branch Booster." });
            }
          } catch (error) {
            console.error("Error fetching traders for BuildWise Intel page:", error);
            setTraders([]);
            toast({ variant: "destructive", title: "Error Loading Trader Data", description: "Failed to load trader data for the Branch Booster due to an unexpected error." });
          } finally {
            setIsLoadingTraders(false);
          }
        } else {
          setIsLoadingTraders(false);
          // Redirection if not logged in should be handled by AppLayout
        }
      }
    };
    initializeData();
  }, [toast]);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold text-primary">BuildWise Intel Portal</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Access external insights and tools from BuildWise Intel. Use the Branch Booster below to analyse this information alongside your trader data.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-foreground">
            This section embeds the BuildWise Intel application. Use the scrollbars within the embedded content to navigate.
            If you encounter any issues, please try accessing the site directly.
          </p>
          <div className="w-full h-[75vh] rounded-md overflow-hidden border border-border bg-muted/20 mb-6">
            <iframe
              src={intelAppUrl}
              title="BuildWise Intel Portal"
              className="w-full h-full border-0"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Branch Booster Integration</CardTitle>
          <CardDescription>
            Use the Branch Booster to ask questions that combine insights from the BuildWise Intel portal above with your current trader data.
            For example: "Based on the trends I see in BuildWise Intel, which of my traders are best positioned for growth?"
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTraders ? (
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-muted-foreground">Loading Branch Booster...</p>
            </div>
          ) : branchInfo && branchInfo.baseBranchId && branchInfo.role !== 'unknown' ? (
            <ProfitPartnerAgentClient traders={traders} />
          ) : (
            <p className="text-muted-foreground p-4 text-center">
              Branch information not available or trader data could not be loaded. Please ensure you are logged in correctly to use the Branch Booster here.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
