
'use server';

import { db } from './firebase-admin-config';
import { type Trader, type BaseBranchId, type ParsedTraderData, TraderSchema } from '@/types';
import { FieldValue } from 'firebase-admin/firestore';
import { INITIAL_SEED_TRADERS_DATA } from './seed-data';

/**
 * Ensures that the required Firestore instance is available.
 * Throws a clear, specific error if Firestore is not initialized.
 */
function ensureFirestore() {
    if (!db) {
      console.error("[Trader Service] FATAL: Firestore database instance is not available. This is a server configuration issue.");
      throw new Error("Firestore not initialized. Cannot perform database operations. Please check the server logs for details on the Firebase Admin SDK initialization failure.");
    }
    return db;
}


async function seedInitialData(branchId: BaseBranchId): Promise<Trader[]> {
    const firestore = ensureFirestore();
    console.log(`[Seed Data] Seeding initial data for branch: ${branchId}`);
    const branchCollectionRef = firestore.collection('traders').doc(branchId).collection('branch_traders');
    const batch = firestore.batch();

    const tradersToSeed: Trader[] = INITIAL_SEED_TRADERS_DATA.map(traderData => {
      const docRef = branchCollectionRef.doc(); // Auto-generate ID
      const newTrader: Trader = {
        ...traderData,
        id: docRef.id,
      };
      // Validate with Zod before adding to batch
      const validation = TraderSchema.safeParse(newTrader);
      if(validation.success) {
        batch.set(docRef, newTrader);
        return validation.data;
      } else {
        console.warn(`[Seed Data] Skipping invalid seed trader object for branch ${branchId}:`, validation.error.flatten().fieldErrors);
        return null;
      }
    }).filter((t): t is Trader => t !== null);

    await batch.commit();
    console.log(`[Seed Data] Finished seeding ${tradersToSeed.length} traders for branch: ${branchId}`);
    return tradersToSeed;
}

export async function getTraders(branchId: BaseBranchId): Promise<Trader[]> {
    const firestore = ensureFirestore();
    const branchDocRef = firestore.collection('traders').doc(branchId);
    const branchCollectionRef = branchDocRef.collection('branch_traders');
    
    const snapshot = await branchCollectionRef.get();
    
    if (snapshot.empty) {
        console.log(`[Trader Service] No traders found for branch ${branchId}. Seeding initial data.`);
        return await seedInitialData(branchId);
    }
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      const validatedData = TraderSchema.safeParse({ ...data, id: doc.id });
      if (validatedData.success) {
        return validatedData.data;
      } else {
        console.warn(`[Trader Service] Invalid data in Firestore for trader ${doc.id} in branch ${branchId}:`, validatedData.error.flatten().fieldErrors);
        return null; // Or some default/fallback object
      }
    }).filter((t): t is Trader => t !== null);
}

export async function addTrader(branchId: BaseBranchId, traderData: Omit<Trader, 'id' | 'lastActivity'>): Promise<Trader> {
    const firestore = ensureFirestore();
    const branchCollectionRef = firestore.collection('traders').doc(branchId).collection('branch_traders');
    const newDocRef = branchCollectionRef.doc();
    
    const newTrader: Trader = {
        ...traderData,
        id: newDocRef.id,
        lastActivity: new Date().toISOString(), // Set current date as last activity
    };

    const validation = TraderSchema.safeParse(newTrader);
    if(!validation.success) {
        console.error("[Trader Service] Invalid trader data for add:", validation.error.flatten().fieldErrors);
        throw new Error(`Invalid trader data provided: ${JSON.stringify(validation.error.flatten().fieldErrors)}`);
    }

    await newDocRef.set(validation.data);
    return validation.data;
}


