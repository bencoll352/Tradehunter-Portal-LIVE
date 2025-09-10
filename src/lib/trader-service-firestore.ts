// src/lib/trader-service-firestore.ts
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { ai } from '@/ai/genkit'; // Import the centralized Genkit instance

let db: admin.firestore.Firestore;

try {
    // The Firebase Admin app is now initialized by Genkit in @/ai/genkit.ts.
    // We can safely get the instance here. If it's not initialized,
    // Genkit's setup would have already thrown an error.
    if (admin.apps.length === 0) {
        // This case should ideally not be hit if Genkit initializes first,
        // but as a fallback, we log an error.
        console.error("[Firestore DB] Firebase Admin app not initialized. This should be handled by Genkit. Operations will likely fail.");
        // We throw an error to make it clear that the configuration is wrong.
        throw new Error("Firebase Admin SDK not initialized by Genkit.");
    }
    
    // Get the default app's firestore instance.
    db = getFirestore();
    console.log("[Firestore DB] Successfully obtained Firestore instance from existing Admin app.");

} catch (error: any) {
    console.error("[Firestore DB] CRITICAL: Failed to get Firestore instance.");
    console.error(`[Firestore DB] Error Message: ${error.message}`);
    
    // To allow the app to run without crashing in some scenarios, we'll set db to null,
    // but operations will fail. The error is thrown to be caught by services.
    db = null as any; 
    // Re-throw to ensure server actions fail clearly.
    throw new Error("Failed to get Firestore instance. Check server logs for configuration errors.");
}


export { db };
