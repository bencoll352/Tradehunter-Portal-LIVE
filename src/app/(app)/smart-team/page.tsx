
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersRound, AlertTriangle, Loader2, type LucideIcon, BrainCircuit, Bot, Compass } from "lucide-react"; 
import { getBranchInfo, type BranchInfo, type BranchLoginId } from '@/types';

interface AgentCardProps {
  title: string;
  description: string;
  url: string;
  icon: LucideIcon;
}

const AgentCard = ({ title, description, url, icon: Icon }: AgentCardProps) => (
  <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden border-border hover:border-primary/30">
    <CardHeader className="pb-4">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="h-7 w-7 text-primary" />
        <CardTitle className="text-xl text-primary">{title}</CardTitle>
      </div>
       <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow p-0">
        <div className="w-full h-[60vh] rounded-b-md overflow-hidden bg-muted/20">
            <iframe
              src={url}
              title={title}
              className="w-full h-full border-0"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
    </CardContent>
  </Card>
);


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
          <p className="mb-6 text-foreground">
            This is your central hub for leveraging specialized AI agents. Each agent has a specific role to help you with sales, strategy, and analysis. Interact with an agent below to get started.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
            <AgentCard 
              title="Summit Coach"
              description="An AI-powered coaching agent designed to enhance skills and strategies."
              url="https://summitcoach-302177537641.us-west1.run.app"
              icon={BrainCircuit}
            />
            <AgentCard 
              title="Sales Navigator"
              description="A specialized agent to help navigate sales data, identify leads, and provide tactical recommendations."
              url="https://sales-navigator-302177537641.us-west1.run.app"
              icon={Bot}
            />
             <AgentCard 
              title="Sales & Strategy Navigator"
              description="A comprehensive tool for in-depth analysis, intelligence, and strategic planning."
              url="https://sales-and-strategy-navigator-leatherhead-302177537641.us-west1.run.app"
              icon={Compass}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
