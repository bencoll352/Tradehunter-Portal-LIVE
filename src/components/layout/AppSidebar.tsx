
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
  LogOut,
  Home,
  Calculator,
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
  Lightbulb, 
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
  Link as LinkIcon, 
  Zap,
  Paperclip,
  Columns,
  Compass, 
  // UsersRound, // No longer used for Compete Intel
  // ClipboardCheck, // No longer used for Compete Intel
  Globe,
  ReplaceAll,
} from "lucide-react";
import { Logo } from "@/components/icons/Logo";
import { useEffect, useState } from "react";
import { getBranchInfo, type BranchInfo } from "@/types";
import { cn } from "@/lib/utils";

const baseNavItems = [
  { href: "/dashboard", icon: Columns, label: "Dashboard", tooltip: "Portal Overview" },
  { href: "/tradehunter", icon: Users, label: "TradeHunter", tooltip: "TradeHunter Hub" },
  // { href: "/competitor-insights", icon: ClipboardCheck, label: "Compete Intel", tooltip: "Competitor Insights" }, // REMOVED
  { href: "/how-to-use", icon: HelpCircle, label: "How to Use", tooltip: "How to Use Guide" },
];

interface PurposeBoxItem {
  id: string;
  icon: LucideIcon;
  text: string;
  contentKey?: string; 
}

const pageSpecificAccordionContent: Record<string, PurposeBoxItem[]> = {
  'do1_content': [
    { id: 'do1c1', icon: Info, text: "Welcome to TradeHunter Pro! This is your main overview." },
    { id: 'do1c2', icon: LinkIcon, text: "Quickly navigate to key sections like TradeHunter Hub, BuildWise Intel, and the Materials Estimator using the cards on this page or the header/sidebar navigation." },
    { id: 'do1c3', icon: Columns, text: "Get a bird's-eye view of the tools available to help manage your branch effectively." },
    { id: 'do1c4', icon: Compass, text: "If you are the Dover Manager, a 'Dover Sales Navigator' tab will also be available in the header and sidebar." },
  ],
  'do2_content': [
    { id: 'do2c1', icon: Users, text: "Dive into detailed trader management: view, add, edit, and delete traders." },
    { id: 'do2c2', icon: Rocket, text: "Utilise the Branch Booster for system-driven insights on your trader data." },
    { id: 'do2c3', icon: UploadCloud, text: "Perform bulk operations like CSV uploads and deletions." },
  ],
  'do3_content': [
    { id: 'do3c1', icon: Briefcase, text: "Access an external portal for specialised industry data and insights." },
    { id: 'do3c2', icon: Lightbulb, text: "Use the integrated Branch Booster on that page to cross-reference Intel data with your local trader information." }, 
  ],
  'do4_content': [
    { id: 'do4c1', icon: Calculator, text: "Access an external tool to help estimate materials needed for various construction projects." },
    { id: 'do4c2', icon: PackageSearch, text: "Streamline project planning by quickly getting material quantity estimates." },
  ],
  'th1_content': [
    { id: 'th1c1', icon: Table, text: "Trader data is displayed in a sortable, searchable table." },
    { id: 'th1c2', icon: Filter, text: "Filter traders by category using the dropdown." },
    { id: 'th1c3', icon: Download, text: "Download current view as CSV using the button." },
  ],
  'th2_content': [
    { id: 'th2c1', icon: PlusCircle, text: "Click 'Add New Trader' for individual entries." },
    { id: 'th2c2', icon: UploadCloud, text: "Use 'Bulk Add Traders' for CSV files." },
    { id: 'th2c3', icon: Pencil, text: "Click pencil icon in table to edit a trader." },
    { id: 'th2c4', icon: Trash2, text: "Click trash icon to delete a trader individually." },
    { id: 'th2c5', icon: CheckSquare, text: "Select multiple traders for bulk deletion using checkboxes and the 'Delete (X)' button." },
  ],
  'th3_content': [
    { id: 'th3c1', icon: MessageSquareQuote, text: "Ask questions about trader performance or market insights." },
    { id: 'th3c2', icon: Zap, text: "Utilise 'Quick Actions' for common, pre-defined analyses." },
    { id: 'th3c3', icon: Paperclip, text: "Upload customer data files (.csv, .txt) for deeper, contextual analysis." },
  ],
   'th4_content': [
    { id: 'th4c1', icon: Users, text: "See counts for Active, Call-Back, and New Lead traders." },
    { id: 'th4c2', icon: Activity, text: "View number of recently active traders (activity in last 30 days)." },
  ],
  'th5_content': [
    { id: 'th5c1', icon: LinkIcon, text: "Navigate to the main 'How to Use' page (sidebar link) for complete portal documentation and FAQs." }
  ],
  'bwi_content_main': [
    { id: 'bwic1', icon: Briefcase, text: "Access the external BuildWise Intel application." },
    { id: 'bwic2', icon: Lightbulb, text: "Gain specialised industry data and insights from their portal." }, 
    { id: 'bwic3', icon: Rocket, text: "Use the Branch Booster (also on this page) to analyse Intel portal info alongside your trader data." }, 
  ],
  'est_content_main': [
    { id: 'estc1', icon: Wrench, text: "Access the external Building Materials Estimator tool." },
    { id: 'estc2', icon: ShoppingBasket, text: "Estimate materials for various construction projects." },
    { id: 'estc3', icon: ClipboardList, text: "Plan material needs (Note: this is an external tool)." },
  ],
  'htu_content_main': [
    { id: 'htuc1', icon: HelpCircle, text: "Find answers to Frequently Asked Questions." },
    { id: 'htuc2', icon: ListChecks, text: "Follow detailed step-by-step instructions for portal features." },
    { id: 'htuc3', icon: BookOpenText, text: "Learn about all core functionalities and how to use them effectively." },
    { id: 'htuc4', icon: Compass, text: "Dover Managers: Find a dedicated 'Dover Sales Navigator' tab providing access to a specialized tool." },
  ],
  'dsn_content_main': [
    { id: 'dsnc1', icon: Compass, text: "Access the advanced Dover Sales & Strategy Navigator." },
    { id: 'dsnc2', icon: TrendingUp, text: "Explore comprehensive sales intelligence and strategic opportunities for the Dover branch." },
    { id: 'dsnc3', icon: ShieldCheck, text: "This tool is exclusively available to the Dover Manager account." },
  ],
};

