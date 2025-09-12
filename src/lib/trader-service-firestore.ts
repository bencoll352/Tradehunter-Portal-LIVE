
import { initializeApp, getApps, App, getApp, type ServiceAccount } from 'firebase-admin/app';
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
      
      // When running in a Google Cloud environment (like App Hosting),
      // the SDK can often find the credentials automatically.
      // If not, it might require explicit configuration.
      const serviceAccountKey = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON 
        ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
        : undefined;

      app = initializeApp(serviceAccountKey ? { credential: { projectId: serviceAccountKey.project_id, clientEmail: serviceAccountKey.client_email, privateKey: serviceAccountKey.private_key } as ServiceAccount } : {});
      
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
    throw new Error("Server configuration error: Could not connect to the database. This might be due to missing or incorrect service account credentials.");
  }
}

/**
 * Returns a Firestore database instance.
 * It ensures that Firebase is initialized before returning the instance.
 * @returns {Firestore} The Firestore database instance.
 * @throws {Error} If Firestore is not initialized and cannot be connected.
 */
export function getDb(): Firestore {
    try {
        const firestore = initializeDb();
        if (!firestore) {
            // This case should theoretically be covered by initializeDb throwing, but as a safeguard:
            throw new Error("Firestore not initialized. Cannot perform database operations.");
        }
        return firestore;
    } catch (error) {
        console.error("[getDb] Error obtaining Firestore instance: ", error);
        // Re-throw the error to ensure the calling function knows about the failure.
        throw error;
    }
}
