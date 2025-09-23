
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, Bot, Search, Users, BarChart2, Lightbulb, FileText, Library } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const smartTeamFeatures = [
  {
    title: "Market Analysis",
    description: "Leverage AI to analyze market trends, identify opportunities, and generate strategic reports for your branch.",
    icon: BarChart2,
    href: "/smart-team/market-analysis",
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/50",
  },
  {
    title: "Competitor Insights",
    description: "Analyze competitor strategies and market positioning to gain a competitive edge.",
    icon: Library, // Using Library icon as Users is already in use
    href: "/smart-team/competitor-insights",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/50",
  },
  {
    title: "Prospecting AI",
    description: "Identify and qualify high-potential leads with an AI-powered prospecting assistant.",
    icon: Search,
    href: "/smart-team/prospecting-ai",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/50",

  },
  {
    title: "Objection Handling Coach",
    description: "Sharpen your skills by practicing with an AI that simulates real-world customer objections.",
    icon: Bot,
    href: "/smart-team/objection-handling",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/50",
  },
  {
    title: "Content Idea Generator",
    description: "Stuck for ideas? Generate engaging content for your blog, social media, or email campaigns.",
    icon: Lightbulb,
    href: "/smart-team/content-generator",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/50",
  },
  {
    title: "Automated Reporting",
    description: "Generate daily, weekly, or monthly performance reports automatically for your branch.",
    icon: FileText,
    href: "/smart-team/automated-reporting",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/50",
  },
];

export default function SmartTeamPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 rounded-full bg-accent/10 border-2 border-accent/30">
              <Users className="h-10 w-10 text-accent" />
            </div>
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">Smart Team Hub</CardTitle>
              <CardDescription className="text-base sm:text-lg text-muted-foreground mt-1">
                Your centralized AI-powered toolkit for sales, marketing, and branch management.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {smartTeamFeatures.map((feature) => (
          <Link href={feature.href} key={feature.title}>
            <Card className="group shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col border-border/20 hover:border-primary/30">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-md", feature.bgColor)}>
                    <feature.icon className={cn("w-6 h-6", feature.color)} />
                  </div>
                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>
                <div className="flex justify-end items-center text-sm font-medium text-primary/80 group-hover:text-primary transition-colors">
                  Explore
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 
