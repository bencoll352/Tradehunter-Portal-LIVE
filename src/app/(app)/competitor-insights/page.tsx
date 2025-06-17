
"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, ClipboardCheck, Sparkles, AlertTriangle } from 'lucide-react'; 
import { useToast } from '@/hooks/use-toast';
import { analyzeCompetitorWebsitesAction, saveCompetitorUrlsAction, getSavedCompetitorUrlsAction } from './actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getBranchInfo, type BranchInfo, type BaseBranchId, type BranchLoginId } from '@/types';

const formSchema = z.object({
  urls: z.string()
    .min(10, { message: "Please enter at least one URL." }) 
    .refine(value => {
      const lines = value.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      return lines.length > 0 && lines.length <= 10;
    }, { message: "Enter between 1 and 10 URLs, each on a new line." })
    .refine(value => {
      const lines = value.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      try {
        lines.forEach(line => z.string().url({ message: `Invalid URL: ${line.length > 30 ? line.substring(0,27) + "..." : line}` }).parse(line));
        return true;
      } catch (e) {
        // This validation message is tricky with react-hook-form showing it for the whole textarea.
        // Individual line errors are better handled by user feedback, but this basic check helps.
        return false;
      }
    }, { message: "One or more inputs are not valid URLs. Ensure each URL is correctly formatted (e.g., https://example.com) and on its own line." }),
});

// Helper function to process and format the analysis text
function FormatAnalysisResult({ analysisText }: { analysisText: string | null }) {
  if (!analysisText) return null;

  const cleanedText = analysisText.replace(/\*/g, ''); 

  const sections: React.ReactNode[] = [];
  let overallAnalysisContent: React.ReactNode = null;

  const overallAnalysisMarker = "Provide your overall analysis:";
  const overallAnalysisMarkerLower = overallAnalysisMarker.toLowerCase();
  const overallAnalysisIndex = cleanedText.toLowerCase().indexOf(overallAnalysisMarkerLower);

  let competitorReportsText = cleanedText;
  if (overallAnalysisIndex !== -1) {
    competitorReportsText = cleanedText.substring(0, overallAnalysisIndex);
    const overallText = cleanedText.substring(overallAnalysisIndex + overallAnalysisMarker.length).trim();
    if (overallText) {
      overallAnalysisContent = (
        <div className="mt-6 pt-4 border-t border-border/30">
          <h3 className="text-lg font-semibold mb-2 text-primary">Overall Analysis</h3>
          {overallText.split('\n').filter(line => line.trim()).map((paragraph, idx) => (
            <p key={`overall-${idx}`} className="mb-2 text-sm">{paragraph}</p>
          ))}
        </div>
      );
    }
  }
  
  const blocks = competitorReportsText.split('---').map(b => b.trim()).filter(b => b);

  blocks.forEach((block, index) => {
    const urlMatch = block.match(/^Website URL:\s*(https?:\/\/[^\s]+)/i);
    let urlDisplay: React.ReactNode = null;
    let analysisLinesForBlock: string[] = [];
    let blockContentToParse = block;

    if (urlMatch && urlMatch[1]) {
      const currentUrl = urlMatch[1];
      urlDisplay = <strong className="text-primary">{currentUrl}</strong>;
      blockContentToParse = block.substring(urlMatch[0].length).trim();
    }
    
    analysisLinesForBlock = blockContentToParse.split('\n').map(line => line.trim()).filter(line => line && line.toLowerCase() !== "content summary:");

    if (analysisLinesForBlock.length > 0 || urlDisplay) {
      sections.push(
        <div key={`section-${index}`} className="mb-4 pb-2 border-b border-border/30 last:border-b-0">
          {urlDisplay && <p className="mb-1 text-md">{urlDisplay}</p>}
          {analysisLinesForBlock.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {analysisLinesForBlock.map((line, lineIdx) => {
                const cleanLine = line.replace(/^-\s*/, '').replace(/^\*\s*/, '').replace(/^\d+\.\s*/, '');
                if (cleanLine.trim()) {
                    return <li key={`line-${index}-${lineIdx}`}>{cleanLine}</li>;
                }
                return null;
              })}
            </ul>
          ) : (
             urlDisplay && <p className="text-sm text-muted-foreground italic mt-1">No specific analysis points provided, or content was fetched with an error.</p>
          )}
        </div>
      );
    }
  });

  if (sections.length === 0 && !overallAnalysisContent && cleanedText.trim()) {
    return cleanedText.split('\n').filter(line => line.trim()).map((paragraph, idx) => (
        <p key={`fallback-${idx}`} className="mb-2 text-sm">{paragraph}</p>
    ));
  }

  return (
    <>
      {sections}
      {overallAnalysisContent}
    </>
  );
}


