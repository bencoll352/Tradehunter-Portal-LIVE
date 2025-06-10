
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, ListChecks, BarChart2, Users, Rocket, UploadCloud, Database, Compass, Briefcase, Home, Calculator } from "lucide-react";

const faqs = [
  {
    value: "item-1",
    question: "How do I log in?",
    answer: "Navigate to the login page and enter your unique Login ID. \n" +
            "Team Login Examples: PURLEY, BRANCH_B, BRANCH_C, BRANCH_D, DOVER. \n" +
            "Manager Login Examples: PURLEYMANAGER, BRANCH_BMANAGER, etc. (append 'MANAGER' to your branch's base ID). \n" +
            "After login, you will land on the main Dashboard (Portal Overview).",
    icon: <HelpCircle className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-2",
    question: "How can I view trader data?",
    answer: "Once logged in, navigate to the 'TradeHunter' Hub (accessible via the 'TradeHunter' tab in the header or sidebar). This section will display a table of traders specific to your branch. You can sort columns, search, filter by category, and paginate (50 traders per page). The TradeHunter Hub also shows mini-stats like Live and Recently Active traders.",
    icon: <BarChart2 className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-3",
    question: "How do I add, edit, or delete a trader?",
    answer: "On the 'TradeHunter' Hub, use the 'Add New Trader' button. The form includes comprehensive fields. To edit or delete, use the respective icons in the 'Actions' column of the trader table. The system warns about duplicate phone numbers on manual addition.",
    icon: <Users className="h-5 w-5 text-primary mr-2" />
  },
   {
    value: "item-6",
    question: "How do I bulk upload traders using a CSV file?",
    answer: "Use the 'Bulk Add Traders' button on the 'TradeHunter' Hub. Upload a CSV file with a mandatory 'Name' header. The system uses flexible header matching. Fields with commas must be double-quoted. Duplicates (by phone number) are skipped.",
    icon: <UploadCloud className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-4",
    question: "What is the Branch Booster?",
    answer: "The Branch Booster helps analyse trader and customer data. It's on the 'TradeHunter' Hub page and the 'BuildWise Intel' page. Use Quick Actions, type questions, or upload customer files for insights. It uses your branch's current trader data and any uploaded file.\n" +
            "On the BuildWise Intel page, ask questions bridging Intel portal insights with your trader data.",
    icon: <Rocket className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-7",
    question: "What is the Sales & Strategy Accelerator? (Managers Only)",
    answer: "Manager logins (e.g., PURLEYMANAGER) will find the Sales & Strategy Accelerator on its dedicated 'Sales Accelerator' page (tab in header). This tool connects to an external AI service for in-depth strategic analysis, supporting complex queries, document uploads, and AI-driven recommendations.",
    icon: <Compass className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-8",
    question: "What is the BuildWise Intel page?",
    answer: "The 'BuildWise Intel' page (tab in header) embeds an external application for specialised industry data. The Branch Booster is also on this page for combined analysis.",
    icon: <Home className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-9",
    question: "What is the Materials Estimator page?",
    answer: "The 'Estimator' page (tab in header) embeds an external Building Materials Estimator tool.",
    icon: <Calculator className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-5",
    question: "Is my branch data secure and persistent?",
    answer: "Yes, data is isolated by branch via your Login ID. Manager logins see their team's branch data. Trader data is stored in Firebase Firestore, ensuring persistence.",
    icon: <Database className="h-5 w-5 text-primary mr-2" />
  },
];

