
"use client"; // Ensure client component directive

import { useState, useRef, useEffect } from "react"; // React hooks
import { z } from "zod"; // Zod for schema validation
import { useForm } from "react-hook-form"; // React Hook Form
import { zodResolver } from "@hookform/resolvers/zod"; // Zod resolver for RHF
import { Button } from "@/components/ui/button"; // ShadCN Button
import { Textarea } from "@/components/ui/textarea"; // ShadCN Textarea
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // ShadCN Card components
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"; // ShadCN Form components
import { Input } from "@/components/ui/input"; // ShadCN Input
import { Loader2, Rocket, Sparkles, Paperclip, XCircle, Lightbulb, PackageSearch, Users, BarChart, TrendingUp, type LucideIcon, ShieldCheck, FileJson, Server } from "lucide-react"; // Lucide icons
import { profitPartnerQuery, type ProfitPartnerQueryInput } from "@/ai/flows/profit-partner-query"; // Genkit flow
import type { Trader, BranchInfo, BranchLoginId } from "@/types"; // Trader type
import { getBranchInfo } from "@/types";
import { formatTraderDataForAnalysis } from "@/lib/utils"; // Utility function
import { ScrollArea } from "@/components/ui/scroll-area"; // ShadCN ScrollArea
import { useToast } from "@/hooks/use-toast"; // Toast hook

// Schema for the agent form
const agentFormSchema = z.object({
  query: z.string().min(5, { message: "Query must be at least 5 characters." }),
});

// Interface for QuickAction items
interface QuickAction {
  label: string;
  query: string;
  icon: LucideIcon;
}

// Array of predefined quick actions
const quickActions: QuickAction[] = [
  { label: "New Customers", query: "Using the getTraderDataByBranch tool, identify new customers and provide a brief summary.", icon: Users },
  { label: "High Potential New Customers", query: "Using the getTraderDataByBranch tool, which new customers show the highest potential? Provide reasons.", icon: TrendingUp },
  { label: "Boost Existing Customer Spend", query: "Using the getTraderDataByBranch tool, suggest strategies to boost spending from existing customers.", icon: BarChart },
  { label: "High Value Existing Customers", query: "Using the getTraderDataByBranch tool, list high-value existing customers and any recent changes in their activity.", icon: Sparkles },
  { label: "Lapsed Accounts (3+ Months)", query: "Using the getTraderDataByBranch tool, identify accounts that have been inactive for 3 or more months and suggest re-engagement actions.", icon: Lightbulb },
  {
    label: "Live Data vs. Summary",
    query: `What is the difference between the summary 'traderData' and the data from the 'getTraderDataByBranch' tool?`,
    icon: FileJson
  },
  {
    label: "List All Traders (Live)",
    query: `Please use the getTraderDataByBranch tool for my branch to get the full, live list of all traders and then display their names.`,
    icon: Server
  },
  {
    label: "Estimate Project Materials",
    query: "Help me estimate the materials needed for a construction project (e.g., a small extension, a garden wall). Please ask for the project type and necessary details (like dimensions) if not provided, and list typical materials and quantities.",
    icon: PackageSearch
  }
];

// Props interface for the component
interface ProfitPartnerAgentClientProps {
  traders: Trader[];
}

// The main client component
export function ProfitPartnerAgentClient({ traders }: ProfitPartnerAgentClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResponse, setAnalysisResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLoggedInId = localStorage.getItem('loggedInId') as BranchLoginId | null;
      setBranchInfo(getBranchInfo(storedLoggedInId));
    }
  }, []);

  const form = useForm<z.infer<typeof agentFormSchema>>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: { query: "" },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("text/") || file.name.endsWith(".csv") || file.name.endsWith(".tsv")) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setFileContent(e.target?.result as string);
        };
        reader.readAsText(file);
         toast({ title: "File Selected", description: `${file.name} is ready for analysis.` });
      } else {
        toast({ variant: "destructive", title: "Invalid File Type", description: "Please upload a text-based file (e.g., .txt, .csv)." });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setSelectedFile(null);
        setFileContent(null);
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFileContent(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast({ title: "File Cleared", description: "Uploaded file has been removed." });
  };

  const handleQuickAction = (query: string) => {
    form.setValue("query", query);
  };

  const onSubmit = async (values: z.infer<typeof agentFormSchema>) => {
    if (!branchInfo?.baseBranchId) {
      toast({ variant: "destructive", title: "Branch Not Identified", description: "Could not identify the current branch. Please try logging in again." });
      return;
    }

    setIsLoading(true);
    setAnalysisResponse(null);
    setError(null);

    const traderDataString = formatTraderDataForAnalysis(traders);

    const input: ProfitPartnerQueryInput = {
      query: values.query,
      traderData: traderDataString,
      branchId: branchInfo.baseBranchId,
      ...(fileContent && { uploadedFileContent: fileContent }),
    };

    try {
      const result = await profitPartnerQuery(input);
      setAnalysisResponse(result.answer);
      if (selectedFile) {
        clearFile();
      }
    } catch (e) {
      console.error("Analysis Error:", e);
      let errorMessage = "Sorry, I couldn't process that request. Please try again or check the external service.";
      if (e instanceof Error) {
        errorMessage = e.message;
      }
      setError(errorMessage);
      toast({ variant: "destructive", title: "Analysis Failed", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Rocket className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-2xl text-primary">Branch Booster</CardTitle>
            <CardDescription>Get insights and recommendations for your branch's traders. The agent can now securely fetch live trader data for analysis.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h3 className="text-md font-semibold mb-2 text-foreground">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickActions.map(action => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.label}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => handleQuickAction(action.query)}
                >
                  <IconComponent className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Question or Analysis Request</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Who are the top 3 traders by estimated annual revenue? Or use a quick action."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel htmlFor="customer-file-upload">Upload Additional Customer Data (Optional .csv, .txt)</FormLabel>
              <div className="flex items-center gap-2">
                <Input
                  id="customer-file-upload"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="flex-grow"
                  accept=".csv,.txt,text/plain,text/csv"
                />
                {selectedFile && (
                  <Button variant="ghost" size="icon" onClick={clearFile} aria-label="Clear file">
                    <XCircle className="h-5 w-5 text-destructive" />
                  </Button>
                )}
              </div>
              {selectedFile && (
                <p className="text-xs text-muted-foreground mt-1">
                  <Paperclip className="inline h-3 w-3 mr-1" />
                  {selectedFile.name} selected. Its content will be sent for analysis.
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Upload a list of customers or specific customer data for deeper insights (e.g., upsell/cross-sell opportunities, multi-customer recommendations).
              </p>
            </FormItem>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Get Insights
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>

      {(analysisResponse || error) && (
         <CardContent className="mt-4 border-t pt-4">
          <h3 className="text-lg font-semibold mb-2 text-foreground">Analysis Result:</h3>
          {analysisResponse && (
            <ScrollArea className="h-[250px] rounded-md border p-3 bg-muted/50">
              <p className="text-sm text-foreground whitespace-pre-wrap">{analysisResponse}</p>
            </ScrollArea>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      )}
    </Card>
  );
}
