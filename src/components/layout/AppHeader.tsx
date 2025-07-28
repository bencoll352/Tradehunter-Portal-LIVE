
"use client";

import Link from 'next/link';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Bot, BarChart3, Settings } from "lucide-react"; 
import { cn } from "@/lib/utils";

const getPathTitle = (path: string) => {
  if (path === "/dashboard") return "Dashboard"; 
  if (path.startsWith("/scenario-generator")) return "Scenario Generator";
  if (path.startsWith("/analytics")) return "Analytics";
  if (path.startsWith("/settings")) return "Settings";
  if (path.startsWith("/how-to-use")) return "How to Use";
  return "ScenarioForge";
};

export function AppHeader() {
  const pathname = usePathname();
  const title = getPathTitle(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-20 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="flex-1 text-xl font-semibold text-foreground">{title}</h1>
      
      <nav className="hidden md:flex items-center gap-2">
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
          variant={pathname.startsWith("/scenario-generator") ? "default" : "ghost"}
          className={cn(
            "font-medium", 
            pathname.startsWith("/scenario-generator") 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "text-primary/90 hover:bg-primary/10 hover:text-primary"
          )}
        >
          <Link href="/scenario-generator" className="flex items-center gap-2">
            <Bot className="h-5 w-5" /> 
            Generator
          </Link>
        </Button>
         <Button
          asChild
          size="lg" 
          variant={pathname.startsWith("/analytics") ? "default" : "ghost"}
          className={cn(
            "font-medium", 
            pathname.startsWith("/analytics") 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "text-primary/90 hover:bg-primary/10 hover:text-primary"
          )}
        >
          <Link href="/analytics" className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> 
            Analytics
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant={pathname === "/settings" ? "default" : "ghost"}
          className={cn(
            "font-medium",
            pathname === "/settings"
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "text-primary/90 hover:bg-primary/10 hover:text-primary"
          )}
        >
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </Button>
      </nav>
    </header>
  );
}
