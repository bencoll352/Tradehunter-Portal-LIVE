
import { initializeApp, getApps, App, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;
let db: ReturnType<typeof getFirestore> | null = null;

try {
  const apps = getApps();
  if (apps.length === 0) {
    // If no app is initialized anywhere in the project, we initialize a new one.
    // In a deployed Google Cloud environment (like Cloud Run, Cloud Functions),
    // calling initializeApp() without arguments automatically discovers the
    // service account credentials.
    console.log('[trader-service-firestore] Initializing a new Firebase Admin app...');
    app = initializeApp();
  } else {
    // If an app has already been initialized (e.g., by Genkit or another part of the app),
    // we retrieve the *existing* default app instance. This is the key to preventing
    // the "The default Firebase app already exists" error and related auth issues.
    console.log('[trader-service-firestore] Using the existing default Firebase Admin app.');
    app = getApp();
  }

  // Get the Firestore instance from the (now guaranteed to be single) app.
  db = getFirestore(app);
  console.log('[trader-service-firestore] Firestore service obtained successfully.');

} catch (error) {
  console.error('[trader-service-firestore] CRITICAL: Failed to initialize or get Firestore.', error);
  // Set db to null so the application can gracefully handle the lack of a database connection.
  db = null;
}


export { db };
