
"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Lightbulb, Sparkles } from "lucide-react";
import { getCompetitorInsightsAction } from "./actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const insightsFormSchema = z.object({
  competitorUrl: z.string().url({ message: "Please enter a valid URL." }),
});

export default function CompetitorInsightsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResponse, setAnalysisResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof insightsFormSchema>>({
    resolver: zodResolver(insightsFormSchema),
    defaultValues: { competitorUrl: "" },
  });

  const onSubmit = async (values: z.infer<typeof insightsFormSchema>) => {
    setIsLoading(true);
    setAnalysisResponse(null);
    setError(null);

    try {
      const result = await getCompetitorInsightsAction({ competitorUrl: values.competitorUrl });
      if (result.analysis.startsWith("An error occurred")) {
          setError(result.analysis);
          toast({ variant: "destructive", title: "Analysis Failed", description: result.analysis });
      } else {
        setAnalysisResponse(result.analysis);
      }
    } catch (e) {
      console.error("Analysis Error:", e);
      let errorMessage = "Sorry, I couldn't process that request. Please try again.";
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
          <Lightbulb className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-2xl text-primary">Competitor Insights</CardTitle>
            <CardDescription>Get insights on your competitors. Enter a competitor's website URL to begin.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="competitorUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Competitor Website URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., https://www.competitor.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
