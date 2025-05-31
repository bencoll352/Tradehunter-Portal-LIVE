
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, ListChecks, BarChart2, Users, Rocket, UploadCloud } from "lucide-react";

const faqs = [
  {
    value: "item-1",
    question: "How do I log in?",
    answer: "Navigate to the login page and enter your unique Branch ID. Currently, valid demo IDs are PURLEY, BRANCH_B, BRANCH_C, or BRANCH_D.",
    icon: <HelpCircle className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-2",
    question: "How can I view trader data?",
    answer: "Once logged in, the dashboard will display a table of traders specific to your branch. You can sort columns by clicking on their headers and paginate through the data if there are many entries.",
    icon: <BarChart2 className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-3",
    question: "How do I add, edit, or delete a trader?",
    answer: "On the dashboard, use the 'Add New Trader' button. To edit or delete, use the respective icons (pencil for edit, trash can for delete) in the 'Actions' column of the trader table.",
    icon: <Users className="h-5 w-5 text-primary mr-2" />
  },
   {
    value: "item-6",
    question: "How do I bulk upload traders?",
    answer: "Use the 'Bulk Add Traders' button on the dashboard. Upload a CSV file. Each row should represent one trader and contain up to 16 columns in the following order: Name, Total Sales, Status (Active/Inactive), Last Activity (e.g., yyyy-MM-dd or MM/dd/yyyy), Description, Reviews (trades made), Rating (0-5), Website, Phone, Owner Name, Main Category, Categories, Workday Timing, Address, Link (Owner Profile Link), Actions (this column's data will be ignored).",
    icon: <UploadCloud className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-4",
    question: "What is the Branch Booster?",
    answer: "The Branch Booster helps you analyze trader and customer data. Use Quick Actions for common analyses, type your questions (e.g., 'What is the total sales volume?', 'Who are the top traders?') into the query box, or upload a customer data file (e.g., CSV) for deeper insights like upsell opportunities or multi-customer recommendations. The system will provide an answer based on the current data for your branch and any uploaded file.",
    icon: <Rocket className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-5",
    question: "Is my branch data secure?",
    answer: "Yes, the system is designed for data isolation. Each branch can only access its own trader data. Authentication is tied to your Branch ID.",
    icon: <ListChecks className="h-5 w-5 text-primary mr-2" />
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
                Your guide to navigating and utilizing the portal.
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
            {faqs.map((faq) => (
              <AccordionItem value={faq.value} key={faq.value} className="border-b border-border">
                <AccordionTrigger className="text-lg hover:no-underline py-4 text-left">
                  <div className="flex items-center">
                    {faq.icon}
                    {faq.question}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground pb-4 pl-9">
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
              <li>Enter your assigned Branch ID (e.g., "PURLEY").</li>
              <li>Click "Sign In". You will be taken to your branch's dashboard.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">2. Managing Traders</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
              <li><strong>View Traders:</strong> Traders for your branch are listed on the dashboard.</li>
              <li><strong>Search:</strong> Use the search bar to find traders by name.</li>
              <li><strong>Sort:</strong> Click on table headers (Name, Total Sales, etc.) to sort data.</li>
              <li><strong>Add Trader:</strong> Click "Add New Trader", fill the form, and submit.</li>
              <li><strong>Bulk Add Traders:</strong> Click "Bulk Add Traders", upload your CSV file (following the 16 specified headers), and submit.</li>
              <li><strong>Edit Trader:</strong> Click the pencil icon next to a trader, modify details, and save.</li>
              <li><strong>Delete Trader:</strong> Click the trash icon, confirm, and the trader will be removed.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">3. Using the Branch Booster</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
              <li>Locate the "Branch Booster" section on the dashboard.</li>
              <li>Use "Quick Actions" for common pre-defined analyses.</li>
              <li>Type your question about trader performance into the text area.</li>
              <li>Optionally, upload a customer data file (e.g., CSV, TXT) for more detailed analysis.</li>
              <li>Click "Get Insights". The analysis will appear below.</li>
              <li>Example queries: "List all active traders.", "What is the average sales per trader?".</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
