
'use server';

import * as admin from 'firebase-admin';
import { App, cert } from 'firebase-admin/app';
import { Firestore } from 'firebase-admin/firestore';
import { Auth } from 'firebase-admin/auth';

// Define a type for the services to ensure type safety.
interface FirebaseAdminServices {
  app: App;
  firestore: Firestore;
  auth: Auth;
}

// Use 'globalThis' to create a global variable for the singleton.
// This is robust against hot-reloading in development environments.
declare global {
  // eslint-disable-next-line no-var
  var __firebaseAdminInstance__: FirebaseAdminServices | undefined;
}

/**
 * Initializes and/or returns the Firebase Admin SDK services.
 * This function uses a global singleton to prevent re-initialization.
 *
 * @returns {Promise<FirebaseAdminServices>} A promise that resolves to an object containing the initialized Firebase services.
 * @throws {Error} If the environment variable for credentials is not set or is invalid.
 */
export async function getFirebaseAdmin(): Promise<FirebaseAdminServices> {
  if (globalThis.__firebaseAdminInstance__) {
    return globalThis.__firebaseAdminInstance__;
  }

  console.log('[Firebase Admin] Getting or Initialising Firebase Admin app...');

  const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!serviceAccountJson) {
    throw new Error(
      '[Firebase Admin] CRITICAL: The GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set. This is required for server-side operations. Check your .env.local file or server configuration.'
    );
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch (error) {
    throw new Error(
      '[Firebase Admin] CRITICAL: Could not parse GOOGLE_APPLICATION_CREDENTIALS_JSON. Please ensure it is a valid, non-escaped JSON string.'
    );
  }

  let app: App;
  if (admin.apps.length === 0) {
    console.log('[Firebase Admin] Initialising new Firebase Admin app...');
    app = admin.initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } else {
    console.log('[Firebase Admin] Using existing Firebase Admin app.');
    app = admin.app();
  }
  
  console.log('[Firebase Admin] Firebase Admin SDK instance is ready.');

  globalThis.__firebaseAdminInstance__ = {
    app: app,
    firestore: app.firestore(),
    auth: app.auth(),
  };

  return globalThis.__firebaseAdminInstance__;
}
