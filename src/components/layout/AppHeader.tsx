
"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PanelLeft, LayoutDashboard, Database, Lightbulb, Calculator, UsersRound, Building2, GraduationCap, HelpCircle, ShieldCheck, DatabaseZap } from "lucide-react";
import { AppSidebarNav } from "./AppSidebarNav";
import { usePathname } from 'next/navigation';

const headerNavLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tradehunter", label: "Trader DB", icon: Database },
  { href: "/estimator", label: "Estimator", icon: Calculator },
  { href: "/staff-training", label: "Staff Training", icon: GraduationCap },
  { href: "/buildwise", label: "BuildWise", icon: Building2 },
  { href: "/smart-team", label: "Smart Team", icon: UsersRound },
];

export function AppHeader() {
  const pathname = usePathname();

  const getPageTitle = () => {
    // Find the main section first, e.g. /smart-team/outreach-pro -> /smart-team
    const currentMainPath = `/${pathname.split('/')[1]}`;
    const navItem = navItems.find(item => item.href === currentMainPath) || mainNavItems.find(item => item.href === currentMainPath);
    
    // Fallback for nested pages to show parent's name
    if (navItem) return navItem.label;

    // Specific titles for pages not in main nav
    switch (pathname) {
      case '/how-to-use':
        return 'How to Use';
      case '/staff-training':
          return 'Staff Training';
      case '/quality-control':
          return 'Quality Control';
      default:
        // Attempt to find in any nav list
        const allNavs = [...mainNavItems, ...navItems];
        const anyNavItem = allNavs.find(item => pathname.startsWith(item.href));
        return anyNavItem?.label || 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs bg-sidebar text-sidebar-foreground border-r-0 p-0">
           <div className="flex h-16 items-center border-b border-sidebar-border px-4 shrink-0">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
                <Logo variant="transparent" className="h-10 w-auto" />
                </Link>
            </div>
           <nav className="grid gap-2 text-sm font-medium p-4">
            <AppSidebarNav onLinkClick={() => document.querySelector<HTMLButtonElement>('[data-radix-collection-item] > button[aria-expanded="true"]')?.click()} />
          </nav>
        </SheetContent>
      </Sheet>
      
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {headerNavLinks.map(({ href, label, icon: Icon }) => (
            <Button key={href} asChild variant={pathname.startsWith(href) ? "default" : "ghost"} size="sm" className="hidden md:flex">
                <Link href={href}>
                <Icon className="h-4 w-4 mr-2" />
                {label}
                </Link>
            </Button>
        ))}
      </div>
    </header>
  );
}

// Re-declaring nav items here to avoid circular dependency if imported,
// and to ensure getPageTitle has access to all possible pages.
// In a larger app, this might be centralized in a separate file.
const mainNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tradehunter", icon: Database, label: "Trader Database" },
  { href: "/estimator", icon: Calculator, label: "Estimator" },
  { href: "/staff-training", icon: GraduationCap, label: "Staff Training" },
  { href: "/buildwise", icon: Building2, label: "BuildWise" },
  { href: "/smart-team", icon: UsersRound, label: "Smart Team" },
];

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tradehunter", icon: Database, label: "Trader Database" },
  { href: "/estimator", icon: Calculator, label: "Estimator" },
  { href: "/staff-training", icon: GraduationCap, label: "Staff Training" },
  { href: "/buildwise", icon: Building2, label: "BuildWise" },
  { href: "/buildwise-intel", icon: Lightbulb, label: "Buildwise-Intel" },
  { href: "/smart-team", icon: UsersRound, label: "Smart Team" },
  { href: "/staff-training", icon: GraduationCap, label: "Staff Training" },
  { href: "/quality-control", icon: ShieldCheck, label: "Quality Control" },
  { href: "/how-to-use", icon: HelpCircle, label: "How to Use" },
];
import { Logo } from "../icons/Logo";
