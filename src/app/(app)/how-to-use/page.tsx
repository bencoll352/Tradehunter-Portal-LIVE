import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, ListChecks, BarChart2, MessageSquareText, Users } from "lucide-react";

const faqs = [
  {
    value: "item-1",
    question: "How do I log in?",
    answer: "Navigate to the login page and enter your unique Branch ID. Currently, valid demo IDs are BRANCH_A, BRANCH_B, or BRANCH_C.",
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
    value: "item-4",
    question: "What is the Profit Partner AI Agent?",
    answer: "The AI agent helps you analyze trader data. Type your questions (e.g., 'What is the total sales volume?', 'Who are the top traders?') into the query box on the dashboard, and the AI will provide an answer based on the current data for your branch.",
    icon: <MessageSquareText className="h-5 w-5 text-primary mr-2" />
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
              <li>Enter your assigned Branch ID (e.g., "BRANCH_A").</li>
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
              <li><strong>Edit Trader:</strong> Click the pencil icon next to a trader, modify details, and save.</li>
              <li><strong>Delete Trader:</strong> Click the trash icon, confirm, and the trader will be removed.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">3. Using the AI Agent</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
              <li>Locate the "Profit Partner AI" section on the dashboard.</li>
              <li>Type your question about trader performance into the text area.</li>
              <li>Click "Ask AI". The AI's response will appear below.</li>
              <li>Example queries: "List all active traders.", "What is the average sales per trader?".</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
