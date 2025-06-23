
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
import {z} from 'genkit';
import { fetchWebsiteContent } from '@/ai/tools/fetch-website-content-tool';

const BUILDWISE_INTEL_URL = "https://studio--buildwise-intel.us-central1.hosted.app/";
const DOVER_NAVIGATOR_URL = "https://sales-and-strategy-navigator-dover-302177537641.us-west1.run.app/";

const ProfitPartnerQueryInputSchema = z.object({
  query: z.string().describe('The question about trader performance or a predefined quick action.'),
  traderData: z.string().describe('The current trader data CSV string to use when answering the question. This data pertains to a specific UK branch.'),
  uploadedFileContent: z.string().optional().describe('Optional: Content of an uploaded file (e.g., CSV of customers) for analysis. Expected format: raw text content of the file.'),
});
export type ProfitPartnerQueryInput = z.infer<typeof ProfitPartnerQueryInputSchema>;

const ProfitPartnerQueryOutputSchema = z.object({
  answer: z.string().describe('The answer to the question or analysis result.'),
});
export type ProfitPartnerQueryOutput = z.infer<typeof ProfitPartnerQueryOutputSchema>;

export async function profitPartnerQuery(input: ProfitPartnerQueryInput): Promise<ProfitPartnerQueryOutput> {
  // The Genkit flow will handle API key issues if GOOGLE_API_KEY is missing or invalid.
  return profitPartnerQueryFlow(input);
}

const profitPartnerAnalysisPrompt = ai.definePrompt({
  name: 'profitPartnerAnalysisPrompt',
  input: { schema: ProfitPartnerQueryInputSchema },
  output: { schema: ProfitPartnerQueryOutputSchema },
  tools: [fetchWebsiteContent],
  prompt: `You are a helpful assistant for a UK-based building supplies company's branch manager.
Your primary goal is to analyse trader data and provide actionable insights relevant to the United Kingdom market and the specific operational area of the branch.
You will be given a query, a string of current trader data for the branch (assume this data is from a UK branch), and optionally, content from an uploaded customer file.

New Capability: You can now access external websites using the 'fetchWebsiteContent' tool. This is particularly useful for analyzing two specialized portals:
- The BuildWise Intel portal: ${BUILDWISE_INTEL_URL}
- The Dover Sales & Strategy Navigator (for Dover branch): ${DOVER_NAVIGATOR_URL}

Key Instructions:
1.  **UK Context**: All analysis, recommendations, and information provided must be tailored to the UK market, business practices, and typical customer behaviours in the UK building trade.
2.  **Local Branch Focus & Geographic Relevance**: The provided trader data pertains to a specific local UK branch. Your insights must be highly relevant to this local context. Pay close attention to any geographic indicators within the user's query or the trader data (such as addresses, city names, or postcodes). If such information is available, ensure your analysis is tailored to that specific town, city, region, or postcode area.
3.  **Tool Use for External Data**:
    - If the user's query requires information from the **BuildWise Intel portal** (e.g., "Analyze project LE/001/2025/PL from the portal..."), you MUST use the \`fetchWebsiteContent\` tool with the URL '${BUILDWISE_INTEL_URL}' to get the portal's content.
    - If the user's query mentions the **Dover Sales & Strategy Navigator** or refers to advanced sales intelligence for the Dover branch, you MUST use the \`fetchWebsiteContent\` tool with the URL '${DOVER_NAVIGATOR_URL}'.
    - Integrate the fetched content from the relevant portal with the local trader data to provide comprehensive insights.
4.  **Actionable Insights**: Focus on providing actionable insights, identifying trends, or suggesting specific actions the branch manager can take within their UK operational context.

User's Query:
{{{query}}}

Trader Data (summary format, specific to a UK branch):
{{{traderData}}}

{{#if uploadedFileContent}}
Additional Uploaded Data (e.g., customer list, sales records):
{{{uploadedFileContent}}}
{{/if}}

Based on all the provided information, please generate a concise and helpful answer to the user's query.
If the query asks for a list (e.g., "list all active traders"), provide the list.
If the query is about totals or averages, calculate and provide them.
If the query is open-ended (e.g., "suggest strategies"), provide thoughtful suggestions applicable to a UK building supplies branch.
If the query is explicitly asking to 'estimate project materials' or similar, focus on that estimation task. You should ask for project details (like type of project, dimensions, specific material preferences if any) if they are not provided in the query. Your primary goal for such queries is to list typical materials and quantities for the specified project, using UK common building practices and material names. Do not primarily use the trader data sheet to come up with project ideas for estimation unless the user's query explicitly suggests linking it to a trader or a trend from the trader data.
Be specific and refer to the data where possible.
If the uploaded file content is relevant to the query, incorporate it into your analysis.
If the data seems insufficient to answer the query fully, politely state that and explain what additional information might be needed.
`,
  // The default model is 'googleai/gemini-2.0-flash' as per src/ai/genkit.ts
  // You can add model configuration or safety settings here if needed, for example:
  // model: 'googleai/gemini-1.5-flash-latest', // Or another compatible model
  // config: {
  //   temperature: 0.7,
  //   safetySettings: [
  //     {
  //       category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
  //       threshold: 'BLOCK_NONE', // Example: Adjust safety settings
  //     },
  //   ],
  // },
});

const profitPartnerQueryFlow = ai.defineFlow(
  {
    name: 'profitPartnerQueryFlow',
    inputSchema: ProfitPartnerQueryInputSchema,
    outputSchema: ProfitPartnerQueryOutputSchema,
  },
  async (input: ProfitPartnerQueryInput): Promise<ProfitPartnerQueryOutput> => {
    console.log(`[profitPartnerQueryFlow] Received query: "${input.query}" for Genkit/Gemini analysis.`);
    console.log(`[profitPartnerQueryFlow] Trader data length: ${input.traderData.length} chars`);
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
      return output; // output directly matches ProfitPartnerQueryOutputSchema
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
