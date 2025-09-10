
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin.
// This will also initialize the default Firebase Admin app instance if not already present.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});

// Define model constants for easy reference
export const geminiPro = 'gemini-1.0-pro-latest';
export const geminiProVision = 'gemini-pro-vision';
