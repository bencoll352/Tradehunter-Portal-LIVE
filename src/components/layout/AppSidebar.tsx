
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
      "Access Trader Database: Retrieve a list of all active trade professionals within a 20-mile radius of a branch, including their specialties (e.g., carpentry, roofing, plumbing), contact details (name, email, phone, address), and sales volume.",
      "Add Trader Records: Enter new trader data via a form on the branch dashboard, including trader ID, name, email, phone, address, and sales volume, linked to the branch’s unique ID.",
      "Update Trader Information: Modify existing trader records (e.g., update contact details or sales volume) using a pre-filled form accessible from the dashboard.",
      "Delete Trader Records: Remove trader records with a confirmation prompt to prevent accidental deletions.",
      "Search and Filter Traders: Filter traders by name, specialty, or sales volume (e.g., “traders with sales > £10,000”) using a search bar on the dashboard.",
      "View Trader Data in Table: Display trader data in a sortable, paginated HTML table (20 records per page) on the branch dashboard, with columns for trader ID, name, email, phone, address, and sales volume.",
      "Upload Customer Data: Upload data for a single trader or multiple traders (e.g., via CSV) to the portal for detailed analysis, such as purchase history or project needs.",
      "Segment Traders by Category: Categorize traders into six types (new customers, high-potential new customers, existing customers needing increased spend, high-value existing customers, lapsed accounts with no spend in 3 months, declined accounts with no spend in 6 months) for targeted interactions."
    ]
  },
  {
    category: "Data Analysis and Insights",
    icon: BarChart3,
    features: [
      "Query Trader Data: Use the Branch Booster to answer questions about branch-specific trader data via a chat interface on the portal. Examples: “What is my total sales volume?”, “Who are my top 5 traders by sales?”, “What is the average transaction value?”, “Which traders haven’t purchased in 3 months?”",
      "Generate Detailed Analysis: Analyze uploaded trader data to provide insights, such as purchase patterns, project types, or potential upsell opportunities.",
      "Provide Real-Time Analytics: Access live performance dashboards showing metrics like total sales, response rates to campaigns, and dormant account reactivation rates.",
      "Estimate Project Materials: Calculate materials needed for construction projects based on project type (e.g., loft conversion, roofing) using the system’s understanding of UK building processes. Example: For a loft conversion, estimate quantities of insulation, damp-proofing, and timber.",
      "Suggest Product Bundles: Recommend complementary products based on trader purchase history or project needs. Example: If a trader buys timber, suggest sustainable aggregates or decking protection.",
      "Track Campaign Performance: Monitor the effectiveness of marketing campaigns (e.g., response rates, conversions) using real-time data from the portal."
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
    category: "Insight & Assistance Features", // Changed from "AI Assistant Capabilities"
    icon: Lightbulb, // Changed from Brain
    features: [
      "Answer Trader-Related Questions: Respond to user queries about trader data, sales, or project needs via the chat interface, using advanced query understanding to interpret intent.", // Rephrased
      "Provide Contextual Responses: Maintain conversation history within a session to offer relevant follow-ups. Example: After “Who are my top traders?”, respond to “What’s their contact info?” with specific details.",
      "Offer Proactive Suggestions: Suggest actions based on trader data, such as re-engaging lapsed accounts or upselling to high-value customers. Example: “John Smith hasn’t ordered in 3 months—offer a 10% discount?”",
      "Handle Objections: Provide relevant responses to common objections or hesitations found in queries (e.g., “That’s expensive”) and suggest solutions like discounts or bulk deals.", // Rephrased
      "Escalate Complex Queries: For queries beyond the dataset (e.g., custom pricing), direct users to human support with a message like, “I’ll connect you with a team member—hang tight.”",
      "Support Staff Training: Provide interactive training modules or Q&A sessions to help staff learn about Jewson's products, services, or the TradeHunter Pro system. Example: Answer questions like, “How do I pitch sustainable aggregates to a customer?”",
      "Customize System Behavior: Adjust the system's tone, response length, or focus (e.g., prioritize upselling or customer retention) via admin settings." // Rephrased
    ]
  },
  {
    category: "Construction Industry Expertise",
    icon: HardHat,
    features: [
      "Understand Building Processes: Leverage knowledge of UK construction practices to provide accurate recommendations for materials and project planning.",
      "Match Products to Trades: Align Jewson's product catalog (timber, insulation, landscaping, roofing, tool hire, sustainable aggregates, composite decking) with specific trade needs (e.g., roofers need slates, carpenters need timber).",
      "Support Project Planning: Assist with estimating material quantities and timelines for projects, improving quote accuracy and customer satisfaction."
    ]
  },
  {
    category: "Security and Compliance",
    icon: ShieldCheck,
    features: [
      "Ensure Data Isolation: Restrict each branch’s access to only their trader data, using branch-specific IDs.",
      "Secure Data Storage: Mock data used in this prototype; production would require secure database and authentication.",
      "Comply with GDPR: Adherence to GDPR requirements for data collection, storage, and deletion is crucial for a production system.",
      "Prevent Unauthorized Access: Secure authentication and authorization mechanisms are essential.",
      "Provide Secure Access: Deliver the portal via HTTPS."
    ]
  },
  {
    category: "Portal and Dashboard Features",
    icon: LayoutGrid,
    features: [
      "Access Admin Dashboard: Admin functionalities are not part of the current branch user prototype but would be needed for system management.",
      "View Branch Dashboard: Provide each branch with a personalized dashboard showing their trader data, campaign tools, and the Branch Booster.",
      "Export Trader Data: Download trader data as a CSV file for offline analysis or reporting (functionality to be implemented).",
      "Monitor Usage Analytics: Track portal usage to provide admins with insights into branch activity (functionality to be implemented).",
      "Access “How to Use” Guide: View a dedicated page with step-by-step instructions for logging in, managing traders, using the Branch Booster, and creating campaigns.",
      "Access Q&A Section: Refer to a Q&A page addressing common questions."
    ]
  },
  {
    category: "Competitive Intelligence",
    icon: Binary,
    features: [
      "Reference Competitor Websites: Functionality for direct competitor website access/database not currently implemented.",
      "Analyze Competitor Strategies: The system may be guided to consider general competitive factors if relevant data is provided." // Rephrased
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
