"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Presentation } from "lucide-react"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StaffTrainingPage() {
  const apexSalesTrainerUrl = "https://aistudio.google.com/u/0/apps/drive/17_f9RP33EDHhr82Qu7HUiHNQswkT_Xw_?showPreview=true&showCode=true&showAssistant=true";
  const trainingPdfUrl = "/resources/The_Power_of_Atomic_Habits.pdf";
  const presentationUrl = "/resources/The_Power_of_Atomic_Habits.pdf";

  return (
    <div className="space-y-8">
      <Card className="shadow-lg w-full">
        <CardHeader>
            <div className="flex items-center gap-3">
              <GraduationCap className="h-10 w-10 text-primary" />
              <div>
                <CardTitle className="text-3xl font-bold text-primary">Staff Training Centre</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                  Hone your skills with our interactive tools and resources.
                </CardDescription>
              </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Interactive Scenario Trainer</CardTitle>
                    <CardDescription>
                        Describe a sales situation you want to practise. The system will create a role-play scenario for you to navigate.
                        <br/>
                        For example, you could practise handling common objections like <code className="font-semibold text-primary">"a customer says our price is too high,"</code> or learning effective responses to specific customer objections. It's a great way to build confidence for real-world conversations.
                    </CardDescription>
                </CardHeader>
                <CardContent>
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

            <Tabs defaultValue="growth-mindset" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="growth-mindset">
                        <BookOpen className="mr-2 h-4 w-4"/>
                        The Growth Mindset PDF
                    </TabsTrigger>
                    <TabsTrigger value="presentation-trainer">
                        <Presentation className="mr-2 h-4 w-4"/>
                        Presentation Trainer
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="growth-mindset" className="mt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>The Growth Mindset: The Power of Atomic Habits</CardTitle>
                            <CardDescription>
                                Review this presentation material to enhance your skills.
                                <strong className="block mt-1">Note:</strong> This document is a key resource for your professional development. 
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full h-[75vh] rounded-md overflow-hidden border border-border bg-muted/20">
                                <iframe
                                    src={trainingPdfUrl}
                                    title="The Growth Mindset Training Program PDF"
                                    className="w-full h-full border-0"
                                    allow="fullscreen"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="presentation-trainer" className="mt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Presentation Trainer: The Power of Atomic Habits</CardTitle>
                            <CardDescription>
                                Review this presentation material to enhance your skills.
                                <strong className="block mt-1">Note:</strong> If the PDF does not load, please ensure the file `The_Power_of_Atomic_Habits.pdf` has been added to the `public/resources` folder in the project directory.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full h-full min-h-[75vh] rounded-md overflow-hidden border border-border bg-muted/20">
                                <iframe
                                    src={presentationUrl}
                                    title="Presentation Trainer: The Power of Atomic Habits"
                                    className="w-full h-full min-h-[75vh] border-0"
                                    allow="fullscreen"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
