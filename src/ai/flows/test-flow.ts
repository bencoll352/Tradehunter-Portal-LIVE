'use server';

import { defineFlow } from '@genkit-ai/core';
import { z } from 'zod';

export const testFlow = defineFlow(
  {
    name: 'testFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (input) => {
    return `You said: ${input}`;
  }
);
