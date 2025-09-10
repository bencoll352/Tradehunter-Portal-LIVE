// src/lib/trader-service-firestore.ts
import { getFirestore } from 'firebase-admin/firestore';
import { ai } from '@/ai/genkit';

// The 'ai' object from Genkit now manages the singleton Firebase Admin app instance.
// We get the Firestore instance from the app that Genkit has already initialized.
// This prevents authentication conflicts.
const db = getFirestore();

export { db };
