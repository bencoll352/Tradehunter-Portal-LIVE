'use server';

import { db } from './trader-service-firestore';

/**
 * This file previously contained Firebase Admin SDK initialization logic.
 * That logic has been identified as the source of a persistent authentication
 * conflict with the Genkit AI initialization.
 *
 * To resolve the "Could not refresh access token" error, all server-side
 * Google service initialization is now handled centrally by Genkit.
 *
 * This file is being kept to avoid breaking imports, but it now re-exports
 * the firestore instance from a new, more appropriately named file.
 * The core initialization logic has been removed.
 */

export { db };
