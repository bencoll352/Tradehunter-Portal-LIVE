
"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GraduationCap, Send, User, Loader2, RefreshCw, ArrowRight, Eye, FileText, PlusCircle, BookOpen, Mic, FileImage, FileCode, BrainCircuit, ShieldAlert, File, FileSpreadsheet, ClipboardUser, AlertTriangle, Users } from "lucide-react";
import { getSalesTrainingResponseAction } from './actions';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';


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
        <Card className="shadow-none border-none flex flex-col h-full bg-transparent">
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
                             <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                <div>
                                    <h3 className="font-semibold text-foreground">Current Scenario:</h3>
                                    <p className="text-sm text-muted-foreground italic">"{scenario}"</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleResetScenario} className="shrink-0">
                                    <RefreshCw className="mr-2 h-4 w-4"/>
                                    New Scenario
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="flex-grow h-0 border rounded-lg p-2 sm:p-4" ref={scrollAreaRef}>
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
                                                "max-w-sm md:max-w-md rounded-lg p-3 text-sm",
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
        <div className="p-4 flex justify-center items-center h-full">
             <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center p-6 border-border hover:border-primary/30 h-full max-w-sm mx-auto">
                <div className={cn("flex items-center justify-center h-24 w-24 rounded-full border-4 mb-4", "border-teal-500/50 text-teal-500 bg-teal-500/10")}>
                    <Mic className="h-12 w-12" />
                </div>
                <CardTitle className="text-xl text-primary mb-1">Apex Speech Trainer</CardTitle>
                <div className="flex items-center gap-1.5 mb-2">
                    <p className="text-sm font-semibold text-accent">External Application</p>
                </div>
                <CardDescription className="text-muted-foreground italic mb-6 flex-grow">
                    Launch the full-featured Speech Sales Trainer application in a new window for advanced, voice-based simulations and scenarios.
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


export default function StaffTrainingPage() {
    const discTestUrl = "https://disc-personality-test-302177537641.us-west1.run.app";
    const trainingPortalUrl = "https://sales-training-portal-302177537641.us-west1.run.app/";
    return (
        <div className="space-y-8">
            <Card className="shadow-lg w-full flex flex-col h-full">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                        <div>
                            <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">Sales Training Centre</CardTitle>
                            <CardDescription className="text-base sm:text-lg text-muted-foreground mt-1">
                                Hone your skills with our training tools. Choose your preferred method below.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
                    <Tabs defaultValue="internal-trainer" className="w-full flex-grow flex flex-col">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="internal-trainer">
                                <User className="mr-2 h-4 w-4" /> Role-Play
                            </TabsTrigger>
                            <TabsTrigger value="speech-trainer">
                                <Mic className="mr-2 h-4 w-4" /> Speech
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="internal-trainer" className="flex-grow mt-4">
                            <InternalTrainer />
                        </TabsContent>
                        <TabsContent value="speech-trainer" className="flex-grow mt-4">
                            <SpeechTrainerLink />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="shadow-lg w-full">
                    <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                        <div>
                            <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">Training Material Portal</CardTitle>
                            <CardDescription className="text-base sm:text-lg text-muted-foreground mt-1">
                                Access training documents, playbooks, assessments, and other resources.
                            </CardDescription>
                        </div>
                    </div>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center">
                        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center p-6 border-border hover:border-primary/30 h-full max-w-sm mx-auto">
                            <div className={cn("flex items-center justify-center h-24 w-24 rounded-full border-4 mb-4", "border-blue-500/50 text-blue-500 bg-blue-500/10")}>
                                <BookOpen className="h-12 w-12" />
                            </div>
                            <CardTitle className="text-xl text-primary mb-1">Launch Training Portal</CardTitle>
                            <div className="flex items-center gap-1.5 mb-2">
                                <p className="text-sm font-semibold text-accent">External Application</p>
                            </div>
                            <CardDescription className="text-muted-foreground italic mb-6 flex-grow">
                            Access the central hub for all training documents, sales playbooks, assessments, and other essential resources.
                            </CardDescription>
                            <Button asChild className="w-full mt-auto bg-primary hover:bg-primary/90">
                                <Link href={trainingPortalUrl} target="_blank" rel="noopener noreferrer">
                                    Launch Portal <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </Card>
                    </CardContent>
                </Card>

                <Card className="shadow-lg w-full">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <Users className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                            <div>
                                <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">DISC Personality Test</CardTitle>
                                <CardDescription className="text-base sm-text-lg text-muted-foreground mt-1">
                                Gain insights into communication styles and improve team interactions.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center">
                        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center p-6 border-border hover:border-primary/30 h-full max-w-sm mx-auto">
                            <div className={cn("flex items-center justify-center h-24 w-24 rounded-full border-4 mb-4", "border-indigo-500/50 text-indigo-500 bg-indigo-500/10")}>
                                <Users className="h-12 w-12" />
                            </div>
                            <CardTitle className="text-xl text-primary mb-1">Launch DISC Test</CardTitle>
                            <div className="flex items-center gap-1.5 mb-2">
                                <p className="text-sm font-semibold text-accent">External Application</p>
                            </div>
                            <CardDescription className="text-muted-foreground italic mb-6 flex-grow">
                                Launch the DISC personality assessment tool to understand your sales style and how to better interact with customers and colleagues.
                            </CardDescription>
                            <Button asChild className="w-full mt-auto bg-primary hover:bg-primary/90">
                                <Link href={discTestUrl} target="_blank" rel="noopener noreferrer">
                                    Launch DISC Test <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </Card>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
