
"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, Database, Settings } from "lucide-react"; 

export default function DashboardOverviewPage() {
  
  return (
    <div className="space-y-8">
      <Card className="shadow-lg w-full bg-gradient-to-br from-primary/5 via-background to-background border-primary/20">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
              <Bot className="h-12 w-12 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-primary">Welcome to TradeHunter Pro</CardTitle>
              <CardDescription className="text-lg md:text-xl text-muted-foreground mt-1">
                Your command center for trade intelligence and sales growth.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground mb-4 text-center md:text-left">
            Navigate to the Trader Database to manage your customer list, or explore the dashboard to access powerful insights and tools.
          </p>
           <p className="text-lg font-semibold text-accent text-center md:text-left italic px-4 py-2 bg-accent/10 rounded-md border border-accent/30">
            A platform designed to help builders merchants identify, track, and engage with trade professionals.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <FeatureCard
          title="Trader Database"
          description="View, add, and manage your complete list of trade customers. Track their status, activity, and value to your branch."
          icon={<Database className="h-8 w-8 text-accent" />}
          link="/tradehunter"
        />
        <FeatureCard
          title="Competitor Insights"
          description="Analyze competitor websites to understand their strategy and identify opportunities for Jewson to win."
          icon={<Bot className="h-8 w-8 text-accent" />}
          link="/competitor-insights"
        />
        <FeatureCard
          title="Materials Estimator"
          description="Quickly generate accurate material estimates for customer projects to streamline your quoting process."
          icon={<Settings className="h-8 w-8 text-accent" />}
          link="/estimator"
        />
      </div>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

function FeatureCard({ title, description, icon, link }: FeatureCardProps) {
  return (
    <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden border-border hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-3">
          {icon}
          <CardTitle className="text-xl text-primary">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
      </CardContent>
      <CardContent className="pt-0">
         <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={link}>
            Go to {title} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
