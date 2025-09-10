'use server';

import { db } from './trader-service-firestore';

/**
 * This file previously contained Firebase Admin SDK initialization logic.
 * That logic has been identified as a source of authentication
 * conflicts with the Genkit AI initialization.
 *
 * To resolve authentication errors, all server-side
 * Google service initialization is now handled centrally by Genkit.
 *
 * This file now re-exports the firestore instance from a new, more appropriately
 * named file that gets the instance from the Genkit-managed app.
 */

export { db };
