
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
      app = initializeApp();
    } else {
      app = getApp();
    }

    db = getFirestore(app);
    return db;

  } catch (error) {
    console.error('[trader-service-firestore] CRITICAL: Failed to initialize or get Firestore.', error);
    db = null;
    throw new Error("Server configuration error: Could not connect to the database.");
  }
}

export function getDb(): Firestore {
    const firestore = initializeDb();
    if (!firestore) {
      throw new Error("Firestore not initialized. Cannot perform database operations.");
    }
    return firestore;
}
