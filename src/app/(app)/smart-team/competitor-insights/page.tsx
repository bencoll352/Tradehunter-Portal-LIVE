'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Lightbulb, ThumbsDown, ThumbsUp, Telescope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCompetitorAnalysisAction } from './actions';

interface CompetitorAnalysis {
  overview: string;
  strengths: string[];
  weaknesses: string[];
}

export default function CompetitorInsightsPage() {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalysis = useCallback(async () => {
    if (!url || !url.startsWith('http')) {
      toast({ variant: 'destructive', title: 'Invalid URL', description: 'Please enter a valid website URL (e.g., https://example.com).' });
      return;
    }

    setIsLoading(true);
    setAnalysis(null);
    try {
      const result = await getCompetitorAnalysisAction(url);
      
      if (result && result.data) {
        setAnalysis(result.data);
      } else {
        setAnalysis(null);
        toast({ 
          variant: "destructive", 
          title: "Analysis Failed", 
          description: result?.error || "Could not retrieve competitor analysis."
        });
      }
    } catch (error) {
      console.error("Competitor Analysis Error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ 
        variant: "destructive", 
        title: "Server Error", 
        description: `An error occurred during analysis. Details: ${errorMessage}`
      });
    } finally {
      setIsLoading(false);
    }
  }, [url, toast]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Competitor Website Analysis</CardTitle>
          <CardDescription>
            Enter a competitor's website URL to generate an AI-powered analysis of their business, strengths, and weaknesses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              placeholder="https://competitor-website.com" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalysis()}
              disabled={isLoading}
            />
            <Button onClick={handleAnalysis} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Telescope className="h-4 w-4" />} 
              <span className="ml-2 hidden sm:inline">Analyze</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-2">Analyzing website... this may take a moment.</p>
        </div>
      )}

      {!isLoading && analysis && (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">{analysis.overview}</p></CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-emerald-500/50">
                    <CardHeader><CardTitle className="flex items-center gap-2"><ThumbsUp className="text-emerald-500" /> Strengths</CardTitle></CardHeader>
                    <CardContent><ul className="list-disc pl-5 space-y-2 text-muted-foreground">{analysis.strengths.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent>
                </Card>
                <Card className="border-rose-500/50">
                    <CardHeader><CardTitle className="flex items-center gap-2"><ThumbsDown className="text-rose-500" /> Weaknesses</CardTitle></CardHeader>
                    <CardContent><ul className="list-disc pl-5 space-y-2 text-muted-foreground">{analysis.weaknesses.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent>
                </Card>
            </div>
        </div>
      )}

      {!isLoading && !analysis && (
          <Card className="text-center">
              <CardContent className="p-8">
                  <p className="text-muted-foreground">Your competitor analysis will appear here. Enter a URL above to begin.</p>
              </CardContent>
          </Card>
      )}
    </div>
  );
}
