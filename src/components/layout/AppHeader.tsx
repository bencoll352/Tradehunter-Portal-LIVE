
"use client";

import Link from 'next/link';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Calculator, Users, Columns, Compass } from "lucide-react"; 
import { cn } from "@/lib/utils";
import { useEffect, useState } from 'react';
import { getBranchInfo, type BranchInfo } from '@/types';

const getPathTitle = (path: string) => {
  if (path === "/dashboard") return "Portal Overview"; 
  if (path.startsWith("/tradehunter")) return "TradeHunter Hub";
  if (path.startsWith("/buildwise-intel")) return "BuildWise Intel";
  if (path.startsWith("/estimator")) return "Materials Estimator";
  if (path.startsWith("/dover-sales-navigator")) return "Dover Sales Navigator";
  if (path.startsWith("/how-to-use")) return "How to Use Guide";
  return "TradeHunter Pro Portal";
};

export function AppHeader() {
  const pathname = usePathname();
  const title = getPathTitle(pathname);
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedInId = localStorage.getItem("loggedInId");
      setBranchInfo(getBranchInfo(loggedInId));
    }
  }, [pathname]); // Re-fetch branchInfo if pathname changes, useful for dynamic UI elements

  return (
    <header className="sticky top-0 z-10 flex h-20 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="flex-1 text-xl font-semibold text-foreground">{title}</h1>
      
      <nav className="flex items-center gap-2">
        <Button
          asChild
          size="lg" 
          variant={pathname === "/dashboard" ? "default" : "ghost"}
          className={cn(
            "font-medium", 
            pathname === "/dashboard" 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "text-primary/90 hover:bg-primary/10 hover:text-primary"
          )}
        >
          <Link href="/dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" /> 
            Dashboard
          </Link>
        </Button>
        <Button
          asChild
          size="lg" 
          variant={pathname.startsWith("/tradehunter") ? "default" : "ghost"}
          className={cn(
            "font-medium", 
            pathname.startsWith("/tradehunter") 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "text-primary/90 hover:bg-primary/10 hover:text-primary"
          )}
        >
          <Link href="/tradehunter" className="flex items-center gap-2">
            <Users className="h-5 w-5" /> 
            TradeHunter
          </Link>
        </Button>
        <Button
          asChild
          size="lg" 
          variant={pathname === "/buildwise-intel" ? "default" : "ghost"}
          className={cn(
            "font-medium", 
            pathname === "/buildwise-intel" 
              ? "bg-accent text-accent-foreground hover:bg-accent/90" 
              : "text-accent/90 hover:bg-accent/10 hover:text-accent"
          )}
        >
          <Link href="/buildwise-intel" className="flex items-center gap-2">
            <Home className="h-5 w-5" /> 
            BuildWise Intel
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant={pathname === "/estimator" ? "default" : "ghost"}
          className={cn(
            "font-medium",
            pathname === "/estimator"
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "text-primary/90 hover:bg-primary/10 hover:text-primary"
          )}
        >
          <Link href="/estimator" className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Estimator
          </Link>
        </Button>
        {branchInfo?.displayLoginId === 'DOVERMANAGER' && (
          <Button
            asChild
            size="lg"
            variant={pathname === "/dover-sales-navigator" ? "default" : "ghost"}
            className={cn(
              "font-medium",
              pathname === "/dover-sales-navigator"
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "text-purple-600/90 hover:bg-purple-600/10 hover:text-purple-700"
            )}
          >
            <Link href="/dover-sales-navigator" className="flex items-center gap-2">
              <Compass className="h-5 w-5" />
              Dover Sales Nav
            </Link>
          </Button>
        )}
      </nav>
    </header>
  );
}
