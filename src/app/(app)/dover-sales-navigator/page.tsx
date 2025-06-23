
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass, AlertTriangle, Loader2, Rocket } from "lucide-react"; 
import { getBranchInfo, type BranchInfo, type Trader, type BranchLoginId } from '@/types';
import { ProfitPartnerAgentClient } from '@/components/dashboard/ProfitPartnerAgentClient';
import { getTradersAction } from '@/app/(app)/tradehunter/actions'; 
import { useToast } from '@/hooks/use-toast';

export default function DoverSalesNavigatorPage() {
  const navigatorAppUrl = "https://sales-and-strategy-navigator-dover-302177537641.us-west1.run.app/";
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTraders, setIsLoadingTraders] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeData = async () => {
      if (typeof window !== 'undefined') {
        const storedLoggedInId = localStorage.getItem('loggedInId') as BranchLoginId | null;
        const info = getBranchInfo(storedLoggedInId);
        setBranchInfo(info);
        setIsLoading(false); // Done loading user info

        if (info.displayLoginId === 'DOVERMANAGER' && info.baseBranchId) {
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
            console.error("Error fetching traders for Dover Sales Navigator page:", error);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading user information...</p>
      </div>
    );
  }

  if (branchInfo?.displayLoginId !== 'DOVERMANAGER') {
    return (
      <Card className="shadow-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <CardTitle className="text-2xl text-destructive">Access Denied</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground">
            This page is exclusively available for the Dover Manager account.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6"> 
      <Card className="shadow-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Compass className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold text-primary">Dover Sales & Strategy Navigator</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Your advanced hub for the Dover branch, offering specialized sales insights and strategic planning capabilities.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-foreground">
            Leverage this dedicated navigator to uncover in-depth sales intelligence, identify strategic opportunities, and access comprehensive planning tools tailored for the Dover branch.
          </p>
          <div className="w-full h-[75vh] rounded-md overflow-hidden border border-border bg-muted/20">
            <iframe
              src={navigatorAppUrl}
              title="Dover Sales & Strategy Navigator"
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
                       Use the Branch Booster to ask questions. You can reference specific data you observe in the Dover Navigator above (e.g., "Analyze the 'High Growth Potential' segment from the navigator for opportunities with my Dover traders"). The Booster will analyze this alongside your local trader data.
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
          ) : traders.length > 0 ? (
            <ProfitPartnerAgentClient traders={traders} />
          ) : (
            <p className="text-muted-foreground p-4 text-center">
              Trader data for Dover could not be loaded. The Branch Booster requires trader data to function.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
