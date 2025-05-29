
"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Rocket, Sparkles } from "lucide-react"; // Changed Bot to Rocket
import { profitPartnerQuery, ProfitPartnerQueryInput } from "@/ai/flows/profit-partner-query";
import type { Trader } from "@/types";
import { formatTraderDataForAI } from "@/lib/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";

const agentFormSchema = z.object({
  query: z.string().min(5, { message: "Query must be at least 5 characters." }),
});

interface ProfitPartnerAgentClientProps {
  traders: Trader[];
}

export function ProfitPartnerAgentClient({ traders }: ProfitPartnerAgentClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof agentFormSchema>>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: { query: "" },
  });

  const onSubmit = async (values: z.infer<typeof agentFormSchema>) => {
    setIsLoading(true);
    setAiResponse(null);
    setError(null);

    const traderDataString = formatTraderDataForAI(traders);
    
    const input: ProfitPartnerQueryInput = {
      query: values.query,
      traderData: traderDataString,
    };

    try {
      const result = await profitPartnerQuery(input);
      setAiResponse(result.answer);
    } catch (e) {
      console.error("AI Query Error:", e);
      setError("Sorry, I couldn't process that request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Rocket className="h-8 w-8 text-primary" /> {/* Changed Bot to Rocket */}
          <div>
            <CardTitle className="text-2xl text-primary">Branch Booster</CardTitle> {/* Changed title */}
            <CardDescription>Ask questions about your branch's trader performance.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Question</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., What is the total sales volume? Who are the top 3 traders by sales?"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Ask AI
            </Button>
          </CardFooter>
        </form>
      </Form>
      {(aiResponse || error) && (
        <CardContent className="mt-4 border-t pt-4">
          <h3 className="text-lg font-semibold mb-2 text-foreground">AI Response:</h3>
          {aiResponse && (
            <ScrollArea className="h-[100px] rounded-md border p-3 bg-muted/50">
              <p className="text-sm text-foreground whitespace-pre-wrap">{aiResponse}</p>
            </ScrollArea>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      )}
    </Card>
  );
}
