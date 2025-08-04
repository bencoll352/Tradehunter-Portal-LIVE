
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
  Lightbulb,
  Settings,
  HelpCircle,
  Database,
  Users,
  Calculator,
  Home,
} from "lucide-react";
import { Logo } from "@/components/icons/Logo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", tooltip: "Dashboard Overview" },
  { href: "/tradehunter", icon: Database, label: "Trader Database", tooltip: "Manage Traders" },
  { href: "/competitor-insights", icon: Lightbulb, label: "Competitor Insights", tooltip: "Analyze Competitors" },
  { href: "/estimator", icon: Calculator, label: "Estimator", tooltip: "Materials Estimator" },
  { href: "/smart-team", icon: Users, label: "Smart Team", tooltip: "Smart Team Hub" },
  { href: "/buildwise-intel", icon: Home, label: "BuildWise Intel", tooltip: "External Intel Portal" },
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
