
import { initializeApp, getApps, App, getApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This is a singleton pattern to ensure we only initialize the DB once.
let db: Firestore | null = null;

function initializeDb() {
  if (db) {
    // If the database is already initialized, return the existing instance.
    return db;
  }
  
  try {
    const apps = getApps();
    let app: App;
    
    if (apps.length === 0) {
      // If no apps are initialized, initialize a new one.
      // This happens on the first call in a new server environment.
      app = initializeApp();
    } else {
      // If apps already exist, get the default app.
      // This prevents re-initializing, which would cause an error.
      app = getApp();
    }

    console.log('[trader-service-firestore] Firebase Admin App initialized.');
    db = getFirestore(app);
    console.log('[trader-service-firestore] Firestore instance obtained.');
    return db;

  } catch (error) {
    console.error('[trader-service-firestore] CRITICAL: Failed to initialize or get Firestore.', error);
    // In case of any error during initialization, we set db to null and throw
    // to prevent the application from proceeding with a broken database connection.
    db = null;
    throw new Error("Server configuration error: Could not connect to the database.");
  }
}

/**
 * Returns a Firestore database instance.
 * It ensures that Firebase is initialized before returning the instance.
 * @returns {Firestore} The Firestore database instance.
 * @throws {Error} If Firestore is not initialized and cannot be connected.
 */
export function getDb(): Firestore {
    const firestore = initializeDb();
    if (!firestore) {
      throw new Error("Firestore not initialized. Cannot perform database operations.");
    }
    return firestore;
}
