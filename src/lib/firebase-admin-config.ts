
// src/lib/firebase-admin-config.ts
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

let db: admin.firestore.Firestore;

// This is the recommended way to initialize the Firebase Admin SDK in managed environments
// like Cloud Run (used by App Hosting) or Cloud Functions.
// It uses Application Default Credentials and doesn't require storing a service account key file.
try {
    if (admin.apps.length === 0) {
        console.log("[Firebase Admin] No active apps, initializing...");
        admin.initializeApp();
        console.log("[Firebase Admin] Initialized successfully using Application Default Credentials.");
    } else {
        console.log("[Firebase Admin] App already initialized. Using existing instance.");
    }
    // After initialization (or if already initialized), get the Firestore instance.
    db = getFirestore();
} catch (error: any) {
    console.error("[Firebase Admin] CRITICAL: Failed to initialize Firebase Admin SDK.");
    console.error(`[Firebase Admin] Error Code: ${error.code}`);
    console.error(`[Firebase Admin] Error Message: ${error.message}`);
    
    // Provide specific guidance for common errors.
    if (error.code === 'GOOGLE_APPLICATION_CREDENTIALS_NOT_SET') {
        console.error("[Firebase Admin] This error typically occurs in a local development environment. Make sure you have authenticated with the gcloud CLI by running 'gcloud auth application-default login'.");
    } else if (error.message.includes('Could not refresh access token')) {
         console.error("[Firebase Admin] This error means the server's service account might lack the necessary IAM permissions. For App Hosting, ensure the underlying Cloud Run service account has the 'Firebase Admin SDK Administrator Service Agent' or 'Editor' role on your project.");
    } else {
        console.error("[Firebase Admin] An unexpected error occurred during initialization. This could be due to network issues or incorrect project configuration.");
    }
    
    // To allow the app to run without crashing, we'll set db to null, but operations will fail.
    // The error will be thrown explicitly in the service layer for clarity.
    db = null as any; 
}


export { db };
