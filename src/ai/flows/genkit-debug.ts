'use server';

import { defineFlow } from '@genkit-ai/core';
import { z } from 'zod';

export const debugFlow = defineFlow(
  {
    name: 'debugFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (input) => {
    return `DEBUG: ${input}`;
  }
);
