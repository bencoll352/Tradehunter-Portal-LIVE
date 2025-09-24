import { gemini15Flash as genkitGemini15Flash } from '@genkit-ai/googleai';
import { configureGenkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';

configureGenkit({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export const gemini15Flash = {
    ...genkitGemini15Flash,
    name: 'gemini-1.5-flash',
    description: 'Google\'s fast and versatile multimodal model.',
};