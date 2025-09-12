
import * as admin from 'firebase-admin';

// This is a singleton to ensure we only initialize Firebase Admin once.
let firebaseAdmin: {
  firestore: admin.firestore.Firestore;
  auth: admin.auth.Auth;
} | null = null;

/**
 * Initializes the Firebase Admin SDK if it hasn't been already.
 * This function is designed to be called on the server-side.
 * It uses service account credentials passed via environment variables.
 */
export async function getFirebaseAdmin() {
  if (firebaseAdmin) {
    return firebaseAdmin;
  }

  // Check if the app is already initialized
  if (admin.apps.length === 0) {
    console.log('[Firebase Admin] Initializing new Firebase Admin app...');
    try {
      const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
      if (!serviceAccountJson) {
        throw new Error("The GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set.");
      }

      const serviceAccount = JSON.parse(serviceAccountJson);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
      console.log('[Firebase Admin] Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
      console.error('[Firebase Admin] Error initializing Firebase Admin SDK:', error.message);
      throw new Error(`[Firebase Admin] CRITICAL: Could not initialize. Check server environment configuration. Error: ${error.message}`);
    }
  } else {
    console.log('[Firebase Admin] Using existing Firebase Admin app.');
  }

  const firestore = admin.firestore();
  const auth = admin.auth();

  firebaseAdmin = { firestore, auth };
  return firebaseAdmin;
}
