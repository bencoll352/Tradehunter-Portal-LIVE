
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Rocket, Home } from "lucide-react"; // Restored Home icon
import { ProfitPartnerAgentClient } from '@/components/dashboard/ProfitPartnerAgentClient';
import { getTradersAction } from '@/app/(app)/dashboard/actions';
import { getBranchInfo, type BranchInfo, type Trader, type BranchLoginId } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function BuildwiseIntelPage() {
  const intelAppUrl = "https://studio--buildwise-intel.us-central1.hosted.app/"; // Restored intelAppUrl
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
        }
      }
    };
    initializeData();
  }, [toast]);

  return (
    <div className="space-y-6">
      {/* Restored Card containing the BuildWise Intel Portal iframe */}
      <Card className="shadow-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
              <Home className="h-8 w-8 text-primary" />
              <div>
                  <CardTitle className="text-2xl text-primary">BuildWise Intel Portal</CardTitle>
                  <CardDescription>
                      Access specialised data and insights from the BuildWise Intel external application.
                      Use the Branch Booster below to analyse this information alongside your trader data.
                  </CardDescription>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[75vh] rounded-md overflow-hidden border border-border bg-muted/20">
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
          <div className="flex items-center gap-3">
              <Rocket className="h-8 w-8 text-primary" />
              <div>
                  <CardTitle className="text-2xl text-primary">Branch Booster</CardTitle>
                  <CardDescription>
                      Use the Branch Booster to ask questions and analyse your current trader data.
                      You can also ask questions that bridge insights from the Intel portal above with your trader data.
                  </CardDescription>
              </div>
          </div>
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
