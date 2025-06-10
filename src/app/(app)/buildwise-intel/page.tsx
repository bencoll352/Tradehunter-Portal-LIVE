
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Loader2, HelpCircle, ListChecks, Rocket } from "lucide-react";
import { ProfitPartnerAgentClient } from '@/components/dashboard/ProfitPartnerAgentClient';
import { getTradersAction } from '@/app/(app)/dashboard/actions';
import { getBranchInfo, type BranchInfo, type Trader, type BranchLoginId } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { InfoAccordion } from '@/components/common/InfoAccordion';

const buildwiseIntelInfoSections = [
  {
    id: "bwi-capabilities",
    title: "BuildWise Intel Portal Capabilities",
    icon: ListChecks,
    defaultOpen: true,
    content: [
      "Access External Insights: This page embeds the BuildWise Intel application, providing specialized data, tools, or insights relevant to the construction and trade industry.",
      "Integrated Analysis with Branch Booster: The Branch Booster tool is available on this page. Use it to analyse insights from BuildWise Intel in conjunction with your branch's trader data.",
    ],
  },
  {
    id: "bwi-how-to-use",
    title: "How to Use BuildWise Intel & Integrated Branch Booster",
    icon: HelpCircle,
    content: [
      "Access BuildWise Intel: Click the 'BuildWise Intel' tab in the main header.",
      "Navigate the Portal: Use the scrollbars and interface within the embedded BuildWise Intel content area to explore its features.",
      "Combine Insights with Branch Booster: While viewing information in the BuildWise Intel portal, use the Branch Booster section alongside it.",
      "Formulate Contextual Queries: Ask the Branch Booster questions that link what you see in BuildWise Intel to your traders. For example: 'BuildWise Intel shows increased demand for X material. Which of my traders supply this or could be encouraged to?' or 'Based on trend Y in BuildWise Intel, suggest 3 cross-selling opportunities for my current active traders.'",
      "Upload Additional Data: If relevant, you can still upload customer/contextual data to the Branch Booster on this page for even more specific analysis combined with BuildWise Intel observations and your trader data.",
    ],
  },
];

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
        }
      }
    };
    initializeData();
  }, [toast]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main Content Area */}
      <div className="lg:col-span-9 space-y-6">
        <Card className="shadow-lg w-full">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Home className="h-10 w-10 text-primary" />
              <div>
                <CardTitle className="text-3xl font-bold text-primary">BuildWise Intel Portal</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                  Access external insights and tools from BuildWise Intel. Use the Branch Booster to analyse this information alongside your trader data.
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
            <div className="flex items-center gap-3">
                <Rocket className="h-8 w-8 text-primary" />
                <div>
                    <CardTitle className="text-2xl text-primary">Branch Booster Integration</CardTitle>
                    <CardDescription>
                        Use the Branch Booster to ask questions that combine insights from the BuildWise Intel portal above with your current trader data.
                        For example: "Based on the trends I see in BuildWise Intel, which of my traders are best positioned for growth?"
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
      
      {/* Sidebar Info Area */}
      <div className="lg:col-span-3 space-y-6">
        <InfoAccordion sections={buildwiseIntelInfoSections} />
      </div>
    </div>
  );
}
