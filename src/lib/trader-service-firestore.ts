
import { initializeApp, getApps, App, getApp, type ServiceAccount, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This is a singleton pattern to ensure we only initialize the DB once.
let db: Firestore | null = null;
let adminApp: App | null = null;

function initializeDb(): Firestore {
  if (db) {
    // If the database is already initialized, return the existing instance.
    return db;
  }
  
  try {
    if (adminApp) {
        db = getFirestore(adminApp);
        return db;
    }
    
    let serviceAccount: ServiceAccount | undefined = undefined;

    // The GOOGLE_APPLICATION_CREDENTIALS_JSON env var is the recommended way to securely
    // provide credentials in a server environment.
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        try {
            serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
            console.log('[trader-service-firestore] Using service account from GOOGLE_APPLICATION_CREDENTIALS_JSON.');
        } catch (e) {
            console.error('[trader-service-firestore] Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON. Falling back to default credentials.', e);
            // Don't throw, allow fallback to default credentials
            serviceAccount = undefined;
        }
    } else {
        console.log('[trader-service-firestore] GOOGLE_APPLICATION_CREDENTIALS_JSON is not set. Using Application Default Credentials.');
    }

    const appOptions = serviceAccount ? { credential: cert(serviceAccount) } : {};

    adminApp = getApps().length > 0 ? getApp() : initializeApp(appOptions);

    console.log('[trader-service-firestore] Firebase Admin App initialized.');
    db = getFirestore(adminApp);
    console.log('[trader-service-firestore] Firestore instance obtained.');
    return db;

  } catch (error) {
    console.error('[trader-service-firestore] CRITICAL: Failed to initialize or get Firestore.', error);
    db = null;
    adminApp = null;
    if (error instanceof Error && error.message.includes('Could not load the default credentials')) {
        throw new Error("Server configuration error: Could not connect to the database. Application Default Credentials could not be found.");
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
