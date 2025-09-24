
'use server';

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { SalesTrainingInputSchema, SalesTrainingOutputSchema } from './sales-training-flow-schema';
import type { SalesTrainingInput, SalesTrainingOutput } from './sales-training-flow-schema';

const salesTrainingPrompt = ai.definePrompt({
  name: 'salesTrainingPrompt',
  input: { schema: z.object({
    scenario: z.string(),
    userMessage: z.string(),
  })},
  output: { schema: SalesTrainingOutputSchema },
  prompt: `You are a sales training agent. The user has defined the following scenario: "{{scenario}}". Your role is to play the part of the customer described in the scenario. Behave according to the scenario, respond to the user's messages, and provide a realistic sales training experience. Do not break character. Do not reveal that you are an AI.`,
});

const salesTrainingFlow = ai.defineFlow(
  {
    name: 'salesTrainingFlow',
    inputSchema: SalesTrainingInputSchema,
    outputSchema: SalesTrainingOutputSchema,
  },
  async (input) => {
    const { scenario, history, userMessage } = input;

    const { output } = await salesTrainingPrompt({
        scenario,
        userMessage,
    }, { history });

    if (!output) {
      return { response: "The agent could not generate a response." };
    }
    
    return output;
  }
);


export async function getSalesTrainingResponse(input: SalesTrainingInput): Promise<SalesTrainingOutput> {
  return salesTrainingFlow(input);
}
