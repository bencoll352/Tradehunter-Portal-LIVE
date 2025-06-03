
// profit-partner-query.ts
'use server';
/**
 * @fileOverview A tool for providing insights on trader performance by making a request to an external analysis service.
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

const EXTERNAL_ANALYSIS_URL = 'https://branch-booster-purley-302177537641.us-west1.run.app/';

const profitPartnerQueryFlow = ai.defineFlow(
  {
    name: 'profitPartnerQueryFlow',
    inputSchema: ProfitPartnerQueryInputSchema,
    outputSchema: ProfitPartnerQueryOutputSchema,
  },
  async (input: ProfitPartnerQueryInput): Promise<ProfitPartnerQueryOutput> => {
    console.log(`[profitPartnerQueryFlow] Received query: "${input.query}" for external service.`);
    console.log(`[profitPartnerQueryFlow] Trader data length: ${input.traderData.length} chars`);
    console.log(`[profitPartnerQueryFlow] Uploaded file content present: ${!!input.uploadedFileContent}, length: ${input.uploadedFileContent?.length || 0} chars`);
    console.log(`[profitPartnerQueryFlow] Calling external analysis service at: ${EXTERNAL_ANALYSIS_URL}`);

    try {
      const response = await fetch(EXTERNAL_ANALYSIS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[profitPartnerQueryFlow] External service returned error: ${response.status} ${response.statusText}. Body: ${errorBody}`);
        throw new Error(`External analysis service failed with status ${response.status}: ${response.statusText}. Details: ${errorBody.substring(0, 200)}...`);
      }

      const responseData = await response.json();

      // Validate the response structure (at least check for the answer field)
      if (!responseData || typeof responseData.answer !== 'string' || responseData.answer.trim() === "") {
        console.error('[profitPartnerQueryFlow] External service response was empty, undefined, or answer field missing/empty/not a string.');
        console.debug('[profitPartnerQueryFlow] Raw response data from external service:', responseData);
        throw new Error('Received an invalid or empty answer from the external analysis service.');
      }

      console.log('[profitPartnerQueryFlow] Successfully received answer from external analysis service.');
      return { answer: responseData.answer };

    } catch (error) {
      console.error('[profitPartnerQueryFlow] Error during call to external analysis service:', error);
      let detailedErrorMessage = 'An unexpected error occurred while communicating with the external analysis service.';
      if (error instanceof Error) {
        if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
            detailedErrorMessage = `Network Error: Could not connect to the external service at ${EXTERNAL_ANALYSIS_URL}. Please ensure the service is running and accessible.`;
        } else if (error.message.startsWith('External analysis service failed with status')) {
            detailedErrorMessage = error.message; // Use the more specific error from the !response.ok block
        } else if (error.message.startsWith('Received an invalid or empty answer')) {
            detailedErrorMessage = error.message; // Use the specific error for bad response structure
        }
         else {
          detailedErrorMessage = error.message;
        }
      }
      // Ensure the error message passed to the client is concise but informative
      throw new Error(`Branch Booster analysis failed: ${detailedErrorMessage.length > 300 ? detailedErrorMessage.substring(0, 297) + '...' : detailedErrorMessage}. Check server logs for full details.`);
    }
  }
);
