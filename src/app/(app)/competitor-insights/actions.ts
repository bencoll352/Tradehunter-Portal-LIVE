
'use server';

import { analyseCompetitor, type CompetitionAnalysisInput, type CompetitionAnalysisOutput } from '@/ai/flows/competition-analysis-flow';

export async function getCompetitorInsightsAction(input: CompetitionAnalysisInput): Promise<CompetitionAnalysisOutput> {
    try {
        const result = await analyseCompetitor(input);
        return result;
    } catch (error) {
        console.error("Error getting competitor insights:", error);
        if (error instanceof Error) {
            return { analysis: `An error occurred: ${error.message}` };
        }
        return { analysis: "An unknown error occurred while analysing the competitor." };
    }
}
