
"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PanelLeft, LayoutDashboard, Database, Lightbulb, Calculator, UsersRound } from "lucide-react";
import { AppSidebarNav } from "./AppSidebarNav";
import { usePathname } from 'next/navigation';

const headerNavLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tradehunter", label: "Trader DB", icon: Database },
  { href: "/estimator", label: "Estimator", icon: Calculator },
  { href: "/smart-team", label: "Smart Team", icon: UsersRound },
];

export function AppHeader() {
  const pathname = usePathname();

  const getPageTitle = () => {
    const currentPath = `/${pathname.split('/')[1]}`; // Get base path
    switch (currentPath) {
      case '/dashboard':
        return 'Dashboard';
      case '/tradehunter':
        return 'Trader Database';
      case '/competitor-insights':
        return 'Competitor Insights';
      case '/estimator':
        return 'Materials Estimator';
      case '/smart-team':
        return 'Smart Team Hub';
      case '/staff-training':
        return 'Staff Training';
      case '/buildwise-intel':
        return 'BuildWise Intel';
      case '/how-to-use':
        return 'How to Use';
      default:
        return 'Dashboard';
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
        <SheetContent side="left" className="sm:max-w-xs bg-sidebar text-sidebar-foreground border-r-0">
           <nav className="grid gap-6 text-lg font-medium p-4">
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
