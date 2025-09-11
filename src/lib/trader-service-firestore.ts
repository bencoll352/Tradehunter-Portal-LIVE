
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
    if (apps.length === 0) {
      console.log('[trader-service-firestore] Initializing a new Firebase Admin app as none exist.');
      app = initializeApp();
    } else {
      console.log('[trader-service-firestore] Using the existing default Firebase Admin app.');
      app = getApp(); // Get the default app already initialized (likely by Genkit)
    }
    
    console.log('[trader-service-firestore] Firestore service obtained successfully.');
    db = getFirestore(app);
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

    