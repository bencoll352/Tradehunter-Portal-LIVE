'use server';

import { analyzeCompetitor, type CompetitionAnalysisInput, type CompetitionAnalysisOutput } from '@/ai/flows/competition-analysis-flow';

export async function getCompetitorInsightsAction(input: CompetitionAnalysisInput): Promise<CompetitionAnalysisOutput> {
    try {
        const result = await analyzeCompetitor(input);
        return result;
    } catch (error) {
        console.error("Error getting competitor insights:", error);
        if (error instanceof Error) {
            return { analysis: `An error occurred: ${error.message}` };
        }
        return { analysis: "An unknown error occurred while analyzing the competitor." };
    }
}
