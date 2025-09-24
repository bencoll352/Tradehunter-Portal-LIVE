 'use server';
/**
 * @fileOverview Server actions for the competitor insights feature.
 */
import {
  analyzeCompetitor,
  type CompetitorAnalysisInput,
  type CompetitorAnalysisOutput,
} from '@/ai/flows/competitor-analysis-flow';

export async function getCompetitorAnalysisAction(
  url: string
): Promise<{ data: CompetitorAnalysisOutput | null; error: string | null }> {
  try {
    const input: CompetitorAnalysisInput = { url };
    const result = await analyzeCompetitor(input);
    return { data: result, error: null };
  } catch (error: any) {
    console.error('[Action Error: getCompetitorAnalysisAction]', error);
    return {
      data: null,
      error:
        error.message || 'An unexpected error occurred during the analysis.',
    };
  }
}
