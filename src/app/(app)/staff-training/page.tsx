
"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight } from "lucide-react"; 

export default function StaffTrainingPage() {
  const apexSalesTrainerUrl = "https://apex-sales-trainer-302177537641.us-west1.run.app/";

  return (
    <div className="space-y-6">
      <Card className="shadow-lg w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center h-20 w-20 rounded-full border-4 border-primary/20 bg-primary/10 text-primary">
                <GraduationCap className="h-10 w-10" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-primary">Staff Training Centre</CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-2">
                Hone your skills with our interactive sales scenario trainer.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center">
            <p className="mb-6 text-foreground px-4">
              Click the button below to launch the <strong>Apex Sales Trainer</strong>. You can describe any sales situation you want to practise, and the system will create a role-play scenario for you to navigate. It's a great way to build confidence for real-world conversations.
            </p>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href={apexSalesTrainerUrl} target="_blank" rel="noopener noreferrer">
                Launch Apex Sales Trainer <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
