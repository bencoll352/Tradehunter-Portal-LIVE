// src/lib/trader-service-firestore.ts
import { getFirestore } from 'firebase-admin/firestore';
import { ai } from '@/ai/genkit'; // Import genkit to ensure it's initialized first

// The 'ai' object from Genkit now manages the singleton Firebase Admin app instance.
// We get the Firestore instance from the app that Genkit has already initialized.
// This prevents authentication conflicts.
const app = ai.getFirebaseApp();
const db = getFirestore(app);

export { db };
