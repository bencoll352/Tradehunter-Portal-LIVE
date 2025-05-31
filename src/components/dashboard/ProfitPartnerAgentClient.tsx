
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
import { Loader2, Rocket, Sparkles, Paperclip, XCircle, Lightbulb } from "lucide-react";
import { profitPartnerQuery, ProfitPartnerQueryInput } from "@/ai/flows/profit-partner-query";
import type { Trader } from "@/types";
import { formatTraderDataForAnalysis } from "@/lib/utils"; // Updated import
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const agentFormSchema = z.object({
  query: z.string().min(5, { message: "Query must be at least 5 characters." }),
});

interface ProfitPartnerAgentClientProps {
  traders: Trader[];
}

const quickActions = [
  { label: "New Customers", query: "Identify new customers and provide a brief summary." },
  { label: "High Potential New Customers", query: "Which new customers show the highest potential? Provide reasons." },
  { label: "Boost Existing Customer Spend", query: "Suggest strategies to boost spending from existing customers." },
  { label: "High Value Existing Customers", query: "List high-value existing customers and any recent changes in their activity." },
  { label: "Lapsed Accounts (3+ Months)", query: "Identify accounts that have been inactive for 3 or more months and suggest re-engagement actions." },
  { label: "Declined Accounts (6+ Months)", query: "List accounts that have declined in activity or stopped purchasing for 6+ months and potential reasons." },
  { label: "List Bricklayers & Sales Campaign", query: "Give me a list of all traders who are 'Bricklayers' or in 'Brickwork' category. Then, suggest a brief sales campaign message to promote our new line of premium mortar to them." },
];

export function ProfitPartnerAgentClient({ traders }: ProfitPartnerAgentClientProps) {
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

  const onSubmit = async (values: z.infer<typeof agentFormSchema>>) => {
    setIsLoading(true);
    setAnalysisResponse(null);
    setError(null);

    const traderDataString = formatTraderDataForAnalysis(traders);
    
    const input: ProfitPartnerQueryInput = {
      query: values.query,
      traderData: traderDataString,
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
        errorMessage = e.message; // Use the specific error from profitPartnerQueryFlow
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
            <CardDescription>Get insights and recommendations for your branch's traders. Current trader data for your branch is automatically included in analyses.</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-md font-semibold mb-2 text-foreground">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickActions.map(action => (
              <Button
                key={action.label}
                variant="outline"
                className="w-full justify-start text-left h-auto py-2"
                onClick={() => handleQuickAction(action.query)}
              >
                {action.label}
              </Button>
            ))}
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
                      placeholder="e.g., What is the total sales volume? Who are the top 3 traders by sales? Or use a quick action."
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
            <ScrollArea className="h-[150px] rounded-md border p-3 bg-muted/50">
              <p className="text-sm text-foreground whitespace-pre-wrap">{analysisResponse}</p>
            </ScrollArea>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      )}
    </Card>
  );
}
