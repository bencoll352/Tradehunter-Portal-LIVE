
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

let firebaseConfig: FirebaseOptions | null = null;
let configSoure = "";

// Try to use App Hosting's FIREBASE_WEBAPP_CONFIG first
if (process.env.FIREBASE_WEBAPP_CONFIG) {
  try {
    firebaseConfig = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
    configSoure = "FIREBASE_WEBAPP_CONFIG";
    console.log("[Firebase Setup] Using FIREBASE_WEBAPP_CONFIG from environment.");
  } catch (e) {
    console.error("[Firebase Setup Error] Failed to parse FIREBASE_WEBAPP_CONFIG. Falling back to NEXT_PUBLIC_ variables.", e);
    firebaseConfig = null; // Ensure fallback if parsing fails
  }
}

// If FIREBASE_WEBAPP_CONFIG wasn't available or failed to parse, use individual NEXT_PUBLIC_ variables
if (!firebaseConfig) {
  configSoure = "NEXT_PUBLIC_FIREBASE_ variables";
  console.log("[Firebase Setup] FIREBASE_WEBAPP_CONFIG not found or failed to parse. Using individual NEXT_PUBLIC_FIREBASE_ variables.");
  firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL, // Optional but can be included
  };
}

// Keys generally required by initializeApp for most services to function correctly.
// Firestore specifically needs projectId to be correct.
const requiredConfigKeysForInit: (keyof FirebaseOptions)[] = [
  'apiKey',
  'authDomain',
  'projectId',
];

let app;
let db: any; // Allow db to be uninitialized if config is bad

if (!getApps().length) {
  let missingKeys = false;
  if (firebaseConfig) {
    for (const key of requiredConfigKeysForInit) {
      if (!firebaseConfig[key]) {
        const envVarSourceDetail = configSoure === "FIREBASE_WEBAPP_CONFIG"
          ? `Expected in the JSON of ${configSoure}.`
          : `Expected as NEXT_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}.`;

        console.error(
`[Firebase Setup Error] Missing Firebase configuration for: ${key}.
Attempted to source from: ${configSoure}. ${envVarSourceDetail}
Please ensure this and other Firebase config variables are correctly set in your .env.local file (for local development) or environment variables (for deployment/App Hosting).
Trader data will NOT be saved or loaded correctly without these.`
        );
        missingKeys = true;
      }
    }
    // Explicitly re-check projectId as it's absolutely critical for Firestore.
    if (!firebaseConfig.projectId) {
        console.error(
`[Firebase Setup Error] Critical: Missing Firebase configuration for projectId. This is essential for Firestore.
Attempted to source from: ${configSoure}.
Please ensure this is set in your environment variables or .env.local file.`
        );
        missingKeys = true; // Ensure this flags as missing if not caught by the loop.
    }

  } else {
    // This should only happen if process.env.FIREBASE_WEBAPP_CONFIG was ill-formatted JSON AND no NEXT_PUBLIC_ vars were set.
    console.error("[Firebase Setup Error] Firebase configuration object could not be constructed from any source. Cannot initialize.");
    missingKeys = true;
  }

  if (missingKeys) {
    console.error("[Firebase Setup Error] Firebase initialization failed due to missing critical configuration. Firestore operations will not work.");
    // db remains undefined, operations will fail with "Firestore not initialized"
  } else {
    try {
      // Non-null assertion used because if firebaseConfig were null, missingKeys would be true.
      app = initializeApp(firebaseConfig!);
      db = getFirestore(app);
      console.log("[Firebase Setup] Firebase initialized successfully using config from", configSoure, "with Project ID:", firebaseConfig!.projectId);
    } catch (error) {
      console.error("[Firebase Setup Error] Error initializing Firebase app with the derived config:", error);
      console.error("[Firebase Setup Error] Config used for initialization attempt:", JSON.stringify(firebaseConfig));
      // db remains undefined
    }
  }
} else {
  app = getApp();
  db = getFirestore(app); // Ensure db is assigned if app already exists
  const existingAppProjectId = getApp().options.projectId;
  if (existingAppProjectId) {
    console.log("[Firebase Setup] Firebase app already initialized. Using existing instance for Project ID:", existingAppProjectId);
  } else {
     console.warn("[Firebase Setup] Firebase app already initialized, but its Project ID is undefined. This is unexpected.");
  }
  // Log a warning if the config derived from env vars differs from the already initialized app's config
  if (firebaseConfig && firebaseConfig.projectId && existingAppProjectId !== firebaseConfig.projectId) {
    console.warn(`[Firebase Setup] Warning: An existing Firebase app's projectId ('${existingAppProjectId}') does not match the projectId derived from environment variables ('${firebaseConfig.projectId}'). This could lead to unexpected behavior if multiple configurations are active or if a page reloads with different server-side env resolution.`);
  }
}

// Export a db that might be undefined if initialization failed
export { db };
