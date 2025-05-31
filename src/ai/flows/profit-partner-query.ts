
// profit-partner-query.ts
'use server';
/**
 * @fileOverview A tool for providing insights on trader performance by querying the Gemini API directly.
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

    // Construct a prompt for Gemini
    let promptText = `You are a helpful assistant for a branch manager.
Your task is to analyze trader data and answer questions.
The primary trader data for the branch is as follows:
--- TRADER DATA START ---
${input.traderData}
--- TRADER DATA END ---

Based on this trader data, please answer the following question: "${input.query}"`;

    if (input.uploadedFileContent) {
      promptText += `

Additionally, consider the following uploaded customer data for context:
--- UPLOADED CUSTOMER DATA START ---
${input.uploadedFileContent}
--- UPLOADED CUSTOMER DATA END ---`;
    }

    promptText += `

Provide a concise, informative, and helpful answer.`;

    console.log('[profitPartnerQueryFlow] Sending constructed prompt to Gemini via Genkit.');
    // console.debug('[profitPartnerQueryFlow] Prompt (snippet):', promptText.substring(0, 500) + (promptText.length > 500 ? '...' : '')); // For debugging if needed

    try {
      // The 'ai' object from src/ai/genkit.ts is configured with googleAI() plugin
      // and a default model (e.g., gemini-2.0-flash).
      // The GOOGLE_API_KEY from the environment will be used by the plugin.
      const response = await ai.generate({
        prompt: promptText,
        // You can add model configuration here if needed, e.g.,
        // model: 'googleai/gemini-pro', // To use a different model than default
        // config: {
        //   temperature: 0.7,
        //   safetySettings: [
        //     { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
        //   ],
        // }
      });

      const answer = response.text; // Correct 1.x syntax
      if (answer === undefined || answer === null || answer.trim() === "") {
        console.error('[profitPartnerQueryFlow] Gemini response was empty or undefined.');
        throw new Error('Received an empty or undefined response from the analysis service.');
      }
      console.log('[profitPartnerQueryFlow] Successfully received answer from Gemini.');
      return { answer };

    } catch (error) {
      console.error('[profitPartnerQueryFlow] Error during call to Gemini via Genkit:', error);
      let errorMessage = 'An error occurred while calling the analysis service.';
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('api key') || error.message.toLowerCase().includes('permission denied') || error.message.toLowerCase().includes('forbidden')) {
          errorMessage = `Analysis service API key or permission issue: ${error.message}. Ensure GOOGLE_API_KEY is correctly set and valid in the environment.`;
        } else if (error.message.toLowerCase().includes('quota')) {
          errorMessage = `Analysis service quota exceeded: ${error.message}. Please check your API quota.`;
        } else {
          errorMessage = `Error calling analysis service: ${error.message}.`;
        }
      }
      // Ensure a new error is thrown to propagate it, or handle as needed
      throw new Error(`${errorMessage} Full details in server logs.`);
    }
  }
);
