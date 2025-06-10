
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass, Loader2 } from "lucide-react"; 
import { SalesNavigatorAgentClient } from '@/components/dashboard/SalesNavigatorAgentClient';
import { getTradersAction } from '@/app/(app)/tradehunter/actions'; // Updated import path
import { getBranchInfo, type BranchInfo, type Trader, type BranchLoginId } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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
          router.replace('/dashboard'); // Redirect to new overview dashboard
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
    <div className="space-y-6"> 
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
  );
}
