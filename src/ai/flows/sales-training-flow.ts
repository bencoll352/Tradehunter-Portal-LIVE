
'use server';
/**
 * @fileOverview A sales training AI agent for role-playing scenarios.
 *
 * - salesTrainingAgent - A function that handles the role-playing conversation.
 * - SalesTrainingInput - The input type for the salesTrainingAgent function.
 * - SalesTrainingOutput - The return type for the salesTrainingAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const SalesTrainingInputSchema = z.object({
  scenario: z.string().describe('A description of the sales scenario to role-play. This sets the context for the agent.'),
  history: z.array(ChatMessageSchema).describe('The history of the conversation so far.'),
  userMessage: z.string().describe("The user's latest message in the conversation."),
});
export type SalesTrainingInput = z.infer<typeof SalesTrainingInputSchema>;

const SalesTrainingOutputSchema = z.object({
  response: z.string().describe("The agent's response in the role-play scenario."),
});
export type SalesTrainingOutput = z.infer<typeof SalesTrainingOutputSchema>;

export async function salesTrainingAgent(input: SalesTrainingInput): Promise<SalesTrainingOutput> {
  return salesTrainingFlow(input);
}

const salesTrainingFlow = ai.defineFlow(
  {
    name: 'salesTrainingFlow',
    inputSchema: SalesTrainingInputSchema,
    outputSchema: SalesTrainingOutputSchema,
  },
  async (input) => {
    const { scenario, history, userMessage } = input;

    const systemPrompt = `You are a sales training assistant. Your task is to role-play as a customer based on the provided scenario. Your responses should be realistic, challenging but fair, to help the user practice their sales skills.

Stay in character as the customer described in the scenario. Do not break character or reveal that you are an AI. Interact with the user based on their messages.

SCENARIO:
${scenario}

Engage in a natural conversation. If the user asks a question, answer it from the customer's perspective. If they try to sell you something, react as that customer would. Your goal is to simulate a real sales interaction.`;

    const fullHistory = [
        ...history,
        { role: 'user' as const, content: userMessage },
    ];

    const { output } = await ai.generate({
      prompt: {
        system: systemPrompt,
        messages: fullHistory,
      },
      output: {
        schema: z.object({ response: z.string() })
      }
    });

    return output!;
  }
);
