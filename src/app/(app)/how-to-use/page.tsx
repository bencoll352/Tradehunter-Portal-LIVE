
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Sparkles, Database, Calculator, Users, Lightbulb, LayoutDashboard, GraduationCap } from "lucide-react"; 

const faqs = [
  {
    value: "item-1",
    question: "Dashboard: Your Command Centre",
    answer: `The Dashboard provides a real-time, high-level overview of your branch's performance and daily activities.

**Key Features & Benefits:**
- **At-a-Glance Stats:** Instantly see your count of Active Traders, Hot Leads, and New Leads.
- **Performance Charts:** Visualize the health of your sales funnel with an easy-to-read chart of your trader pipeline.
- **Goal Setting:** Define and track weekly and monthly goals for new leads and active traders to keep your team focused on key objectives.
- **Task Management:** Create, assign, and manage tasks linked directly to specific traders, ensuring accountability and timely follow-ups.
- **Calendar Integration:** View all scheduled tasks and deadlines in an integrated calendar to better plan your day and week.`,
    icon: <LayoutDashboard className="h-5 w-5 text-primary mr-2" />,
    defaultOpen: true,
  },
  {
    value: "item-2",
    question: "Trader Database: Your Central CRM",
    answer: `The Trader Database is the core of TradeHunter Pro, acting as your central Customer Relationship Management (CRM) system. It's where you manage all information about your trade customers.

**Key Features & Benefits:**
- **Centralized Information:** View, search, and filter all traders in one place. Key data like status, last activity, contact info, and financial estimates are clearly visible.
- **Efficient Data Entry:** Add new traders manually with a simple form or upload hundreds at once using the Bulk Add CSV feature.
- **Bulk Financial Updates:** Quickly update financial data (like revenue and employee count) for multiple traders at once by uploading a CSV file, saving hours of manual entry.
- **Actionable Insights:** Mark traders as 'Hot Leads' ('Call-Back' status) to prioritize follow-ups. Use filters to segment your customers by category for targeted campaigns.
- **Organized Record-Keeping:** Edit trader details, add notes, and assign call-back dates to maintain a complete and accurate history of your customer interactions.`,
    icon: <Database className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-3",
    question: "Estimator: Streamline Your Quoting",
    answer: `The Materials Estimator is a powerful, integrated tool designed to help your team generate fast and accurate project quotes for trade customers.

**Key Features & Benefits:**
- **Save Time:** Drastically reduce the time it takes to calculate materials for common projects like decking, fencing, and flooring.
- **Improve Accuracy:** Eliminate costly calculation errors by using a standardized tool, ensuring quotes are precise and professional.
- **Increase Sales Conversion:** Respond to customer enquiries faster with detailed, accurate quotes, increasing your chances of winning the business.
- **Empower Your Team:** Enable all staff members, regardless of experience, to create complex quotes with confidence.`,
    icon: <Calculator className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-4",
    question: "Staff Training: Develop Your Team's Skills",
    answer: `The Staff Training Centre provides a suite of tools to help your team hone their sales skills and product knowledge.

**Key Features & Benefits:**
- **Interactive Role-Play:** Use the built-in AI to simulate customer interactions and practice handling various sales scenarios, from dealing with complaints to upselling products.
- **Speech Trainer:** Access an external, voice-based sales trainer for advanced, hands-on practice with realistic scenarios.
- **DISC Personality Assessment:** Help team members understand their own communication style and learn how to adapt their approach for different customer personalities, improving rapport and effectiveness.
- **Centralized Resources:** Launch the Training Material Portal to access key documents, sales playbooks, and assessments.`,
    icon: <GraduationCap className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-5",
    question: "Buildwise-Intel: Access Market Intelligence",
    answer: `The Buildwise-Intel portal is your gateway to specialized, external data on building projects and market trends in your area.

**Key Features & Benefits:**
- **Identify New Leads:** Discover new construction projects and the companies behind them before your competitors do.
- **Strategic Planning:** Use hyper-local data to understand market demand, identify growth opportunities, and make informed decisions about inventory and sales focus.
- **Competitive Edge:** Gain insights into competitor activity and market positioning to better tailor your sales strategy.`,
    icon: <Lightbulb className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-6",
    question: "Smart Team Hub: Your AI-Powered Assistants",
    answer: `The Smart Team Hub provides access to a roster of specialized AI-powered assistants designed to augment your team's capabilities in strategy, lead generation, and outreach.

**Key Features & Benefits:**
- **Sales & Strategy Navigator:** Perform deep market analysis, generate strategic reports, and get data-driven recommendations for growth.
- **Outreach Pro:** Craft highly-effective, personalized sales emails and messages for targeted campaigns.
- **Summit Coach:** Get performance coaching and actionable insights based on your branch's sales data to elevate your team.
- **Sales Navigator:** Identify and qualify high-potential leads from external data sources to fill your pipeline.`,
    icon: <Users className="h-5 w-5 text-primary mr-2" />
  },
];

export default function HowToUsePage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
            <HelpCircle className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">How to Use TradeHunter Pro</CardTitle>
              <CardDescription className="text-base sm:text-lg text-muted-foreground mt-1">
                Your guide to mastering the platform's features and benefits.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-foreground">
            Welcome to TradeHunter Pro! This guide will help you understand the core functionalities
            and make the most out of your sales intelligence platform.
          </p>

          <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
            {faqs.map((faq) => (
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
    </div>
  );
}
