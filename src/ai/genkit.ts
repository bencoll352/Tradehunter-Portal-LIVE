
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin
// The API key is automatically sourced from Application Default Credentials
// in a managed environment like Firebase App Hosting.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  logLevel: "debug",
  enableTracingAndMetrics: false,
});

// Define model constants for easy reference
export const geminiPro = 'gemini-1.0-pro-latest';
export const geminiProVision = 'gemini-pro-vision';
