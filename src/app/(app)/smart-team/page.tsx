
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UsersRound, AlertTriangle, Loader2, type LucideIcon, Mountain, Bot, Compass, ArrowRight, MessageSquareQuote, Target } from "lucide-react"; 
import { getBranchInfo, type BranchInfo, type BranchLoginId } from '@/types';
import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

// Custom SVG icon component for the Sales & Strategy Navigator
const StrategyNavigatorIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M8 18L10 22L14 22L16 18"/>
        <path d="M12 20V12"/>
        <path d="M11 12H13"/>
        <path d="M8 12H16"/>
        <path d="M8 8H16"/>
        <path d="M10 4L14 4"/>
        <path d="M10 2L14 2"/>
        <path d="M15 16C15 14.3431 16.3431 13 18 13C19.6569 13 21 14.3431 21 16"/>
        <path d="M15 16L21 16"/>
        <path d="M16 16L16 18L20 18L20 16"/>
        <path d="M18 13V11"/>
    </svg>
);


interface AgentRosterCardProps {
  title: string;
  role: string;
  description: string;
  href: string;
  icon: React.ElementType; 
  iconStyle: string;
}

const AgentRosterCard = ({ title, role, description, href, icon: Icon, iconStyle }: AgentRosterCardProps) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center p-6 border-border hover:border-primary/30 h-full">
    <div className={cn("flex items-center justify-center h-24 w-24 rounded-full border-4 mb-4", iconStyle)}>
      <Icon className="h-12 w-12" />
    </div>
    <CardTitle className="text-xl text-primary mb-1">{title}</CardTitle>
    <div className="flex items-center gap-1.5 mb-2">
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
        icon: Compass,
        iconStyle: "border-emerald-500/50 text-emerald-500 bg-emerald-500/10",
    },
    {
        title: "Sales & Strategy Navigator",
        role: "Strategic Analyst",
        description: "I provide comprehensive analysis, market intelligence, and strategic planning.",
        href: "/smart-team/sales-strategy-navigator",
        icon: StrategyNavigatorIcon,
        iconStyle: "border-blue-500/50 text-blue-500 bg-blue-500/10",
    },
    {
        title: "Outreach Pro",
        role: "Sales Assistant",
        description: "I craft compelling outreach messages and help you manage targeted sales campaigns.",
        href: "/smart-team/outreach-pro",
        icon: MessageSquareQuote,
        iconStyle: "border-sky-500/50 text-sky-500 bg-sky-500/10",
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
              <CardTitle className="text-3xl font-bold text-primary">Smart Team Hub</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Meet your Smart Team members, here to help you succeed.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent) => (
                <AgentRosterCard key={agent.title} {...agent} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
