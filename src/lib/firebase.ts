
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let db: Firestore | null = null;
let auth: Auth | null = null;

// This function provides a robust way to get the Firebase App instance.
function getFirebaseApp(): FirebaseApp | undefined {
    if (getApps().length > 0) {
        return getApp();
    }
    // Validate that the config is populated before trying to initialize
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
        try {
            const newApp = initializeApp(firebaseConfig);
            console.log("[Firebase Setup] Firebase app initialised successfully.");
            return newApp;
        } catch (error) {
            console.error("[Firebase Setup] Error initialising Firebase app:", error);
            return undefined;
        }
    } else {
        console.error("[Firebase Setup] CRITICAL: Firebase configuration is missing or incomplete. Ensure NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID are set in your environment variables.");
        return undefined;
    }
}

// Initialize the app.
app = getFirebaseApp();

// Only try to get other services if the app was successfully initialized.
if (app) {
    try {
        db = getFirestore(app);
        auth = getAuth(app);
        console.log("[Firebase Setup] Firestore and Auth services obtained successfully.");
    } catch (e) {
        console.error("[Firebase Setup] Error obtaining Firestore or Auth service.", e);
        // Ensure they are null if there's an error.
        db = null;
        auth = null;
    }
} else {
    console.error("[Firebase Setup] Firebase app initialisation failed. Firestore and Auth services will not be available.");
}


export { app, db, auth };