const dashboardOverviewPurposeItems: PurposeBoxItem[] = [
  { id: 'do1', icon: Eye, text: "Portal Overview & Navigation", contentKey: 'do1_content' },
  { id: 'do2', icon: Users, text: "Go to: TradeHunter Hub", contentKey: 'do2_content' },
  { id: 'do3', icon: Briefcase, text: "Go to: BuildWise Intel", contentKey: 'bwi_content_main' }, 
  { id: 'do4', icon: Calculator, text: "Go to: Materials Estimator", contentKey: 'est_content_main' }, 
];

const tradeHunterPurposeItems: PurposeBoxItem[] = [
  { id: 'th1', icon: Eye, text: "View & Manage Trader Data", contentKey: 'th1_content' },
  { id: 'th2', icon: Users, text: "Add, Edit, & Delete Traders", contentKey: 'th2_content' },
  { id: 'th3', icon: Rocket, text: "Analyse Data with Branch Booster", contentKey: 'th3_content' }, 
  { id: 'th4', icon: BarChart2, text: "View Hub Statistics", contentKey: 'th4_content'},
  { id: 'th5', icon: BookOpenText, text: "Comprehensive 'How to Use' Guide", contentKey: 'th5_content' }
];

const buildwiseIntelPurposeItems: PurposeBoxItem[] = [
  { id: 'bwi_main', icon: Home, text: "BuildWise Intel Portal & Analysis", contentKey: 'bwi_content_main' }, 
];

const estimatorPurposeItems: PurposeBoxItem[] = [
  { id: 'est_main', icon: Calculator, text: "Building Materials Estimator", contentKey: 'est_content_main' },
];

const howToUsePurposeItems: PurposeBoxItem[] = [
  { id: 'htu_main', icon: HelpCircle, text: "Portal Usage Guide & FAQs", contentKey: 'htu_content_main' },
];

const doverSalesNavigatorPurposeItems: PurposeBoxItem[] = [
  { id: 'dsn_main', icon: Compass, text: "Dover Sales Navigator Tool", contentKey: 'dsn_content_main' },
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
  let navItems = [...baseNavItems]; 

  if (branchInfo?.displayLoginId === 'DOVERMANAGER') {
    const howToUseIndex = navItems.findIndex(item => item.href === "/how-to-use");
    const doverNavItem = {
      href: "/dover-sales-navigator",
      icon: Compass,
      label: "Dover Sales Nav",
      tooltip: "Dover: Advanced Sales & Strategy Hub",
    };
    if (howToUseIndex !== -1) {
      navItems.splice(howToUseIndex, 0, doverNavItem);
    } else { 
      navItems.push(doverNavItem);
    }
  }
  
  if (pathname === "/dashboard") {
    currentPurposeItems = dashboardOverviewPurposeItems;
    currentPageTitle = "Dashboard: Overview & Purpose";
  } else if (pathname.startsWith("/tradehunter")) {
    currentPurposeItems = tradeHunterPurposeItems;
    currentPageTitle = "TradeHunter Hub: Purpose & How-To's";
  } else if (pathname.startsWith("/buildwise-intel")) {
    currentPurposeItems = buildwiseIntelPurposeItems;
    currentPageTitle = "BuildWise Intel: Purpose";
  } else if (pathname.startsWith("/estimator")) {
    currentPurposeItems = estimatorPurposeItems;
    currentPageTitle = "Estimator: Purpose";
  } else if (pathname.startsWith("/dover-sales-navigator") && branchInfo?.displayLoginId === 'DOVERMANAGER') {
    currentPurposeItems = doverSalesNavigatorPurposeItems;
    currentPageTitle = "Dover Sales Nav: Purpose";
  }
   else if (pathname.startsWith("/how-to-use")) {
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
              if (item.href === "/dover-sales-navigator" && branchInfo?.displayLoginId !== 'DOVERMANAGER') {
                return null;
              }

              let isActive = false;
              if (item.href === "/dashboard" || item.href === "/how-to-use") { 
                isActive = pathname === item.href;
              } else { 
                isActive = pathname.startsWith(item.href);
              }
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
                  } else { 
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
