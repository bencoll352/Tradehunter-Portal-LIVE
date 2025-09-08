
// src/lib/firebase-admin-config.ts
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
let db: admin.firestore.Firestore | null = null;

if (serviceAccountKey) {
    try {
        const serviceAccount = JSON.parse(Buffer.from(serviceAccountKey, 'base64').toString('utf8'));
        if (admin.apps.length === 0) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
             console.log("[Firebase Admin] Initialized successfully.");
        } else {
             console.log("[Firebase Admin] Already initialized.");
        }
        db = getFirestore();
    } catch (error) {
        console.error("[Firebase Admin] Error parsing service account key or initializing app:", error);
        if (serviceAccountKey && !serviceAccountKey.trim().startsWith("{")) {
            console.error("[Firebase Admin] The FIREBASE_SERVICE_ACCOUNT_KEY environment variable does not appear to be a valid JSON object. It might be encoded incorrectly. Please ensure it's a direct JSON string or correctly Base64 encoded.");
        }
    }
} else {
    console.warn("[Firebase Admin] FIREBASE_SERVICE_ACCOUNT_KEY environment variable not found. Server-side Firebase features will be disabled.");
}

export { db };
