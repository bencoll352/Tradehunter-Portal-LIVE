
import { initializeApp, getApps, App, getApp, type ServiceAccount, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This is a singleton pattern to ensure we only initialize the DB once.
let db: Firestore | null = null;

function initializeDb(): Firestore {
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
      let serviceAccount: ServiceAccount | undefined = undefined;

      // The GOOGLE_APPLICATION_CREDENTIALS_JSON env var is the recommended way to securely
      // provide credentials in a server environment.
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        try {
          const serviceAccountKey = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
          serviceAccount = serviceAccountKey;
          console.log('[trader-service-firestore] Using service account from GOOGLE_APPLICATION_CREDENTIALS_JSON.');
        } catch (e) {
          console.error('[trader-service-firestore] Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON. Ensure it is a valid JSON string.', e);
          throw new Error("Invalid server configuration: GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON.");
        }
      } else {
         console.warn('[trader-service-firestore] WARNING: GOOGLE_APPLICATION_CREDENTIALS_JSON is not set. The Admin SDK will try to use default credentials. This may fail in some environments.');
      }
      
      app = initializeApp(serviceAccount ? { credential: cert(serviceAccount) } : undefined);
      
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
    if (error instanceof Error && error.message.includes('Could not load the default credentials')) {
        throw new Error("Server configuration error: Could not connect to the database. The GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is likely missing or incorrect for this server environment.");
    }
    throw new Error(`Server configuration error: Could not connect to the database. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
