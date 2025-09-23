'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getProspectingDataAction } from './actions';

interface Prospect {
  id: string;
  name: string;
  industry: string;
  location: string;
  potential: 'High' | 'Medium' | 'Low';
}

export default function ProspectingAiPage() {
  const [criteria, setCriteria] = useState('');
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = useCallback(async () => {
    if (!criteria) {
      toast({ variant: 'destructive', title: 'Search Error', description: 'Please enter a search query to find prospects.' });
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await getProspectingDataAction(criteria);
      if (result && result.data) {
        setProspects(result.data);
        if (result.data.length === 0) {
          toast({ title: 'No Results', description: 'No prospects found for your query. Try a broader search.' });
        }
      } else {
        setProspects([]);
        toast({ 
          variant: "destructive", 
          title: "Error Fetching Prospects", 
          description: result?.error || "An unexpected error occurred."
        });
      }
    } catch (error) {
      console.error("Prospecting AI Error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ 
        variant: "destructive", 
        title: "Search Failed", 
        description: `Could not connect to the prospecting service. Details: ${errorMessage}`
      });
    } finally {
      setIsLoading(false);
    }
  }, [criteria, toast]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Prospecting</CardTitle>
          <CardDescription>
            Enter your criteria below to find high-potential leads. For example, try "tech companies in san francisco" or "restaurants in new york with > 50 employees".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              placeholder="Enter prospecting criteria..." 
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={isLoading}
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} 
              <span className="ml-2 hidden sm:inline">Search</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-2">Finding prospects for you...</p>
        </div>
      )}

      {!isLoading && prospects.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {prospects.map((prospect) => (
            <Card key={prospect.id}>
              <CardHeader>
                <CardTitle>{prospect.name}</CardTitle>
                <CardDescription>{prospect.industry} - {prospect.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-sm font-semibold ${prospect.potential === 'High' ? 'text-green-500' : prospect.potential === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}>
                  Potential: {prospect.potential}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {!isLoading && prospects.length === 0 && !criteria && (
         <Card className="text-center">
           <CardContent className="p-8">
             <p className="text-muted-foreground">Enter a query above to start your AI-powered prospecting.</p>
           </CardContent>
         </Card>
      )}

      {!isLoading && prospects.length === 0 && criteria && (
         <Card className="text-center">
           <CardContent className="p-8">
             <p className="text-muted-foreground">No prospects found. Try adjusting your search criteria.</p>
           </CardContent>
         </Card>
      )}
    </div>
  );
}

