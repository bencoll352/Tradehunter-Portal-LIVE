
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersRound, AlertTriangle, Loader2 } from "lucide-react"; 
import { getBranchInfo, type BranchInfo, type BranchLoginId } from '@/types';

// TODO: Define Agent components and structure
// Example:
// const AgentCard = ({ name, description }) => (
//   <Card>
//     <CardHeader><CardTitle>{name}</CardTitle></CardHeader>
//     <CardContent>{description}</CardContent>
//   </Card>
// );

export default function SmartTeamPage() {
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      if (typeof window !== 'undefined') {
        const storedLoggedInId = localStorage.getItem('loggedInId') as BranchLoginId | null;
        const info = getBranchInfo(storedLoggedInId);
        setBranchInfo(info);
        setIsLoading(false); 
      }
    };
    initializeData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading user information...</p>
      </div>
    );
  }

  // Access is now tied to the 'manager' role instead of a specific branch manager
  if (branchInfo?.role !== 'manager') {
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
            The Smart Team hub is exclusively available for Manager accounts.
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
            <UsersRound className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold text-primary">Smart Team Hub</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Deploy and interact with your team of specialized AI agents.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-foreground">
            This is your central hub for leveraging specialized AI agents. Each agent has a specific role to help you with sales, strategy, and analysis. Select an agent below to get started.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder for future agent cards */}
            <Card>
                <CardHeader><CardTitle>Strategy Agent</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Analyzes market trends and competitor data to suggest strategic opportunities. (Coming Soon)</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Sales Agent</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Identifies high-potential leads and suggests engagement tactics. (Coming Soon)</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Data Agent</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Provides deep-dive analysis and answers questions about your branch data. (Coming Soon)</p>
                </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
