'use server';
/**
 * @fileOverview Centralized Genkit configuration and AI model exports.
 */

import { genkit, geminiPro } from '@genkit-ai/googleai';
import { googleAI } from '@genkit-ai/googleai';
import { configureGenkit } from 'genkit';

// Initialize Genkit with the Google AI plugin
export const ai = genkit({
  plugins: [googleAI()],
});

export { geminiPro };
