
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

let firebaseConfig: FirebaseOptions | null = null;
let configSource = ""; // Corrected variable name

// Try to use App Hosting's FIREBASE_WEBAPP_CONFIG first
if (process.env.FIREBASE_WEBAPP_CONFIG) {
  try {
    firebaseConfig = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
    configSource = "FIREBASE_WEBAPP_CONFIG";
    console.log("[Firebase Setup] Using FIREBASE_WEBAPP_CONFIG from environment. Check SERVER-SIDE console for details.");
  } catch (e) {
    console.error("[Firebase Setup Error] Failed to parse FIREBASE_WEBAPP_CONFIG. Falling back to NEXT_PUBLIC_ variables. Check SERVER-SIDE console for details.", e);
    firebaseConfig = null; // Ensure fallback if parsing fails
  }
}

// If FIREBASE_WEBAPP_CONFIG wasn't available or failed to parse, use individual NEXT_PUBLIC_ variables
if (!firebaseConfig) {
  configSource = "NEXT_PUBLIC_FIREBASE_ variables";
  console.log("[Firebase Setup] FIREBASE_WEBAPP_CONFIG not found or failed to parse. Using individual NEXT_PUBLIC_FIREBASE_ variables. Check SERVER-SIDE console for details if issues persist.");
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
        const envVarSourceDetail = configSource === "FIREBASE_WEBAPP_CONFIG"
          ? `Expected in the JSON of ${configSource}.`
          : `Expected as NEXT_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}.`;

        console.error( // This log will appear in the server-side console
`[Firebase Setup Error] SERVER-SIDE: Missing Firebase configuration for: ${key}.
Attempted to source from: ${configSource}. ${envVarSourceDetail}
Please ensure this and other Firebase config variables are correctly set in your .env.local file (for local development AND RESTART SERVER) or environment variables (for deployment/App Hosting).
Trader data will NOT be saved or loaded correctly without these. CHECK SERVER LOGS.`
        );
        missingKeys = true;
      }
    }
    // Explicitly re-check projectId as it's absolutely critical for Firestore.
    if (!firebaseConfig.projectId) {
        console.error( // This log will appear in the server-side console
`[Firebase Setup Error] SERVER-SIDE: Critical: Missing Firebase configuration for projectId. This is essential for Firestore.
Attempted to source from: ${configSource}.
Please ensure this is set in your environment variables or .env.local file (AND RESTART SERVER). CHECK SERVER LOGS.`
        );
        missingKeys = true; // Ensure this flags as missing if not caught by the loop.
    }

  } else {
    // This should only happen if process.env.FIREBASE_WEBAPP_CONFIG was ill-formatted JSON AND no NEXT_PUBLIC_ vars were set.
    console.error("[Firebase Setup Error] SERVER-SIDE: Firebase configuration object could not be constructed from any source. Cannot initialize. CHECK SERVER LOGS.");
    missingKeys = true;
  }

  if (missingKeys) {
    console.error("[Firebase Setup Error] SERVER-SIDE: Firebase initialization failed due to missing critical configuration. Firestore operations will not work. CHECK SERVER LOGS.");
    // db remains undefined, operations will fail with "Firestore not initialized"
  } else {
    try {
      // Non-null assertion used because if firebaseConfig were null, missingKeys would be true.
      console.log("[Firebase Setup] SERVER-SIDE: Attempting to initialize Firebase with Project ID:", firebaseConfig!.projectId, "from source:", configSource);
      app = initializeApp(firebaseConfig!);
      db = getFirestore(app);
      console.log("[Firebase Setup] SERVER-SIDE: Firebase initialized successfully using config from", configSource, "with Project ID:", firebaseConfig!.projectId, ". CHECK SERVER LOGS if issues persist.");
    } catch (error) {
      console.error("[Firebase Setup Error] SERVER-SIDE: Error initializing Firebase app with the derived config:", error, ". CHECK SERVER LOGS.");
      console.error("[Firebase Setup Error] SERVER-SIDE: Config used for initialization attempt:", JSON.stringify(firebaseConfig));
      // db remains undefined
    }
  }
} else {
  app = getApp();
  db = getFirestore(app); // Ensure db is assigned if app already exists
  const existingAppProjectId = getApp().options.projectId;
  if (existingAppProjectId) {
    console.log("[Firebase Setup] SERVER-SIDE: Firebase app already initialized. Using existing instance for Project ID:", existingAppProjectId, ". CHECK SERVER LOGS if issues persist.");
  } else {
     console.warn("[Firebase Setup] SERVER-SIDE: Firebase app already initialized, but its Project ID is undefined. This is unexpected. CHECK SERVER LOGS.");
  }
  // Log a warning if the config derived from env vars differs from the already initialized app's config
  if (firebaseConfig && firebaseConfig.projectId && existingAppProjectId !== firebaseConfig.projectId) {
    console.warn(`[Firebase Setup] SERVER-SIDE: Warning: An existing Firebase app's projectId ('${existingAppProjectId}') does not match the projectId derived from environment variables ('${firebaseConfig.projectId}'). This could lead to unexpected behavior. CHECK SERVER LOGS.`);
  }
}

// Export a db that might be undefined if initialization failed
export { db };
