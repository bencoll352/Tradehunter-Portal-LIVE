
// profit-partner-query.ts
'use server';
/**
 * @fileOverview A Branch Booster tool for providing insights on trader performance using Genkit and Google Gemini.
 *
 * - profitPartnerQuery - A function that handles the query process.
 * - ProfitPartnerQueryInput - The input type for the profitPartnerQuery function.
 * - ProfitPartnerQueryOutput - The return type for the profitPartnerQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { fetchWebsiteContent } from '@/ai/tools/fetch-website-content-tool';
import { getTraderDataByBranch } from '@/ai/tools/get-trader-data-tool';

const BUILDWISE_INTEL_URL = "https://studio--buildwise-intel.us-central1.hosted.app/";
const DOVER_NAVIGATOR_URL = "https://sales-and-strategy-navigator-dover-302177537641.us-west1.run.app/";
const LEATHERHEAD_NAVIGATOR_URL = "https://sales-and-strategy-navigator-leatherhead-302177537641.us-west1.run.app/";

const ProfitPartnerQueryInputSchema = z.object({
  query: z.string().describe('The question about trader performance or a predefined quick action.'),
  traderData: z.string().describe('A summary of current trader data CSV string to use when answering the question. This data pertains to a specific UK branch.'),
  uploadedFileContent: z.string().optional().describe('Optional: Content of an uploaded file (e.g., CSV of customers) for analysis. Expected format: raw text content of the file.'),
  branchId: z.string().describe('The base branch ID (e.g., "PURLEY", "DOVER") for which the analysis is being performed. This is crucial for context and for using tools that might require a branch identifier.'),
});
export type ProfitPartnerQueryInput = z.infer<typeof ProfitPartnerQueryInputSchema>;

const ProfitPartnerQueryOutputSchema = z.object({
  answer: z.string().describe('The answer to the question or analysis result.'),
});
export type ProfitPartnerQueryOutput = z.infer<typeof ProfitPartnerQueryOutputSchema>;

export async function profitPartnerQuery(input: ProfitPartnerQueryInput): Promise<ProfitPartnerQueryOutput> {
  return profitPartnerQueryFlow(input);
}

const profitPartnerAnalysisPrompt = ai.definePrompt({
  name: 'profitPartnerAnalysisPrompt',
  input: { schema: ProfitPartnerQueryInputSchema },
  output: { schema: ProfitPartnerQueryOutputSchema },
  tools: [fetchWebsiteContent, getTraderDataByBranch],
  prompt: `You are a helpful assistant for a UK-based building supplies company's branch manager.
Your primary goal is to analyse trader data and provide actionable insights relevant to the United Kingdom market and the specific operational area of the branch.
You will be given a query, a string of current trader data for the branch (assume this data is from a UK branch), and optionally, content from an uploaded customer file.

New Capabilities:
- You can access external websites using the 'fetchWebsiteContent' tool. This is for general web pages or the specialized portals listed below.
- You can fetch a complete, live list of all traders for a specific branch using the 'getTraderDataByBranch' tool. This is the PREFERRED method for getting trader data for analysis, as the 'traderData' input is only a summary.

Key Instructions:
1.  **Use the Right Tool**:
    - For any query that requires a detailed or fresh list of traders (e.g., "List all active traders", "Who is the newest trader?"), you MUST use the \`getTraderDataByBranch\` tool with the provided 'branchId' (e.g., 'PURLEY'). Do NOT rely on the potentially stale 'traderData' summary for these queries.
    - If the user's query requires information from the **BuildWise Intel portal** (e.g., "Analyze project LE/001/2025/PL from the portal..."), you MUST use the \`fetchWebsiteContent\` tool with the URL '${BUILDWISE_INTEL_URL}' to get the portal's content.
    - If the user's query mentions the **Dover Sales & Strategy Navigator**, you MUST use the \`fetchWebsiteContent\` tool with the URL '${DOVER_NAVIGATOR_URL}'.
    - If the user's query mentions the **Leatherhead Sales & Strategy Navigator**, you MUST use the \`fetchWebsiteContent\` tool with the URL '${LEATHERHEAD_NAVIGATOR_URL}'.
2.  **UK Context & Geographic Relevance**: All analysis and recommendations must be tailored to the UK market. The provided branchId ('{{{branchId}}}') is your key piece of geographic information. Tailor your insights to that specific branch's likely location.
3.  **Actionable Insights**: Focus on providing actionable insights, identifying trends, or suggesting specific actions the branch manager can take.
4.  **Material Estimation**: If asked to 'estimate project materials', your goal is to list typical materials and quantities for the specified project, using UK common building practices. Ask for project details if not provided.

User's Query:
{{{query}}}

Branch ID for this query:
{{{branchId}}}

Trader Data (summary format, potentially outdated):
{{{traderData}}}

{{#if uploadedFileContent}}
Additional Uploaded Data (e.g., customer list, sales records):
{{{uploadedFileContent}}}
{{/if}}

Based on all the provided information, please generate a concise and helpful answer to the user's query.
`,
});

const profitPartnerQueryFlow = ai.defineFlow(
  {
    name: 'profitPartnerQueryFlow',
    inputSchema: ProfitPartnerQueryInputSchema,
    outputSchema: ProfitPartnerQueryOutputSchema,
  },
  async (input: ProfitPartnerQueryInput): Promise<ProfitPartnerQueryOutput> => {
    console.log(`[profitPartnerQueryFlow] Received query: "${input.query}" for Genkit/Gemini analysis for branch ${input.branchId}.`);
    console.log(`[profitPartnerQueryFlow] Trader data summary length: ${input.traderData.length} chars`);
    console.log(`[profitPartnerQueryFlow] Uploaded file content present: ${!!input.uploadedFileContent}, length: ${input.uploadedFileContent?.length || 0} chars`);

    if (!process.env.GOOGLE_API_KEY) {
      console.error("[profitPartnerQueryFlow] CRITICAL: GOOGLE_API_KEY environment variable is not set. Branch Booster will not function.");
      throw new Error(`Branch Booster analysis failed: The GOOGLE_API_KEY environment variable is not configured on the server. Please contact support or check server logs.`);
    }

    try {
      const {output} = await profitPartnerAnalysisPrompt(input);

      if (!output || typeof output.answer !== 'string' || output.answer.trim() === "") {
        console.error('[profitPartnerQueryFlow] Genkit/Gemini analysis returned an empty, undefined, or invalid answer. Raw output:', output);
        throw new Error('The analysis service returned an invalid or empty answer.');
      }

      console.log('[profitPartnerQueryFlow] Successfully received answer from Genkit/Gemini analysis.');
      return output;
    } catch (error) {
      console.error('[profitPartnerQueryFlow] Error during Genkit/Gemini analysis:', error);
      let detailedErrorMessage = 'An unexpected error occurred during the analysis.';
      if (error instanceof Error) {
        if (error.message.includes('API key not valid') ||
            error.message.includes('API_KEY_INVALID') ||
            error.message.toLowerCase().includes('api key is missing')) {
          detailedErrorMessage = 'The GOOGLE_API_KEY is invalid or missing. Please check your server environment variables.';
        } else if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
          detailedErrorMessage = 'The analysis service quota has been exceeded. Please try again later or check your Google Cloud project quota.';
        } else if (error.message.includes('Vertex AI API has not been used') || error.message.includes(' služba ভয়ঙ্কর POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=')) {
             detailedErrorMessage = "The Vertex AI API (which Gemini uses) may not be enabled in your Google Cloud project, or there's an issue with its configuration. Please ensure it's enabled, billing is set up, and the correct API (Generative Language API or Vertex AI) is active.";
        } else if (error.message.includes('SAFETY')) {
            detailedErrorMessage = 'The generated response was blocked due to safety settings. Try rephrasing your query or check the content filters.';
        } else {
          detailedErrorMessage = error.message;
        }
      }
      throw new Error(`Branch Booster analysis failed: ${detailedErrorMessage.length > 300 ? detailedErrorMessage.substring(0, 297) + '...' : detailedErrorMessage}. Check server logs for full details.`);
    }
  }
);
