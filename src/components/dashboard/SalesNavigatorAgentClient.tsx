"use client";

import { useState, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Compass, Sparkles, Paperclip, XCircle, TrendingUp, ShieldAlert, Target, Lightbulb } from "lucide-react";
import { salesNavigatorQuery, type SalesNavigatorQueryInput } from "@/ai/flows/sales-navigator-query";
import type { Trader, BaseBranchId } from "@/types";
import { formatTraderDataForAnalysis } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const agentFormSchema = z.object({
  query: z.string().min(10, { message: "Strategic query must be at least 10 characters." }),
});

interface SalesNavigatorAgentClientProps {
  traders: Trader[];
  baseBranchId: BaseBranchId;
}

const strategicQuickActions = [
  { label: "Market Trends Analysis", query: "Analyse current market trends for our key product lines in this branch's territory.", icon: TrendingUp },
  { label: "Growth Opportunities", query: "Identify 3 strategic growth opportunities for this branch in the next 12 months, considering current trader performance.", icon: Target },
  { label: "New Client Campaign Strategy", query: "Suggest a high-level sales campaign outline for targeting new commercial clients in the area.", icon: Lightbulb },
  { label: "Risk Assessment & Mitigation", query: "What are potential risks to our market share (e.g., new competitors, economic shifts) and how can we proactively mitigate them?", icon: ShieldAlert },
  { label: "Optimise High-Value Trader Sales", query: "Based on current high-value trader performance, outline a strategy to optimise sales team effectiveness and further grow these accounts.", icon: Sparkles },
];


export function SalesNavigatorAgentClient({ traders, baseBranchId }: SalesNavigatorAgentClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResponse, setAnalysisResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof agentFormSchema>>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: { query: "" },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("text/") || file.name.endsWith(".csv") || file.name.endsWith(".tsv") || file.type === "application/pdf" || file.type.startsWith("application/vnd.openxmlformats-officedocument")) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setFileContent(e.target?.result as string);
        };
        reader.readAsText(file);
        toast({ title: "File Selected", description: `${file.name} is ready for analysis.` });
      } else {
        toast({ variant: "destructive", title: "Invalid File Type", description: "Please upload a text-based file (e.g., .txt, .csv), PDF, or Office document." });
        if(fileInputRef.current) fileInputRef.current.value = "";
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
    setIsLoading(true);
    setAnalysisResponse(null);
    setError(null);

    const traderDataString = formatTraderDataForAnalysis(traders);

    const input: SalesNavigatorQueryInput = {
      query: values.query,
      traderData: traderDataString,
      branchId: baseBranchId,
      ...(fileContent && { uploadedFileContent: fileContent }),
    };

    try {
      const result = await salesNavigatorQuery(input);
      setAnalysisResponse(result.strategy);
      if (selectedFile) {
        clearFile();
      }
    } catch (e) {
      console.error("Sales & Strategy Accelerator Analysis Error:", e);
      let errorMessage = "Sorry, I couldn't process that strategic request. Please try again or check the external Sales & Strategy Accelerator service.";
      if (e instanceof Error) {
        errorMessage = e.message;
      }
      setError(errorMessage);
      toast({ variant: "destructive", title: "Sales & Strategy Accelerator Failed", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-2 border-primary/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Compass className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-2xl text-primary">Sales & Strategy Accelerator</CardTitle>
            <CardDescription>Input your strategic questions for advanced market and sales acceleration. (Manager Access)</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h3 className="text-md font-semibold mb-2 text-foreground">Strategic Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {strategicQuickActions.map(action => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.label}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-2 border-primary/30 hover:bg-primary/5 hover:border-primary/50"
                  onClick={() => handleQuickAction(action.query)}
                >
                  {IconComponent && <IconComponent className="mr-2 h-4 w-4 text-primary/80" />}
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
                  <FormLabel>Your Strategic Question or Objective</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Analyse Q3 sales trends and suggest three actionable strategies to increase market share in the commercial sector for this branch. Consider current trader performance and potential new leads based on local economic indicators."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel htmlFor="sales-navigator-file-upload">Upload Supplemental Data (Optional .txt, .csv, .pdf, .docx)</FormLabel>
              <div className="flex items-center gap-2">
                <Input
                  id="sales-navigator-file-upload"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="flex-grow"
                  accept=".txt,.csv,text/plain,text/csv,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
                Upload market reports, competitor profiles, or other relevant documents to enhance strategic analysis.
              </p>
            </FormItem>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Get Strategic Insights
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>

      {(analysisResponse || error) && (
        <CardContent className="mt-4 border-t border-primary/30 pt-4">
          <h3 className="text-lg font-semibold mb-2 text-primary">Accelerator Response:</h3>
          {analysisResponse && (
            <ScrollArea className="h-[200px] rounded-md border p-3 bg-muted/30">
              <p className="text-sm text-foreground whitespace-pre-wrap">{analysisResponse}</p>
            </ScrollArea>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      )}
    </Card>
  );
}
