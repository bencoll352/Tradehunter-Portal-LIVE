
"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GraduationCap, Send, User, Loader2, RefreshCw, ArrowRight, TrendingUp, Zap, Mic, BookOpen, FileText, Eye, MoreHorizontal } from "lucide-react";
import { getSalesTrainingResponseAction } from './actions';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface Message {
    role: 'user' | 'model';
    content: string;
}

const apexSalesTrainerUrl = "https://apex-sales-trainer-302177537641.us-west1.run.app/";

function InternalTrainer() {
    const [scenario, setScenario] = useState("");
    const [isScenarioSet, setIsScenarioSet] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo(0, scrollAreaRef.current.scrollHeight);
        }
    }, [messages]);

    const handleStartScenario = () => {
        if (scenario.trim().length < 10) {
            toast({
                variant: 'destructive',
                title: "Scenario Too Short",
                description: "Please provide a more detailed scenario (at least 10 characters).",
            });
            return;
        }
        setIsScenarioSet(true);
        setMessages([]); // Clear previous chat
        toast({
            title: "Scenario Set!",
            description: "The training agent is ready. Type your opening message below.",
        });
    };

    const handleResetScenario = () => {
        setIsScenarioSet(false);
        setScenario("");
        setMessages([]);
        setCurrentMessage("");
    }

    const handleSendMessage = async () => {
        if (currentMessage.trim() === "" || isLoading) return;

        const newUserMessage: Message = { role: 'user', content: currentMessage };
        setMessages(prev => [...prev, newUserMessage]);
        setCurrentMessage("");
        setIsLoading(true);

        try {
            const result = await getSalesTrainingResponseAction({
                scenario,
                history: messages,
                userMessage: currentMessage,
            });

            if (result.response.startsWith("An error occurred")) {
                toast({ variant: "destructive", title: "Agent Error", description: result.response });
            } else {
                const agentResponse: Message = { role: 'model', content: result.response };
                setMessages(prev => [...prev, agentResponse]);
            }
        } catch (error) {
            console.error("Failed to get response from agent:", error);
            toast({
                variant: "destructive",
                title: "Request Failed",
                description: "Could not get a response from the training agent. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card className="shadow-none border-none flex flex-col h-full">
            <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden p-0">
                {!isScenarioSet ? (
                    <div className="space-y-4 p-4 rounded-lg border bg-background animate-in fade-in-50">
                        <h3 className="text-lg font-semibold text-foreground">1. Define the Scenario</h3>
                        <p className="text-sm text-muted-foreground">
                            Describe the customer and the situation. For example: "I am a disgruntled homeowner whose delivery of fence panels was late. I'm calling to complain and I'm thinking of cancelling my whole order."
                        </p>
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="scenario">Sales Scenario</Label>
                            <Textarea
                                id="scenario"
                                placeholder="Describe the customer you want me to play..."
                                value={scenario}
                                onChange={(e) => setScenario(e.target.value)}
                                rows={5}
                            />
                        </div>
                        <Button onClick={handleStartScenario}>Start Training</Button>
                    </div>
                ) : (
                    <div className="flex flex-col h-full overflow-hidden gap-4">
                        <div className="p-4 rounded-lg border bg-muted/50">
                             <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-foreground">Current Scenario:</h3>
                                    <p className="text-sm text-muted-foreground italic">"{scenario}"</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleResetScenario}>
                                    <RefreshCw className="mr-2 h-4 w-4"/>
                                    New Scenario
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="flex-grow h-0 border rounded-lg p-4" ref={scrollAreaRef}>
                            <div className="space-y-4">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "flex items-end gap-2",
                                            message.role === 'user' ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {message.role === 'model' && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback><GraduationCap /></AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div
                                            className={cn(
                                                "max-w-md rounded-lg p-3 text-sm",
                                                message.role === 'user'
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted"
                                            )}
                                        >
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                        {message.role === 'user' && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback><User /></AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex items-end gap-2 justify-start">
                                         <Avatar className="h-8 w-8">
                                            <AvatarFallback><GraduationCap /></AvatarFallback>
                                        </Avatar>
                                        <div className="max-w-md rounded-lg p-3 bg-muted">
                                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        <div className="flex items-center gap-2 pt-2">
                            <Input
                                placeholder="Type your response..."
                                value={currentMessage}
                                onChange={(e) => setCurrentMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                disabled={isLoading}
                            />
                            <Button onClick={handleSendMessage} disabled={isLoading || currentMessage.trim() === ''}>
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Send</span>
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function SpeechTrainerLink() {
    return (
        <div className="p-4">
             <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center p-6 border-border hover:border-primary/30 h-full max-w-sm mx-auto">
                <div className={cn("flex items-center justify-center h-24 w-24 rounded-full border-4 mb-4", "border-teal-500/50 text-teal-500 bg-teal-500/10")}>
                    <Mic className="h-12 w-12" />
                </div>
                <CardTitle className="text-xl text-primary mb-1">Speech Sales Trainer</CardTitle>
                <div className="flex items-center gap-1.5 mb-2">
                    <p className="text-sm font-semibold text-accent">External Application</p>
                </div>
                <CardDescription className="text-muted-foreground italic mb-6 flex-grow">
                    "Launch the full-featured Speech Sales Trainer application in a new window for advanced, voice-based simulations and scenarios."
                </CardDescription>
                <Button asChild className="w-full mt-auto bg-primary hover:bg-primary/90">
                    <Link href={apexSalesTrainerUrl} target="_blank" rel="noopener noreferrer">
                        Launch Trainer <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </Card>
        </div>
    );
}


const trainingMaterials = [
    {
      name: "The Growth Mindset",
      type: "PDF",
      category: "Training Material",
      dateAdded: "September 8, 2025",
      link: "#"
    },
    {
      name: "Persuasion Mastery",
      type: "PDF",
      category: "Sales Playbook",
      dateAdded: "September 8, 2025",
      link: "#"
    }
];

function TrainingMaterialPortal() {
    return (
      <Card className="shadow-lg mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-3">
            <BookOpen className="h-8 w-8" />
            Training Material Portal
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Access training documents, playbooks, and other resources.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[40%]">Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {trainingMaterials.map((material) => (
                    <TableRow key={material.name}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                {material.name}
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">{material.type}</Badge>
                        </TableCell>
                        <TableCell>{material.category}</TableCell>
                        <TableCell>{material.dateAdded}</TableCell>
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={material.link}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                    </Link>
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Download</DropdownMenuItem>
                                        <DropdownMenuItem>Share</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </CardContent>
         <CardFooter className="flex justify-end">
          <Button variant="outline">View All Materials</Button>
        </CardFooter>
      </Card>
    )
}


export default function StaffTrainingPage() {
    return (
        <div className="space-y-8">
            <Card className="shadow-lg w-full flex flex-col h-full">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <GraduationCap className="h-10 w-10 text-primary" />
                        <div>
                            <CardTitle className="text-3xl font-bold text-primary">Sales Training Centre</CardTitle>
                            <CardDescription className="text-lg text-muted-foreground">
                                Hone your skills with our training tools. Choose your preferred method below.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
                    <Tabs defaultValue="internal-trainer" className="w-full flex-grow flex flex-col">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="internal-trainer">Text-Based Trainer</TabsTrigger>
                            <TabsTrigger value="speech-trainer">Speech Sales Trainer</TabsTrigger>
                        </TabsList>
                        <TabsContent value="internal-trainer" className="flex-grow">
                            <InternalTrainer />
                        </TabsContent>
                        <TabsContent value="speech-trainer" className="flex-grow">
                            <SpeechTrainerLink />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <TrainingMaterialPortal />
        </div>
    );
}
