
'use server';

import { analyzeCompetitors, type CompetitionAnalysisInput, type CompetitionAnalysisOutput } from '@/ai/flows/competition-analysis-flow';

export async function analyzeCompetitorWebsitesAction(
  urls: string[]
): Promise<{ analysis: string | null; error: string | null }> {
  try {
    const input: CompetitionAnalysisInput = { websiteUrls: urls };
    const result: CompetitionAnalysisOutput = await analyzeCompetitors(input);
    return { analysis: result.analysis, error: null };
  } catch (e) {
    console.error("Error in analyzeCompetitorWebsitesAction:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during analysis.";
    return { analysis: null, error: errorMessage };
  }
}
