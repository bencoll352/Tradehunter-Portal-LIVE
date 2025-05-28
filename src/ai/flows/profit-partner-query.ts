// profit-partner-query.ts
'use server';
/**
 * @fileOverview An AI agent for answering questions about trader performance within a branch.
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

const profitPartnerQueryPrompt = ai.definePrompt({
  name: 'profitPartnerQueryPrompt',
  input: {schema: ProfitPartnerQueryInputSchema},
  output: {schema: ProfitPartnerQueryOutputSchema},
  prompt: `You are a helpful AI agent that answers questions about trader performance, using the provided data.

Trader Data: {{{traderData}}}

Question: {{{query}}}

Answer: `,
});

const profitPartnerQueryFlow = ai.defineFlow(
  {
    name: 'profitPartnerQueryFlow',
    inputSchema: ProfitPartnerQueryInputSchema,
    outputSchema: ProfitPartnerQueryOutputSchema,
  },
  async input => {
    const {output} = await profitPartnerQueryPrompt(input);
    return output!;
  }
);
