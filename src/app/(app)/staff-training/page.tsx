
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Download, AlertTriangle } from "lucide-react"; 

export default function StaffTrainingPage() {
  const apexSalesTrainerUrl = "https://apex-sales-trainer-426945894753.us-west1.run.app/";

  return (
    <div className="space-y-6">
      <Card className="shadow-lg w-full">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-10 w-10 text-primary" />
              <div>
                <CardTitle className="text-3xl font-bold text-primary">Interactive Sales Trainer</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                  Practise and improve your sales skills in realistic scenarios.
                </CardDescription>
              </div>
            </div>
            <Button asChild>
                <a href="/resources/The_Growth_Mindset_Training_Program.pdf" download>
                    <Download className="mr-2 h-4 w-4" />
                    Download Resources
                </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
              <p className="mb-6 text-foreground">
                  This interactive sales trainer helps you practise and improve your skills. You can describe a sales situation you want to practise, and the system will create a role-play scenario for you.
                  <br/><br/>
                  For example, you could practise handling common objections like <code className="font-semibold text-primary">"a customer says our price is too high,"</code> navigating situations like <code className="font-semibold text-primary">"handling a technical question I don't know the answer to,"</code> or learning effective responses to specific customer objections. It's a great way to build confidence for real-world conversations.
                  <br/><br/>
                  Use the tool below to get started.
              </p>
              <div className="w-full h-[75vh] rounded-md overflow-hidden border border-border bg-muted/20">
                <iframe
                  src={apexSalesTrainerUrl}
                  title="Apex Sales Trainer - Interactive Scenarios"
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
        </CardContent>
      </Card>
    </div>
  );
}