export async function updateTrader(branchId: BaseBranchId, traderId: string, traderData: Partial<Omit<Trader, 'id'>>): Promise<Trader> {
    const firestore = ensureFirestore();
    const traderRef = firestore.collection('traders').doc(branchId).collection('branch_traders').doc(traderId);

    const doc = await traderRef.get();
    if (!doc.exists) {
        throw new Error(`Trader with ID ${traderId} not found in branch ${branchId}.`);
    }
    const existingData = doc.data() as Trader;

    const updatedData: Trader = {
        ...existingData,
        ...traderData,
        lastActivity: new Date().toISOString(), // Always update last activity on any change
        id: traderId, // Ensure ID is not overwritten
    };

    const validation = TraderSchema.safeParse(updatedData);
    if(!validation.success) {
        console.error("[Trader Service] Invalid trader data for update:", validation.error.flatten().fieldErrors);
        throw new Error(`Invalid trader data provided for update: ${JSON.stringify(validation.error.flatten().fieldErrors)}`);
    }
    
    // Important: Pass the original `traderData` to the update method, not the merged `validation.data`
    // This ensures we only update the fields that were actually changed.
    await traderRef.update(traderData);
    return validation.data;
}


export async function deleteTrader(branchId: BaseBranchId, traderId: string): Promise<void> {
    const firestore = ensureFirestore();
    const traderRef = firestore.collection('traders').doc(branchId).collection('branch_traders').doc(traderId);
    await traderRef.delete();
}

export async function bulkAddTraders(branchId: BaseBranchId, traders: ParsedTraderData[]): Promise<Trader[]> {
    const firestore = ensureFirestore();
    const branchCollectionRef = firestore.collection('traders').doc(branchId).collection('branch_traders');
    const batch = firestore.batch();

    const newTraders: Trader[] = [];

    for (const parsedData of traders) {
        const newDocRef = branchCollectionRef.doc();
        const trader: Trader = {
            id: newDocRef.id,
            name: parsedData.name,
            status: parsedData.status || 'New Lead',
            lastActivity: parsedData.lastActivity || new Date().toISOString(),
            description: parsedData.description || null,
            rating: parsedData.rating || null,
            website: parsedData.website || null,
            phone: parsedData.phone || null,
            ownerName: parsedData.ownerName || null,
            mainCategory: parsedData.mainCategory || null,
            categories: parsedData.categories || null,
            workdayTiming: parsedData.workdayTiming || null,
            address: parsedData.address || null,
            ownerProfileLink: parsedData.ownerProfileLink || null,
            notes: parsedData.notes || null,
            callBackDate: null,
            estimatedAnnualRevenue: parsedData.estimatedAnnualRevenue || null,
            estimatedCompanyValue: parsedData.estimatedCompanyValue || null,
            employeeCount: parsedData.employeeCount || null,
        };
        
        const validation = TraderSchema.safeParse(trader);
        if (validation.success) {
            batch.set(newDocRef, validation.data);
            newTraders.push(validation.data);
        } else {
            console.warn(`[Trader Service] Skipping invalid trader object in bulk add for branch ${branchId}:`, validation.error.flatten().fieldErrors);
        }
    }
    
    await batch.commit();
    return newTraders;
}

export async function bulkDeleteTraders(branchId: BaseBranchId, traderIds: string[]): Promise<{ successCount: number, failureCount: number }> {
    const firestore = ensureFirestore();
    const branchCollectionRef = firestore.collection('traders').doc(branchId).collection('branch_traders');
    let successCount = 0;
    let failureCount = 0;

    // Firestore allows a maximum of 500 operations in a single batch.
    const batchPromises = [];
    for (let i = 0; i < traderIds.length; i += 500) {
        const chunk = traderIds.slice(i, i + 500);
        const batch = firestore.batch();
        chunk.forEach(id => {
            const docRef = branchCollectionRef.doc(id);
            batch.delete(docRef);
        });
        batchPromises.push(batch.commit().then(() => {
            successCount += chunk.length;
        }).catch((err) => {
            console.error(`[Trader Service] Batch delete failed for a chunk starting at index ${i}:`, err);
            failureCount += chunk.length;
        }));
    }

    await Promise.all(batchPromises);

    return { successCount, failureCount };
}
