
"use client";

import Link from 'next/link';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Calculator, Lightbulb, Database, Home, GraduationCap } from "lucide-react"; 
import { cn } from "@/lib/utils";

const getPathTitle = (path: string): string => {
  const pathMap: { [key: string]: string } = {
    "/dashboard": "Dashboard",
    "/tradehunter": "Trader Database",
    "/competitor-insights": "Competitor Insights",
    "/estimator": "Materials Estimator",
    "/smart-team": "Smart Team Hub",
    "/buildwise-intel": "BuildWise Intel",
    "/staff-training": "Staff Training",
    "/how-to-use": "How to Use"
  };

  const matchingPath = Object.keys(pathMap).find(key => path.startsWith(key));
  return matchingPath ? pathMap[matchingPath] : "TradeHunter Pro";
};

export function AppHeader() {
  const pathname = usePathname();
  const title = getPathTitle(pathname);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tradehunter", label: "Trader DB", icon: Database },
    { href: "/competitor-insights", label: "Competitors", icon: Lightbulb },
    { href: "/estimator", label: "Estimator", icon: Calculator },
    { href: "/smart-team", label: "Smart Team", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-10 flex h-16 md:h-20 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="flex-1 text-xl font-semibold text-foreground">{title}</h1>
      
      <nav className="hidden md:flex items-center gap-1">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Button
            key={href}
            asChild
            size="lg" 
            variant={pathname.startsWith(href) ? "default" : "ghost"}
            className={cn(
              "font-medium", 
              pathname.startsWith(href)
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "text-primary/90 hover:bg-primary/10 hover:text-primary"
            )}
          >
            <Link href={href} className="flex items-center gap-2">
              <Icon className="h-5 w-5" /> 
              {label}
            </Link>
          </Button>
        ))}
      </nav>
    </header>
  );
}
