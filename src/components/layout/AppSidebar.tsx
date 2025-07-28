
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
import {
  LayoutDashboard,
  Bot,
  BarChart3,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Logo } from "@/components/icons/Logo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", tooltip: "Dashboard" },
  { href: "/scenario-generator", icon: Bot, label: "Generator", tooltip: "Scenario Generator" },
  { href: "/analytics", icon: BarChart3, label: "Analytics", tooltip: "Performance Analytics" },
  { href: "/settings", icon: Settings, label: "Settings", tooltip: "Account Settings" },
  { href: "/how-to-use", icon: HelpCircle, label: "How to Use", tooltip: "How to Use Guide" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-3">
         <Logo />
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1 px-3 py-2">
          <SidebarMenu className="mb-4">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
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
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {/* User info and logout button have been removed as login is disabled */}
      </SidebarFooter>
    </Sidebar>
  );
}
