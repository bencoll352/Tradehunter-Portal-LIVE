

// NOTE: The 'dotenv/config' call, crucial for loading environment variables
// from .env.local on the server, is now handled in the server action files
// that require it (e.g., src/app/(app)/tradehunter/actions.ts).
// This ensures environment variables are loaded before this file is executed
// in those server-side contexts.

import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


function getFirebaseConfig(): FirebaseOptions {
    console.log("[Firebase Setup] SERVER-SIDE: Constructing Firebase config from process.env variables.");

    const firebaseConfig: FirebaseOptions = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    
    // This check is critical. It ensures that we don't proceed with a partial or empty config.
    if (!firebaseConfig.projectId) {
        console.error("[Firebase Setup Error] SERVER-SIDE: Firebase configuration is missing critical 'projectId'. CHECK YOUR .env.local FILE and ensure it is correctly formatted and all NEXT_PUBLIC_FIREBASE_... variables are present.");
        // Throwing an error here is better than returning null and getting a less clear error downstream.
        throw new Error("Firebase projectId is missing in the configuration.");
    }

    console.log(`[Firebase Setup] SERVER-SIDE: Successfully constructed Firebase config for Project ID: '${firebaseConfig.projectId}'.`);
    return firebaseConfig;
}

// This is the robust "singleton" pattern for Firebase initialization
const app = !getApps().length ? initializeApp(getFirebaseConfig()) : getApp();
const db = getFirestore(app);

export { db };
