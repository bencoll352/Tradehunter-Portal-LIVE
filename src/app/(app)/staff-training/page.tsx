
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, AlertTriangle } from "lucide-react"; 

export default function StaffTrainingPage() {
  const apexSalesTrainerUrl = "https://apex-sales-trainer-426945894753.us-west1.run.app/";

  return (
    <div className="space-y-6">
      <Card className="shadow-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              <div>
                  <CardTitle className="text-2xl text-primary">Interactive Sales Trainer</CardTitle>
                  <CardDescription>
                      Practice and improve your sales skills in realistic scenarios.
                       <span className="block mt-1 text-xs text-muted-foreground italic">
                        <AlertTriangle className="inline-block h-3 w-3 mr-1 text-amber-500" />
                        Note: This is an external training tool. Performance and data are managed by the provider.
                      </span>
                  </CardDescription>
              </div>
          </div>
        </CardHeader>
        <CardContent>
            <div className="p-6 border rounded-lg">
              <p className="mb-6 text-foreground">
                  This interactive sales trainer helps you practice and improve your skills. You can describe a sales situation you want to practice, and the system will create a role-play scenario for you.
                  <br/><br/>
                  For example, you could practice handling common objections like <code className="font-semibold text-primary">"a customer says our price is too high,"</code> navigating situations like <code className="font-semibold text-primary">"handling a technical question I don't know the answer to,"</code> or learning effective responses to specific customer objections. It's a great way to build confidence for real-world conversations.
                  <br/><br/>
                  Use the tool below to get started.
              </p>
              <div className="w-full h-[75vh] rounded-md overflow-hidden border border-border bg-muted/20">
                <iframe
                  src={apexSalesTrainerUrl}
                  title="Apex Sales Trainer - Interactive Scenarios"
                  className="w-full h-full border-0"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
