
'use server';

import { z } from 'zod';
import { defineFlow } from '@genkit-ai/core';
import { gemini15Flash } from '@/ai/genkit';
import { firebaseAuth } from '@genkit-ai/firebase';

// Define Zod schemas for input and output
export const SalesTrainingInputSchema = z.object({
  scenario: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })),
  userMessage: z.string(),
});

export const SalesTrainingOutputSchema = z.object({
  response: z.string(),
});

export type SalesTrainingInput = z.infer<typeof SalesTrainingInputSchema>;
export type SalesTrainingOutput = z.infer<typeof SalesTrainingOutputSchema>;

// The main flow function
export const salesTrainingAgent = defineFlow(
  {
    name: 'salesTrainingAgent',
    inputSchema: SalesTrainingInputSchema,
    outputSchema: SalesTrainingOutputSchema,
  },
  firebaseAuth((auth) => {
    // No specific auth rules needed for this flow
  }),
  async (input) => {
    const { scenario, history, userMessage } = input;

    const systemInstruction = `You are a sales training agent. The user has defined the following scenario: \"${scenario}\". Your role is to play the part of the customer described in the scenario. Behave according to the scenario, respond to the user's messages, and provide a realistic sales training experience. Do not break character. Do not reveal that you are an AI.`;

    const modelResponse = await gemini15Flash.generate({
      system: systemInstruction,
      history: history,
      prompt: userMessage,
    });

    return {
      response: modelResponse.text(),
    };
  }
);
