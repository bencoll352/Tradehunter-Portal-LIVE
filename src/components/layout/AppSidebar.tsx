
"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Logo } from "@/components/icons/Logo";
import { AppSidebarNav } from "./AppSidebarNav";
import { Settings, LifeBuoy } from "lucide-react";
import { usePathname } from 'next/navigation';
import { getBranchInfo, type BranchInfo, type BranchLoginId } from '@/types';

export function AppSidebar() {
  const pathname = usePathname();
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLoggedInId = localStorage.getItem('loggedInId') as BranchLoginId | null;
      const storedUser = localStorage.getItem('loggedInUser');
      const info = getBranchInfo(storedLoggedInId, storedUser);
      setBranchInfo(info);
    }
  }, []);

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-4">
          <Link
            href="/tradehunter"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">TradeHunter Pro</span>
          </Link>
          <AppSidebarNav isTooltip={true} />
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/how-to-use"
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${pathname === '/how-to-use' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'} transition-colors hover:text-foreground md:h-8 md:w-8`}
              >
                <LifeBuoy className="h-5 w-5" />
                <span className="sr-only">How to Use</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">How to Use</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  );
}
