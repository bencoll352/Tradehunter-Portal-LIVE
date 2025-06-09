
"use client";

import Link from 'next/link';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { Briefcase } from "lucide-react"; // Added Briefcase
import { cn } from "@/lib/utils";

const getPathTitle = (path: string) => {
  if (path.startsWith("/dashboard")) return "Dashboard";
  if (path.startsWith("/how-to-use")) return "How to Use & FAQs";
  if (path.startsWith("/buildwise-intel")) return "BuildWise Intel"; // Title for the new page
  return "TradeHunter Pro Portal";
};

export function AppHeader() {
  const pathname = usePathname();
  const title = getPathTitle(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="flex-1 text-xl font-semibold text-foreground">{title}</h1>
      
      <nav className="flex items-center gap-2">
        <Button
          asChild
          variant={pathname === "/dashboard" ? "default" : "ghost"}
          className={cn(
            "text-sm font-medium",
            pathname === "/dashboard" 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button
          asChild
          variant={pathname === "/buildwise-intel" ? "default" : "ghost"}
          className={cn(
            "text-sm font-medium",
            pathname === "/buildwise-intel" 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Link href="/buildwise-intel" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            BuildWise Intel
          </Link>
        </Button>
      </nav>
      {/* Future elements like global search or user menu can go here */}
    </header>
  );
}
