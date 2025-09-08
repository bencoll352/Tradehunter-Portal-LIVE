
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Database, UsersRound, Lightbulb, Calculator, GraduationCap, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { getBranchInfo, type BranchLoginId, type BranchInfo } from "@/types";

const navItems = [
  { href: "/tradehunter", icon: Database, label: "Trader Database" },
  { href: "/competitor-insights", icon: Lightbulb, label: "Competitor Insights" },
  { href: "/estimator", icon: Calculator, label: "Materials Estimator" },
  { href: "/staff-training", icon: GraduationCap, label: "Staff Training" },
  { href: "/buildwise-intel", icon: Home, label: "BuildWise Intel" },
  { href: "/smart-team", icon: UsersRound, label: "Smart Team Hub", roles: ['manager'] },
];

interface AppSidebarNavProps {
  isTooltip?: boolean;
  onLinkClick?: () => void;
}

export function AppSidebarNav({ isTooltip = false, onLinkClick }: AppSidebarNavProps) {
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

  const visibleNavItems = navItems.filter(item => {
    if (!item.roles) return true; // Visible to all roles
    if (!branchInfo) return false; // Hide role-specific items if info not loaded
    return item.roles.includes(branchInfo.role);
  });

  return (
    <>
      {visibleNavItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;
        const linkContent = (
          <Link
            href={href}
            onClick={onLinkClick}
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'} transition-colors hover:text-foreground md:h-8 md:w-8`}
          >
            <Icon className="h-5 w-5" />
            <span className="sr-only">{label}</span>
          </Link>
        );

        if (isTooltip) {
          return (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                {linkContent}
              </TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          );
        }
        
        return (
           <Link
            key={href}
            href={href}
            onClick={onLinkClick}
            className={`flex items-center gap-4 px-2.5 ${isActive ? 'text-foreground' : 'text-muted-foreground'} hover:text-foreground`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </>
  );
}
