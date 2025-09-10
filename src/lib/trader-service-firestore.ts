// src/lib/trader-service-firestore.ts
import { getApps, getApp, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// This file ensures a single instance of the Firebase Admin SDK is used server-side,
// preventing authentication conflicts with other services like Genkit.

let app: App;
if (!getApps().length) {
  // This code path should not be hit in a typical App Hosting environment
  // where Genkit initializes first. It's a fallback.
  app = require('firebase-admin/app').initializeApp();
  console.log("[Firebase Admin] Initialized a new default Firebase app as a fallback.");
} else {
  // If an app is already initialized (e.g., by Genkit), get the existing default app.
  // This is the key step to prevent the "already exists" error and auth conflicts.
  app = getApp();
  console.log("[Firebase Admin] Using existing default Firebase app instance.");
}

// Get the Firestore instance from the unified app instance.
const db = getFirestore(app);

export { db };
