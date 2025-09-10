// src/lib/trader-service-firestore.ts
import { getApps, getApp, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;
if (getApps().length === 0) {
  // If no app is initialized, it's likely Genkit or another service will initialize it.
  // In a server environment managed by Firebase (like Cloud Functions or App Hosting),
  // initializeApp() can often be called without arguments.
  app = initializeApp();
} else {
  // If an app is already initialized (e.g., by Genkit), get that app.
  app = getApp();
}

const db = getFirestore(app);

export { db };
