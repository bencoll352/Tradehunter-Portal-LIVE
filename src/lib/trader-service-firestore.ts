// src/lib/trader-service-firestore.ts
import { getApps, getApp, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;
if (getApps().length === 0) {
  app = initializeApp();
  console.log("[Firebase Admin] Initialized a new default Firebase app.");
} else {
  app = getApp();
  console.log("[Firebase Admin] Using existing default Firebase app instance.");
}

const db = getFirestore(app);

export { db };
