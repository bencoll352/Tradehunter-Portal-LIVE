
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Bot, BarChart3, Settings } from "lucide-react"; 

const faqs = [
  {
    value: "item-1",
    question: "What is ScenarioForge?",
    answer: "ScenarioForge is a platform that uses AI to generate customized role-play scenarios for sales training. It helps you practice real-world sales situations to improve your skills and confidence.",
    icon: <HelpCircle className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-2",
    question: "How do I generate a scenario?",
    answer: "Navigate to the 'Generator' page. Input the product you're selling, the customer's industry, and the key challenge or situation you want to practice. The AI will then create a detailed scenario for you.",
    icon: <Bot className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-3",
    question: "What does the Analytics Dashboard show?",
    answer: "The Analytics Dashboard (coming soon) will track your performance and progress across different scenarios. It will provide insights into your strengths and areas for improvement.",
    icon: <BarChart3 className="h-5 w-5 text-primary mr-2" />
  },
   {
    value: "item-4",
    question: "How do I manage my account and subscription?",
    answer: "Go to the 'Settings' page. Here you can manage your subscription details, access any custom scenario packs you've purchased, and update your profile information.",
    icon: <Settings className="h-5 w-5 text-primary mr-2" />
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
              <CardTitle className="text-3xl font-bold text-primary">How to Use ScenarioForge</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Your guide to mastering the platform.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-foreground">
            Welcome to ScenarioForge! This guide will help you understand the core functionalities
            and make the most out of your sales training.
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
