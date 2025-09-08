
'use server';
/**
 * @fileOverview A competitor analysis AI agent.
 *
 * - analyseCompetitor - A function that handles the competitor analysis process.
 * - CompetitionAnalysisInput - The input type for the analyseCompetitor function.
 * - CompetitionAnalysisOutput - The return type for the analyseCompetitor function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit/zod';
import { geminiPro } from '@/ai/genkit';

export const CompetitionAnalysisInputSchema = z.object({
    competitorUrl: z.string().url().describe("The URL of the competitor's website."),
});
export type CompetitionAnalysisInput = z.infer<typeof CompetitionAnalysisInputSchema>;

export const CompetitionAnalysisOutputSchema = z.object({
    analysis: z.string().describe("The detailed analysis of the competitor."),
});
export type CompetitionAnalysisOutput = z.infer<typeof CompetitionAnalysisOutputSchema>;

export async function analyseCompetitor(input: CompetitionAnalysisInput): Promise<CompetitionAnalysisOutput> {
    return competitionAnalysisFlow(input);
}

const competitionAnalysisFlow = ai.defineFlow(
    {
        name: 'competitionAnalysisFlow',
        inputSchema: CompetitionAnalysisInputSchema,
        outputSchema: CompetitionAnalysisOutputSchema,
    },
    async (input) => {
        const { output } = await ai.generate({
            model: geminiPro,
            prompt: `
              You are a world-class business strategist and market analyst, working for the UK builders merchant, Jewson.
              Your task is to analyze a competitor's website and provide a detailed report.
              The report should be structured to give Jewson's branch managers a clear, actionable understanding of the competitor.
  
              Analyze the website at the following URL: ${input.competitorUrl}
  
              Your report should include the following sections, formatted with Markdown for clarity:
  
              ### 1. Executive Summary
              - A brief, high-level overview of the competitor.
              - Their apparent target market (e.g., trade, DIY, specialists).
              - Their key value proposition.
  
              ### 2. Product & Service Range
              - What are their main product categories? (e.g., timber, plumbing, tools, landscaping).
              - Do they offer services like tool hire, kitchen/bathroom design, or delivery?
              - Note any specialized or niche product areas they focus on.
  
              ### 3. Strengths
              - What does this competitor do particularly well?
              - Examples: website usability, clear pricing, strong branding, specific expertise, special offers.
  
              ### 4. Weaknesses
              - Where are the potential gaps or weaknesses?
              - Examples: limited product range, poor website navigation, lack of key services, unclear information.
  
              ### 5. Actionable Counter-Strategies for Jewson
              - Provide **at least three concrete, actionable strategies** that a local Jewson branch manager could implement to compete effectively.
              - These should be practical and directly address the findings from your analysis. For example:
                - "If they have a strong online presence for landscapers, Jewson should run a targeted social media campaign for local landscaping businesses showcasing our range and delivery options."
                - "If their pricing on timber is very competitive, Jewson should highlight our 'Price Match Guarantee' and the quality of our timber in-store."
                - "If they lack a tool hire service, Jewson should promote our own tool hire offerings to their potential customer base."
  
              Your analysis must be insightful, concise, and focused on providing real commercial value to the Jewson team.
              Do not just list what's on the website; interpret it from a strategic perspective.
            `,
            output: {
                schema: CompetitionAnalysisOutputSchema,
                format: "json",
            },
        });

        if (!output) {
            throw new Error("The AI model did not return the expected analysis output.");
        }

        return output;
    }
);
