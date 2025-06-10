
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
            "Manager Login Examples: PURLEYMANAGER, BRANCH_BMANAGER, etc. (append 'MANAGER' to your branch's base ID).",
    icon: <HelpCircle className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-2",
    question: "How can I view trader data?",
    answer: "Once logged in, the dashboard (accessible via the 'Dashboard' tab in the header) will display a table of traders specific to your branch. You can sort columns by clicking on their headers, search by keywords, filter by category, and paginate through the data (50 traders per page). The dashboard also shows mini-stats like Live and Recently Active traders.",
    icon: <BarChart2 className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-3",
    question: "How do I add, edit, or delete a trader?",
    answer: "On the dashboard, use the 'Add New Trader' button. The form includes comprehensive fields like name, sales, status, contact info, notes, and call-back dates. To edit or delete, use the respective icons (pencil for edit, trash can for delete) in the 'Actions' column of the trader table. When adding manually, the system will warn you if a trader with the same phone number already exists.",
    icon: <Users className="h-5 w-5 text-primary mr-2" />
  },
   {
    value: "item-6",
    question: "How do I bulk upload traders using a CSV file?",
    answer: "Use the 'Bulk Add Traders' button on the dashboard. Upload a CSV file. The system uses flexible parsing: \n" +
            "• **Headers are Key**: It primarily relies on matching header names (case-insensitive, space-trimmed), though a general column order is good practice (e.g., Name, Total Sales, Status, etc., up to 16 common fields). \n" +
            "• **Mandatory 'Name'**: The 'Name' header and corresponding data for each trader are mandatory. \n" +
            "• **Expected Headers (approximate)**: Name, Total Sales, Status, Last Activity, Description, Reviews, Rating, 🌐Website, 📞 Phone, Owner Name, Main Category, Categories, Workday Timing, Address, Link, Notes, Actions (Actions column data ignored). Some headers have alternative names (e.g., 'Owner Name' or 'Owner'). Refer to the dialogue for specific examples and more details. \n" +
            "• **Quoted Fields**: Fields containing commas (e.g., in Description, Address, Categories) MUST be enclosed in double quotes (e.g., \"Main St, Suite 100\"). \n" +
            "• **Duplicate Handling**: Traders with phone numbers already existing in the database or duplicated within the CSV will be automatically skipped. A summary of additions and skips will be provided.",
    icon: <UploadCloud className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-4",
    question: "What is the Branch Booster?",
    answer: "The Branch Booster helps you analyse trader and customer data. It's located on the Dashboard page and also on the BuildWise Intel page. Use Quick Actions for common analyses, type your questions (e.g., 'What is the total sales volume?', 'Who are the top traders?') into the query box. You can also upload a customer data file (e.g., .txt, .csv) for deeper, context-specific insights like upsell opportunities. The system uses advanced analytical models to provide answers based on the current data for your branch and any uploaded file.\n" +
            "When using it on the BuildWise Intel page, you can ask questions that bridge insights from the Intel portal with your trader data, e.g., 'How can I apply the market trends shown in BuildWise Intel to my top 5 traders?'",
    icon: <Rocket className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-7",
    question: "What is the Sales & Strategy Accelerator? (Managers Only)",
    answer: "If you log in with a Manager ID (e.g., PURLEYMANAGER), you'll see the Sales & Strategy Accelerator below the Branch Booster on the Dashboard page. This tool connects to an external, specialised AI service for more in-depth strategic analysis. You can ask complex questions about market positioning, long-term sales strategies, competitive analysis relative to your branch's data, use strategic quick actions, upload supplemental documents (like market reports), and get AI-driven recommendations for optimising team performance and branch growth.",
    icon: <Compass className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-8",
    question: "What is the BuildWise Intel page?",
    answer: "The 'BuildWise Intel' page, accessible via the 'BuildWise Intel' tab/button in the main header, embeds an external application from BuildWise Intel. This provides access to additional specialised data, tools, or insights relevant to the construction and trade industry. Navigate within the embedded content using its own scrollbars and interface. \n" +
            "The Branch Booster tool is also available at the bottom of this page, allowing you to analyse insights from BuildWise Intel in conjunction with your branch's trader data.",
    icon: <Home className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-9",
    question: "What is the Materials Estimator page?",
    answer: "The 'Estimator' page, accessible via the 'Estimator' tab/button in the main header, embeds an external Building Materials Estimator tool. This tool can help you estimate the quantities of various materials needed for common construction projects. Navigate within the embedded content using its own scrollbars and interface.",
    icon: <Calculator className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-5",
    question: "Is my branch data secure and persistent?",
    answer: "Yes, the system is designed for data isolation. Each branch can only access its own trader data, authenticated by your Login ID. Manager logins see the same underlying branch data as their team. Trader data is persistently stored in Firebase Firestore, ensuring it's saved across sessions and centrally managed for your branch.",
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
              <li>Click "Sign In". You will be taken to your branch's dashboard (main page after login).</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">2. Accessing Main Sections</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
              <li><strong>Dashboard:</strong> Click the "Dashboard" tab in the header to view and manage traders, and use analytical tools.</li>
              <li><strong>BuildWise Intel:</strong> Click the "BuildWise Intel" tab in the header to access the external insights portal and use the integrated Branch Booster.</li>
              <li><strong>Estimator:</strong> Click the "Estimator" tab in the header to access the external Building Materials Estimator tool.</li>
              <li><strong>How to Use (this page):</strong> Click "How to Use" in the left sidebar for help and FAQs.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">3. Managing Traders (on Dashboard)</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
              <li><strong>View Traders:</strong> Traders for your branch are listed on the dashboard (50 per page). View mini-stats at the top for a quick overview.</li>
              <li><strong>Search & Filter:</strong> Use the search bar to find traders by keyword. Use the category dropdown filter for targeted views.</li>
              <li><strong>Sort:</strong> Click on table headers (Name, Total Sales, Call-Back Date, etc.) to sort data.</li>
              <li><strong>Add Trader:</strong> Click "Add New Trader", fill the comprehensive form (including call-back dates), and submit. You'll be warned about duplicate phone numbers.</li>
              <li><strong>Bulk Add Traders:</strong> Click "Bulk Add Traders". Upload your CSV file.
                <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-6 text-sm">
                    <li>Ensure it has a mandatory 'Name' header.</li>
                    <li>The system uses flexible header matching (see dialogue instructions for details and expected headers).</li>
                    <li>Fields with commas (e.g., in addresses or categories) must be double-quoted.</li>
                    <li>Duplicate traders (by phone number, compared to existing data or within the CSV) are automatically skipped.</li>
                </ul>
              </li>
              <li><strong>Edit Trader:</strong> Click the pencil icon next to a trader, modify details in the form, and save.</li>
              <li><strong>Delete Single/Multiple Traders:</strong> For a single trader, click the trash icon. To delete multiple, select their checkboxes, then click the "Delete (X)" button that appears. Confirm deletion.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">4. Using the Branch Booster</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
              <li>Locate the "Branch Booster" section on the <strong>Dashboard page</strong> or at the bottom of the <strong>BuildWise Intel page</strong>.</li>
              <li>Use "Quick Actions" for common pre-defined analyses.</li>
              <li>Type your question about trader performance or market insights into the text area.</li>
              <li>Optionally, upload a customer data file (e.g., .csv, .txt) for more detailed, context-aware analysis.</li>
              <li>Click "Get Insights". The analysis will appear below.</li>
              <li><strong>On Dashboard:</strong> Example queries: "List all active traders.", "What is the average sales per trader?".</li>
              <li><strong>On BuildWise Intel Page:</strong> Example queries: "Using the information from BuildWise Intel, suggest 3 cross-selling opportunities for my current active traders.", "Which of my traders are best suited to supply materials for projects trending in the BuildWise Intel data?"</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">5. Using the Sales & Strategy Accelerator (Managers Only, on Dashboard)</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
              <li>If logged in with a Manager ID (e.g., "PURLEYMANAGER"), this agent appears below the Branch Booster on the dashboard.</li>
              <li>Use "Strategic Quick Actions" for pre-defined high-level analyses.</li>
              <li>Enter complex strategic queries related to market trends, sales team optimisation, competitive positioning, or long-term growth strategies for your branch.</li>
              <li>Optionally, upload supplemental data (like market reports or competitor info) to enhance the analysis.</li>
              <li>Click "Get Strategic Insights". The response from the specialised external analysis service will appear below.</li>
            </ul>
          </div>
           <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">6. Accessing & Utilising BuildWise Intel Portal</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
              <li>Click on the "BuildWise Intel" tab/button in the main header at the top of the page.</li>
              <li>The page will load an embedded version of the external BuildWise Intel application.</li>
              <li>Use the interface and scrollbars provided within the embedded content area to interact with the BuildWise Intel portal.</li>
              <li>Below the embedded portal, you will find the <strong>Branch Booster</strong>. Use this to ask questions that bridge information from BuildWise Intel with your branch's trader data. For example, you can view trends in BuildWise Intel and then ask the Branch Booster how these trends might affect your specific traders or identify opportunities.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">7. Using the Materials Estimator</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
              <li>Click on the "Estimator" tab/button in the main header at the top of the page.</li>
              <li>The page will load an embedded version of the external Building Materials Estimator tool.</li>
              <li>Use the interface provided within the embedded content area to estimate materials for your projects.</li>
            </ul>
          </div>
           <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">8. Data Persistence</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
              <li>All your trader data is stored securely in Firebase Firestore and is specific to your branch's base ID.</li>
              <li>Changes you make (add, edit, delete) are persistent and will be available across your sessions.</li>
              <li>If your branch's trader data is empty in Firestore (and it's not 'PURLEY'), it will be automatically seeded with initial sample data on first load.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
