
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
  Lightbulb,
  HelpCircle,
  Database,
  Users,
  Calculator,
  Home,
  LogOut,
  UserCircle,
} from "lucide-react";
import { Logo } from "@/components/icons/Logo";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { type BranchInfo, type BranchLoginId, getBranchInfo } from "@/types";
import { InfoAccordion } from "../common/InfoAccordion";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", tooltip: "Dashboard Overview" },
  { href: "/tradehunter", icon: Database, label: "Trader Database", tooltip: "Manage Traders" },
  { href: "/competitor-insights", icon: Lightbulb, label: "Competitor Insights", tooltip: "Analyse Competitors" },
  { href: "/estimator", icon: Calculator, label: "Estimator", tooltip: "Materials Estimator" },
  { href: "/smart-team", icon: Users, label: "Smart Team", tooltip: "Smart Team Hub (Managers)" },
  { href: "/buildwise-intel", icon: Home, label: "BuildWise Intel", tooltip: "External Intel Portal" },
  { href: "/how-to-use", icon: HelpCircle, label: "How to Use", tooltip: "How to Use Guide" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const { toast } = useToast();
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLoggedInId = localStorage.getItem('loggedInId') as BranchLoginId | null;
      const storedUser = localStorage.getItem('loggedInUser');
      const info = getBranchInfo(storedLoggedInId, storedUser);
      setBranchInfo(info);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInId");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push("/login");
  };

  const insightFeatures = [
    { 
        id: "insights", 
        title: "Insight & Assistance Features",
        icon: Lightbulb, 
        defaultOpen: true,
        content: [
            "Quickly analyse competitor strategies.",
            "Generate material estimates for projects.",
            "Access specialised data via BuildWise Intel.",
            "For managers: utilise the Smart Team Hub for advanced analytics and lead generation."
        ]
    },
    { 
        id: "data-management", 
        title: "Data Management",
        icon: Database,
        defaultOpen: false,
        content: [
            "View, add, edit, and delete traders.",
            "Use bulk CSV upload for large datasets.",
            "Filter and sort traders by various criteria.",
            "Data is securely stored and managed per branch.",
        ]
    }
  ];

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-3">
         <Logo />
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1 px-3 py-2">
          <SidebarMenu className="mb-4">
            {navItems.map((item) => {
              // Conditionally render the Smart Team link based on user role
              if (item.href === "/smart-team" && branchInfo?.role !== 'manager') {
                return null;
              }
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

          <div className="group-data-[collapsible=icon]:hidden px-1">
             <InfoAccordion sections={insightFeatures} />
          </div>

        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2">
         {branchInfo && (
          <div className="rounded-lg bg-sidebar-accent/50 border border-sidebar-border p-2 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-2">
                <UserCircle className="h-6 w-6 text-sidebar-foreground" />
                <div className="flex flex-col text-left">
                    <p className="text-xs font-semibold text-sidebar-foreground truncate" title={branchInfo.displayLoginId || ''}>
                        {branchInfo.displayLoginId || 'Unknown ID'}
                    </p>
                    <p className="text-[11px] text-sidebar-foreground/70 capitalize">
                        {branchInfo.role}
                    </p>
                </div>
            </div>
          </div>
         )}
         <Button 
            variant="ghost" 
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
         >
            <LogOut className="h-5 w-5" />
            <span className="group-data-[collapsible=icon]:hidden ml-2">Logout</span>
         </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
