
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, UsersRound, Lightbulb, Calculator, GraduationCap, Home, LayoutDashboard, HelpCircle, Building2, ShieldCheck, DatabaseZap } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tradehunter", icon: Database, label: "Trader Database" },
  { href: "/estimator", icon: Calculator, label: "Estimator" },
  { href: "/staff-training", icon: GraduationCap, label: "Staff Training" },
  { href: "/buildwise-intel", icon: Lightbulb, label: "Buildwise-Intel" },
  { href: "/smart-team", icon: UsersRound, label: "Smart Team" },
  { href: "/quality-control", icon: ShieldCheck, label: "Quality Control" },
  { href: "/how-to-use", icon: HelpCircle, label: "How to Use" },
];

interface AppSidebarNavProps {
  onLinkClick?: () => void;
}

export function AppSidebarNav({ onLinkClick }: AppSidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-1">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname.startsWith(href);
        return (
           <Link
            key={href}
            href={href}
            onClick={onLinkClick}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-lg transition-all",
                isActive 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
