// src/lib/trader-service-firestore.ts
import { getApps, getApp, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;
if (getApps().length === 0) {
  app = initializeApp();
} else {
  app = getApp();
}

const db = getFirestore(app);

export { db };
