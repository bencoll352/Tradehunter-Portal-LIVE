
'use server';
/**
 * @fileOverview A Genkit flow to analyze competitor websites.
 *
 * - analyzeCompetitors - A function that handles the competitor analysis process.
 * - CompetitionAnalysisInputSchema - The input type for the analyzeCompetitors function.
 * - CompetitionAnalysisOutputSchema - The return type for the analyzeCompetitors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { fetchWebsiteContentTool, type FetchWebsiteContentOutput } from '@/ai/tools/fetch-website-content-tool';

export const CompetitionAnalysisInputSchema = z.object({
  websiteUrls: z.array(z.string().url({ message: "Please provide valid URLs."}))
    .min(1, { message: "Please provide at least one website URL." })
    .max(10, { message: "You can analyze a maximum of 10 websites at a time." })
    .describe('A list of competitor website URLs (up to 10).'),
});
export type CompetitionAnalysisInput = z.infer<typeof CompetitionAnalysisInputSchema>;

// This will be the schema for the data passed to the main analysis prompt
const WebsiteContentsSchema = z.array(
  z.object({
    url: z.string().url(),
    content: z.string().nullable().describe('The fetched text content of the website, or null if fetching failed.'),
    error: z.string().nullable().describe('An error message if fetching failed for this specific URL.'),
  })
);

export const CompetitionAnalysisOutputSchema = z.object({
  analysis: z.string().describe('The textual analysis of the competitor websites.'),
});
export type CompetitionAnalysisOutput = z.infer<typeof CompetitionAnalysisOutputSchema>;

export async function analyzeCompetitors(input: CompetitionAnalysisInput): Promise<CompetitionAnalysisOutput> {
  return competitionAnalysisFlow(input);
}

const competitionAnalysisMainPrompt = ai.definePrompt({
  name: 'competitionAnalysisMainPrompt',
  input: { schema: z.object({ sitesData: WebsiteContentsSchema }) },
  output: { schema: CompetitionAnalysisOutputSchema },
  prompt: `You are a local market analyst for a builders' merchant.
You have been provided with content (or error messages if content fetching failed) from several competitor websites.
Your task is to analyze this information and provide a summary of the local competitive landscape.

Focus on:
- Key services or products being prominently promoted by each competitor.
- Special offers, discounts, or unique selling propositions mentioned.
- Recent news, blog posts, events, or community involvement highlighted on their sites.
- The general tone, style, and target audience apparent from their website content.
- Any discernible local market trends, common themes, or areas of intense competition based on the collective information.
- Identify any unique strengths or weaknesses you can infer for each competitor based *solely* on the provided text.

Structure your analysis clearly. You can provide a brief summary for each website first, then an overall synthesis.
Be concise and focus on actionable insights that would be valuable to a builders' merchant manager.
If content for a website is missing, insufficient, or an error message is provided instead of content, acknowledge this in your analysis for that specific URL and explain that you cannot analyze it deeply. Do not attempt to guess or fetch information yourself. Base your analysis *only* on the provided text.

Competitor Website Information:
{{#each sitesData}}
Website URL: {{{url}}}
{{#if error}}
Error Fetching Content: {{{error}}}
{{else if content}}
Content Summary:
(Provide a brief summary of the key points from the website content below if available and relevant, otherwise state if content is minimal or uninformative)
"""
{{{content}}}
"""
{{else}}
Content: No content provided or content was empty.
{{/if}}
---
{{/each}}

Provide your overall analysis:
`,
  // Model configuration can be added here if needed, e.g., temperature
  // config: { temperature: 0.5 }
});

const competitionAnalysisFlow = ai.defineFlow(
  {
    name: 'competitionAnalysisFlow',
    inputSchema: CompetitionAnalysisInputSchema,
    outputSchema: CompetitionAnalysisOutputSchema,
    tools: [fetchWebsiteContentTool] // Make the tool available to the flow context, though we call it directly here.
  },
  async (input: CompetitionAnalysisInput): Promise<CompetitionAnalysisOutput> => {
    console.log(`[competitionAnalysisFlow] Starting analysis for ${input.websiteUrls.length} URLs.`);

    const sitesData: FetchWebsiteContentOutput[] = [];

    for (const url of input.websiteUrls) {
      try {
        // Explicitly call the tool for each URL.
        // The tool itself is defined with input and output schemas.
        const fetchResult = await fetchWebsiteContentTool({ url });
        sitesData.push(fetchResult);
        if (fetchResult.error) {
          console.warn(`[competitionAnalysisFlow] Error fetching content for ${url}: ${fetchResult.error}`);
        } else {
          console.log(`[competitionAnalysisFlow] Successfully fetched content snippet for ${url}. Length: ${fetchResult.content?.substring(0,100)}...`);
        }
      } catch (toolError) {
        console.error(`[competitionAnalysisFlow] Critical error calling fetchWebsiteContentTool for ${url}:`, toolError);
        sitesData.push({
          url,
          content: null,
          error: toolError instanceof Error ? toolError.message : "Unknown error calling fetch tool.",
        });
      }
    }

    console.log(`[competitionAnalysisFlow] All website content fetching attempts completed. Passing to main prompt.`);

    try {
      const {output} = await competitionAnalysisMainPrompt({ sitesData });
      if (!output || !output.analysis) {
        console.error('[competitionAnalysisFlow] Analysis prompt returned empty or invalid output.');
        throw new Error('The analysis service returned an empty or invalid analysis.');
      }
      console.log('[competitionAnalysisFlow] Successfully received analysis from prompt.');
      return output;
    } catch (promptError) {
        console.error('[competitionAnalysisFlow] Error during main analysis prompt execution:', promptError);
        let detailedErrorMessage = 'An unexpected error occurred during the analysis prompt.';
        if (promptError instanceof Error) {
            detailedErrorMessage = promptError.message;
        }
        throw new Error(`Competitor analysis failed at the prompt stage: ${detailedErrorMessage}`);
    }
  }
);
