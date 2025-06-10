
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
  ListChecks,
  HelpCircle,
  Users,
  Rocket,
  PackageSearch, // For Branch Booster's estimator
} from "lucide-react";
import { Logo } from "@/components/icons/Logo";
import { useEffect, useState } from "react";
import { getBranchInfo, type BranchInfo } from "@/types";
import { cn } from "@/lib/utils";
import { InfoAccordion } from "@/components/common/InfoAccordion"; // Import new component

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", tooltip: "Dashboard" },
  // Other main navigation items are now in AppHeader
];

// Define InfoAccordion sections for each page
const dashboardInfoSections = [
  {
    id: "dashboard-capabilities",
    title: "Dashboard & Traders",
    icon: ListChecks,
    defaultOpen: true,
    content: [
      "View & Manage Trader Database: Main table lists branch traders. Use pagination. Mini-stats show Active, Call-Backs, New Leads, Recently Active.",
      "Add New Trader: Use 'Add New Trader'. Form includes name, sales, status, contacts, notes, call-back dates. Duplicate phone warnings.",
      "Edit Trader: Click pencil icon (✏️) to modify.",
      "Delete Single/Multiple Traders: Trash icon (🗑️) for single. Checkboxes + 'Delete (X)' for bulk.",
      "Bulk Add Traders (CSV): Use 'Bulk Add Traders (CSV)'. Header row with mandatory 'Name' needed.",
      "Search & Filter: Keyword search and category dropdown filter.",
      "Sort Trader Data: Click column headers to sort.",
      "Set Call-Back Reminders: Use 'Call-Back Date' field.",
      "Download Trader Data (CSV): 'Download CSV' button exports current view.",
    ],
  },
  {
    id: "branch-booster-dashboard-how-to",
    title: "Branch Booster Usage",
    icon: Rocket,
    content: [
      "Locate 'Branch Booster' on Dashboard.",
      "Ask Questions: e.g., 'List active traders with sales over £50k'.",
      "Use Quick Actions: Pre-fill common queries like 'Estimate Project Materials' (icon: PackageSearch).",
      "Upload Customer Data (Optional): For deeper insights.",
      "Get Insights: Click button for analysis.",
    ],
  },
];

const buildwiseIntelInfoSections = [
  {
    id: "bwi-capabilities",
    title: "BuildWise Intel Portal",
    icon: Home,
    defaultOpen: true,
    content: [
      "Access External Insights: Embeds the BuildWise Intel application for specialized industry data and tools.",
      "Integrated Analysis: Branch Booster is available on this page to analyse BuildWise insights with your branch's trader data.",
    ],
  },
  {
    id: "bwi-how-to-use",
    title: "Using BuildWise & Booster",
    icon: HelpCircle,
    content: [
      "Access BuildWise Intel: Via 'BuildWise Intel' tab in header.",
      "Navigate Portal: Use embedded scrollbars and interface.",
      "Combine Insights: While viewing BuildWise, use Branch Booster alongside.",
      "Contextual Queries: Ask Booster questions linking BuildWise info to your traders (e.g., 'BuildWise shows X trend. How does this affect my Y traders?').",
      "Upload Data: Optionally upload data to Branch Booster for specific analysis.",
    ],
  },
];

const estimatorInfoSections = [
  {
    id: "estimator-capabilities",
    title: "Materials Estimator",
    icon: Calculator,
    defaultOpen: true,
    content: [
      "Access External Estimator: Embeds an external Building Materials Estimator tool.",
      "Estimate Project Materials: Use the tool to estimate material quantities for construction projects.",
    ],
  },
  {
    id: "estimator-how-to-use",
    title: "Using Materials Estimator",
    icon: HelpCircle,
    content: [
      "Access Estimator: Via 'Estimator' tab in header.",
      "Navigate Tool: Use embedded interface and scrollbars.",
      "Input Project Details: Follow tool instructions.",
      "View Estimates: Tool provides material estimates.",
      "Note: External tool. Refer to its documentation for specific questions. Branch Booster also has a material estimation quick action.",
    ],
  },
];

const salesAcceleratorInfoSections = [
  {
    id: "ssa-capabilities",
    title: "Sales Accelerator",
    icon: Compass,
    defaultOpen: true,
    content: [
      "Advanced Strategic Insights: For strategic planning.",
      "Deep Dive Analysis: Ask complex questions (market position, sales strategies, competitive analysis).",
      "AI-Driven Recommendations: For team performance and branch growth.",
      "Upload Supplemental Data: Market reports, competitor profiles for tailored insights.",
      "Use Strategic Quick Actions: For common strategic queries.",
      "External Intelligence: Connects to dedicated external analysis service.",
    ],
  },
  {
    id: "ssa-how-to-use",
    title: "Using Sales Accelerator",
    icon: HelpCircle,
    content: [
      "Access: For Managers, via 'Sales Accelerator' tab in header.",
      "Formulate Strategic Query: Input complex question/objective.",
      "Use Quick Actions: e.g., 'Market Trends Analysis'.",
      "Upload Supporting Docs (Optional): For enhanced context.",
      "Get Insights: Click 'Get Strategic Insights'.",
      "Contextual Data: Branch trader data automatically included.",
    ],
  },
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

  let currentPageInfoSections: any[] = [];
  if (pathname.startsWith("/dashboard")) {
    currentPageInfoSections = dashboardInfoSections;
  } else if (pathname.startsWith("/buildwise-intel")) {
    currentPageInfoSections = buildwiseIntelInfoSections;
  } else if (pathname.startsWith("/estimator")) {
    currentPageInfoSections = estimatorInfoSections;
  } else if (pathname.startsWith("/sales-accelerator") && branchInfo?.role === 'manager') {
    currentPageInfoSections = salesAcceleratorInfoSections;
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
          
          {currentPageInfoSections.length > 0 && (
            <InfoAccordion sections={currentPageInfoSections} />
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

