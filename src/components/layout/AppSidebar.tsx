
"use client";

import React from 'react';
import Link from "next/link";
import { Logo } from "@/components/icons/Logo";
import { AppSidebarNav } from "./AppSidebarNav";
import { Sparkles, Eye, TrendingUp, Award, Zap, Lightbulb, DatabaseZap } from 'lucide-react';
import { UserNav } from './UserNav';
import { InfoAccordion } from '../common/InfoAccordion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  className?: string;
}

const FeatureCard = ({ icon: Icon, title, description, className }: FeatureCardProps) => (
  <div className={cn("bg-card/90 text-card-foreground p-3 rounded-lg shadow-md", className)}>
    <div className="flex items-center gap-3">
      <div className="bg-background/20 p-2 rounded-md">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <h4 className="font-semibold text-sm">{title}</h4>
    </div>
    <p className="text-xs text-card-foreground/80 mt-2">
      {description}
    </p>
  </div>
);


export function AppSidebar() {
  
  const sidebarSections = [
    { 
      id: "insight-assistance", 
      title: "Insight & Assistance Features", 
      icon: Lightbulb,
      content: [
        <span key="ia-1">Analyse market intelligence.</span>,
        <span key="ia-2">Analyse competitor strategies.</span>,
        <span key="ia-3">Receive sales coaching.</span>,
        <span key="ia-4">Generate outreach messages.</span>
      ],
      defaultOpen: false 
    },
    { 
      id: "data-management", 
      title: "Data Management", 
      icon: DatabaseZap,
      content: [
        <span key="dm-1">Bulk import/export traders.</span>,
        <span key="dm-2">Automated data cleaning.</span>,
        <span key="dm-3">Connect external data sources.</span>,
        <span key="dm-4">Custom reporting dashboards.</span>
      ],
      defaultOpen: false 
    }
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-sidebar text-sidebar-foreground sm:flex">
      <div className="flex h-16 items-center border-b border-sidebar-border px-4 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
          <Logo className="h-auto w-full" />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <nav className="grid items-start text-sm font-medium">
          <AppSidebarNav />
        </nav>
        
        {/* New Feature Card Section */}
        <div className="space-y-3 pt-4">
            <FeatureCard 
                icon={Eye}
                title="Complete Territory Visibility"
                description="Gain a comprehensive live dashboard perspective across your entire territory."
            />
            <FeatureCard 
                icon={Zap}
                title="Sales Efficiency"
                description="Automate repetitive tasks and focus on high-value sales activities."
            />
            <FeatureCard 
                icon={TrendingUp}
                title="Scalable Growth"
                description="Identify new opportunities and scale your sales outreach effectively."
            />
             <FeatureCard 
                icon={Award}
                title="Competitive Advantage"
                description="Leverage market intelligence to stay ahead of the competition."
            />
        </div>

        <InfoAccordion sections={sidebarSections} />
      </div>
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <UserNav />
      </div>
    </aside>
  );
}
