'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Loader2, Wand, MessageSquareQuote, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getObjectionResponseAction } from './actions'; // Assuming this action exists

interface ObjectionResponse {
  suggestedResponse: string;
  talkingPoints: string[];
  reframe: string;
}

export default function ObjectionHandlingPage() {
  const [objection, setObjection] = useState('');
  const [response, setResponse] = useState<ObjectionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetSuggestion = useCallback(async () => {
    if (!objection.trim()) {
      toast({ variant: 'destructive', title: 'Input Error', description: 'Please enter a customer objection to get a suggestion.' });
      return;
    }

    setIsLoading(true);
    setResponse(null);
    try {
      const result = await getObjectionResponseAction(objection);
      
      if (result && result.data) {
        setResponse(result.data);
      } else {
        setResponse(null);
        toast({ 
          variant: "destructive", 
          title: "Suggestion Failed", 
          description: result?.error || "Could not get a response from the AI coach."
        });
      }
    } catch (error) {
      console.error("Objection Handling Error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ 
        variant: "destructive", 
        title: "Server Error", 
        description: `An error occurred while getting the suggestion. Details: ${errorMessage}`
      });
    } finally {
      setIsLoading(false);
    }
  }, [objection, toast]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Objection Handling Coach</CardTitle>
          <CardDescription>
            Enter a customer objection below, and the AI will provide a strategy to handle it effectively.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            placeholder="e.g., 'Your price is too high.' or 'We are happy with our current provider.'" 
            value={objection}
            onChange={(e) => setObjection(e.target.value)}
            rows={4}
            disabled={isLoading}
          />
          <Button onClick={handleGetSuggestion} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand className="h-4 w-4" />} 
            <span className="ml-2">Get Suggestion</span>
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-2">Your AI coach is thinking...</p>
        </div>
      )}

      {!isLoading && response && (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquareQuote /> Suggested Response</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground italic">{response.suggestedResponse}</p></CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><BrainCircuit /> Key Talking Points</CardTitle></CardHeader>
                <CardContent><ul className="list-disc pl-5 space-y-2 text-muted-foreground">{response.talkingPoints.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><RotateCcw /> Reframe the Objection</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">{response.reframe}</p></CardContent>
            </Card>
        </div>
      )}

      {!isLoading && !response && (
          <Card className="text-center">
              <CardContent className="p-8">
                  <p className="text-muted-foreground">Enter an objection above to receive AI-powered guidance.</p>
              </CardContent>
          </Card>
      )}
    </div>
  );
}
