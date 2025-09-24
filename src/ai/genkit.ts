'use server';
import {genkit, ai} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

genkit({
  plugins: [googleAI()],
});

export {ai};
