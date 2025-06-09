
"use client";

import Link from 'next/link';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard } from "lucide-react"; // Changed Briefcase to Home, added LayoutDashboard for clarity
import { cn } from "@/lib/utils";

const getPathTitle = (path: string) => {
  if (path.startsWith("/dashboard")) return "Dashboard";
  if (path.startsWith("/how-to-use")) return "How to Use & FAQs";
  if (path.startsWith("/buildwise-intel")) return "BuildWise Intel";
  return "TradeHunter Pro Portal";
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
      
      <nav className="flex items-center gap-2">
        <Button
          asChild
          size="lg" // Made button larger
          variant={pathname === "/dashboard" ? "default" : "ghost"}
          className={cn(
            "font-medium", // Removed text-sm to allow size="lg" to control text better
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
          size="lg" // Made button larger
          variant={pathname === "/buildwise-intel" ? "default" : "ghost"}
          className={cn(
            "font-medium", // Removed text-sm
            pathname === "/buildwise-intel" 
              ? "bg-accent text-accent-foreground hover:bg-accent/90" 
              : "text-accent/90 hover:bg-accent/10 hover:text-accent"
          )}
        >
          <Link href="/buildwise-intel" className="flex items-center gap-2">
            <Home className="h-5 w-5" /> {/* Changed icon to Home */}
            BuildWise Intel
          </Link>
        </Button>
      </nav>
      {/* Future elements like global search or user menu can go here */}
    </header>
  );
}
