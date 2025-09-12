
'use server';

import * as admin from 'firebase-admin';

// This is a singleton to ensure we only initialize Firebase Admin once.
let firebaseAdminInstance: admin.app.App | null = null;

/**
 * Initializes the Firebase Admin SDK if it hasn't been already.
 * This function is designed to be called ONLY on the server-side.
 * It uses service account credentials passed via an environment variable containing the JSON content.
 */
function initializeFirebaseAdmin() {
  // If an app is already initialized, return it to prevent re-initialization.
  if (admin.apps.length > 0) {
      console.log('[Firebase Admin] Using existing Firebase Admin app.');
      return admin.apps[0]!;
  }

  console.log('[Firebase Admin] Initializing new Firebase Admin app...');
  
  // 1. Get the service account JSON from the environment variable.
  const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  
  // 2. Check if the environment variable is set. This is a critical failure point.
  if (!serviceAccountJson) {
    console.error("[Firebase Admin] CRITICAL: The GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set. This is required for server-side operations. The application cannot connect to the database.");
    throw new Error("CRITICAL: The GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set. This is a server configuration issue.");
  }

  try {
    // 3. Parse the JSON string from the environment variable.
    const serviceAccount = JSON.parse(serviceAccountJson);

    // 4. Initialize the Firebase Admin app with the parsed credentials.
    const newInstance = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    
    console.log('[Firebase Admin] Firebase Admin SDK initialized successfully.');
    return newInstance;

  } catch (error: any) {
    // This will catch errors from JSON.parse() if the variable contains invalid JSON.
    console.error('[Firebase Admin] Error initializing Firebase Admin SDK:', error.message);
    throw new Error(`[Firebase Admin] CRITICAL: Could not initialize. This is likely due to a malformed GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable. Please verify it is a valid JSON service account key. Original error: ${error.message}`);
  }
}

// Initialize the app and export the firestore and auth instances.
// This ensures that the initialization runs only once when the module is first imported on the server.
if (!firebaseAdminInstance) {
    try {
        firebaseAdminInstance = initializeFirebaseAdmin();
    } catch (e) {
        console.error("[Firebase Admin] Singleton Initialization failed.", e);
        // We don't re-throw here because the initial error is more descriptive.
        // If we get here, the server is in a non-functional state regarding DB access.
    }
}


// Export the services. If initialization failed, these will throw errors when used.
export const firestore = firebaseAdminInstance!.firestore();
export const auth = firebaseAdminInstance!.auth();
