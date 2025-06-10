
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
  Home,
  Calculator,
  Compass,
  BarChart2,
  Users,
  UploadCloud,
  Rocket,
  PackageSearch,
  FileText,
  ShieldCheck,
  Briefcase,
  type LucideIcon,
  Eye,
  ClipboardList,
  Info,
  Wrench,
  ShoppingBasket,
  TrendingUp,
  Brain,
  MessageSquareQuote 
} from "lucide-react";
import { Logo } from "@/components/icons/Logo";
import { useEffect, useState } from "react";
import { getBranchInfo, type BranchInfo } from "@/types";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", tooltip: "Dashboard" },
  // Other main navigation items are now in AppHeader
];

interface PurposeBoxItem {
  id: string;
  icon: LucideIcon;
  text: string;
}

const dashboardPurposeItems: PurposeBoxItem[] = [
  { id: 'dp1', icon: Eye, text: "View & manage branch trader data" },
  { id: 'dp2', icon: Users, text: "Add, edit, & delete traders" },
  { id: 'dp3', icon: Rocket, text: "Analyse data with Branch Booster" },
  { id: 'dp4', icon: BarChart2, text: "See quick stats at a glance" },
];

const buildwiseIntelPurposeItems: PurposeBoxItem[] = [
  { id: 'bwi1', icon: Briefcase, text: "Access external BuildWise Intel portal" },
  { id: 'bwi2', icon: Brain, text: "Gain specialized industry insights" },
  { id: 'bwi3', icon: Rocket, text: "Use Branch Booster for contextual analysis" },
  { id: 'bwi4', icon: MessageSquareQuote, text: "Bridge external data with your traders" }, 
];

const estimatorPurposeItems: PurposeBoxItem[] = [
  { id: 'est1', icon: Wrench, text: "Access external materials estimator" },
  { id: 'est2', icon: ShoppingBasket, text: "Estimate materials for projects" },
  { id: 'est3', icon: ClipboardList, text: "Plan material needs efficiently" },
  { id: 'est4', icon: Info, text: "Note: External tool, independent usage" },
];

const salesAcceleratorPurposeItems: PurposeBoxItem[] = [
  { id: 'sa1', icon: Compass, text: "Advanced strategic analysis (Managers)" },
  { id: 'sa2', icon: TrendingUp, text: "Identify growth & market opportunities" },
  { id: 'sa3', icon: FileText, text: "Analyse with supplemental documents" },
  { id: 'sa4', icon: ShieldCheck, text: "Develop data-driven sales strategies" },
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

  let currentPurposeItems: PurposeBoxItem[] = [];
  let currentPageTitle = "Page Info";

  if (pathname.startsWith("/dashboard")) {
    currentPurposeItems = dashboardPurposeItems;
    currentPageTitle = "Dashboard Purpose";
  } else if (pathname.startsWith("/buildwise-intel")) {
    currentPurposeItems = buildwiseIntelPurposeItems;
    currentPageTitle = "BuildWise Intel Purpose";
  } else if (pathname.startsWith("/estimator")) {
    currentPurposeItems = estimatorPurposeItems;
    currentPageTitle = "Estimator Purpose";
  } else if (pathname.startsWith("/sales-accelerator") && branchInfo?.role === 'manager') {
    currentPurposeItems = salesAcceleratorPurposeItems;
    currentPageTitle = "Accelerator Purpose";
  }


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
        <ScrollArea className="flex-1 px-3 py-2">
          <SidebarMenu className="mb-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href === "/dashboard" && pathname.startsWith("/dashboard"));
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
          
          {currentPurposeItems.length > 0 && (
            <div className="space-y-2 pt-2 group-data-[collapsible=icon]:px-0.5">
              <h3 className="text-xs font-semibold uppercase text-sidebar-foreground/60 px-2 group-data-[collapsible=icon]:hidden">
                {currentPageTitle}
              </h3>
              {currentPurposeItems.map((item) => (
                <div 
                  key={item.id} 
                  className={cn(
                    "flex items-center gap-2.5 p-2 rounded-md text-sidebar-foreground/90 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:py-2.5 group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:aspect-square group-data-[collapsible=icon]:h-auto",
                    sidebarState === "collapsed" ? "hover:bg-sidebar-accent/40" : "bg-sidebar-accent/10 hover:bg-sidebar-accent/30" 
                  )}
                  title={sidebarState === 'collapsed' ? item.text : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0 text-sidebar-primary group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
                  <span className="text-xs group-data-[collapsible=icon]:hidden">{item.text}</span>
                </div>
              ))}
            </div>
          )}

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
