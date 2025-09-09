
import { genkit, GenerationCommonConfig } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { firebase } from "@genkit-ai/firebase";

// Base configuration for AI models
// This configuration is shared across all models.
const sharedConfig: GenerationCommonConfig = {
  temperature: 0.7,
  maxOutputTokens: 1024,
};

// Initialize Genkit with the Google AI plugin
// The API key is automatically sourced from Application Default Credentials
// in a managed environment like Firebase App Hosting.
export const ai = genkit({
  plugins: [
    googleAI(),
    firebase(),
  ],
  logLevel: "debug",
  enableTracingAndMetrics: true,
});

// Define model constants for easy reference
export const geminiPro = 'gemini-1.0-pro-latest';
export const geminiProVision = 'gemini-pro-vision';


// Helper function to apply default configuration to a model
export function getModel(modelName: string, overrides: GenerationCommonConfig = {}) {
    return {
        ...sharedConfig,
        ...overrides,
    };
}
