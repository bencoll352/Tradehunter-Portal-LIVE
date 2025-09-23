'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarChart2, Loader2, Lightbulb, AlertTriangle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getMarketAnalysisAction } from './actions'; // Assuming this action exists

interface AnalysisResult {
  keyTrends: string[];
  opportunities: string[];
  risks: string[];
  summary: string;
}

export default function MarketAnalysisPage() {
  const [marketQuery, setMarketQuery] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalysis = useCallback(async () => {
    if (!marketQuery) {
      toast({ variant: 'destructive', title: 'Input Error', description: 'Please enter a market or topic to analyze.' });
      return;
    }

    setIsLoading(true);
    setAnalysis(null);
    try {
      const result = await getMarketAnalysisAction(marketQuery);
      
      if (result && result.data) {
        setAnalysis(result.data);
      } else {
        setAnalysis(null);
        toast({ 
          variant: "destructive", 
          title: "Analysis Failed", 
          description: result?.error || "Could not retrieve market analysis data."
        });
      }
    } catch (error) {
      console.error("Market Analysis Error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ 
        variant: "destructive", 
        title: "Server Error", 
        description: `An error occurred during analysis. Details: ${errorMessage}`
      });
    } finally {
      setIsLoading(false);
    }
  }, [marketQuery, toast]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Market Analysis</CardTitle>
          <CardDescription>
            Enter a market, industry, or topic to generate an AI-powered analysis of key trends, opportunities, and risks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              placeholder="e.g., 'Residential solar panels in California'" 
              value={marketQuery}
              onChange={(e) => setMarketQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalysis()}
              disabled={isLoading}
            />
            <Button onClick={handleAnalysis} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart2 className="h-4 w-4" />} 
              <span className="ml-2 hidden sm:inline">Analyze</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-2">Analyzing the market... this may take a moment.</p>
        </div>
      )}

      {!isLoading && analysis && (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Analysis Summary</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">{analysis.summary}</p></CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-sky-500/50">
                    <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="text-sky-500" /> Key Trends</CardTitle></CardHeader>
                    <CardContent><ul className="list-disc pl-5 space-y-2 text-muted-foreground">{analysis.keyTrends.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent>
                </Card>
                <Card className="border-emerald-500/50">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="text-emerald-500" /> Opportunities</CardTitle></CardHeader>
                    <CardContent><ul className="list-disc pl-5 space-y-2 text-muted-foreground">{analysis.opportunities.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent>
                </Card>
                <Card className="border-rose-500/50">
                    <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="text-rose-500" /> Risks</CardTitle></CardHeader>
                    <CardContent><ul className="list-disc pl-5 space-y-2 text-muted-foreground">{analysis.risks.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent>
                </Card>
            </div>
        </div>
      )}

      {!isLoading && !analysis && (
          <Card className="text-center">
              <CardContent className="p-8">
                  <p className="text-muted-foreground">Your market analysis will appear here. Enter a query above to begin.</p>
              </CardContent>
          </Card>
      )}
    </div>
  );
}
