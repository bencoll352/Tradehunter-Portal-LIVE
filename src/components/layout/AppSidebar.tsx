
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
  BarChart3,
  Megaphone,
  Lightbulb, // Changed from Brain
  HardHat,
  ShieldCheck,
  LayoutGrid,
  Binary,
  Settings2,
  Wrench,
  FileText,
  Database,
  UploadCloud,
  Fingerprint,
  LineChart
} from "lucide-react";
import { Logo } from "@/components/icons/Logo";
import { useEffect, useState } from "react";
import type { BranchId } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", tooltip: "Dashboard" },
  { href: "/how-to-use", icon: HelpCircle, label: "How to Use", tooltip: "Help & FAQs" },
];

const capabilitiesData = [
  {
    category: "Trader Management",
    icon: Users,
    features: [
      "Access Trader Database: Retrieve a list of all active trade professionals, including their specialties, contact details, and sales volume, linked to the branch’s unique ID.",
      "Add Trader Records: Enter new trader data via a form on the branch dashboard.",
      "Update Trader Information: Modify existing trader records using a pre-filled form.",
      "Delete Trader Records: Remove trader records with a confirmation prompt.",
      "Persistent Data Storage: Trader data is securely stored in Firebase Firestore, ensuring data is saved per branch and persists across sessions. Includes automatic data seeding if a branch's collection is initially empty.",
      "Bulk Add Traders: Upload trader data in bulk via CSV files, with robust parsing for various formats (header-based matching, flexible column order, quoted field handling) and duplicate detection.",
      "Duplicate Trader Prevention: System checks for duplicate traders by phone number during manual addition and bulk CSV uploads, preventing redundant entries with appropriate user feedback.",
      "Search and Filter Traders: Filter traders by name, specialty, or sales volume using a search bar and category filters on the dashboard.",
      "Segment Traders by Category: Categorize traders into six types (new customers, high-potential new customers, existing customers needing increased spend, high-value existing customers, lapsed accounts with no spend in 3 months, declined accounts with no spend in 6 months) for targeted interactions (primarily via Branch Booster queries)."
    ]
  },
  {
    category: "Data Analysis and Insights",
    icon: BarChart3, // Consider LineChart or similar if more fitting for "Insights"
    features: [
      "Branch Booster Queries: Use the Branch Booster (powered by Genkit and Google Gemini API) to answer questions about branch-specific trader data via a chat interface. Examples: “What is my total sales volume?”, “Who are my top 5 traders by sales?”",
      "Analyze Uploaded Contextual Data: Upload supplementary customer data files (e.g., .txt, .csv) to the Branch Booster for deeper, context-aware analysis alongside existing trader data (e.g., identifying upsell opportunities based on customer purchase history).",
      "Provide Real-Time Analytics: Access live performance dashboards showing metrics like total sales, response rates to campaigns, and dormant account reactivation rates (some metrics available via Mini Dashboard).",
      "Estimate Project Materials: Calculate materials needed for construction projects based on project type using the system’s understanding of UK building processes.",
      "Suggest Product Bundles: Recommend complementary products based on trader purchase history or project needs.",
      "Track Campaign Performance: Monitor the effectiveness of marketing campaigns (e.g., response rates, conversions) using real-time data from the portal (requires campaign feature implementation)."
    ]
  },
  {
    category: "Campaign Creation and Management",
    icon: Megaphone,
    features: [
      "Create Targeted Campaigns: Design trade-specific marketing campaigns using live trader data from the portal, targeting specific trader types or specialties (e.g., timber promotion for carpenters).",
      "Customize Campaign Content: Adjust campaign messages, offers, or delivery methods (e.g., email, SMS) based on trader profiles and preferences.",
      "Schedule Campaigns: Set up campaigns to run at specific times or intervals, ensuring timely outreach to traders.",
      "Track Campaign Responses: Record responses to campaigns (e.g., clicks, replies, purchases) to evaluate effectiveness and refine future efforts.",
      "Reactivate Dormant Accounts: Identify and target lapsed (no spend in 3 months) or declined (no spend in 6 months) accounts with tailored campaigns, such as discount offers or re-engagement messages."
    ]
  },
  {
    category: "Insight & Assistance Features",
    icon: Lightbulb,
    features: [
      "Answer Trader-Related Questions: Respond to user queries about trader data, sales, or project needs via the Branch Booster, using advanced query understanding.",
      "Provide Contextual Responses: Maintain conversation history within a Branch Booster session to offer relevant follow-ups.",
      "Offer Proactive Suggestions: Suggest actions based on trader data via Branch Booster queries.",
      "Handle Objections: Provide relevant responses to common objections or hesitations found in queries and suggest solutions like discounts or bulk deals.",
      "Escalate Complex Queries: For queries beyond the dataset, direct users to human support.",
      "Support Staff Training: Provide interactive training modules or Q&A sessions to help staff learn about products, services, or the system.",
      "Customize System Behavior: Adjust the system's tone, response length, or focus via admin settings (future capability)."
    ]
  },
  {
    category: "Construction Industry Expertise",
    icon: HardHat,
    features: [
      "Understand Building Processes: Leverage knowledge of UK construction practices to provide accurate recommendations for materials and project planning.",
      "Match Products to Trades: Align product catalog with specific trade needs.",
      "Support Project Planning: Assist with estimating material quantities and timelines."
    ]
  },
  {
    category: "Security and Compliance",
    icon: ShieldCheck,
    features: [
      "Ensure Data Isolation: Restrict each branch’s access to only their trader data using branch-specific IDs, with data stored in Firebase Firestore.",
      "Secure Data Storage: Data is stored in Firebase Firestore with appropriate security rules (user to configure/verify).",
      "Comply with GDPR: Adherence to GDPR requirements for data collection, storage, and deletion is crucial for a production system.",
      "Prevent Unauthorized Access: Secure authentication and authorization mechanisms via Branch ID login.",
      "Provide Secure Access: Deliver the portal via HTTPS."
    ]
  },
  {
    category: "Portal and Dashboard Features",
    icon: LayoutGrid,
    features: [
      "Access Admin Dashboard: Admin functionalities are not part of the current branch user prototype.",
      "View Branch Dashboard: Personalized dashboard with trader data, Branch Booster, and key statistics.",
      "Dashboard Statistics: View key metrics at a glance, such as Live Traders Count and Recently Active Traders Count.",
      "View Trader Data in Table: Display trader data in a sortable, paginated HTML table (20 records per page) with comprehensive trader details.",
      "Export Trader Data: Download trader data as a CSV file (functionality to be implemented).",
      "Monitor Usage Analytics: Track portal usage for admins (functionality to be implemented).",
      "Access “How to Use” Guide: View a dedicated page with instructions.",
      "Access Q&A Section: Refer to a Q&A page addressing common questions."
    ]
  },
  {
    category: "Competitive Intelligence",
    icon: Binary,
    features: [
      "Reference Competitor Websites: Functionality for direct competitor website access/database not currently implemented.",
      "Analyze Competitor Strategies: The system may be guided to consider general competitive factors if relevant data is provided."
    ]
  },
  {
    category: "Integration and Customization",
    icon: Settings2,
    features: [
      "Integrate with Existing Systems: API integrations are not part of the current prototype.",
      "Customize Interface: Limited customization; focus on core functionality.",
      "Support Multi-User Access: Current prototype assumes single branch user session."
    ]
  },
  {
    category: "Operational Support",
    icon: Wrench,
    features: [
      "Provide Implementation Support: Details for a structured onboarding process.",
      "Assign Dedicated Account Manager: Service aspect for user support.",
      "Conduct Team Training: Service aspect for user adoption.",
      "Offer Ongoing Optimization: Service aspect for continuous improvement."
    ]
  },
  {
    category: "Example Use Cases",
    icon: FileText,
    features: [
      "Branch Manager: Uses the portal to identify lapsed traders, launches a re-engagement campaign, and tracks a 15% reactivation rate.",
      "Sales Staff: Queries the Branch Booster for top traders’ contact details, suggests product bundles, and secures a bulk order.",
      "Admin: Creates new branch accounts and monitors usage analytics to ensure adoption.",
      "Trader: Receives a targeted campaign for roofing materials, responds to a quote, and places an order via Click & Collect."
    ]
  }
];


export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile, state: sidebarState } = useSidebar();
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
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2">
          <Logo 
            width={sidebarState === 'collapsed' ? 32 : 180} 
            height={sidebarState === 'collapsed' ? 32 : 47} 
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1">
          <SidebarMenu className="px-3 py-2">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.tooltip}
                    onClick={() => setOpenMobile(false)}
                    className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                  >
                    <div> 
                      <item.icon />
                      <span>{item.label}</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          <Separator className="my-3 bg-sidebar-border group-data-[collapsible=icon]:hidden" />
          
          <div className="px-3 py-2 group-data-[collapsible=icon]:hidden">
            <h3 className="mb-2 text-sm font-semibold text-sidebar-primary-foreground tracking-wider">
              Functional Capabilities
            </h3>
            <p className="mb-3 text-xs text-sidebar-foreground/80">
              TradeHunter Pro is a precision intelligence system designed to support Jewson's branch teams in managing trader relationships, optimizing sales, and improving operational efficiency.
            </p>
            <Accordion type="multiple" className="w-full">
              {capabilitiesData.map((capability, index) => {
                const IconComponent = capability.icon;
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

    