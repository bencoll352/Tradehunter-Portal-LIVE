
"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Logo } from "@/components/icons/Logo";
import { AppSidebarNav } from "./AppSidebarNav";
import { Settings, LifeBuoy } from "lucide-react";
import { usePathname } from 'next/navigation';
import { getBranchInfo, type BranchInfo, type BranchLoginId } from '@/types';
import { InfoAccordion } from '../common/InfoAccordion';
import { Sparkles, Database as DataManagementIcon } from 'lucide-react';
import { UserNav } from './UserNav';

export function AppSidebar() {
  const pathname = usePathname();
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLoggedInId = localStorage.getItem('loggedInId') as BranchLoginId | null;
      const info = getBranchInfo(storedLoggedInId);
      setBranchInfo(info);
    }
  }, []);

  const insightFeatures = [
    "Quickly analyse competitor strategies.",
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
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-card sm:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Logo className="h-8 w-auto" />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-4 text-sm font-medium">
          <AppSidebarNav />
        </nav>
        <div className="px-4 mt-4">
          <InfoAccordion sections={[
            { id: "insights", title: "Insight & Assistance Features", icon: Sparkles, content: insightFeatures, defaultOpen: true },
            { id: "data", title: "Data Management", icon: DataManagementIcon, content: dataManagementFeatures }
          ]} />
        </div>
      </div>
      <div className="mt-auto p-4 border-t">
        <UserNav />
      </div>
    </aside>
  );
}
