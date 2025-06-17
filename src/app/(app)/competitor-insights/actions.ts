
'use server';

import { analyzeCompetitors, type CompetitionAnalysisInput, type CompetitionAnalysisOutput } from '@/ai/flows/competition-analysis-flow';
import { saveCompetitorUrls as saveUrlsToDb, getSavedCompetitorUrls as getUrlsFromDb } from '@/lib/competitor-insights-service';
import type { BaseBranchId } from '@/types';

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

export async function saveCompetitorUrlsAction(
  branchId: BaseBranchId,
  urls: string[]
): Promise<{ success: boolean; error: string | null }> {
  try {
    await saveUrlsToDb(branchId, urls);
    return { success: true, error: null };
  } catch (e) {
    console.error("Error in saveCompetitorUrlsAction:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while saving URLs.";
    return { success: false, error: errorMessage };
  }
}

export async function getSavedCompetitorUrlsAction(
  branchId: BaseBranchId
): Promise<{ urls: string[] | null; error: string | null }> {
  try {
    const urls = await getUrlsFromDb(branchId);
    return { urls, error: null };
  } catch (e) {
    console.error("Error in getSavedCompetitorUrlsAction:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while fetching saved URLs.";
    return { urls: null, error: errorMessage };
  }
}
