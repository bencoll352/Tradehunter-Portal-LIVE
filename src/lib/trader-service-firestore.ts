
import { initializeApp, getApps, App, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;
if (getApps().length === 0) {
  // If no app is initialized, we initialize one.
  // In a Firebase/Google Cloud environment, initializeApp() can often be called without arguments
  // as it will automatically discover the service account credentials.
  console.log('[trader-service-firestore] Initializing new Firebase Admin app.');
  app = initializeApp();
} else {
  // If an app is already initialized (e.g., by Genkit), we get the existing app.
  // This is the key to preventing authentication conflicts.
  console.log('[trader-service-firestore] Using existing Firebase Admin app.');
  app = getApp();
}

const db = getFirestore(app);

export { db };
