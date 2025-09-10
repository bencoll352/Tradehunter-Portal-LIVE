
"use client";

import React from 'react';
import Link from "next/link";
import { Logo } from "@/components/icons/Logo";
import { AppSidebarNav } from "./AppSidebarNav";
import { Sparkles, Database as DataManagementIcon } from 'lucide-react';
import { UserNav } from './UserNav';
import { InfoAccordion } from '../common/InfoAccordion';

export function AppSidebar() {
  const insightFeatures = [
    "Generate material estimates for projects.",
    "Access specialised data via BuildWise Intel.",
    "For managers: utilise the Smart Team Hub for advanced analytics and lead generation."
  ];

  const dataManagementFeatures = [
    "View and manage traders in the Trader Database.",
    "Perform bulk uploads and deletions.",
    "Data is securely stored and backed up."
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-sidebar text-sidebar-foreground sm:flex">
      <div className="flex h-16 items-center border-b border-sidebar-border px-4 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
          <Logo variant="transparent" className="h-10 w-auto" />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start p-4 text-sm font-medium">
          <AppSidebarNav />
        </nav>
        <div className="px-4 mt-4">
          <InfoAccordion sections={[
            { id: "insights", title: "Insight & Assistance Features", icon: Sparkles, content: insightFeatures, defaultOpen: true },
            { id: "data", title: "Data Management", icon: DataManagementIcon, content: dataManagementFeatures }
          ]} />
        </div>
      </div>
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <UserNav />
      </div>
    </aside>
  );
}
