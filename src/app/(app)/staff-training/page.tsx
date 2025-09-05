"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Presentation, ExternalLink } from "lucide-react"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function StaffTrainingPage() {
  const apexSalesTrainerUrl = "https://apex-sales-trainer-302177537641.us-west1.run.app/";

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
                                <p className="mt-2">Review this presentation material on The Growth Mindset to enhance your skills. This document is a key resource for your professional development.</p>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full h-[60vh] rounded-md overflow-hidden border border-border bg-muted/20">
                                <iframe src="https://storage.googleapis.com/project-spark-335215.appspot.com/b0f16428-1bf3-4919-8664-de68f694e02a/q17rfl3mxxb.pdf" className="w-full h-full" title="The Growth Mindset PDF"></iframe>
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
                        </Header>
                        <CardContent>
                           <div className="w-full h-[60vh] rounded-md overflow-hidden border border-border bg-muted/20">
                               <iframe src="https://storage.googleapis.com/project-spark-3B35215.appspot.com/b0f16428-1bf3-4919-8664-de68f694e02a/q17rfl3n2fb.pdf" className="w-full h-full" title="Atomic Habits Presentation"></iframe>
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
