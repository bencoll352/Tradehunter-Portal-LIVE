
"use client";

import { useState, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Compass, Sparkles } from "lucide-react";
import { salesNavigatorQuery, SalesNavigatorQueryInputSchema, type SalesNavigatorQueryInput } from "@/ai/flows/sales-navigator-query";
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

export function SalesNavigatorAgentClient({ traders, baseBranchId }: SalesNavigatorAgentClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResponse, setAnalysisResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof agentFormSchema>>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: { query: "" },
  });

  const onSubmit = async (values: z.infer<typeof agentFormSchema>) => {
    setIsLoading(true);
    setAnalysisResponse(null);
    setError(null);

    const traderDataString = formatTraderDataForAnalysis(traders);
    
    const input: SalesNavigatorQueryInput = {
      query: values.query,
      traderData: traderDataString,
      branchId: baseBranchId,
    };

    try {
      const result = await salesNavigatorQuery(input);
      setAnalysisResponse(result.strategy);
    } catch (e) {
      console.error("Sales Navigator Analysis Error:", e);
      let errorMessage = "Sorry, I couldn't process that strategic request. Please try again or check the external Sales Navigator service.";
      if (e instanceof Error) {
        errorMessage = e.message; 
      }
      setError(errorMessage);
      toast({ variant: "destructive", title: "Sales Navigator Failed", description: errorMessage });
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
            <CardTitle className="text-2xl text-primary">Sales & Strategy Navigator</CardTitle>
            <CardDescription>Input your strategic questions for advanced market and sales analysis. (Manager Access)</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
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
                      placeholder="e.g., Analyze Q3 sales trends and suggest three actionable strategies to increase market share in the commercial sector for this branch. Consider current trader performance and potential new leads based on local economic indicators."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
          <h3 className="text-lg font-semibold mb-2 text-primary">Navigator Response:</h3>
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
