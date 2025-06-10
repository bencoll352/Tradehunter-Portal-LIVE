
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Eye, Briefcase, Calculator, Users, ArrowRight, Columns } from "lucide-react";
import Image from 'next/image';

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg w-full bg-gradient-to-br from-primary/5 via-background to-background border-primary/20">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
              <Columns className="h-12 w-12 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-primary">Welcome to TradeHunter Pro</CardTitle>
              <CardDescription className="text-lg md:text-xl text-muted-foreground mt-1">
                Your central hub for managing traders, accessing market intelligence, and estimating materials.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground mb-6 text-center md:text-left">
            Navigate through the portal using the header tabs, sidebar, or the quick links below to access powerful tools designed to boost your branch's performance.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          title="TradeHunter Hub"
          description="Manage your trader database, track performance, and get AI-powered insights with the Branch Booster. Access detailed trader information, add new traders, and perform bulk actions."
          icon={<Users className="h-8 w-8 text-accent" />}
          link="/tradehunter"
          imageSrc="https://placehold.co/600x400.png"
          imageHint="trader management"
        />
        <FeatureCard
          title="BuildWise Intel"
          description="Access specialised external data and insights from the BuildWise Intel portal. Use the integrated Branch Booster to analyze this information alongside your trader data."
          icon={<Briefcase className="h-8 w-8 text-accent" />}
          link="/buildwise-intel"
          imageSrc="https://placehold.co/600x400.png"
          imageHint="market intelligence"
        />
        <FeatureCard
          title="Materials Estimator"
          description="Utilize the external Building Materials Estimator tool to plan for projects. Estimate quantities for common construction tasks efficiently."
          icon={<Calculator className="h-8 w-8 text-accent" />}
          link="/estimator"
          imageSrc="https://placehold.co/600x400.png"
          imageHint="materials estimation"
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
  imageSrc: string;
  imageHint: string;
}

function FeatureCard({ title, description, icon, link, imageSrc, imageHint }: FeatureCardProps) {
  return (
    <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden border-border hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-3">
          {icon}
          <CardTitle className="text-xl text-primary">{title}</CardTitle>
        </div>
         <Image 
            src={imageSrc} 
            alt={title} 
            width={600} 
            height={400} 
            className="rounded-md aspect-[3/2] object-cover border" 
            data-ai-hint={imageHint}
        />
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
