// src/lib/trader-service-firestore.ts
import { getFirestore } from 'firebase-admin/firestore';
import { getApp, getApps } from 'firebase-admin/app';
import { ai } from '@/ai/genkit'; // Import genkit to ensure it's initialized first

// The 'ai' object from Genkit now manages the singleton Firebase Admin app instance.
// We get the Firestore instance from the app that Genkit has already initialized.
// This prevents authentication conflicts.
let app;
if (getApps().length === 0) {
    // This part of the code should ideally not be reached if Genkit initializes first,
    // but it's here as a fallback to ensure an app exists.
    console.warn("[Trader Service] Genkit did not initialize the default app. This is unexpected.");
    app = ai.getFirebaseApp(); // We rely on genkit to create the app.
} else {
    app = getApp(); // Get the default app already initialized by Genkit.
}

const db = getFirestore(app);

export { db };
