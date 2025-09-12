
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatabaseZap, AlertTriangle } from "lucide-react"; 
import { getBranchInfo, type BranchInfo, type BranchLoginId } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function DataHubPage() {
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeData = () => {
      if (typeof window !== 'undefined') {
        const storedLoggedInId = localStorage.getItem('loggedInId') as BranchLoginId | null;
        const info = getBranchInfo(storedLoggedInId);
        setBranchInfo(info);
        setIsLoading(false);
      }
    };
    initializeData();
  }, []);

  // Placeholder URL. In a real scenario, this would point to a data application.
  // We can pass branch info as query parameters.
  const dataAppUrl = `https://example-data-hub.com/dashboard?branch=${branchInfo?.baseBranchId || 'none'}`;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
              <DatabaseZap className="h-8 w-8 text-primary" />
              <div>
                  <CardTitle className="text-2xl text-primary">Branch Data Hub</CardTitle>
                  <CardDescription>
                      Centralised data and databases for {branchInfo?.branchName || 'your branch'}.
                      <span className="block mt-1 text-xs text-muted-foreground italic">
                        <AlertTriangle className="inline-block h-3 w-3 mr-1 text-amber-500" />
                        This is a placeholder for embedding branch-specific data applications.
                      </span>
                  </CardDescription>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[75vh] rounded-md overflow-hidden border border-border bg-muted/20 flex items-center justify-center">
            {/* The iframe is commented out until a real URL is available */}
            {/* <iframe
              src={dataAppUrl}
              title="Branch Data Hub"
              className="w-full h-full border-0"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            /> */}
            <p className="text-muted-foreground">Data application placeholder for branch: {branchInfo?.baseBranchId || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
