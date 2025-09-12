
'use server';

import * as admin from 'firebase-admin';

// This is a singleton to ensure we only initialize Firebase Admin once.
let firebaseAdminInstance: admin.app.App | null = null;

/**
 * Initializes the Firebase Admin SDK if it hasn't been already.
 * This function is designed to be called ONLY on the server-side.
 * It uses service account credentials passed via environment variables.
 */
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
      console.log('[Firebase Admin] Using existing Firebase Admin app.');
      return admin.apps[0]!;
  }

  console.log('[Firebase Admin] Initializing new Firebase Admin app...');
  try {
    const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    
    if (!serviceAccountJson) {
      throw new Error("The GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set. This is required for server-side operations.");
    }

    // Parse the service account JSON from the environment variable.
    const serviceAccount = JSON.parse(serviceAccountJson);

    const newInstance = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    
    console.log('[Firebase Admin] Firebase Admin SDK initialized successfully.');
    return newInstance;

  } catch (error: any) {
    console.error('[Firebase Admin] Error initializing Firebase Admin SDK:', error.message);
    // Provide a more descriptive error for easier debugging.
    if (error.message.includes('GOOGLE_APPLICATION_CREDENTIALS_JSON')) {
        throw error;
    }
    throw new Error(`[Firebase Admin] CRITICAL: Could not initialize. This is likely due to an invalid or malformed GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable. Please verify it is a valid JSON service account key. Original error: ${error.message}`);
  }
}

// Initialize the app and export the firestore and auth instances.
// This ensures that the initialization runs only once when the module is first imported on the server.
if (!firebaseAdminInstance) {
    firebaseAdminInstance = initializeFirebaseAdmin();
}

export const firestore = firebaseAdminInstance.firestore();
export const auth = firebaseAdminInstance.auth();