export default function HowToUsePage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold text-primary">How to Use TradeHunter Pro</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Your guide to navigating and utilising the portal.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-foreground">
            Welcome to the TradeHunter Pro Portal! This guide will help you understand the core functionalities
            and make the most out of the platform. Below are some frequently asked questions and step-by-step
            instructions.
          </p>

          <Accordion type="single" collapsible className="w-full">
            {faqs.sort((a,b) => parseInt(a.value.split('-')[1]) - parseInt(b.value.split('-')[1])).map((faq) => (
              <AccordionItem value={faq.value} key={faq.value} className="border-b border-border">
                <AccordionTrigger className="text-lg hover:no-underline py-4 text-left">
                  <div className="flex items-center">
                    {faq.icon}
                    {faq.question}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground pb-4 pl-9 whitespace-pre-line">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Step-by-Step Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">1. Logging In</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
              <li>Go to the main page. You will be redirected to the login screen.</li>
              <li>Enter your assigned Login ID.
                <ul className="list-disc list-inside text-muted-foreground space-y-0.5 pl-6 text-sm">
                    <li>Team examples: "PURLEY", "BRANCH_B", "DOVER".</li>
                    <li>Manager examples: "PURLEYMANAGER", "BRANCH_BMANAGER".</li>
                </ul>
              </li>
              <li>Click "Sign In". You will be taken to the main Dashboard (Portal Overview).</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">2. Accessing Main Sections</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
              <li><strong>Dashboard (Overview):</strong> The first page after login. Provides quick links and portal summary. Access via "Dashboard" tab in header/sidebar.</li>
              <li><strong>TradeHunter Hub:</strong> Click the "TradeHunter" tab in header/sidebar to view and manage traders, and use analytical tools.</li>
              <li><strong>BuildWise Intel:</strong> Click the "BuildWise Intel" tab in header to access the external insights portal.</li>
              <li><strong>Estimator:</strong> Click the "Estimator" tab in header to access the external Building Materials Estimator tool.</li>
              <li><strong>How to Use (this page):</strong> Click "How to Use" in the left sidebar for help and FAQs.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">3. Managing Traders (on TradeHunter Hub)</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
              <li><strong>View Traders:</strong> Traders for your branch are listed on the TradeHunter Hub (50 per page). View mini-stats at the top.</li>
              <li><strong>Search & Filter:</strong> Use the search bar and category dropdown.</li>
              <li><strong>Sort:</strong> Click on table headers.</li>
              <li><strong>Add Trader:</strong> Click "Add New Trader", fill the form.</li>
              <li><strong>Bulk Add Traders:</strong> Click "Bulk Add Traders". Upload CSV (must have 'Name' header).</li>
              <li><strong>Edit Trader:</strong> Click the pencil icon.</li>
              <li><strong>Delete Single/Multiple Traders:</strong> Use trash icon or select checkboxes and "Delete (X)" button.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">4. Using the Branch Booster</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
              <li>Located on the <strong>TradeHunter Hub</strong> or at the bottom of the <strong>BuildWise Intel page</strong>.</li>
              <li>Use "Quick Actions", type questions, or upload customer data files.</li>
              <li><strong>On TradeHunter Hub:</strong> Example queries: "List all active traders.", "What is the average sales per trader?".</li>
              <li><strong>On BuildWise Intel Page:</strong> Example queries: "Using BuildWise Intel, suggest cross-selling opportunities for active traders."</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">5. Using the Sales & Strategy Accelerator (Managers Only)</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
              <li>Access via "Sales Accelerator" tab in header (if logged in with Manager ID).</li>
              <li>Use "Strategic Quick Actions", enter complex queries, or upload supplemental data.</li>
            </ul>
          </div>
           <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">6. Accessing & Utilising BuildWise Intel Portal</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
              <li>Click on the "BuildWise Intel" tab in the main header.</li>
              <li>Interact with the embedded external portal.</li>
              <li>Use the Branch Booster below it for combined analysis.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">7. Using the Materials Estimator</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
              <li>Click on the "Estimator" tab in the main header.</li>
              <li>Interact with the embedded external tool.</li>
            </ul>
          </div>
           <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">8. Data Persistence</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
              <li>All trader data is stored securely in Firebase Firestore, specific to your branch.</li>
              <li>Changes are persistent across sessions.</li>
              <li>Initial sample data is seeded if your branch's collection is empty (excluding 'PURLEY').</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
