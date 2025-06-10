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
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/icons/Logo";
import { useEffect, useState } from "react";
import { getBranchInfo, type BranchInfo } from "@/types";
import { cn } from "@/lib/utils";

// Main navigation items are now primarily in the AppHeader
const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", tooltip: "Dashboard (Main)" },
  // "How to Use" is removed, content distributed to relevant pages.
  // Other main tabs (BuildWise, Estimator, Sales Accelerator) are in AppHeader.
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile, state: sidebarState } = useSidebar();
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedInId = localStorage.getItem("loggedInId");
      setBranchInfo(getBranchInfo(loggedInId));
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("loggedInId");
    }
    router.push("/login");
    setOpenMobile(false);
  };

  const displayId = branchInfo?.displayLoginId || "Branch";
  const avatarChar = displayId.includes("MANAGER") ? displayId.charAt(0) + "M" : displayId.charAt(0);

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-3">
        <div className={cn(
            "flex items-center gap-2",
            sidebarState === 'collapsed' ? "justify-center" : ""
          )}
        >
          <Logo
            width={sidebarState === 'collapsed' ? 40 : 180}
            height={sidebarState === 'collapsed' ? 20 : 47}
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1">
          <SidebarMenu className="px-3 py-2">
            {navItems.map((item) => { // Only "Dashboard" link might remain here for quick access if desired
              const isActive = pathname === item.href || (item.href === "/dashboard" && pathname.startsWith("/dashboard")); // Make dashboard active if on main dashboard
              return (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.tooltip}
                      onClick={() => setOpenMobile(false)}
                      className={cn(
                        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                         isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
                      )}
                    >
                      <div>
                        <item.icon />
                        <span>{item.label}</span>
                      </div>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
          
          {/* Functional Capabilities Accordion has been removed */}
          {/* Its content is now distributed to individual pages */}

        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <Separator className="my-2 bg-sidebar-border group-data-[collapsible=icon]:hidden"/>
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center p-2 rounded-md hover:bg-sidebar-accent transition-colors">
            <Avatar className="h-9 w-9 border-2 border-sidebar-primary">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                {avatarChar}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-medium text-sidebar-primary-foreground">
                {displayId}
              </span>
              <span className="text-xs text-sidebar-foreground/80">{branchInfo?.role === 'manager' ? 'Manager Account' : 'Branch Account'}</span>
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
