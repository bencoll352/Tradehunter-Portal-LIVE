
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, AlertTriangle } from "lucide-react"; 

export default function StaffTrainingPage() {
  const apexSalesTrainerUrl = "https://apex-sales-trainer-426945894753.us-west1.run.app/";
  // Placeholder URL for the new trainer. Replace with the actual URL when available.
  const salesObjectionsTrainerUrl = "https://apex-sales-trainer-426945894753.us-west1.run.app/";


  return (
    <div className="space-y-6">
      <Card className="shadow-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              <div>
                  <CardTitle className="text-2xl text-primary">Sales Training Centre</CardTitle>
                  <CardDescription>
                      Choose a training module below to practice and improve your sales skills.
                       <span className="block mt-1 text-xs text-muted-foreground italic">
                        <AlertTriangle className="inline-block h-3 w-3 mr-1 text-amber-500" />
                        Note: These are external training tools. Performance and data are managed by the providers.
                      </span>
                  </CardDescription>
              </div>
          </div>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="scenario-trainer" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="scenario-trainer">Interactive Scenario Trainer</TabsTrigger>
                <TabsTrigger value="objections-trainer">Sales Objections Trainer</TabsTrigger>
              </TabsList>
              <TabsContent value="scenario-trainer">
                <div className="mt-4 p-6 border rounded-lg">
                  <p className="mb-6 text-foreground">
                      Describe a sales situation you want to practice, and the interactive system will create a role-play scenario for you to tackle. For example, you could practice handling common objections like <code className="font-semibold text-primary">"a customer says our price is too high"</code> or navigating situations like <code className="font-semibold text-primary">"handling a technical question I don't know the answer to."</code>
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
              </TabsContent>
              <TabsContent value="objections-trainer">
                 <div className="mt-4 p-6 border rounded-lg">
                    <p className="mb-6 text-foreground">
                      This trainer focuses specifically on handling common customer objections. Choose an objection type from within the tool to start a practice session and learn effective responses.
                       <br/><br/>
                       This is a great way to build confidence and prepare for real-world sales conversations.
                    </p>
                    <div className="w-full h-[75vh] rounded-md overflow-hidden border border-border bg-muted/20">
                      <iframe
                        src={salesObjectionsTrainerUrl}
                        title="Sales Objections Trainer"
                        className="w-full h-full border-0"
                        allowFullScreen
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      />
                    </div>
                  </div>
              </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
