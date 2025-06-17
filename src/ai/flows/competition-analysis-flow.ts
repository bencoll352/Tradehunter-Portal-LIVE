
'use server';
/**
 * @fileOverview A Genkit flow to analyze competitor websites.
 *
 * - analyzeCompetitors - A function that handles the competitor analysis process.
 * - CompetitionAnalysisInput - The input type for the analyzeCompetitors function.
 * - CompetitionAnalysisOutput - The return type for the analyzeCompetitors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { fetchWebsiteContentTool, type FetchWebsiteContentOutput } from '@/ai/tools/fetch-website-content-tool';

const CompetitionAnalysisInputSchema = z.object({
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

const CompetitionAnalysisOutputSchema = z.object({
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
Your task is to analyze this information and provide a summary of the local competitive landscape, with a strong emphasis on current offers, promotions, and the specific products or services they relate to.

Focus primarily on:
- **The latest offers, promotions, discounts, or special deals** being advertised. Detail these clearly for each competitor.
- **Crucially, identify the specific products or services these promotions apply to.** For example, if there's a "20% off sale", specify what products or service categories are included in that sale.
- Key services or products being prominently promoted, especially if they are mentioned alongside offers or discounts.
- Any unique selling propositions highlighted in relation to current promotions or promoted products/services.

Also consider:
- Recent news, blog posts, or events that might tie into current offers on specific products/services.
- The general tone and target audience for these promotions and the products/services they feature.
- Any discernible local market trends related to promotional activities and product/service focus based on the collective information.
- Identify any unique strengths or weaknesses you can infer for each competitor based *solely* on the provided text and their promotional strategies for specific products/services.

Structure your analysis clearly. For each website, first list its offers/promotions and the **specific products/services involved**, then provide a brief summary of other relevant points about their promoted offerings. Conclude with an overall synthesis of the competitive promotional landscape, emphasizing product/service focus.
Be concise and focus on actionable insights that would be valuable to a builders' merchant manager.
If content for a website is missing, insufficient, or an error message is provided instead of content, acknowledge this in your analysis for that specific URL and explain that you cannot analyze it deeply. Do not attempt to guess or fetch information yourself. Base your analysis *only* on the provided text.

Competitor Website Information:
{{#each sitesData}}
Website URL: {{{url}}}
{{#if error}}
Error Fetching Content: {{{error}}}
{{else if content}}
Content Summary & Promotions (with focus on products/services):
(Provide a brief summary of the key points, focusing on offers, promotions and the specific products/services they apply to from the website content below if available and relevant. State if content is minimal or uninformative regarding promoted products/services.)
"""
{{{content}}}
"""
{{else}}
Content: No content provided or content was empty.
{{/if}}
---
{{/each}}

Provide your overall analysis of the competitive promotional landscape, focusing on promoted products/services:
`,
});

const competitionAnalysisFlow = ai.defineFlow(
  {
    name: 'competitionAnalysisFlow',
    inputSchema: CompetitionAnalysisInputSchema,
    outputSchema: CompetitionAnalysisOutputSchema,
    tools: [fetchWebsiteContentTool] // Make the tool available to the flow context
  },
  async (input: CompetitionAnalysisInput): Promise<CompetitionAnalysisOutput> => {
    console.log(`[competitionAnalysisFlow] Starting analysis for ${input.websiteUrls.length} URLs.`);

    const sitesData: FetchWebsiteContentOutput[] = [];

    for (const url of input.websiteUrls) {
      try {
        // Explicitly call the tool for each URL.
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

