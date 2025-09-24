
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, Mountain, Compass, Target, Send, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const smartTeamFeatures = [
  {
    title: "Summit Coach",
    subtitle: "Performance Coach",
    description: "'Analyse performance data and provide actionable coaching insights to elevate your team.'",
    icon: Mountain,
    href: "/smart-team/summit-coach",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Sales Navigator",
    subtitle: "Lead Generation Tool",
    description: "'Find and qualify high-quality leads, so you can focus on closing deals.'",
    icon: Compass,
    href: "/smart-team/sales-navigator",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Sales & Strategy Navigator",
    subtitle: "Strategic Analyst",
    description: "'Comprehensive analysis, market intelligence, and strategic planning.'",
    icon: Target,
    href: "/smart-team/sales-strategy-navigator",
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
  },
  {
    title: "Outreach Pro",
    subtitle: "Sales Assistant",
    description: "'Craft compelling outreach messages and manage targeted sales campaigns.'",
    icon: Send,
    href: "/smart-team/outreach-pro",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
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
                Meet your Smart assistants, here to help you succeed.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {smartTeamFeatures.map((feature) => (
          <Link href={feature.href} key={feature.title}>
            <Card className="group shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col border-border/20 hover:border-primary/30 text-center">
              <CardContent className="flex flex-col items-center justify-start pt-6 flex-grow">
                <div className={cn("p-4 rounded-full mb-4", feature.bgColor)}>
                  <feature.icon className={cn("w-12 h-12", feature.color)} />
                </div>
                <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
                 <p className="text-sm font-semibold text-destructive/80 mb-2">{feature.subtitle}</p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 italic flex-grow">
                  {feature.description}
                </p>
                <Button className="w-full mt-auto">
                    Launch Tool
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
