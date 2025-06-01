
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// These should be set in your .env.local file for development
// and in your hosting environment variables for production.
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const requiredConfigKeys: (keyof FirebaseOptions)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

let app;
let db: any; // Allow db to be uninitialized if config is bad

if (!getApps().length) {
  let missingKeys = false;
  for (const key of requiredConfigKeys) {
    if (!firebaseConfig[key]) {
      console.error(
`[Firebase Setup Error] Missing Firebase configuration: NEXT_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}. 
Please ensure this and other Firebase config variables are correctly set in your .env.local file (for local development) or environment variables (for deployment). 
Trader data will NOT be saved or loaded correctly without these.`
      );
      missingKeys = true;
    }
  }

  if (missingKeys) {
    console.error("[Firebase Setup Error] Firebase initialization failed due to missing configuration. Firestore operations will not work.");
    // db remains undefined, operations will fail more explicitly
  } else {
    try {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      console.log("[Firebase Setup] Firebase initialized successfully with Project ID:", firebaseConfig.projectId);
    } catch (error) {
      console.error("[Firebase Setup Error] Error initializing Firebase app:", error);
      // db remains undefined
    }
  }
} else {
  app = getApp();
  db = getFirestore(app);
  if (firebaseConfig.projectId) {
    console.log("[Firebase Setup] Firebase app already initialized. Using existing instance for Project ID:", firebaseConfig.projectId);
  } else {
     console.warn("[Firebase Setup] Firebase app already initialized, but current NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing. This might indicate a configuration issue during hot-reloads or in your environment setup.");
  }
}

// Export a db that might be undefined if initialization failed
export { db };
