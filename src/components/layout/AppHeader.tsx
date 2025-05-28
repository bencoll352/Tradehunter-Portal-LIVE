"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { Home, Users, HelpCircle, Settings } from "lucide-react";

const getPathTitle = (path: string) => {
  if (path.startsWith("/dashboard")) return "Dashboard";
  if (path.startsWith("/how-to-use")) return "How to Use & FAQs";
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
      {/* Future elements like global search or user menu can go here */}
      {/* <Button variant="outline" size="icon">
        <Settings className="h-5 w-5" />
        <span className="sr-only">Settings</span>
      </Button> */}
    </header>
  );
}
