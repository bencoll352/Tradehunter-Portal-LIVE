
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Bot, Database, Calculator, Users, Lightbulb } from "lucide-react"; 

const faqs = [
  {
    value: "item-1",
    question: "What is TradeHunter Pro?",
    answer: "TradeHunter Pro is a sales intelligence platform for builders merchants. It helps you find, track, and manage relationships with trade professionals to grow your business.",
    icon: <HelpCircle className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-2",
    question: "How do I use the Trader Database?",
    answer: "Navigate to the 'Trader Database' page. Here you can view all traders for your branch, search for specific ones, add new traders manually, or perform bulk uploads and deletions using a CSV file. Click on a trader's name to mark them as a 'Hot Lead' for follow-up.",
    icon: <Database className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-3",
    question: "What does Competitor Insights do?",
    answer: "Go to the 'Competitor Insights' page and enter the website URL of a local competitor. The system will analyse their site and provide a strategic report on their offerings, strengths, weaknesses, and actionable counter-strategies for Jewson.",
    icon: <Lightbulb className="h-5 w-5 text-primary mr-2" />
  },
   {
    value: "item-4",
    question: "What is the Materials Estimator?",
    answer: "The 'Estimator' page contains a tool to help you quickly generate quotes for customer projects. This streamlines your quoting process and improves accuracy.",
    icon: <Calculator className="h-5 w-5 text-primary mr-2" />
  },
   {
    value: "item-5",
    question: "What is the Smart Team Hub?",
    answer: "Available to managers, the 'Smart Team' hub provides access to specialised systems that can assist with lead generation, strategic analysis, sales coaching, and crafting outreach messages, further enhancing your branch's capabilities.",
    icon: <Users className="h-5 w-5 text-primary mr-2" />
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
                Your guide to mastering the platform.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-foreground">
            Welcome to TradeHunter Pro! This guide will help you understand the core functionalities
            and make the most out of your sales intelligence.
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
