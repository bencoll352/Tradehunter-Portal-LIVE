
"use client";

import React from 'react';
import Link from "next/link";
import { Logo } from "@/components/icons/Logo";
import { AppSidebarNav } from "./AppSidebarNav";
import { Sparkles, Eye, TrendingUp, Award, Zap, Lightbulb, DatabaseZap } from 'lucide-react';
import { UserNav } from './UserNav';
import { InfoAccordion } from '../common/InfoAccordion';

export function AppSidebar() {
  
  const sidebarSections = [
    { 
      id: "capabilities", 
      title: "Key Capabilities", 
      icon: Sparkles, 
      content: [
        <div key="vis" className="flex items-center gap-2.5">
          <Eye className="h-4 w-4 text-sidebar-accent-foreground/80" />
          <span className="font-medium text-sidebar-accent-foreground/90">Complete Territory Visibility</span>
        </div>,
        <div key="growth" className="flex items-center gap-2.5">
          <TrendingUp className="h-4 w-4 text-sidebar-accent-foreground/80" />
          <span className="font-medium text-sidebar-accent-foreground/90">Scalable Growth</span>
        </div>,
        <div key="advantage" className="flex items-center gap-2.5">
          <Award className="h-4 w-4 text-sidebar-accent-foreground/80" />
          <span className="font-medium text-sidebar-accent-foreground/90">Competitive Advantage</span>
        </div>,
        <div key="efficiency" className="flex items-center gap-2.5">
          <Zap className="h-4 w-4 text-sidebar-accent-foreground/80" />
          <span className="font-medium text-sidebar-accent-foreground/90">Sales Efficiency</span>
        </div>
      ],
      defaultOpen: true 
    },
    { 
      id: "insight-assistance", 
      title: "Insight & Assistance Features", 
      icon: Lightbulb,
      content: [
        <span key="ia-1">Access market intelligence.</span>,
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
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start p-4 text-sm font-medium">
          <AppSidebarNav />
        </nav>
        <div className="px-4 mt-4">
          <InfoAccordion sections={sidebarSections} />
        </div>
      </div>
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <UserNav />
      </div>
    </aside>
  );
}
