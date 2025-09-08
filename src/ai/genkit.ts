
import { genkit, GenerationCommonConfig } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Centralized configuration for safety settings
const defaultSafetySettings = [
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_ONLY_HIGH',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_ONLY_HIGH',
  },
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_ONLY_HIGH',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_ONLY_HIGH',
  },
];

// Centralized configuration for all models
const sharedModelConfig: GenerationCommonConfig = {
  temperature: 0.3,
  maxOutputTokens: 2048,
  safetySettings: defaultSafetySettings,
};


export const ai = genkit({
  plugins: [
    googleAI({
      // The API key is usually automatically sourced from the GOOGLE_API_KEY environment variable
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export const geminiPro = 'gemini-1.0-pro-latest';
export const geminiProVision = 'gemini-1.0-pro-vision-latest';


// Helper function to apply default configuration to a model
export function getModel(modelName: string, overrides: GenerationCommonConfig = {}) {
  return {
    model: modelName,
    config: {
      ...sharedModelConfig,
      ...overrides,
    }
  };
}
