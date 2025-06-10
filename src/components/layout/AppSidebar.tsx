
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  MessageSquareQuote, 
  HelpCircle,
  ListChecks,
  BookOpenText,
  Table,
  Filter,
  Download,
  PlusCircle,
  Pencil,
  Trash2,
  CheckSquare,
  Activity,
  Link as LinkIcon, // Renamed to avoid conflict with NextLink
  Zap,
  Paperclip,
} from "lucide-react";
import { Logo } from "@/components/icons/Logo";
import { useEffect, useState } from "react";
import { getBranchInfo, type BranchInfo } from "@/types";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", tooltip: "Dashboard" },
  { href: "/how-to-use", icon: HelpCircle, label: "How to Use", tooltip: "How to Use Guide" },
];

interface PurposeBoxItem {
  id: string;
  icon: LucideIcon;
  text: string;
  contentKey?: string; 
}

const pageSpecificAccordionContent: Record<string, PurposeBoxItem[]> = {
  'dp1_content': [
    { id: 'dp1c1', icon: Table, text: "Trader data is displayed in a sortable, searchable table." },
    { id: 'dp1c2', icon: Filter, text: "Filter traders by category using the dropdown." },
    { id: 'dp1c3', icon: Download, text: "Download current view as CSV using the button." },
  ],
  'dp2_content': [
    { id: 'dp2c1', icon: PlusCircle, text: "Click 'Add New Trader' for individual entries." },
    { id: 'dp2c2', icon: UploadCloud, text: "Use 'Bulk Add Traders' for CSV files." },
    { id: 'dp2c3', icon: Pencil, text: "Click pencil icon in table to edit a trader." },
    { id: 'dp2c4', icon: Trash2, text: "Click trash icon to delete a trader individually." },
    { id: 'dp2c5', icon: CheckSquare, text: "Select multiple traders for bulk deletion using checkboxes and the 'Delete (X)' button." },
  ],
  'dp3_content': [
    { id: 'dp3c1', icon: MessageSquareQuote, text: "Ask questions about trader performance or market insights." },
    { id: 'dp3c2', icon: Zap, text: "Utilize 'Quick Actions' for common, pre-defined analyses." },
    { id: 'dp3c3', icon: Paperclip, text: "Upload customer data files (.csv, .txt) for deeper, contextual analysis." },
  ],
   'dp4_content': [
    { id: 'dp4c1', icon: Users, text: "See counts for Active, Call-Back, and New Lead traders." },
    { id: 'dp4c2', icon: Activity, text: "View number of recently active traders (activity in last 30 days)." },
  ],
  'dp5_content': [
    { id: 'dp5c1', icon: LinkIcon, text: "Navigate to the main 'How to Use' page (sidebar link) for complete portal documentation and FAQs." }
  ],
  // Define content for other pages if needed, e.g., buildwiseIntel, estimator
  'bwi_content_main': [
    { id: 'bwic1', icon: Briefcase, text: "Access the external BuildWise Intel application." },
    { id: 'bwic2', icon: Brain, text: "Gain specialized industry data and insights from their portal." },
    { id: 'bwic3', icon: Rocket, text: "Use the Branch Booster (also on this page) to analyze Intel portal info alongside your trader data." },
  ],
  'est_content_main': [
    { id: 'estc1', icon: Wrench, text: "Access the external Building Materials Estimator tool." },
    { id: 'estc2', icon: ShoppingBasket, text: "Estimate materials for various construction projects." },
    { id: 'estc3', icon: ClipboardList, text: "Plan material needs (Note: this is an external tool)." },
  ],
  'sa_content_main': [
    { id: 'sac1', icon: Compass, text: "For Managers: Advanced strategic analysis via external service." },
    { id: 'sac2', icon: TrendingUp, text: "Identify growth opportunities and assess market trends." },
    { id: 'sac3', icon: FileText, text: "Analyze with supplemental documents (market reports, etc.)." },
  ],
  'htu_content_main': [
    { id: 'htuc1', icon: HelpCircle, text: "Find answers to Frequently Asked Questions." },
    { id: 'htuc2', icon: ListChecks, text: "Follow detailed step-by-step instructions for portal features." },
    { id: 'htuc3', icon: BookOpenText, text: "Learn about all core functionalities and how to use them effectively." },
  ]
};

const dashboardPurposeItems: PurposeBoxItem[] = [
  { id: 'dp1', icon: Eye, text: "View & Manage Trader Data", contentKey: 'dp1_content' },
  { id: 'dp2', icon: Users, text: "Add, Edit, & Delete Traders", contentKey: 'dp2_content' },
  { id: 'dp3', icon: Rocket, text: "Analyse Data with Branch Booster", contentKey: 'dp3_content' },
  { id: 'dp4', icon: BarChart2, text: "View Dashboard Statistics", contentKey: 'dp4_content'},
  { id: 'dp5', icon: BookOpenText, text: "Comprehensive 'How to Use' Guide", contentKey: 'dp5_content' }
];

