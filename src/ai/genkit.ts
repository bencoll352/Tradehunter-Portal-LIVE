'use server';
/**
 * @fileOverview Centralized Genkit configuration and AI model exports.
 */

import { genkit } from 'genkit';
import { googleAI, geminiPro } from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin
export const ai = genkit({
  plugins: [
    googleAI({
      // The API key is usually automatically discovered from the GOOGLE_API_KEY
      // environment variable. Specifying it here is optional.
      // apiKey: process.env.GOOGLE_API_KEY,
    }),
  ],
  // Log all traces to the Firebase console.
  // Make sure to set the GCLOUD_PROJECT environment variable.
  // traceStore: {
  //   provider: 'firebase',
  // },
  // Log all traces to a local file.
  traceStore: {
    provider: 'file',
    options: {
      path: '.genkit-traces.jsonl',
    },
  },
  flowStateStore: {
    provider: 'file',
    options: {
      path: '.genkit-flow-state.jsonl',
    }
  }
});

export { geminiPro };
