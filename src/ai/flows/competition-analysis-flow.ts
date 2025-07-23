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
  prompt: `You are an expert business analyst. Your task is to analyze the provided competitor's website and provide a detailed report.

Based on the content of the website at the URL {{{competitorUrl}}}, please provide an analysis covering the following points:
- Company Overview: What does the company do? What is their main product or service?
- Target Audience: Who are their likely customers?
- Strengths: What are their apparent strengths based on their website's content and presentation?
- Weaknesses: What are potential weaknesses or areas they don't emphasize?
- Marketing Strategy: What seems to be their marketing strategy based on the language and calls-to-action on their site?

Provide the full analysis as a single string in the 'analysis' field.`,
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
