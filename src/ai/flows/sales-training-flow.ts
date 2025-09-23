'use server';
/**
 * @fileOverview A sales training AI agent that simulates customer interactions.
 *
 * - salesTrainingAgent - A function that handles the sales training role-play conversation.
 * - SalesTrainingInput - The input type for the salesTrainingAgent function.
 * - SalesTrainingOutput - The return type for the salesTrainingAgent function.
 */

import { defineFlow } from '@genkit-ai/core';
import { definePrompt } from '@genkit-ai/ai';
import { z } from 'zod';
import { gemini15Flash } from '../genkit';

// Define the shape of individual messages in the history
const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

// Define the input schema for the sales training agent
export const SalesTrainingInputSchema = z.object({
  scenario: z.string().describe('The sales scenario or customer persona the AI should adopt.'),
  history: z.array(MessageSchema).describe('The history of the conversation so far.'),
  userMessage: z.string().describe('The latest message from the user (the trainee).'),
});
export type SalesTrainingInput = z.infer<typeof SalesTrainingInputSchema>;

// Define the output schema for the sales training agent
export const SalesTrainingOutputSchema = z.object({
  response: z.string().describe("The AI agent's response in character, based on the scenario."),
});
export type SalesTrainingOutput = z.infer<typeof SalesTrainingOutputSchema>;

const salesTrainingPrompt = definePrompt(
  {
    name: 'salesTrainingPrompt',
    inputSchema: SalesTrainingInputSchema,
    outputSchema: SalesTrainingOutputSchema,
  },
  (input) => `
    You are a sales training assistant. Your task is to role-play as a customer based on a provided scenario.
    You must stay in character and respond to the user (the sales trainee) as the customer would.

    **Scenario:**
    ${input.scenario}

    **Conversation History:**
    ${input.history.map((message) => `**${message.role}**: ${message.content}`).join('\n')}

    **Trainee's Latest Message:**
    ${input.userMessage}

    **Your Task:**
    Generate the next response from the perspective of the customer described in the scenario. Be realistic and engaging.
`
);

// Define the Genkit flow
export const salesTrainingFlow = defineFlow(
  {
    name: 'salesTrainingFlow',
    inputSchema: SalesTrainingInputSchema,
    outputSchema: SalesTrainingOutputSchema,
  },
  async (input) => {

    const llmResponse = await salesTrainingPrompt.generate({
        input: input,
        model: gemini15Flash,
    });

    return llmResponse.output()!;
  }
);

// Exported wrapper function to be called by the server action
export async function salesTrainingAgent(input: SalesTrainingInput): Promise<SalesTrainingOutput> {
  return salesTrainingFlow(input);
}
