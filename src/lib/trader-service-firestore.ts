// src/lib/trader-service-firestore.ts
import { getApps, getApp, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// This file ensures a single instance of the Firebase Admin SDK is used server-side,
// preventing authentication conflicts with other services like Genkit.

let app: App;
// Check if the default app is already initialized
if (getApps().length === 0) {
  // If not, initialize a new default app.
  // This might happen in local development or if this service is run before Genkit.
  app = initializeApp();
  console.log("[Firebase Admin] Initialized a new default Firebase app.");
} else {
  // If an app is already initialized (e.g., by Genkit), get the existing default app.
  // This is the key step to prevent the "already exists" error and auth conflicts.
  app = getApp();
  console.log("[Firebase Admin] Using existing default Firebase app instance.");
}

// Get the Firestore instance from the unified app instance.
const db = getFirestore(app);

export { db };
