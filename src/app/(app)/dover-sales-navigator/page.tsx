
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass, AlertTriangle } from "lucide-react"; 
import { getBranchInfo, type BranchInfo } from '@/types';

export default function DoverSalesNavigatorPage() {
  const navigatorAppUrl = "https://sales-and-strategy-navigator-dover-302177537641.us-west1.run.app/";
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedInId = localStorage.getItem('loggedInId');
      const info = getBranchInfo(loggedInId);
      setBranchInfo(info);
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading user information...</p>
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
    </div>
  );
}

