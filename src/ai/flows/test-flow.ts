'use server';

import { defineFlow } from '@genkit-ai/core';
import { z } from 'zod';

export const testFlow = defineFlow(
  'testFlow',
  z.string(),
  z.string(),
  async (input) => {
    return `You said: ${input}`;
  }
);
