import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// The dotenv config() call has been moved to src/lib/firebase.ts to ensure it runs
// at the absolute earliest point, which is necessary for server-side Firebase initialization.
// No longer needed here.

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
