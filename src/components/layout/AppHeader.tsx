"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PanelLeft, LogOut, LayoutDashboard, Database, Lightbulb, Calculator, UsersRound } from "lucide-react";
import { UserNav } from "./UserNav";
import { AppSidebarNav } from "./AppSidebarNav";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";

const headerNavLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tradehunter", label: "Trader DB", icon: Database },
  { href: "/competitor-insights", label: "Competitors", icon: Lightbulb },
  { href: "/estimator", label: "Estimator", icon: Calculator },
  { href: "/smart-team", label: "Smart Team", icon: UsersRound },
];


export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <AppSidebarNav onLinkClick={() => document.querySelector<HTMLButtonElement>('[data-radix-collection-item] > button[aria-expanded="true"]')?.click()} />
        </SheetContent>
      </Sheet>
      
      <nav className="hidden md:flex items-center gap-2">
        {headerNavLinks.map(({ href, label, icon: Icon }) => (
          <Button key={href} asChild variant={pathname.startsWith(href) ? "default" : "ghost"} size="sm">
            <Link href={href} >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </Link>
          </Button>
        ))}
      </nav>

      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Can add breadcrumbs or search here if needed */}
      </div>
      {/* UserNav is now in the sidebar for desktop */}
    </header>
  );
}
