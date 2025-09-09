
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UsersRound, AlertTriangle, Loader2, type LucideIcon, Mountain, Compass, ArrowRight, MessageSquareQuote, Target, BarChart } from "lucide-react"; 
import { getBranchInfo, type BranchInfo, type BranchLoginId } from '@/types';
import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

// Custom SVG icon component for the Sales & Strategy Navigator
const StrategyNavigatorIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="88"
      height="88"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22a2 2 0 0 0 2-2V18h-4v2a2 2 0 0 0 2 2Z" />
      <path d="M18 18h-2a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h2" />
      <path d="M6 18h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H6" />
      <path d="M15.89 15.5H8.11a2 2 0 0 1-1.6-3.2L9.6 9.5a2.12 2.12 0 0 0-1-3.8A3.12 3.12 0 0 1 5.3 2.5a1 1 0 0 1 1.4-1.4 5.12 5.12 0 0 0 8.6 3.8 2.12 2.12 0 0 0-.9 3.8l3.1 2.8a2 2 0 0 1-1.6 3.2Z" />
    </svg>
);


interface RosterCardProps {
  title: string;
  role: string;
  description: string;
  href: string;
  icon: React.ElementType; 
  iconStyle: string;
}

const RosterCard = ({ title, role, description, href, icon: Icon, iconStyle }: RosterCardProps) => (
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
        Launch Tool <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  </Card>
);

const assistants: RosterCardProps[] = [
    {
        title: "Summit Coach",
        role: "Performance Coach",
        description: "I analyse performance data and provide actionable coaching insights to elevate your team.",
        href: "/smart-team/summit-coach",
        icon: Mountain,
        iconStyle: "border-purple-500/50 text-purple-500 bg-purple-500/10",
    },
    {
        title: "Sales Navigator",
        role: "Lead Generation Tool",
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
        icon: Target,
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

  return (
    <div className="space-y-6"> 
      <Card className="shadow-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <UsersRound className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold text-primary">Smart Team Hub</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Meet your Smart assistants, here to help you succeed.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assistants.map((assistant) => (
                <RosterCard key={assistant.title} {...assistant} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
