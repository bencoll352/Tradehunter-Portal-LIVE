
import * as admin from 'firebase-admin';

// This is a singleton to ensure we only initialize Firebase Admin once.
let firebaseAdmin: {
  firestore: admin.firestore.Firestore;
  auth: admin.auth.Auth;
} | null = null;

/**
 * Initializes the Firebase Admin SDK if it hasn't been already.
 * This function is designed to be called on the server-side.
 * It uses Application Default Credentials, which is the standard for Google Cloud environments.
 */
export async function getFirebaseAdmin() {
  if (firebaseAdmin) {
    return firebaseAdmin;
  }

  // Check if the app is already initialized
  if (admin.apps.length === 0) {
    console.log('[Firebase Admin] Initializing new Firebase Admin app...');
    try {
      // Use application default credentials if available
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
      console.log('[Firebase Admin] Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
      console.error('[Firebase Admin] Error initializing Firebase Admin SDK:', error.message);
      // This is a critical error, we should throw it to stop the process.
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
