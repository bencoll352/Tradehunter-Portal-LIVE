
"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GraduationCap, Send, User, Loader2, RefreshCw } from "lucide-react";
import { getSalesTrainingResponseAction } from './actions';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Message {
    role: 'user' | 'model';
    content: string;
}

export default function StaffTrainingPage() {
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
        <Card className="shadow-lg w-full max-w-4xl mx-auto flex flex-col h-[85vh]">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <GraduationCap className="h-10 w-10 text-primary" />
                    <div>
                        <CardTitle className="text-3xl font-bold text-primary">Apex Sales Trainer</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground">
                            Practice your sales skills in a real-time role-playing scenario.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
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
