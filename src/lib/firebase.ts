
// src/lib/firebase.ts
// FORCE-LOAD .env variables at the top of this file. This is the most reliable way
// to ensure they are available before any Firebase initialization logic runs.
import { config } from 'dotenv';
config({ path: '.env.local' });

import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

function getFirebaseConfig() {
    let firebaseConfig: FirebaseOptions | null = null;
    let configSource = "";

    if (process.env.FIREBASE_WEBAPP_CONFIG) {
        try {
            const parsedConfig = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
            if (parsedConfig && parsedConfig.projectId) {
                firebaseConfig = parsedConfig;
                configSource = "FIREBASE_WEBAPP_CONFIG (from Firebase Hosting)";
                console.log(`[Firebase Setup] SERVER-SIDE: Attempting to use FIREBASE_WEBAPP_CONFIG for Project ID: ${firebaseConfig.projectId}`);
            } else {
                console.warn("[Firebase Setup] SERVER-SIDE: FIREBASE_WEBAPP_CONFIG was present but invalid. Falling back.");
            }
        } catch (e) {
            console.error("[Firebase Setup Error] SERVER-SIDE: Failed to parse FIREBASE_WEBAPP_CONFIG. Falling back. Error:", e);
        }
    }

    if (!firebaseConfig) {
        configSource = "NEXT_PUBLIC_FIREBASE_... variables (from .env or hosting env)";
        console.log(`[Firebase Setup] SERVER-SIDE: Attempting to use individual NEXT_PUBLIC_FIREBASE_... variables from source: ${configSource}`);
        
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
    
    // Final check for critical keys
    if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
        console.error(`[Firebase Setup Error] SERVER-SIDE: Firebase configuration is missing critical keys (projectId or apiKey). Sourced from: ${configSource}. Cannot initialise. CHECK YOUR ENVIRONMENT VARIABLES.`);
        return null;
    }

    console.log(`[Firebase Setup] SERVER-SIDE: Successfully constructed Firebase config for Project ID: '${firebaseConfig.projectId}' from source: ${configSource}.`);
    return firebaseConfig;
}

// This is the robust "singleton" pattern for Firebase initialization
const app = !getApps().length ? initializeApp(getFirebaseConfig()!) : getApp();
const db = getFirestore(app);

export { db };
