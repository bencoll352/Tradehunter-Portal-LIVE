
// src/lib/firebase-admin-config.ts
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

let db: admin.firestore.Firestore;

try {
    if (admin.apps.length === 0) {
        // In many managed environments (like Google Cloud Run, which App Hosting uses),
        // the Admin SDK can automatically detect the project's service account credentials
        // without needing a service account key file or environment variable.
        admin.initializeApp();
        console.log("[Firebase Admin] Initialized successfully using default credentials.");
    } else {
        console.log("[Firebase Admin] Already initialized.");
    }
    db = getFirestore();
} catch (error) {
    console.error("[Firebase Admin] Error initializing app:", error);
    // If running locally without default credentials, this will fail.
    // The previous implementation with FIREBASE_SERVICE_ACCOUNT_KEY can be used as a fallback for local dev if needed,
    // but the default credential method is preferred for deployed environments.
    console.error("[Firebase Admin] This might happen if you are running locally without the gcloud CLI authenticated or a service account key. For deployed environments, ensure the runtime service account has 'Firebase Admin SDK Administrator Service Agent' role.");
    // To allow the app to run without crashing, we'll set db to null, but operations will fail.
    db = null as any; 
}


export { db };

