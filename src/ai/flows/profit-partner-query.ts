
// profit-partner-query.ts
'use server';
/**
 * @fileOverview A tool for providing insights on trader performance within a branch.
 * This tool forwards queries to an external service and can include uploaded file content.
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

// IMPORTANT: If you are receiving 404 errors, this URL might be incomplete.
// The external service might expect POST requests to a specific path, e.g.:
// https://branch-booster-purley-302177537641.us-west1.run.app/api/invoke
// https://branch-booster-purley-302177537641.us-west1.run.app/query
// Please verify the exact and full endpoint URL from your service's deployment details.
const EXTERNAL_AI_URL = 'https://branch-booster-purley-302177537641.us-west1.run.app/'; 
const API_KEY = process.env.BRANCH_BOOSTER_API_KEY;

const profitPartnerQueryFlow = ai.defineFlow(
  {
    name: 'profitPartnerQueryFlow',
    inputSchema: ProfitPartnerQueryInputSchema,
    outputSchema: ProfitPartnerQueryOutputSchema,
  },
  async (input: ProfitPartnerQueryInput): Promise<ProfitPartnerQueryOutput> => {
    console.log(`[profitPartnerQueryFlow] Attempting to call external service at URL: ${EXTERNAL_AI_URL}`);
    console.log(`[profitPartnerQueryFlow] Query: "${input.query}"`);
    console.log(`[profitPartnerQueryFlow] Trader data length: ${input.traderData.length} chars`);
    console.log(`[profitPartnerQueryFlow] Uploaded file content present: ${!!input.uploadedFileContent}, length: ${input.uploadedFileContent?.length || 0} chars`);
    
    if (API_KEY) {
      console.log('[profitPartnerQueryFlow] Using API Key for authorization.');
    } else {
      console.warn('[profitPartnerQueryFlow] BRANCH_BOOSTER_API_KEY is not set. Request will be made without Authorization header. If your service requires an API key, this will likely cause 401/403 errors.');
    }

    try {
      const payload = {
        query: input.query,
        traderData: input.traderData,
        ...(input.uploadedFileContent && { customerDataFileContent: input.uploadedFileContent }),
      };
      const payloadString = JSON.stringify(payload);
      const payloadSnippet = payloadString.substring(0, 500) + (payloadString.length > 500 ? '...' : '');
      console.log('[profitPartnerQueryFlow] Sending payload (snippet):', payloadSnippet);

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (API_KEY) {
        headers['Authorization'] = `Bearer ${API_KEY}`;
      }

      const response = await fetch(EXTERNAL_AI_URL, {
        method: 'POST',
        headers: headers,
        body: payloadString,
      });

      console.log(`[profitPartnerQueryFlow] Received response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorBody = await response.text();
        const errorBodySnippet = errorBody.substring(0, 500) + (errorBody.length > 500 ? '...' : '');
        console.error(`[profitPartnerQueryFlow] External service error: ${response.status} ${response.statusText}. Error Body (snippet):`, errorBodySnippet);
        
        if (response.status === 404) {
             throw new Error(`Failed to get response from external service: Status 404 (Not Found). This most often means the EXTERNAL_AI_URL ("${EXTERNAL_AI_URL}") is missing a specific path (e.g., /api/invoke or /query) or the endpoint itself is not correctly deployed. An API key was ${API_KEY ? 'sent' : 'NOT sent'}. Please verify the full URL. Full details in server logs.`);
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Failed to get response from external service: Status ${response.status} (${response.statusText}). This indicates an Authentication/Authorization issue. An API key was ${API_KEY ? 'sent' : 'NOT sent'}. Please verify the BRANCH_BOOSTER_API_KEY and ensure the external service accepts it in the 'Authorization: Bearer <key>' header. Full details in server logs.`);
        }
        throw new Error(`Failed to get response from external service. Status: ${response.status}. An API key was ${API_KEY ? 'sent' : 'NOT sent'}. Full details in server logs.`);
      }

      const resultText = await response.text();
      let result;
      try {
        result = JSON.parse(resultText);
      } catch (jsonError) {
        const resultTextSnippet = resultText.substring(0, 500) + (resultText.length > 500 ? '...' : '');
        console.error('[profitPartnerQueryFlow] Failed to parse response as JSON. Response text (snippet):', resultTextSnippet, 'Original Error:', jsonError);
        throw new Error('External service returned a non-JSON response. Expected format: {"answer": "string"}. Full details in server logs.');
      }
      
      const resultString = JSON.stringify(result);
      const resultSnippet = resultString.substring(0, 500) + (resultString.length > 500 ? '...' : '');
      console.log('[profitPartnerQueryFlow] Received result from external service (snippet):', resultSnippet);

      if (result && typeof result.answer === 'string') {
        return { answer: result.answer };
      } else {
        console.error('[profitPartnerQueryFlow] External service returned an unexpected response format. Expected { answer: string }, Got (snippet):', resultSnippet);
        throw new Error('External service returned an unexpected response format. Expected format: {"answer": "string"}. Full details in server logs.');
      }
    } catch (error) {
      console.error('[profitPartnerQueryFlow] Error during call to external service:', error);
      if (error instanceof Error) {
        throw new Error(`Error calling external service: ${error.message}. Please verify the EXTERNAL_AI_URL ("${EXTERNAL_AI_URL}") and ensure the service is operational. Full details in server logs.`);
      }
      throw new Error(`An unknown error occurred while calling the external service. Please verify the EXTERNAL_AI_URL ("${EXTERNAL_AI_URL}") and ensure the service is operational. Full details in server logs.`);
    }
  }
);

