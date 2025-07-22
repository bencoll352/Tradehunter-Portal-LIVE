// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { config } from 'dotenv';

// Force-load environment variables from .env file at the earliest possible point.
// This is the definitive fix to ensure Firebase has the credentials it needs when this module is imported.
config({ path: '.env' });

let firebaseConfig: FirebaseOptions | null = null;
let configSource = ""; // To track where the config came from

// Try to use App Hosting's FIREBASE_WEBAPP_CONFIG first
if (process.env.FIREBASE_WEBAPP_CONFIG) {
  try {
    firebaseConfig = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
    configSource = "FIREBASE_WEBAPP_CONFIG (from Firebase Hosting)";
    // SERVER-SIDE log: Indicates attempt to use App Hosting's specific env var.
    console.log("[Firebase Setup] SERVER-SIDE: Attempting to use FIREBASE_WEBAPP_CONFIG environment variable.");
  } catch (e) {
    // SERVER-SIDE log: Parsing FIREBASE_WEBAPP_CONFIG failed.
    console.error("[Firebase Setup Error] SERVER-SIDE: Failed to parse FIREBASE_WEBAPP_CONFIG. Falling back to NEXT_PUBLIC_ variables if available. Error:", e);
    firebaseConfig = null; // Ensure fallback if parsing fails
  }
}

// If FIREBASE_WEBAPP_CONFIG wasn't available or failed to parse, use individual NEXT_PUBLIC_ variables
if (!firebaseConfig) {
  configSource = "NEXT_PUBLIC_FIREBASE_... variables (from .env.local or hosting env)";
  // SERVER-SIDE log: Indicates fallback to individual NEXT_PUBLIC vars.
  if (process.env.FIREBASE_WEBAPP_CONFIG) { // Only log this specific message if the previous attempt failed
     console.log("[Firebase Setup] SERVER-SIDE: Continuing to use individual NEXT_PUBLIC_FIREBASE_... variables as FIREBASE_WEBAPP_CONFIG parsing failed.");
  } else {
    console.log("[Firebase Setup] SERVER-SIDE: FIREBASE_WEBAPP_CONFIG not found. Attempting to use individual NEXT_PUBLIC_FIREBASE_... variables.");
  }
  firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  };
}

const requiredConfigKeysForInit: (keyof FirebaseOptions)[] = [
  'apiKey',
  'authDomain',
  'projectId',
];

let app;
let db: any; // Allow db to be uninitialised if config is bad

if (!getApps().length) {
  let missingKeys = false;
  if (firebaseConfig) {
    for (const key of requiredConfigKeysForInit) {
      if (!firebaseConfig[key]) {
        const envVarSourceDetail = configSource.startsWith("FIREBASE_WEBAPP_CONFIG")
          ? `Expected in the JSON of FIREBASE_WEBAPP_CONFIG.`
          : `Expected as NEXT_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()} in .env.local or your hosting environment variables.`;

        // SERVER-SIDE log: Critical missing key identified.
        console.error(
`[Firebase Setup Error] SERVER-SIDE: Missing Firebase configuration for: '${key}'.
Sourced from: ${configSource}.
Detail: ${envVarSourceDetail}
Ensure this is correctly set. If using .env.local, YOU MUST RESTART YOUR DEV SERVER after changes.
Trader data will NOT be saved or loaded correctly. CHECK SERVER-SIDE LOGS.`
        );
        missingKeys = true;
      }
    }
    // Explicitly re-check projectId as it's absolutely critical for Firestore.
    if (!firebaseConfig.projectId) {
        // SERVER-SIDE log: Critical missing projectId.
        console.error(
`[Firebase Setup Error] SERVER-SIDE: Critical: Missing Firebase configuration for 'projectId'. This is essential for Firestore.
Sourced from: ${configSource}.
Ensure this is correctly set. If using .env.local, YOU MUST RESTART YOUR DEV SERVER after changes. CHECK SERVER-SIDE LOGS.`
        );
        missingKeys = true;
    }

  } else {
    // SERVER-SIDE log: FirebaseConfig object is null, this is a major issue.
    console.error("[Firebase Setup Error] SERVER-SIDE: Firebase configuration object could not be constructed from any source (FIREBASE_WEBAPP_CONFIG or NEXT_PUBLIC_ variables). Cannot initialise. CHECK SERVER-SIDE LOGS.");
    missingKeys = true;
  }

  if (missingKeys) {
    // SERVER-SIDE log: Overall initialisation failure.
    console.error("[Firebase Setup Error] SERVER-SIDE: Firebase initialisation FAILED due to missing critical configuration. Firestore operations will NOT work. Review previous error messages in SERVER-SIDE LOGS carefully.");
    // db remains undefined, operations will fail with "Firestore not initialised"
  } else {
    try {
      // SERVER-SIDE log: Attempting initialisation.
      console.log(`[Firebase Setup] SERVER-SIDE: Attempting to initialise Firebase with Project ID: '${firebaseConfig!.projectId}' from source: ${configSource}.`);
      app = initializeApp(firebaseConfig!); // Non-null assertion because if firebaseConfig were null, missingKeys would be true.
      db = getFirestore(app);
      // SERVER-SIDE log: Successful initialisation.
      console.log(`[Firebase Setup] SERVER-SIDE: Firebase initialised SUCCESSFULLY using config from ${configSource} with Project ID: '${firebaseConfig!.projectId}'. Firestore should be operational.`);
    } catch (error) {
      // SERVER-SIDE log: Exception during initializeApp.
      console.error("[Firebase Setup Error] SERVER-SIDE: Error during Firebase initializeApp() call with the derived config:", error);
      console.error("[Firebase Setup Error] SERVER-SIDE: Config used for initialisation attempt:", JSON.stringify(firebaseConfig));
      // db remains undefined
    }
  }
} else {
  app = getApp();
  db = getFirestore(app); // Ensure db is assigned if app already exists
  const existingAppProjectId = getApp().options.projectId;
  // SERVER-SIDE log: App already initialised.
  if (existingAppProjectId) {
    console.log(`[Firebase Setup] SERVER-SIDE: Firebase app already initialised. Using existing instance for Project ID: '${existingAppProjectId}'.`);
  } else {
     console.warn("[Firebase Setup] SERVER-SIDE: Firebase app already initialised, but its Project ID is undefined. This is unexpected.");
  }
  // Log a warning if the config derived from env vars differs from the already initialised app's config
  if (firebaseConfig && firebaseConfig.projectId && existingAppProjectId !== firebaseConfig.projectId) {
    // SERVER-SIDE log: Potential mismatch warning.
    console.warn(`[Firebase Setup] SERVER-SIDE: Warning: An existing Firebase app's projectId ('${existingAppProjectId}') does not match the projectId derived from current environment variables ('${firebaseConfig.projectId}'). This could lead to unexpected behaviour if a new initialisation was intended.`);
  }
}

// Export a db that might be undefined if initialisation failed
export { db };
