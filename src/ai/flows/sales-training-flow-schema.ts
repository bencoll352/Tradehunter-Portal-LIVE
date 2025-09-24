'use server';

import { z } from 'zod';

export const SalesTrainingInputSchema = z.object({
  scenario: z.string().describe('The sales scenario context.'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
      })
    )
    .optional()
    .describe('The history of the conversation.'),
  userMessage: z.string().describe("The user's most recent message."),
});

export type SalesTrainingInput = z.infer<typeof SalesTrainingInputSchema>;

export const SalesTrainingOutputSchema = z.object({
  response: z.string().describe("The agent's response."),
});

export type SalesTrainingOutput = z.infer<typeof SalesTrainingOutputSchema>;
