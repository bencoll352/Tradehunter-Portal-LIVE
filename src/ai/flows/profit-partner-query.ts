
// profit-partner-query.ts
'use server';
/**
 * @fileOverview An AI agent for answering questions about trader performance within a branch.
 * This agent now forwards queries to an external service and can include uploaded file content.
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

const EXTERNAL_AI_URL = 'https://copy-of-jewson-branch-booster-302177537641.us-west1.run.app/';

const profitPartnerQueryFlow = ai.defineFlow(
  {
    name: 'profitPartnerQueryFlow',
    inputSchema: ProfitPartnerQueryInputSchema,
    outputSchema: ProfitPartnerQueryOutputSchema,
  },
  async (input: ProfitPartnerQueryInput): Promise<ProfitPartnerQueryOutput> => {
    try {
      // The external service needs to be able to handle the `uploadedFileContent` field
      // if it's present in the payload.
      const payload = {
        query: input.query,
        traderData: input.traderData,
        ...(input.uploadedFileContent && { customerDataFileContent: input.uploadedFileContent }),
      };

      const response = await fetch(EXTERNAL_AI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`External service error: ${response.status} ${response.statusText}`, errorBody);
        throw new Error(`Failed to get response from external service. Status: ${response.status}`);
      }

      const result = await response.json();

      // Ensure the result matches the expected output schema
      if (typeof result.answer === 'string') {
        return { answer: result.answer };
      } else {
        console.error('External service returned an unexpected response format:', result);
        throw new Error('External service returned an unexpected response format.');
      }
    } catch (error) {
      console.error('Error calling external service:', error);
      if (error instanceof Error) {
        throw new Error(`Error calling external service: ${error.message}`);
      }
      throw new Error('An unknown error occurred while calling the external service.');
    }
  }
);
