
import { initializeApp, getApps, App, getApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let db: Firestore | null = null;

function initializeDb() {
  if (db) {
    return db;
  }
  
  try {
    const apps = getApps();
    let app: App;
    
    // --- START DIAGNOSTIC LOGGING ---
    console.log(`[trader-service-firestore] Starting DB initialization. Found ${apps.length} existing Firebase Admin app(s).`);
    if (process.env.GCLOUD_PROJECT) {
        console.log(`[trader-service-firestore] Environment variable GCLOUD_PROJECT is set to: "${process.env.GCLOUD_PROJECT}"`);
    } else {
        console.warn(`[trader-service-firestore] WARNING: Environment variable GCLOUD_PROJECT is NOT set. Firebase Admin may not initialize correctly.`);
    }
    // --- END DIAGNOSTIC LOGGING ---

    if (apps.length === 0) {
      console.log('[trader-service-firestore] No existing Firebase Admin app found. Initializing a new default app.');
      app = initializeApp();
    } else {
      console.log('[trader-service-firestore] Found existing Firebase Admin app. Reusing the default app.');
      app = getApp(); // Get the default app already initialized
    }
    
    // --- START DIAGNOSTIC LOGGING ---
    if (app.options.projectId) {
        console.log(`[trader-service-firestore] Successfully obtained app instance for project: "${app.options.projectId}"`);
    } else {
        console.warn(`[trader-service-firestore] WARNING: Obtained app instance has NO projectId. This will likely fail.`);
    }
    // --- END DIAGNOSTIC LOGGING ---

    db = getFirestore(app);
    console.log('[trader-service-firestore] Firestore service obtained successfully.');
    return db;

  } catch (error) {
    console.error('[trader-service-firestore] CRITICAL: Failed to initialize or get Firestore.', error);
    db = null; // Ensure db is null on failure
    throw new Error("Server configuration error: Could not connect to the database.");
  }
}

// Export a function that returns the live DB instance.
// This ensures that the DB is initialized only when first needed.
export function getDb(): Firestore {
    const firestore = initializeDb();
    if (!firestore) {
      console.error("[Trader Service] FATAL: Firestore database instance is not available. This is a server configuration issue.");
      throw new Error("Firestore not initialized. Cannot perform database operations. Please check the server logs for details on the Firebase Admin SDK initialization failure.");
    }
    return firestore;
}
