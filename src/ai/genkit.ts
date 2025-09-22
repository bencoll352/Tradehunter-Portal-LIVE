'use server';
/**
 * @fileOverview Centralised Genkit configuration and AI model exports.
 */

import { genkit } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/googleai';
import { file } from '@genkit-ai/googleai/plugins/file';

// Initialize Genkit with the Google AI plugin
export const ai = genkit({
  plugins: [
    googleAI(),
    // Log all traces to a local file.
    file({
      dir: '.genkit',
      filename: 'traces.jsonl',
      type: 'trace',
    }),
    file({
      dir: '.genkit',
      filename: 'flow-state.jsonl',
      type: 'flowState',
    }),
  ],
  // Log all traces to the Firebase console.
  // Make sure to set the GCLOUD_PROJECT environment variable.
  // traceStore: {
  //   provider: 'firebase',
  // },
});

export { gemini15Flash };
