
// src/lib/trader-service-firestore.ts
import { getApps, getApp, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import 'firebase-admin/auth'; // Ensure auth module is included

// This is the correct way to initialize the Firebase Admin SDK on the server.
// It ensures that we don't try to initialize the app more than once, which is a common
// source of errors, especially in a Next.js server environment with hot-reloading.
let app: App;
if (getApps().length === 0) {
  // If no app is initialized, we initialize one.
  // In a Firebase/Google Cloud environment, initializeApp() can often be called without arguments
  // as it will automatically discover the service account credentials.
  console.log('[Trader Service Firestore] Initializing new Firebase Admin App.');
  app = initializeApp();
} else {
  // If an app is already initialized (e.g., by Genkit), we get the existing app.
  // This is the key to preventing authentication conflicts.
  console.log('[Trader Service Firestore] Using existing Firebase Admin App.');
  app = getApp();
}

const db = getFirestore(app);

export { db };
