
// profit-partner-query.ts
'use server';
/**
 * @fileOverview A tool for providing insights on trader performance by querying the Gemini API directly using Genkit.
 *
 * - profitPartnerQuery - A function that handles the query process.
 * - ProfitPartnerQueryInput - The input type for the profitPartnerQuery function.
 * - ProfitPartnerQueryOutput - The return type for the profitPartnerQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProfitPartnerQueryInputSchema = z.object({
  query: z.string().describe('The question about trader performance or a predefined quick action.'),
  traderData: z.string().describe('The current trader data CSV string to use when answering the question.'),
  uploadedFileContent: z.string().optional().describe('Optional: Content of an uploaded file (e.g., CSV of customers) for analysis. Expected format: raw text content of the file.'),
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
  prompt: `You are a helpful assistant for a branch manager.
Your task is to analyze trader data and answer questions based on the information provided.

The primary trader data for the branch is as follows:
--- TRADER DATA START ---
{{{traderData}}}
--- TRADER DATA END ---

Based on this trader data, please answer the following question: "{{{query}}}"
{{#if uploadedFileContent}}

Additionally, consider the following uploaded customer data for context:
--- UPLOADED CUSTOMER DATA START ---
{{{uploadedFileContent}}}
--- UPLOADED CUSTOMER DATA END ---
{{/if}}

Provide a concise, informative, and helpful answer.
Your response MUST be a JSON object with a single key "answer" that holds your textual response. For example: {"answer": "Your analysis results here."}
`,
});

const profitPartnerQueryFlow = ai.defineFlow(
  {
    name: 'profitPartnerQueryFlow',
    inputSchema: ProfitPartnerQueryInputSchema,
    outputSchema: ProfitPartnerQueryOutputSchema,
  },
  async (input: ProfitPartnerQueryInput): Promise<ProfitPartnerQueryOutput> => {
    console.log(`[profitPartnerQueryFlow] Received query: "${input.query}"`);
    console.log(`[profitPartnerQueryFlow] Trader data length: ${input.traderData.length} chars`);
    console.log(`[profitPartnerQueryFlow] Uploaded file content present: ${!!input.uploadedFileContent}, length: ${input.uploadedFileContent?.length || 0} chars`);

    // The GOOGLE_API_KEY from .env (or Firebase environment variables) will be used by the googleAI() plugin.
    console.log('[profitPartnerQueryFlow] Calling profitPartnerAnalysisPrompt with Genkit.');
    // For debugging, log snippets of the input being passed to the prompt
    console.debug('[profitPartnerQueryFlow] Prompt input (query snippet):', input.query ? input.query.substring(0,100) + (input.query.length > 100 ? '...' : '') : "N/A");
    console.debug('[profitPartnerQueryFlow] Prompt input (traderData snippet):', input.traderData ? input.traderData.substring(0,100) + (input.traderData.length > 100 ? '...' : '') : "N/A");
    if (input.uploadedFileContent) {
      console.debug('[profitPartnerQueryFlow] Prompt input (uploadedFileContent snippet):', input.uploadedFileContent.substring(0,100) + (input.uploadedFileContent.length > 100 ? '...' : ''));
    }


    try {
      const { output } = await profitPartnerAnalysisPrompt(input);

      if (!output || !output.answer || output.answer.trim() === "") {
        console.error('[profitPartnerQueryFlow] Gemini response via prompt was empty, undefined, or answer field missing/empty.');
        throw new Error('Received an empty or undefined answer from the analysis service.');
      }
      console.log('[profitPartnerQueryFlow] Successfully received answer from Gemini via prompt.');
      return output;

    } catch (error) {
      console.error('[profitPartnerQueryFlow] Error during call to Gemini via Genkit prompt:', error);
      let detailedErrorMessage = 'An unexpected error occurred with the analysis service.';
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('api key not found') || error.message.toLowerCase().includes('permission denied') || error.message.toLowerCase().includes('api key invalid') || error.message.toLowerCase().includes('invalid api key')) {
          detailedErrorMessage = `API Key Issue: ${error.message}. Ensure GOOGLE_API_KEY is correctly set in environment variables and is valid.`;
        } else if (error.message.toLowerCase().includes('quota')) {
          detailedErrorMessage = `Quota Exceeded: ${error.message}. Please check your Google AI/Gemini API quota.`;
        } else if (error.message.toLowerCase().includes('model not found')) {
           detailedErrorMessage = `Model Not Found: ${error.message}. The configured Gemini model might be unavailable or incorrect.`;
        } else if (error.message.includes('failed to parse model output') || error.message.includes('output_schema')) {
            detailedErrorMessage = `Model Output Parsing Error: ${error.message}. The model's response might not match the expected JSON format (e.g., {"answer": "..."}). Check the prompt instructions.`;
        } else if (error.message.toLowerCase().includes('400') && error.message.toLowerCase().includes('candidate was blocked due to safety')) {
            detailedErrorMessage = `Content Moderation: ${error.message}. The request or response was blocked by safety filters.`;
        }
         else {
          detailedErrorMessage = error.message;
        }
      }
      throw new Error(`Branch Booster analysis failed: ${detailedErrorMessage} Check server logs for full details.`);
    }
  }
);
