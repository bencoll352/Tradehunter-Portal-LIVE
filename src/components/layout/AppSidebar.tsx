
"use client";

import React from 'react';
import Link from "next/link";
import { Logo } from "@/components/icons/Logo";
import { AppSidebarNav } from "./AppSidebarNav";
import { Lightbulb, DatabaseZap } from 'lucide-react';
import { UserNav } from './UserNav';
import { InfoAccordion } from '../common/InfoAccordion';
import { cn } from '@/lib/utils';
import { VerifiedBadge } from '../icons/VerifiedBadge';

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
        
        <InfoAccordion sections={sidebarSections} />
      </div>
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <UserNav />
      </div>
    </aside>
  );
}