const buildwiseIntelPurposeItems: PurposeBoxItem[] = [
  { id: 'bwi_main', icon: Home, text: "BuildWise Intel Portal & Analysis", contentKey: 'bwi_content_main' },
];

const estimatorPurposeItems: PurposeBoxItem[] = [
  { id: 'est_main', icon: Calculator, text: "Building Materials Estimator", contentKey: 'est_content_main' },
];

const salesAcceleratorPurposeItems: PurposeBoxItem[] = [
   { id: 'sa_main', icon: Compass, text: "Sales & Strategy Accelerator", contentKey: 'sa_content_main' },
];

const howToUsePurposeItems: PurposeBoxItem[] = [
  { id: 'htu_main', icon: HelpCircle, text: "Portal Usage Guide & FAQs", contentKey: 'htu_content_main' },
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
    currentPageTitle = "Dashboard: Purpose & How-To's";
  } else if (pathname.startsWith("/buildwise-intel")) {
    currentPurposeItems = buildwiseIntelPurposeItems;
    currentPageTitle = "BuildWise Intel: Purpose";
  } else if (pathname.startsWith("/estimator")) {
    currentPurposeItems = estimatorPurposeItems;
    currentPageTitle = "Estimator: Purpose";
  } else if (pathname.startsWith("/sales-accelerator") && branchInfo?.role === 'manager') {
    currentPurposeItems = salesAcceleratorPurposeItems;
    currentPageTitle = "Accelerator: Purpose";
  } else if (pathname.startsWith("/how-to-use")) {
    currentPurposeItems = howToUsePurposeItems;
    currentPageTitle = "How to Use: Guide Sections";
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
              const isActive = pathname === item.href || 
                               (item.href === "/dashboard" && pathname.startsWith("/dashboard")) ||
                               (item.href === "/how-to-use" && pathname.startsWith("/how-to-use"));
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
            <div className="space-y-1 pt-2 group-data-[collapsible=icon]:px-0.5">
              <h3 className="text-xs font-semibold uppercase text-sidebar-foreground/60 px-2 group-data-[collapsible=icon]:hidden mb-1">
                {currentPageTitle}
              </h3>
              <Accordion type="multiple" className="w-full space-y-1">
                {currentPurposeItems.map((item) => {
                  const IconComponent = item.icon;
                  const content = item.contentKey ? pageSpecificAccordionContent[item.contentKey] : null;

                  if (content && content.length > 0) {
                    return (
                      <AccordionItem value={item.id} key={item.id} 
                        className={cn(
                          "border-none rounded-md",
                           sidebarState === "collapsed" ? "" : "bg-sidebar-accent/10"
                        )}
                      >
                        <AccordionTrigger 
                          className={cn(
                            "p-2 text-sidebar-foreground/90 no-underline hover:no-underline data-[state=open]:bg-sidebar-accent/40 data-[state=closed]:hover:bg-sidebar-accent/30 rounded-md w-full text-left",
                            "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:py-2.5 group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:aspect-square group-data-[collapsible=icon]:h-auto"
                          )}
                          title={sidebarState === 'collapsed' ? item.text : undefined}
                        >
                          <div className="flex items-center gap-2.5 w-full">
                            <IconComponent className="h-4 w-4 shrink-0 text-sidebar-primary group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
                            <span className="text-xs flex-1 group-data-[collapsible=icon]:hidden">{item.text}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-1 pb-2 pl-3 pr-2 space-y-1.5 group-data-[collapsible=icon]:hidden">
                          {content.map(subItem => {
                            const SubItemIcon = subItem.icon;
                            return (
                              <div key={subItem.id} className="flex items-start gap-2 p-1.5 rounded-md hover:bg-sidebar-accent/20">
                                <SubItemIcon className="h-3.5 w-3.5 shrink-0 text-sidebar-primary/80 mt-0.5" />
                                <span className="text-xs text-sidebar-foreground/80 flex-1">{subItem.text}</span>
                              </div>
                            );
                          })}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  } else { // Render as a non-accordion item if no contentKey or no content
                    return (
                      <div 
                        key={item.id} 
                        className={cn(
                          "flex items-center gap-2.5 p-2 rounded-md text-sidebar-foreground/90",
                          sidebarState === "collapsed" 
                            ? "hover:bg-sidebar-accent/40 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:py-2.5 group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:aspect-square group-data-[collapsible=icon]:h-auto" 
                            : "bg-sidebar-accent/10 hover:bg-sidebar-accent/30" 
                        )}
                        title={sidebarState === 'collapsed' ? item.text : undefined}
                      >
                        <IconComponent className="h-4 w-4 shrink-0 text-sidebar-primary group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
                        <span className="text-xs group-data-[collapsible=icon]:hidden">{item.text}</span>
                      </div>
                    );
                  }
                })}
              </Accordion>
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
