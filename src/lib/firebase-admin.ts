
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
 * It intelligently switches between emulator and production configurations.
 *
 * @returns {Promise<FirebaseAdminServices>} A promise that resolves to an object containing the initialized Firebase services.
 * @throws {Error} If the environment variable for credentials is not set or is invalid in a production environment.
 */
export async function getFirebaseAdmin(): Promise<FirebaseAdminServices> {
  if (globalThis.__firebaseAdminInstance__) {
    return globalThis.__firebaseAdminInstance__;
  }

  console.log('[Firebase Admin] Getting or Initialising Firebase Admin app...');

  const isEmulator = process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST;
  let app: App;

  if (admin.apps.length > 0) {
    console.log('[Firebase Admin] Using existing Firebase Admin app.');
    app = admin.app();
  } else if (isEmulator) {
    // For local development with emulators, we don't need service account credentials.
    // The SDK will automatically connect to the emulators if the respective
    // _EMULATOR_HOST environment variables are set by the Firebase CLI.
    console.log('[Firebase Admin] Emulator environment detected. Initialising app without credentials...');
    app = admin.initializeApp({
      // Using a default project ID for emulator is fine.
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
    });
  } else {
    // For production or environments without emulators, we require the service account credentials.
    console.log('[Firebase Admin] Production or non-emulator environment detected. Initialising with service account credentials...');
    const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

    if (!serviceAccountJson) {
      throw new Error(
        '[Firebase Admin] CRITICAL: The GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set. This is required for server-side operations in a non-emulator environment. Check your .env.local file or server configuration.'
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

    app = admin.initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }

  console.log('[Firebase Admin] Firebase Admin SDK instance is ready.');

  globalThis.__firebaseAdminInstance__ = {
    app: app,
    firestore: app.firestore(),
    auth: app.auth(),
  };

  return globalThis.__firebaseAdminInstance__;
}
