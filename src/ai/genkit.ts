'use server';
/**
 * @fileOverview Centralised Genkit configuration and AI model exports.
 */

import { configureGenkit } from '@genkit-ai/core';
import { googleAI, gemini15Flash } from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin
configureGenkit({
  plugins: [
    googleAI(),
  ],
});

export { gemini15Flash };
