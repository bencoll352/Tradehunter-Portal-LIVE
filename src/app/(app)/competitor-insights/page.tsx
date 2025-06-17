
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, ClipboardSearch, Sparkles, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeCompetitorWebsitesAction } from './actions';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  urls: z.string()
    .min(10, { message: "Please enter at least one URL." })
    .refine(value => {
      const lines = value.split('\\n').map(line => line.trim()).filter(line => line.length > 0);
      return lines.length > 0 && lines.length <= 10;
    }, { message: "Enter between 1 and 10 URLs, each on a new line." })
    .refine(value => {
      const lines = value.split('\\n').map(line => line.trim()).filter(line => line.length > 0);
      try {
        lines.forEach(line => z.string().url().parse(line));
        return true;
      } catch (e) {
        return false;
      }
    }, { message: "One or more inputs are not valid URLs. Ensure each URL is correctly formatted (e.g., https://example.com)." }),
});

export default function CompetitorInsightsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      urls: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);

    const urlsArray = values.urls.split('\\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (urlsArray.length === 0) {
      form.setError("urls", { type: "manual", message: "Please enter at least one URL."});
      setIsLoading(false);
      return;
    }
     if (urlsArray.length > 10) {
      form.setError("urls", { type: "manual", message: "You can analyze a maximum of 10 websites."});
      setIsLoading(false);
      return;
    }


    try {
      const result = await analyzeCompetitorWebsitesAction(urlsArray);
      if (result.error) {
        setError(result.error);
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: result.error,
        });
      } else {
        setAnalysisResult(result.analysis);
        toast({
          title: "Analysis Complete",
          description: "Competitor insights generated successfully.",
        });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unexpected client-side error occurred.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ClipboardSearch className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold text-primary">Competitor Insights</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Analyze local competitor websites. Enter up to 10 URLs (one per line) to get an overview of their offerings, promotions, and local activities.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="urls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Competitor Website URLs (One per line, max 10)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="https://competitor1.com\nhttps://competitor2.co.uk\n..."
                        className="min-h-[120px] resize-y"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Analyze Competitors
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Analyzing websites... this may take a few moments.</p>
            <p className="text-xs text-muted-foreground mt-1">(Fetching and processing multiple websites can be time-consuming)</p>
          </CardContent>
        </Card>
      )}

      {error && !isLoading && (
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <CardTitle className="text-destructive">Analysis Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive-foreground bg-destructive/10 p-3 rounded-md">{error}</p>
          </CardContent>
        </Card>
      )}

      {analysisResult && !isLoading && (
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl text-primary">Analysis Results</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-muted/30">
              <pre className="text-sm text-foreground whitespace-pre-wrap break-words">{analysisResult}</pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
