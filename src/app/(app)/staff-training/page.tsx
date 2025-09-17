
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
import { GraduationCap, Send, User, Loader2, RefreshCw, ArrowRight, Eye, FileText, PlusCircle, BookOpen, Mic, FileImage, FileCode, BrainCircuit, ShieldAlert, File, FileSpreadsheet, ClipboardUser, AlertTriangle } from "lucide-react";
import { getSalesTrainingResponseAction } from './actions';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        <div className="prose prose-sm lg:prose-base max-w-none text-foreground p-4">
            <h2 className="text-2xl font-bold text-primary mb-4">The Growth Mindset: A Visual Guide</h2>
            <div className="text-sm space-y-1 mb-6 text-muted-foreground">
                <p><strong>Authors:</strong> Dan Strutzel & Traci Shoblom</p>
                <p><strong>Focus:</strong> Shifting from a fixed to a growth-oriented perspective to unlock potential.</p>
            </div>

            <div className="p-4 border-l-4 border-primary bg-muted/50 rounded-r-lg mb-8">
                <h3 className="text-lg font-semibold mt-0">Executive Summary</h3>
                <p className="mt-2">
                    This guide contrasts the "Fixed Mindset" with the "Growth Mindset." A fixed mindset assumes abilities are static, leading to avoidance of challenges. A growth mindset sees abilities as developable through dedication, leading to resilience, a love of learning, and higher achievement. Adopting a growth mindset is critical for success in sales and personal development.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fixed Mindset Column */}
                <div className="border border-red-500/30 rounded-lg p-4 bg-red-500/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-shrink-0 bg-red-100 dark:bg-red-900/50 p-2 rounded-full">
                            <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-red-700 dark:text-red-400">Fixed Mindset</h3>
                    </div>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2"><strong>Avoids:</strong> Challenges, for fear of failure.</li>
                        <li className="flex items-start gap-2"><strong>Reacts:</strong> Gives up easily when faced with obstacles.</li>
                        <li className="flex items-start gap-2"><strong>Views Effort:</strong> As fruitless or a sign of weakness.</li>
                        <li className="flex items-start gap-2"><strong>Handles Criticism:</strong> Ignores or is defensive about feedback.</li>
                        <li className="flex items-start gap-2"><strong>Sees Others' Success:</strong> As a threat or intimidating.</li>
                    </ul>
                </div>

                {/* Growth Mindset Column */}
                <div className="border border-green-500/30 rounded-lg p-4 bg-green-500/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                            <BrainCircuit className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-green-700 dark:text-green-400">Growth Mindset</h3>
                    </div>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2"><strong>Embraces:</strong> Challenges as opportunities to grow.</li>
                        <li className="flex items-start gap-2"><strong>Persists:</strong> Views setbacks as part of the learning process.</li>
                        <li className="flex items-start gap-2"><strong>Views Effort:</strong> As the direct path to mastery.</li>
                        <li className="flex items-start gap-2"><strong>Handles Criticism:</strong> Learns from it and seeks feedback.</li>
                        <li className="flex items-start gap-2"><strong>Finds Inspiration:</strong> In the success of others.</li>
                    </ul>
                </div>
            </div>
        </div>
      )
    },
    {
      id: "persuasion-mastery",
      title: "Persuasion Mastery Programme",
      description: "A 10-week comprehensive training programme in psychological influence tailored for UK sales contexts.",
      type: "PDF",
      category: "Sales Playbook",
      tags: "persuasion, sales, techniques, Cialdini",
      dateAdded: "September 8, 2025",
      content: (
        <div className="prose prose-sm lg:prose-base max-w-none text-foreground p-4">
           <h2 className="text-2xl font-bold text-primary mb-4">Persuasion Mastery: Core Principles</h2>
            <div className="p-4 border-l-4 border-primary bg-muted/50 rounded-r-lg mb-8">
                <p className="mt-0 text-lg">
                    Based on Dr. Robert Cialdini's groundbreaking work, these six principles are the pillars of ethical and effective influence. Mastering them is key to excelling in sales.
                </p>
            </div>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-accent">1. Reciprocation</h3>
                    <p className="mt-1 text-muted-foreground">People feel obligated to give back to others who have given to them first. In sales, this means providing genuine value upfront (e.g., helpful advice, a small sample, useful market insight) before asking for anything in return.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-accent">2. Commitment & Consistency</h3>
                    <p className="mt-1 text-muted-foreground">People want to be consistent with what they have previously said or done. Start with small, easy commitments (e.g., agreeing to a short meeting, answering a simple question) and build from there. This makes it easier for them to say "yes" to larger requests later.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-accent">3. Social Proof</h3>
                    <p className="mt-1 text-muted-foreground">When people are uncertain, they look to the actions and behaviours of others to determine their own. Use testimonials, case studies, and mention popular products ("our best-selling cladding") to show that others are making similar choices.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-accent">4. Liking</h3>
                    <p className="mt-1 text-muted-foreground">People are more likely to be persuaded by those they like. Build genuine rapport by findin_g common ground, offering sincere compliments, and demonstrating that you are working together towards a common goal.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-accent">5. Authority</h3>
                    <p className="mt-1 text-muted-foreground">People tend to obey authority figures. Establish your credibility by highlighting your expertise, experience, and knowledge of the industry and products. Dress professionally and speak confidently.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-accent">6. Scarcity</h3>
                    <p className="mt-1 text-muted-foreground">People desire more of those things they can have less of. Use this ethically by highlighting genuine limited-time offers, exclusive products, or potential stock shortages. For example, "This is the last batch we'll have at this price."</p>
                </div>
            </div>
        </div>
      )
    }
];

const contentFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().optional(),
  category: z.string().min(3, { message: "Category is required." }),
  tags: z.string().optional(),
  files: z.any().optional(),
});
type ContentFormValues = z.infer<typeof contentFormSchema>;


function AddContentDialog({ onAddContent }: { onAddContent: (values: TrainingMaterial) => void }) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const form = useForm<ContentFormValues>({
        resolver: zodResolver(contentFormSchema),
        defaultValues: { title: "", description: "", category: "Sales Playbook", tags: "" },
    });
    const fileRef = form.register("files");

    const onSubmit = (values: ContentFormValues) => {
        const file = values.files?.[0];
        if (!file) {
            toast({
                variant: 'destructive',
                title: "File Required",
                description: "Please select a file to upload.",
            });
            return;
        }

        const newMaterial: TrainingMaterial = {
            id: `material_${Date.now()}_${file.name}`,
            title: values.title || file.name,
            description: values.description,
            category: values.category,
            tags: values.tags,
            file: file,
            type: file.type.split('/')[1]?.toUpperCase() || 'File',
            dateAdded: format(new Date(), "MMMM d, yyyy"),
        };
        
        onAddContent(newMaterial);

        toast({
            title: "Content Added",
            description: `${newMaterial.title} has been added to the portal.`,
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
                        Add a new file to your content library.
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
                                        <SelectItem value="Assessments">Assessments</SelectItem>
                                        <SelectItem value="Product Guide">Product Guide</SelectItem>
                                        <SelectItem value="Image">Image</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
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
                            name="files"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>File</FormLabel>
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

    const MaterialContent = () => {
        const [fileUrl, setFileUrl] = useState<string | null>(null);

        useEffect(() => {
            let objectUrl: string | null = null;
            if (material.file) {
                objectUrl = URL.createObjectURL(material.file);
                setFileUrl(objectUrl);
            }

            return () => {
                if (objectUrl) {
                    URL.revokeObjectURL(objectUrl);
                }
            };
        }, [material.file]);

        if (material.content) {
            return <ScrollArea className="h-full"><div className="p-2">{material.content}</div></ScrollArea>;
        }

        if (fileUrl) {
            const isPdf = material.type.toLowerCase().includes('pdf') || material.file?.type === 'application/pdf';
            const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].some(ext => material.type.toLowerCase().includes(ext) || material.file?.type.includes(ext));

            if (isPdf) {
                return <iframe src={fileUrl} className="w-full h-full border-0" title={material.title}></iframe>;
            }
            if (isImage) {
                return <img src={fileUrl} alt={material.title} className="max-w-full h-auto mx-auto object-contain p-4" />;
            }
            return (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
                    <p className="font-semibold">Cannot preview this file type.</p>
                    <p className="text-sm mt-1">File: {material.title}</p>
                    <p className="text-sm">Type: {material.type}</p>
                    <Button asChild variant="link" className="mt-4">
                        <a href={fileUrl} download={material.title}>Download File</a>
                    </Button>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center h-full text-muted-foreground p-6">
                 {material.file ? <Loader2 className="h-6 w-6 animate-spin" /> : <p>No viewable content available for this item.</p>}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-4 sm:p-6 pb-2 border-b shrink-0">
                    <DialogTitle>{material.title}</DialogTitle>
                    {material.description && <DialogDescription>{material.description}</DialogDescription>}
                </DialogHeader>
                <div className="flex-grow overflow-auto">
                   {open && <MaterialContent />}
                </div>
                <DialogFooter className="p-4 border-t bg-background shrink-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function getFileIcon(type: string): React.ElementType {
    const fileType = type.toLowerCase();
    if (fileType.includes('pdf')) return FileCode;
    if (['png', 'jpg', 'jpeg', 'gif', 'svg'].some(ext => fileType.includes(ext))) return FileImage;
    if (['doc', 'docx'].some(ext => fileType.includes(ext))) return File;
    if (['xls', 'xlsx'].some(ext => fileType.includes(ext))) return FileSpreadsheet;
    return FileText;
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

    const groupedMaterials = useMemo(() => {
        return materials.reduce((acc, material) => {
            const category = material.category || 'Other';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(material);
            return acc;
        }, {} as Record<string, TrainingMaterial[]>);
    }, [materials]);

    const sortedCategories = Object.keys(groupedMaterials).sort((a, b) => {
        // Custom sort order
        const order = ['Assessments', 'Sales Playbook', 'Mindset'];
        const indexA = order.indexOf(a);
        const indexB = order.indexOf(b);
        if (indexA > -1 && indexB > -1) return indexA - indexB;
        if (indexA > -1) return -1;
        if (indexB > -1) return 1;
        return a.localeCompare(b);
    });
    
    return (
      <>
        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-3">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8" />
                Training Material Portal
            </CardTitle>
            <CardDescription className="text-base sm:text-lg text-muted-foreground">
                Access training documents, playbooks, assessments, and other resources.
            </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                 <div className="space-y-6">
                    {sortedCategories.map(category => (
                        <div key={category}>
                            <h3 className="text-lg font-semibold mb-2 text-primary/90 border-b pb-1">{category}</h3>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40%]">Name</TableHead>
                                        <TableHead className="hidden sm:table-cell">Type</TableHead>
                                        <TableHead className="hidden md:table-cell w-[30%]">Description</TableHead>
                                        <TableHead className="hidden md:table-cell">Date Added</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {groupedMaterials[category].map((material) => {
                                        const Icon = getFileIcon(material.type);
                                        return (
                                            <TableRow key={material.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                                        <span className="truncate">{material.title}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Badge variant="outline">{material.type}</Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell truncate max-w-xs">{material.description}</TableCell>
                                                <TableCell className="hidden md:table-cell">{material.dateAdded}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" onClick={() => handleViewMaterial(material)}>
                                                        <Eye className="mr-0 sm:mr-2 h-4 w-4" />
                                                        <span className="hidden sm:inline">View</span>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
                <AddContentDialog onAddContent={handleAddContent} />
            </CardFooter>
        </Card>
        <ViewMaterialDialog material={selectedMaterial} open={isViewOpen} onOpenChange={setIsViewOpen} />
      </>
    )
}

function DiscTestSection() {
    const discTestUrl = "https://disc-personality-test-302177537641.us-west1.run.app/";
    return (
        <Card className="shadow-lg w-full">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <ClipboardUser className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle className="text-2xl text-primary">DISC Personality Test</CardTitle>
                        <CardDescription>
                            Understand your sales style and how to interact with different customer types.
                             <span className="block mt-1 text-xs text-muted-foreground italic">
                                <AlertTriangle className="inline-block h-3 w-3 mr-1 text-amber-500" />
                                Note: This is an external tool. Data and privacy are managed by the provider.
                            </span>
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="w-full h-[75vh] rounded-md overflow-hidden border border-border bg-muted/20">
                    <iframe
                        src={discTestUrl}
                        title="DISC Personality Test"
                        className="w-full h-full border-0"
                        allowFullScreen
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                </div>
            </CardContent>
        </Card>
    );
}

export default function StaffTrainingPage() {
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
            
            <TrainingMaterialPortal />

            <DiscTestSection />
        </div>
    );
}

    