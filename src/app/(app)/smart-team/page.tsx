
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UsersRound, AlertTriangle, Loader2, type LucideIcon, Mountain, Bot, Compass, ArrowRight, Briefcase, Send, MessageSquareQuote } from "lucide-react"; 
import { getBranchInfo, type BranchInfo, type BranchLoginId } from '@/types';
import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

// Custom Chess Piece Icon Component - UPDATED to Chess Knight
const ChessPieceIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="currentColor"
      {...props}
    >
      <path d="M256 32c-2.2 0-4.4.1-6.5.3-21.3 2.5-39.7 12.3-54.3 27.6-13.3 14-21.3 31.4-23.4 49.5-1.5 13.2-.9 26.6 1.7 39.5 2.8 13.9 7.4 27.1 13.5 39.3 2.9 5.8 6.3 11.3 10 16.6l-36.4 72.8c-2.6-1.1-5.3-2-8-2.7-18.4-4.8-38.3-2.6-55.9 5.9-18.8 9-33.8 24.3-43.7 43.6-9.7 18.9-13.8 40.6-12.2 62.3 1.5 20.2 8.7 39.4 20.8 55.6 12.5 16.8 29.8 30.1 49.9 38.3 20.8 8.5 44 11.4 66.8 8.4 22.9-3 44.2-11.8 62.5-25.5l3.8 4.6c2.7 3.2 6.3 5.5 10.3 6.6 4.2 1.2 8.5.8 12.4-1.1 2.3-1.1 4.4-2.7 6.2-4.6l3.3-3.4 3.3 3.4c1.8 1.9 3.9 3.5 6.2 4.6 3.9 1.9 8.2 2.3 12.4 1.1 4-.9 7.6-3.4 10.3-6.6l3.8-4.6c18.3 13.7 39.6 22.5 62.5 25.5 22.8 3 46-1 66.8-8.4 20.1-8.2 37.4-21.5 49.9-38.3 12.1-16.2 19.3-35.4 20.8-55.6 1.6-21.7-2.5-43.4-12.2-62.3C475.8 288.3 460.8 273 442 264c-17.6-8.5-37.5-10.7-55.9-5.9-2.7.7-5.4 1.7-8 2.7l-36.4-72.8c3.7-5.3 7.1-10.8 10-16.6 6.1-12.2 10.7-25.4 13.5-39.3 2.6-12.9 3.2-26.3 1.7-39.5-2.1-18.1-10.1-35.5-23.4-49.5-14.6-15.3-33-25.1-54.3-27.6C260.4 32.1 258.2 32 256 32zm22.4 64c-2.4 0-4.8.4-7.1 1.1-11.5 3.8-21.5 11.1-28.5 21.2-6.5 9.3-9.9 20.4-9.9 31.9 0 11.2 3.1 22.3 9.1 31.9 6.2 10.1 15 18.2 25.9 23.3 11.4 5.4 24 7.6 36.6 6.3 12.9-1.3 25-6.1 35.1-13.8 9.7-7.3 17.1-17.3 21.5-28.8 4.2-11.2 5.2-23.2 2.8-34.9-2.3-11.3-8-21.8-16.2-30.2-8.5-8.7-19.3-14.9-31-17.8-3.9-1-7.8-1.5-11.8-1.5z M128 416c-13.3 0-26.2 2.7-38.2 7.8-12.2 5.2-23.3 12.7-32.9 22.1-9.6 9.4-17.5 20.6-23.1 32.9-5.6 12.3-8.8 25.7-9.3 39.3H488c-.5-13.6-3.7-27-9.3-39.3-5.6-12.3-13.5-23.5-23.1-32.9-9.6-9.4-20.7-16.9-32.9-22.1-12-5.1-24.9-7.8-38.2-7.8H128z"/>
    </svg>
  );


interface AgentRosterCardProps {
  title: string;
  role: string;
  description: string;
  href: string;
  icon: React.ElementType; // Changed from LucideIcon to allow SVGs
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
        icon: Compass,
        iconStyle: "border-emerald-500/50 text-emerald-500 bg-emerald-500/10",
    },
    {
        title: "Sales & Strategy Navigator",
        role: "Strategic Analyst",
        description: "I provide comprehensive analysis, market intelligence, and strategic planning.",
        href: "/smart-team/sales-strategy-navigator",
        icon: ChessPieceIcon,
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
              <CardTitle className="text-3xl font-bold text-primary">Smart Team Roster</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Meet your AI-powered team members, here to help you succeed.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {agents.map((agent) => (
                <AgentRosterCard key={agent.title} {...agent} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
