// src/lib/firebase.ts
// FORCE-LOAD .env variables at the top of this file. This is the most reliable way
// to ensure they are available before any Firebase initialization logic runs.
import { config } from 'dotenv';
config({ path: '.env.local' });

import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

let firebaseConfig: FirebaseOptions | null = null;
let configSource = ""; // To track where the config came from

// Try to use App Hosting's FIREBASE_WEBAPP_CONFIG first
if (process.env.FIREBASE_WEBAPP_CONFIG) {
  try {
    const parsedConfig = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
    // Add a check to ensure the parsed object has at least the projectId
    if (parsedConfig && parsedConfig.projectId) {
        firebaseConfig = parsedConfig;
        configSource = "FIREBASE_WEBAPP_CONFIG (from Firebase Hosting)";
        console.log("[Firebase Setup] SERVER-SIDE: Attempting to use FIREBASE_WEBAPP_CONFIG environment variable.");
    } else {
        console.warn("[Firebase Setup] SERVER-SIDE: FIREBASE_WEBAPP_CONFIG was present but invalid (e.g., empty or missing projectId). Falling back to NEXT_PUBLIC_ variables.");
        firebaseConfig = null; // Force fallback
    }
  } catch (e) {
    console.error("[Firebase Setup Error] SERVER-SIDE: Failed to parse FIREBASE_WEBAPP_CONFIG. Falling back to NEXT_PUBLIC_ variables if available. Error:", e);
    firebaseConfig = null; // Ensure fallback if parsing fails
  }
}

// If FIREBASE_WEBAPP_CONFIG wasn't available or failed to parse, use individual NEXT_PUBLIC_ variables
if (!firebaseConfig) {
  if (configSource === "") { // Only log this if we haven't tried the other source yet
    console.log("[Firebase Setup] SERVER-SIDE: FIREBASE_WEBAPP_CONFIG not found. Attempting to use individual NEXT_PUBLIC_FIREBASE_... variables.");
  }
  configSource = "NEXT_PUBLIC_FIREBASE_... variables (from .env or hosting env)";
  
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
  if (firebaseConfig && firebaseConfig.projectId) { // Also check projectId explicitly here
    for (const key of requiredConfigKeysForInit) {
      if (!firebaseConfig[key]) {
        const envVarSourceDetail = configSource.startsWith("FIREBASE_WEBAPP_CONFIG")
          ? `Expected in the JSON of FIREBASE_WEBAPP_CONFIG.`
          : `Expected as NEXT_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()} in .env or your hosting environment variables.`;

        console.error(
`[Firebase Setup Error] SERVER-SIDE: Missing Firebase configuration for: '${key}'.
Sourced from: ${configSource}.
Detail: ${envVarSourceDetail}
Ensure this is correctly set. If using .env, YOU MUST RESTART YOUR DEV SERVER after changes.
Trader data will NOT be saved or loaded correctly. CHECK SERVER-SIDE LOGS.`
        );
        missingKeys = true;
      }
    }
  } else {
    console.error(`[Firebase Setup Error] SERVER-SIDE: Firebase configuration object could not be constructed or is missing 'projectId'. Sourced from: ${configSource}. Cannot initialise. CHECK SERVER-SIDE LOGS.`);
    missingKeys = true;
  }

  if (missingKeys) {
    console.error("[Firebase Setup Error] SERVER-SIDE: Firebase initialisation FAILED due to missing critical configuration. Firestore operations will NOT work. Review previous error messages in SERVER-SIDE LOGS carefully.");
  } else {
    try {
      console.log(`[Firebase Setup] SERVER-SIDE: Attempting to initialise Firebase with Project ID: '${firebaseConfig!.projectId}' from source: ${configSource}.`);
      app = initializeApp(firebaseConfig!);
      db = getFirestore(app);
      console.log(`[Firebase Setup] SERVER-SIDE: Firebase initialised SUCCESSFULLY using config from ${configSource} with Project ID: '${firebaseConfig!.projectId}'. Firestore should be operational.`);
    } catch (error) {
      console.error("[Firebase Setup Error] SERVER-SIDE: Error during Firebase initializeApp() call with the derived config:", error);
      console.error("[Firebase Setup Error] SERVER-SIDE: Config used for initialisation attempt:", JSON.stringify(firebaseConfig));
    }
  }
} else {
  app = getApp();
  db = getFirestore(app);
  const existingAppProjectId = getApp().options.projectId;
  if (existingAppProjectId) {
    console.log(`[Firebase Setup] SERVER-SIDE: Firebase app already initialised. Using existing instance for Project ID: '${existingAppProjectId}'.`);
  } else {
     console.warn("[Firebase Setup] SERVER-SIDE: Firebase app already initialised, but its Project ID is undefined. This is unexpected.");
  }
  if (firebaseConfig && firebaseConfig.projectId && existingAppProjectId !== firebaseConfig.projectId) {
    console.warn(`[Firebase Setup] SERVER-SIDE: Warning: An existing Firebase app's projectId ('${existingAppProjectId}') does not match the projectId derived from current environment variables ('${firebaseConfig.projectId}'). This could lead to unexpected behaviour if a new initialisation was intended.`);
  }
}

export { db };
