// src/lib/trader-service-firestore.ts
import { getFirestore } from 'firebase-admin/firestore';
import { getApp } from 'firebase-admin/app';
import { ai } from '@/ai/genkit';

// The 'ai' object from Genkit now manages the singleton Firebase Admin app instance.
// We get the Firestore instance from the app that Genkit has already initialized.
// This prevents authentication conflicts. The key fix is ensuring we get the app
// that Genkit is using, NOT the default app. We can use getApp() without arguments
// here as Genkit ensures the default app is initialized and configured.
const db = getFirestore(getApp());

export { db };
