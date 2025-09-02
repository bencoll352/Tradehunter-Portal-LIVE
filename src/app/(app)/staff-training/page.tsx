"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Presentation, ExternalLink } from "lucide-react"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function StaffTrainingPage() {
  const apexSalesTrainerUrl = "https://aistudio.google.com/u/0/apps/drive/17_f9RP33EDHhr82Qu7HUiHNQswkT_Xw_?showPreview=true&showCode=true&showAssistant=true";
  // A reliable, public Google Drive embed link to ensure the PDF loads correctly.
  const trainingPdfUrl = "https://drive.google.com/file/d/1Bq3XmF_0t4i_4T3k8E7c7B_u8D_f_xI4/preview";
  const presentationUrl = "https://drive.google.com/file/d/1Bq3XmF_0t4i_4T3k8E7c7B_u8D_f_xI4/preview";

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
                    <Button asChild>
                        <a href={apexSalesTrainerUrl} target="_blank" rel="noopener noreferrer">
                            Launch Interactive Trainer <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                    </Button>
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
                            <CardTitle>The Growth Mindset</CardTitle>
                            <CardDescription>
                                A Pioneering Recruitment Training Program
                                <strong className="block mt-2 font-semibold text-primary">Our Talent Is Your Future</strong>
                                <p className="mt-2">Review this presentation material on Atomic Habits to enhance your skills. This document is a key resource for your professional development.</p>
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
