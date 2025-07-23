
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UsersRound, AlertTriangle, Loader2, type LucideIcon, Mountain, Bot, Compass, ArrowRight, Briefcase } from "lucide-react"; 
import { getBranchInfo, type BranchInfo, type BranchLoginId } from '@/types';
import { cn } from '@/lib/utils';

interface AgentRosterCardProps {
  title: string;
  role: string;
  description: string;
  href: string;
  icon: LucideIcon;
  iconStyle: string;
}

const AgentRosterCard = ({ title, role, description, href, icon: Icon, iconStyle }: AgentRosterCardProps) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center p-6 border-border hover:border-primary/30">
    <div className={cn("flex items-center justify-center h-24 w-24 rounded-full border-4 mb-4", iconStyle)}>
      <Icon className="h-12 w-12" />
    </div>
    <CardTitle className="text-xl text-primary mb-1">{title}</CardTitle>
    <div className="flex items-center gap-1.5 mb-2">
      <Briefcase className="h-4 w-4 text-muted-foreground" />
      <p className="text-sm font-semibold text-accent">{role}</p>
    </div>
    <CardDescription className="text-muted-foreground italic mb-6 flex-grow">
      "{description}"
    </CardDescription>
    <Button asChild className="w-full mt-auto bg-primary hover:bg-primary/90">
      <Link href={href}>
        Launch Agent <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  </Card>
);

const agents: AgentRosterCardProps[] = [
    {
        title: "Summit Coach",
        role: "Performance Coach",
        description: "I analyze performance data and provide actionable coaching insights to elevate your team.",
        href: "/smart-team/summit-coach",
        icon: Mountain,
        iconStyle: "border-purple-500/50 text-purple-500 bg-purple-500/10",
    },
    {
        title: "Sales Navigator",
        role: "Lead Generation Agent",
        description: "I help you find and qualify high-quality leads, so you can focus on closing deals.",
        href: "/smart-team/sales-navigator",
        icon: Bot,
        iconStyle: "border-blue-500/50 text-blue-500 bg-blue-500/10",
    },
    {
        title: "Sales & Strategy Navigator",
        role: "Strategic Analyst",
        description: "I provide comprehensive analysis, market intelligence, and strategic planning.",
        href: "/smart-team/sales-strategy-navigator",
        icon: Compass,
        iconStyle: "border-emerald-500/50 text-emerald-500 bg-emerald-500/10",
    },
]


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
              <CardTitle className="text-3xl font-bold text-primary">Smart Team Roster</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Meet your AI-powered team members, here to help you succeed.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {agents.map((agent) => (
                <AgentRosterCard key={agent.title} {...agent} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
