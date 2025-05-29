
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/icons/Logo";
import { useEffect, useState } from "react";
import type { BranchId } from "@/types";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", tooltip: "Dashboard" },
  { href: "/how-to-use", icon: HelpCircle, label: "How to Use", tooltip: "Help & FAQs" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const [currentBranchId, setCurrentBranchId] = useState<BranchId | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedBranchId = localStorage.getItem("branchId") as BranchId | null;
      setCurrentBranchId(storedBranchId);
    }
  }, []);
  
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("branchId");
    }
    router.push("/login");
    setOpenMobile(false);
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <Logo className="text-sidebar-primary"/>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <h1 className="text-xl font-semibold text-sidebar-primary-foreground">TradeHunter Pro</h1>
            {/* <p className="text-xs text-sidebar-foreground/80">Portal</p> Removed "Portal" part */}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1">
          <SidebarMenu className="px-3 py-2">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.tooltip}
                    onClick={() => setOpenMobile(false)}
                    className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                  >
                    <a>
                      <item.icon />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <Separator className="my-2 bg-sidebar-border group-data-[collapsible=icon]:hidden"/>
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center p-2 rounded-md hover:bg-sidebar-accent transition-colors">
            <Avatar className="h-9 w-9 border-2 border-sidebar-primary">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                {currentBranchId ? currentBranchId.charAt(0) : '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-medium text-sidebar-primary-foreground">
                {currentBranchId || "Branch"}
              </span>
              <span className="text-xs text-sidebar-foreground/80">Branch Account</span>
            </div>
        </div>

        <SidebarMenuButton
          onClick={handleLogout}
          tooltip="Logout"
          className="mt-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut />
          <span className="group-data-[collapsible=icon]:hidden">Logout</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
