"use client";

import { Award, Eye, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const features: FeatureCardProps[] = [
  {
    icon: Eye,
    title: "Complete Territory Visibility",
    description: "Gain a comprehensive live dashboard perspective across your entire territory."
  },
  {
    icon: Zap,
    title: "Sales Efficiency",
    description: "Automate repetitive tasks and focus on high-value sales activities."
  },
  {
    icon: TrendingUp,
    title: "Scalable Growth",
    description: "Identify new opportunities and scale your sales outreach effectively."
  },
  {
    icon: Award,
    title: "Competitive Advantage",
    description: "Leverage market intelligence to stay ahead of the competition."
  }
];

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <Card className="shadow-md hover:shadow-lg transition-shadow bg-card/90">
    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
      <div className="bg-primary/10 p-3 rounded-full">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <CardTitle className="text-lg font-semibold text-primary">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);


export function FeatureCards() {
  return (
    <div className="pt-4">
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
            ))}
        </div>
    </div>
  );
}
