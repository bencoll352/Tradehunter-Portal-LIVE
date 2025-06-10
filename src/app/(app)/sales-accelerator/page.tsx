
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass, Loader2, ListChecks, HelpCircle } from "lucide-react";
import { SalesNavigatorAgentClient } from '@/components/dashboard/SalesNavigatorAgentClient';
import { getTradersAction } from '@/app/(app)/dashboard/actions';
import { getBranchInfo, type BranchInfo, type Trader, type BranchLoginId } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { InfoAccordion } from '@/components/common/InfoAccordion';

const salesAcceleratorInfoSections = [
  {
    id: "ssa-capabilities",
    title: "Sales & Strategy Accelerator Capabilities",
    icon: ListChecks,
    defaultOpen: true,
    content: [
      "Access Advanced Strategic Insights: This tool provides access to advanced analysis for strategic planning.",
      "Deep Dive Analysis: Ask complex questions about market positioning, long-term sales strategies, competitive analysis relative to your branch's data.",
      "AI-Driven Recommendations: Get AI-driven recommendations for optimising team performance and branch growth.",
      "Upload Supplemental Data: Use the 'Upload Supplemental Data' option to upload files like market reports or competitor profiles. This provides additional context to the external analysis service for more tailored insights.",
      "Use Strategic Quick Actions: Click pre-defined buttons for common strategic queries, such as 'Market Trends Analysis', 'Growth Opportunities', or 'Risk Assessment & Mitigation'.",
      "External Intelligence: The Sales & Strategy Accelerator connects to a dedicated external analysis service for its insights, potentially incorporating broader market data.",
    ],
  },
  {
    id: "ssa-how-to-use",
    title: "How to Use the Sales & Strategy Accelerator",
    icon: HelpCircle,
    content: [
      "This tool is available for Manager logins and is accessed via the 'Sales Accelerator' tab in the header.",
      "Formulate Your Strategic Query: Type your complex strategic question or objective into the main text area. Be specific about what you want to analyse or achieve.",
      "Use Quick Actions: For common analyses, click one of the 'Strategic Quick Actions' buttons (e.g., 'Market Trends Analysis', 'Growth Opportunities'). This will pre-fill the query for you.",
      "Upload Supporting Documents (Optional): If you have relevant market reports, competitor analyses, or other data, use the 'Upload Supplemental Data' option. This will enhance the context for the AI's analysis.",
      "Get Insights: Click 'Get Strategic Insights'. The analysis from the specialized external service will appear below.",
      "Contextual Data: Your branch's current trader data is automatically included as context for the analysis.",
    ],
  },
];

export default function SalesAcceleratorPage() {
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const initializeData = async () => {
      if (typeof window !== 'undefined') {
        const storedLoggedInId = localStorage.getItem('loggedInId') as BranchLoginId | null;
        const info = getBranchInfo(storedLoggedInId);
        setBranchInfo(info);

        if (info.role !== 'manager') {
          toast({ variant: "destructive", title: "Access Denied", description: "This page is for managers only." });
          router.replace('/dashboard'); // Redirect non-managers
          return;
        }

        if (info.baseBranchId) {
          setIsLoading(true);
          try {
            const result = await getTradersAction(info.baseBranchId);
            if (result.data) {
              setTraders(result.data);
            } else {
              setTraders([]);
              toast({ variant: "destructive", title: "Error Loading Trader Data", description: result.error || "Could not load trader data." });
            }
          } catch (error) {
            console.error("Error fetching traders for Sales Accelerator page:", error);
            setTraders([]);
            toast({ variant: "destructive", title: "Error Loading Trader Data", description: "Failed to load trader data due to an unexpected error." });
          } finally {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
           toast({ variant: "destructive", title: "Branch Error", description: "Branch information not found. Please re-login." });
           router.replace('/login');
        }
      }
    };
    initializeData();
  }, [toast, router]);

  if (isLoading || !branchInfo || branchInfo.role !== 'manager') {
    return (
      <div className="flex h-[calc(100vh-theme(spacing.20))] w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main Content Area */}
      <div className="lg:col-span-9 space-y-6">
        <Card className="shadow-lg w-full border-primary/30">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Compass className="h-10 w-10 text-primary" />
              <div>
                <CardTitle className="text-3xl font-bold text-primary">Sales & Strategy Accelerator</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                  Leverage advanced analytics for strategic decision-making. (Manager Access for Branch: {branchInfo.displayLoginId})
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {branchInfo.baseBranchId ? (
              <SalesNavigatorAgentClient traders={traders} baseBranchId={branchInfo.baseBranchId} />
            ) : (
               <p className="text-muted-foreground p-4 text-center">
                Branch information is missing. Cannot load the Sales & Strategy Accelerator.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Info Area */}
      <div className="lg:col-span-3 space-y-6">
        <InfoAccordion sections={salesAcceleratorInfoSections} />
      </div>
    </div>
  );
}
