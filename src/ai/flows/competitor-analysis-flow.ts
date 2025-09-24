'use server';
/**
 * @fileOverview An AI flow for analyzing a competitor's website.
 *
 * - analyzeCompetitor - A function that analyzes a given URL.
 * - CompetitorAnalysisInput - The input type for the analyzeCompetitor function.
 * - CompetitorAnalysisOutput - The return type for the analyzeCompetitor function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const CompetitorAnalysisInputSchema = z.object({
  url: z.string().url().describe('The URL of the competitor\'s website.'),
});
export type CompetitorAnalysisInput = z.infer<
  typeof CompetitorAnalysisInputSchema
>;

export const CompetitorAnalysisOutputSchema = z.object({
  overview: z
    .string()
    .describe(
      'A brief overview of the company, its business, and its target audience based on the website content.'
    ),
  strengths: z
    .array(z.string())
    .describe(
      'A list of key strengths of the company, such as unique selling propositions, clear messaging, or good user experience.'
    ),
  weaknesses: z
    .array(z.string())
    .describe(
      'A list of potential weaknesses, such as unclear calls-to-action, poor navigation, or outdated design.'
    ),
});
export type CompetitorAnalysisOutput = z.infer<
  typeof CompetitorAnalysisOutputSchema
>;

const competitorAnalysisPrompt = ai.definePrompt({
  name: 'competitorAnalysisPrompt',
  input: { schema: CompetitorAnalysisInputSchema },
  output: { schema: CompetitorAnalysisOutputSchema },
  prompt: `You are a business and marketing analyst. Analyze the provided website URL and generate a report.

Based on the content of the website at the URL: {{{url}}}, provide:
1.  A concise overview of the company, their main business, and their likely target audience.
2.  A bullet-point list of their key strengths (e.g., clear value proposition, good design, strong social proof).
3.  A bullet-point list of their potential weaknesses (e.g., confusing navigation, lack of contact information, slow loading times).

Assume you have access to the content of the website at the given URL. Structure your response according to the output schema.`,
});

const competitorAnalysisFlow = ai.defineFlow(
  {
    name: 'competitorAnalysisFlow',
    inputSchema: CompetitorAnalysisInputSchema,
    outputSchema: CompetitorAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await competitorAnalysisPrompt(input);
    if (!output) {
      throw new Error('Failed to get a valid analysis from the AI model.');
    }
    return output;
  }
);

export async function analyzeCompetitor(
  input: CompetitorAnalysisInput
): Promise<CompetitorAnalysisOutput> {
  return competitorAnalysisFlow(input);
}