export default function CompetitorInsightsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
  const [isLoadingSavedUrls, setIsLoadingSavedUrls] = useState(true);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      urls: "",
    },
  });

  useEffect(() => {
    const storedLoggedInId = localStorage.getItem('loggedInId') as BranchLoginId | null;
    const info = getBranchInfo(storedLoggedInId);
    setBranchInfo(info);
  }, []);

  useEffect(() => {
    if (branchInfo?.baseBranchId) {
      setIsLoadingSavedUrls(true);
      getSavedCompetitorUrlsAction(branchInfo.baseBranchId)
        .then(result => {
          if (result.urls && result.urls.length > 0) {
            form.reset({ urls: result.urls.join('\n') });
          } else {
            form.reset({ urls: "" }); // Explicitly clear if no URLs or null
          }
          if (result.error) {
            // Non-critical, just log or subtle toast
            console.warn("Could not load saved competitor URLs:", result.error);
             toast({ variant: "default", title: "Note", description: "Could not retrieve previously saved URLs.", duration: 3000});
          }
        })
        .catch(err => {
          console.error("Client error fetching saved URLs:", err);
          toast({ variant: "destructive", title: "Client Error", description: "Error fetching saved URLs on client."});
        })
        .finally(() => setIsLoadingSavedUrls(false));
    } else {
      setIsLoadingSavedUrls(false); // No branch ID, so nothing to load
    }
  }, [branchInfo, form, toast]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);

    const urlsArray = values.urls.split('\n')
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
      const analysisOp = await analyzeCompetitorWebsitesAction(urlsArray);
      if (analysisOp.error) {
        setError(analysisOp.error);
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: analysisOp.error,
        });
      } else {
        setAnalysisResult(analysisOp.analysis);
        toast({
          title: "Analysis Complete",
          description: "Competitor insights generated successfully.",
        });
        // Save the successfully analyzed URLs
        if (branchInfo?.baseBranchId) {
          const saveResult = await saveCompetitorUrlsAction(branchInfo.baseBranchId, urlsArray);
          if (saveResult.error) {
            toast({
              variant: "destructive",
              title: "Failed to Save URLs",
              description: saveResult.error,
            });
          } else {
            // Optionally, a success toast for saving, or just let it be silent
            // toast({ title: "URLs Saved", description: "Analyzed URLs have been saved for this branch."});
          }
        }
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
            <ClipboardCheck className="h-10 w-10 text-primary" /> 
            <div>
              <CardTitle className="text-3xl font-bold text-primary">Competitor Insights</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Analyze local competitor websites. Enter up to 10 URLs (one per line) to get an overview of their offerings, promotions, and local activities. Previously analyzed URLs for your branch will be loaded.
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
                        placeholder={isLoadingSavedUrls ? "Loading saved URLs..." : "https://competitor1.com\nhttps://competitor2.co.uk\n..."}
                        className="min-h-[120px] resize-y"
                        {...field}
                        disabled={isLoading || isLoadingSavedUrls}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading || isLoadingSavedUrls} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
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
            <ScrollArea className="h-auto max-h-[600px] w-full rounded-md border p-4 bg-muted/30">
              <FormatAnalysisResult analysisText={analysisResult} />
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
