
"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PanelLeft, LogOut } from "lucide-react";
import { UserNav } from "./UserNav";
import { AppSidebarNav } from "./AppSidebarNav";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

export function AppHeader() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('loggedInId');
    localStorage.removeItem('loggedInUser');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.replace('/login');
  };

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
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Can add breadcrumbs or search here if needed */}
      </div>
      <UserNav />
      <Button variant="outline" size="sm" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </header>
  );
}
