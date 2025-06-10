
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
  Users,
  Lightbulb,
  ShieldCheck,
  FileText,
  Compass,
  Home, // Changed from Briefcase
} from "lucide-react";
import { Logo } from "@/components/icons/Logo";
import { useEffect, useState } from "react";
import { getBranchInfo, type BranchInfo } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", tooltip: "Dashboard" },
  { href: "/how-to-use", icon: HelpCircle, label: "How to Use", tooltip: "Help & FAQs" },
];

const capabilitiesData = [
  {
    category: "Trader Management",
    icon: Users,
    features: [
      "Access & View Trader Database: After logging in with your Branch or Manager ID, your branch's traders are listed in the main dashboard table. The table shows 50 traders per page; use pagination to navigate.",
      "Add New Trader: Click 'Add New Trader' on the dashboard. A form will appear to enter details like name, sales, status, contact info, notes, and specific call-back dates. The system checks for duplicate phone numbers within the branch.",
      "Edit Trader Information: In the trader table, click the pencil icon (✏️) in the 'Actions' column for the desired trader. Their details will load in a form for you to modify and save.",
      "Delete Single Trader: Click the trash can icon (🗑️) in the 'Actions' column for a trader. A confirmation dialogue will ask you to confirm before permanently deleting.",
      "Bulk Delete Multiple Traders: Select traders by clicking the checkboxes next to their names in the table. The 'Delete (X)' button will appear; click it and confirm to remove all selected traders at once.",
      "Bulk Add Traders (CSV Upload): Click 'Bulk Add Traders (CSV)'. Upload a CSV file containing trader data. The system primarily uses header names (e.g., 'Name', 'Total Sales', 'Phone') to map data, so column order is flexible. 'Name' is mandatory. See dialogue instructions for more on expected headers and CSV formatting (e.g., use double quotes for fields with commas like addresses). Duplicates (by phone number, compared to existing data or within the CSV) are automatically skipped, with a summary provided.",
      "Search Traders: Use the search bar above the trader table. Type keywords to find traders across various fields like name, description, main category, address, or notes.",
      "Filter Traders by Category: Use the 'Filter by category' dropdown (next to the search bar) to view traders belonging to specific categories. The category list is dynamically generated from your branch's trader data.",
      "Sort Trader Data: Click on column headers in the trader table (e.g., 'Name', 'Total Sales', 'Last Activity', 'Call-Back Date') to sort the data by that column in ascending or descending order.",
      "Set & Manage Call-Back Reminders: When adding or editing a trader, use the 'Call-Back Date' field (with a calendar picker) to set a follow-up date. These dates are visible in the 'Call-Back' column and can be sorted to prioritise upcoming calls.",
      "Data Persistence & Branch Isolation: All trader data is securely stored per branch in Firebase Firestore. This means your data is saved across sessions and is separate from other branches."
    ]
  },
  {
    category: "Data Analysis & Branch Booster",
    icon: Lightbulb,
    features: [
      "Query Trader Data (Branch Booster): Find the 'Branch Booster' section on your dashboard or the BuildWise Intel page. Type your questions about your branch's traders directly into the text area (e.g., 'What is the total sales volume for active traders?', 'List all traders in the 'Brickwork' category with a call-back date this month'). The analysis automatically uses your current branch's trader data.",
      "Use Quick Actions (Branch Booster): Click pre-defined buttons in the Branch Booster for common analyses like 'New Customers', 'High Potential New Customers', or 'List Bricklayers & Sales Campaign'. This pre-fills the query for you.",
      "Analyse Uploaded Customer/Contextual Data (Branch Booster): Use the 'Upload Additional Customer Data' option in the Branch Booster to upload a text or CSV file (e.g., a list of local customers, specific project details). The Branch Booster will then use this information alongside your trader data to answer more complex queries (e.g., 'Based on this uploaded customer list, which of my active traders might be suitable for them?').",
      "Estimate Project Materials (Branch Booster): Click the 'Estimate Project Materials' Quick Action. You can then further refine the project type or details in the query box. The Branch Booster leverages its understanding of UK building processes to help estimate typical materials needed.",
      "Get Actionable Insights & Suggestions (Branch Booster): Ask the Branch Booster for strategic advice, such as 'Suggest strategies to re-engage lapsed accounts who were previously high value' or 'Draft a promotional message for our new line of eco-friendly insulation to traders in the 'Roofing' category'.",
      "View Key Branch Statistics: The mini-dashboard at the top of the page provides an at-a-glance view of 'Active Traders', 'Call-Back Traders', 'New Leads', and 'Recently Active Traders' counts for your branch.",
      "Utilise the Branch Booster on the BuildWise Intel page to gain insights that leverage both your trader data and information from the external BuildWise Intel portal."
    ]
  },
  {
    category: "Sales & Strategy Accelerator (Managers Only)",
    icon: Compass,
    features: [
      "Access Advanced Strategic Insights: If logged in with a Manager ID (e.g., 'PURLEYMANAGER'), the 'Sales & Strategy Accelerator' agent appears below the Branch Booster on the Dashboard.",
      "Deep Dive Analysis: Use the Accelerator to ask complex strategic questions, request market trend analysis relative to your branch's data, or get AI-driven recommendations for sales strategies, team performance optimisation, and long-term branch growth.",
      "Upload Supplemental Data (Accelerator): Use the 'Upload Supplemental Data' option within the Accelerator to upload files like market reports or competitor profiles. This provides additional context to the external analysis service, potentially leading to more tailored strategic insights.",
      "Use Strategic Quick Actions (Accelerator): Click pre-defined buttons in the Accelerator for common strategic queries, such as 'Market Trends Analysis', 'Growth Opportunities', or 'Risk Assessment & Mitigation'.",
      "External Intelligence: The Sales & Strategy Accelerator connects to a dedicated external analysis service for its insights, potentially incorporating broader market data beyond just your branch's immediate traders."
    ]
  },
  {
    category: "External Integrations",
    icon: Home, // Changed from Briefcase
    features: [
      "Access BuildWise Intel Portal: Navigate to the 'BuildWise Intel' tab/button in the main header area to access an embedded version of the external BuildWise Intel application. This portal provides additional specialised data, tools, or insights relevant to the construction and trade industry. Use the interface and scrollbars within the embedded content area to interact with it.",
      "The Branch Booster is also available on the BuildWise Intel page, allowing you to ask questions that combine insights from the external application with your branch's trader data."
    ]
  },
  {
    category: "Reporting & Productivity",
    icon: FileText,
    features: [
      "Download Trader Data (CSV Export): In the 'Trader Overview' section on the Dashboard, click the 'Download CSV' button. This will generate and download a CSV file containing the list of traders currently visible in your table (respecting any active search or category filters).",
      "Access 'How to Use' Guide: For detailed instructions, feature explanations, and troubleshooting, click on 'How to Use' in the left sidebar. This page includes FAQs and step-by-step guides."
    ]
  },
  {
    category: "System & Security",
    icon: ShieldCheck,
    features: [
      "Role-Based Login: The system supports Team logins (e.g., 'PURLEY') and Manager logins (e.g., 'PURLEYMANAGER'). Managers have access to additional tools like the Sales & Strategy Accelerator.",
      "Branch-Specific Data Access: Your Login ID ensures that you can only access and manage trader data associated with your specific branch. Manager logins view the same branch data as their team counterparts, but with added analytical tools.",
      "Secure Data Storage: All trader information is stored in Firebase Firestore, a cloud-hosted database, using security rules to maintain data integrity and isolation between branches.",
      "Secure Portal Access: The TradeHunter Pro portal is delivered over HTTPS, encrypting data transmitted between your browser and the server."
    ]
  }
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
            {navItems.map((item) => {
              const isActive = pathname === item.href;
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

          <Separator className="my-3 bg-sidebar-border group-data-[collapsible=icon]:hidden" />

          <div className="px-3 py-2 group-data-[collapsible=icon]:hidden">
            <h3 className="mb-2 text-sm font-semibold text-sidebar-primary-foreground tracking-wider">
              Functional Capabilities
            </h3>
            <p className="mb-3 text-xs text-sidebar-foreground/80">
              TradeHunter Pro is a precision intelligence system designed to support branch teams in managing trader relationships, optimising sales, and improving operational efficiency.
            </p>
            <Accordion type="multiple" className="w-full">
              {capabilitiesData.map((capability, index) => {
                const IconComponent = capability.icon;
                if (capability.category.includes("Managers Only") && branchInfo?.role !== 'manager') {
                  return null;
                }
                return (
                  <AccordionItem value={`item-${index}`} key={capability.category} className="border-sidebar-border/50">
                    <AccordionTrigger className="py-2 text-sm text-sidebar-foreground hover:no-underline hover:text-sidebar-primary-foreground [&[data-state=open]>svg]:text-sidebar-primary-foreground">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-sidebar-primary" />
                        <span className="font-medium">{capability.category}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3 pl-4 pr-1 text-xs">
                      <ul className="list-disc space-y-1.5 pl-4 text-sidebar-foreground/90">
                        {capability.features.map((feature, fIndex) => (
                          <li key={fIndex}>{feature}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>

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
