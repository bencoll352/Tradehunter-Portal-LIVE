import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { config } from 'dotenv';

// Force-load environment variables from .env file at the earliest possible point.
// This ensures that firebase.ts has the credentials it needs when it's first imported by the server.
config({ path: '.env' });

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
