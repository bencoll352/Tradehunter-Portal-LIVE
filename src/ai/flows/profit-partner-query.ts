
// profit-partner-query.ts
'use server';
/**
 * @fileOverview An AI agent for answering questions about trader performance within a branch.
 * This agent now forwards queries to an external service.
 *
 * - profitPartnerQuery - A function that handles the query process.
 * - ProfitPartnerQueryInput - The input type for the profitPartnerQuery function.
 * - ProfitPartnerQueryOutput - The return type for the profitPartnerQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProfitPartnerQueryInputSchema = z.object({
  query: z.string().describe('The question about trader performance.'),
  traderData: z.string().describe('The trader data to use when answering the question.'),
});
export type ProfitPartnerQueryInput = z.infer<typeof ProfitPartnerQueryInputSchema>;

const ProfitPartnerQueryOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
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
      const response = await fetch(EXTERNAL_AI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`External AI service error: ${response.status} ${response.statusText}`, errorBody);
        throw new Error(`Failed to get response from external AI service. Status: ${response.status}`);
      }

      const result = await response.json();

      // Ensure the result matches the expected output schema
      if (typeof result.answer === 'string') {
        return { answer: result.answer };
      } else {
        console.error('External AI service returned an unexpected response format:', result);
        throw new Error('External AI service returned an unexpected response format.');
      }
    } catch (error) {
      console.error('Error calling external AI service:', error);
      if (error instanceof Error) {
        throw new Error(`Error calling external AI service: ${error.message}`);
      }
      throw new Error('An unknown error occurred while calling the external AI service.');
    }
  }
);
