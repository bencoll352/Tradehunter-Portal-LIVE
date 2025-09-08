
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
import { GraduationCap, Send, User, Loader2, RefreshCw, ArrowRight, TrendingUp, Zap, Mic, BookOpen, FileText, Eye, MoreHorizontal, PlusCircle } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


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

interface TrainingMaterial {
    id: string;
    title: string;
    description?: string;
    type: string;
    category: string;
    tags?: string;
    dateAdded: string;
    link?: string;
    file?: File;
    content?: React.ReactNode;
}

const initialTrainingMaterials: TrainingMaterial[] = [
    {
      id: "growth-mindset",
      title: "The Growth Mindset",
      description: "A PDF document on the importance of a growth mindset in sales.",
      type: "PDF",
      category: "Mindset",
      tags: "growth, mindset, psychology",
      dateAdded: "September 8, 2025",
      content: (
        <div className="prose prose-sm lg:prose-base max-w-none text-foreground">
            <h2 className="text-xl font-bold text-primary">The Growth Mindset: Enhanced Visual Training Summary</h2>
            <div className="text-sm space-y-1 mb-6">
                <p><strong>Authors:</strong> Dan Strutzel & Traci Shoblom</p>
                <p><strong>Focus:</strong> Personal development and mindset transformation</p>
                <p><strong>Intended Audience:</strong> Professionals, students, and individuals seeking personal growth</p>
            </div>

            <div className="p-4 border-l-4 border-primary bg-muted/50 rounded-r-lg">
                <h3 className="text-lg font-semibold mt-0">Executive Overview</h3>
                <p className="mt-2">
                    "The Growth Mindset" is a comprehensive guide that combines psychological principles with practical
                    strategies to help individuals transform their lives through mindset change. The book presents a structured
                    approach using the GROW! system and includes a complete 30-day implementation challenge.
                </p>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-4">Core Concepts & Key Principles</h3>

            <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-center mb-4">1. Growth vs. Fixed Mindset Foundation</h4>
                <div className="flex flex-col md:flex-row justify-around items-start gap-8">
                    {/* Growth Mindset */}
                    <div className="flex-1 text-center">
                        <p className="text-lg font-bold text-green-600 mb-2">Growth Mindset</p>
                        <div className="relative flex justify-center items-center h-24">
                           <div className="absolute h-16 w-16 bg-green-200/50 rounded-full flex items-center justify-center font-bold text-green-800">
                                GROWTH
                           </div>
                           <svg className="absolute top-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M20,90 Q25,50 30,10" stroke="hsl(var(--primary))" fill="none" strokeWidth="2" markerEnd="url(#arrow-up)" />
                                <path d="M50,90 Q50,50 50,10" stroke="hsl(var(--primary))" fill="none" strokeWidth="2" markerEnd="url(#arrow-up)" />
                                <path d="M80,90 Q75,50 70,10" stroke="hsl(var(--primary))" fill="none" strokeWidth="2" markerEnd="url(#arrow-up)" />
                           </svg>
                        </div>
                        <ul className="mt-4 text-left list-disc list-inside space-y-1">
                            <li>Embraces challenges</li>
                            <li>Persists through obstacles</li>
                            <li>Sees effort as path to mastery</li>
                            <li>Learns from criticism</li>
                            <li>Finds inspiration in others</li>
                        </ul>
                    </div>

                    {/* Fixed Mindset */}
                     <div className="flex-1 text-center">
                        <p className="text-lg font-bold text-red-600 mb-2">Fixed Mindset</p>
                        <div className="relative flex flex-col justify-center items-center h-24">
                           <div className="h-16 w-16 bg-red-200/50 rounded-full flex items-center justify-center font-bold text-red-800 mb-1">
                                FIXED
                           </div>
                           <div className="w-24 h-2 bg-red-500 rounded"></div>
                        </div>
                        <ul className="mt-4 text-left list-disc list-inside space-y-1">
                            <li>Avoids challenges</li>
                            <li>Gives up easily</li>
                            <li>Sees effort as sign of weakness</li>
                            <li>Ignores useful criticism</li>
                            <li>Feels threatened by others</li>
                        </ul>
                    </div>
                </div>
            </div>
             <svg width="0" height="0">
              <defs>
                <marker id="arrow-up" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--primary))"></path>
                </marker>
              </defs>
            </svg>
        </div>
      )
    },
    {
      id: "persuasion-mastery",
      title: "Persuasion Mastery",
      description: "A sales playbook covering advanced persuasion techniques.",
      type: "PDF",
      category: "Sales Playbook",
      tags: "persuasion, sales, techniques",
      dateAdded: "September 8, 2025",
      content: (
        <div className="prose prose-sm lg:prose-base max-w-none text-foreground">
           <h2 className="text-xl font-bold text-primary">Persuasion Mastery</h2>
           <p>Content for Persuasion Mastery goes here...</p>
        </div>
      )
    }
];

const contentFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().optional(),
  category: z.string().min(3, { message: "Category is required." }),
  tags: z.string().optional(),
  file: z.any().optional(), // File is optional for now
});
type ContentFormValues = z.infer<typeof contentFormSchema>;


function AddContentDialog({ onAddContent }: { onAddContent: (values: TrainingMaterial) => void }) {
    const [open, setOpen] = useState(false);
    const form = useForm<ContentFormValues>({
        resolver: zodResolver(contentFormSchema),
        defaultValues: { title: "", description: "", category: "Sales Playbook", tags: "" },
    });
    const fileRef = form.register("file");

    const onSubmit = (values: ContentFormValues) => {
        const file = values.file?.[0];
        const newMaterial: TrainingMaterial = {
            id: `material_${Date.now()}`,
            title: values.title,
            description: values.description,
            category: values.category,
            tags: values.tags,
            file: file,
            type: file ? file.type.split('/')[1]?.toUpperCase() || 'File' : 'Document',
            dateAdded: format(new Date(), "MMMM d, yyyy"),
        };
        onAddContent(newMaterial);
        toast({
            title: "Content Added",
            description: `"${newMaterial.title}" has been added to the portal.`,
        });
        setOpen(false);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Content
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Content</DialogTitle>
                    <DialogDescription>
                        Add a new file to your content library. Fill in the details below.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Q3 Sales Playbook" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="A short description of the content." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                               <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Sales Playbook">Sales Playbook</SelectItem>
                                        <SelectItem value="Training Material">Training Material</SelectItem>
                                        <SelectItem value="Mindset">Mindset</SelectItem>
                                        <SelectItem value="Product Guide">Product Guide</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tags</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Add tags, comma separated" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="file"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>File (Optional)</FormLabel>
                                    <FormControl>
                                        <Input type="file" {...fileRef} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit">Publish</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function ViewMaterialDialog({ material, open, onOpenChange }: { material: TrainingMaterial | null, open: boolean, onOpenChange: (open: boolean) => void }) {
    if (!material) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{material.title}</DialogTitle>
                    <DialogDescription>{material.description}</DialogDescription>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto pr-6 -mr-6">
                   {material.content}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function TrainingMaterialPortal() {
    const [materials, setMaterials] = useState<TrainingMaterial[]>(initialTrainingMaterials);
    const [selectedMaterial, setSelectedMaterial] = useState<TrainingMaterial | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const { toast } = useToast();

    const handleAddContent = (newMaterial: TrainingMaterial) => {
        setMaterials(prev => [...prev, newMaterial]);
    };

    const handleViewMaterial = (material: TrainingMaterial) => {
        setSelectedMaterial(material);
        setIsViewOpen(true);
    };

    return (
      <>
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
                    {materials.map((material) => (
                        <TableRow key={material.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    {material.title}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">{material.type}</Badge>
                            </TableCell>
                            <TableCell>{material.category}</TableCell>
                            <TableCell>{material.dateAdded}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" onClick={() => handleViewMaterial(material)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
                <AddContentDialog onAddContent={handleAddContent} />
            </CardFooter>
        </Card>
        <ViewMaterialDialog material={selectedMaterial} open={isViewOpen} onOpenChange={setIsViewOpen} />
      </>
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
