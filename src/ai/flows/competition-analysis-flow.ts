'use server';
/**
 * @fileOverview A competitor analysis AI agent.
 *
 * - analyzeCompetitor - A function that handles the competitor analysis process.
 * - CompetitionAnalysisInput - The input type for the analyzeCompetitor function.
 * - CompetitionAnalysisOutput - The return type for the analyzeCompetitor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CompetitionAnalysisInputSchema = z.object({
  competitorUrl: z.string().url().describe("The URL of the competitor's website."),
});
export type CompetitionAnalysisInput = z.infer<typeof CompetitionAnalysisInputSchema>;

const CompetitionAnalysisOutputSchema = z.object({
  analysis: z.string().describe("A detailed analysis of the competitor based on their website."),
});
export type CompetitionAnalysisOutput = z.infer<typeof CompetitionAnalysisOutputSchema>;

export async function analyzeCompetitor(input: CompetitionAnalysisInput): Promise<CompetitionAnalysisOutput> {
  return competitionAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'competitionAnalysisPrompt',
  input: {schema: CompetitionAnalysisInputSchema},
  output: {schema: CompetitionAnalysisOutputSchema},
  prompt: `You are an expert business strategist for a large UK builders merchant called Jewson. Your task is to analyze a competitor's website and provide a detailed strategic report.

Based on the content of the website at the URL {{{competitorUrl}}}, provide a detailed analysis covering the following points:

1.  **Offerings:** What specific products, services, and solutions does this company offer? Are they targeting trade professionals, DIY customers, or both?

2.  **Strengths:** What are their key strengths based on their website? Consider their branding, messaging, product range, apparent online features (e.g., account management, delivery options), and any unique selling propositions they highlight.

3.  **Weaknesses:** What are their potential weaknesses? Look for what's missing. Do they lack a clear focus? Is their product range limited? Is the site difficult to navigate? Do they fail to mention key services that trade professionals expect (like credit accounts, bulk delivery, etc.)?

4.  **Actionable Counter-Strategy for Jewson:** This is the most important section. Provide specific, actionable advice on how Jewson can leverage the competitor's weaknesses and counter their strengths. For example:
    *   If the competitor has a weak online presence, suggest Jewson could run targeted digital ads in their area.
    *   If the competitor focuses only on retail (DIY), advise on how Jewson can emphasize its superior trade services.
    *   If the competitor has a limited product range, suggest Jewson promote its wider stock availability.
    *   If the competitor's website is not user-friendly, suggest Jewson highlight its own easy-to-use online ordering system.

Provide the full analysis as a single, well-structured string in the 'analysis' field. Use clear headings for each section.`,
});

const competitionAnalysisFlow = ai.defineFlow(
  {
    name: 'competitionAnalysisFlow',
    inputSchema: CompetitionAnalysisInputSchema,
    outputSchema: CompetitionAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
