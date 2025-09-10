// src/lib/trader-service-firestore.ts
import { initializeApp, getApps, getApp, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;
if (!getApps().length) {
  // If no app is initialized, Genkit or another process hasn't started one.
  // We will initialize it here. It will use Application Default Credentials
  // in the App Hosting environment.
  app = initializeApp();
  console.log("[Firebase Admin] Initialized default Firebase app.");
} else {
  // If an app is already initialized (likely by Genkit), get the existing one.
  // This prevents the "already exists" error and ensures a single instance.
  app = getApp();
  console.log("[Firebase Admin] Using existing Firebase app instance.");
}

const db = getFirestore(app);

export { db };
