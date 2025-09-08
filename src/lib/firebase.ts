
// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
if (!getApps().length) {
    try {
        app = initializeApp(firebaseConfig);
        console.log("[Firebase Setup] Firebase app initialized successfully.");
    } catch (error) {
        console.error("[Firebase Setup] Error initializing Firebase app:", error);
        // Check for common configuration errors
        if (!firebaseConfig.projectId) {
            console.error("[Firebase Setup] Firebase initialization failed: 'projectId' is missing. Ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID is set in your environment variables.");
        }
        if (!firebaseConfig.apiKey) {
            console.error("[Firebase Setup] Firebase initialization failed: 'apiKey' is missing. Ensure NEXT_PUBLIC_FIREBASE_API_KEY is set in your environment variables.");
        }
    }
} else {
    app = getApps()[0];
    console.log("[Firebase Setup] Firebase app already initialized.");
}


let db, auth;

try {
    db = getFirestore(app);
    auth = getAuth(app);
    console.log("[Firebase Setup] Firestore and Auth services obtained.");
} catch(e) {
    console.error("[Firebase Setup] Could not initialize Firestore or Auth. This is often due to a faulty Firebase config.", e);
    // Setting to null so the app can gracefully degrade
    db = null;
    auth = null;
}


export { app, db, auth };
