
'use server';

import { getDb } from './trader-service-firestore';
import { type Trader, type BaseBranchId, type ParsedTraderData, TraderSchema } from '@/types';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { INITIAL_SEED_TRADERS_DATA } from './seed-data';

/**
 * Ensures that the required Firestore instance is available.
 * Throws a clear, specific error if Firestore is not initialized.
 */
function ensureFirestore() {
    // getDb() will throw an error if it can't initialize, so this is our check.
    return getDb();
}


async function seedInitialData(branchId: BaseBranchId): Promise<Trader[]> {
    const firestore = ensureFirestore();
    console.log(`[Seed Data] Seeding initial data for branch: ${branchId}`);
    const branchCollectionRef = firestore.collection('traders').doc(branchId).collection('branch_traders');
    const batch = firestore.batch();

    const tradersToSeed: Trader[] = INITIAL_SEED_TRADERS_DATA.map(traderData => {
      const docRef = branchCollectionRef.doc(); // Auto-generate ID
      
      const newTraderWithTimestamp: Omit<Trader, 'id'> & { id?: string, lastActivity: Timestamp, callBackDate: Timestamp | null } = {
        ...traderData,
        lastActivity: Timestamp.fromDate(new Date(traderData.lastActivity)),
        callBackDate: traderData.callBackDate ? Timestamp.fromDate(new Date(traderData.callBackDate)) : null
      };

      const newTrader: Trader = {
        ...newTraderWithTimestamp,
        id: docRef.id,
        lastActivity: newTraderWithTimestamp.lastActivity.toDate().toISOString(), // Convert back for Zod
        callBackDate: newTraderWithTimestamp.callBackDate ? newTraderWithTimestamp.callBackDate.toDate().toISOString() : null
      };

      // Validate with Zod before adding to batch
      const validation = TraderSchema.safeParse(newTrader);
      if(validation.success) {
        batch.set(docRef, newTraderWithTimestamp); // Use the object with the Firestore Timestamp
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
    
    // Optimization: Order by lastActivity descending directly in the query
    const snapshot = await branchCollectionRef.orderBy('lastActivity', 'desc').get();
    
    if (snapshot.empty) {
        console.log(`[Trader Service] No traders found for branch ${branchId}. Seeding initial data.`);
        return await seedInitialData(branchId);
    }
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Firestore returns Timestamps, need to convert to ISO strings for Zod validation and client-side usage
      const dataWithISOString = {
        ...data,
        lastActivity: (data.lastActivity as Timestamp)?.toDate().toISOString(),
        callBackDate: (data.callBackDate as Timestamp)?.toDate().toISOString() || null,
      }

      const validatedData = TraderSchema.safeParse({ ...dataWithISOString, id: doc.id });
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
    
    const newTraderForFirestore = {
        ...traderData,
        lastActivity: FieldValue.serverTimestamp(), // Use server timestamp for accuracy
        callBackDate: traderData.callBackDate ? Timestamp.fromDate(new Date(traderData.callBackDate)) : null
    };
    
    // Validate a mock object first before writing to DB
    const mockTraderForValidation: Trader = {
      ...traderData,
      id: newDocRef.id,
      lastActivity: new Date().toISOString(),
    };

    const validation = TraderSchema.safeParse(mockTraderForValidation);
    if(!validation.success) {
        console.error("[Trader Service] Invalid trader data for add:", validation.error.flatten().fieldErrors);
        throw new Error(`Invalid trader data provided: ${JSON.stringify(validation.error.flatten().fieldErrors)}`);
    }

    await newDocRef.set(newTraderForFirestore);

    // Fetch the newly created document to get the server-generated timestamp
    const newDoc = await newDocRef.get();
    const newDocData = newDoc.data();
    
    const finalTrader = TraderSchema.parse({
      ...newDocData,
      id: newDoc.id,
      lastActivity: (newDocData!.lastActivity as Timestamp).toDate().toISOString(),
      callBackDate: (newDocData!.callBackDate as Timestamp)?.toDate().toISOString() || null,
    });


    return finalTrader;
}


export async function updateTrader(branchId: BaseBranchId, traderId: string, traderData: Partial<Omit<Trader, 'id'>>): Promise<Trader> {
    const firestore = ensureFirestore();
    const traderRef = firestore.collection('traders').doc(branchId).collection('branch_traders').doc(traderId);

    const doc = await traderRef.get();
    if (!doc.exists) {
        throw new Error(`Trader with ID ${traderId} not found in branch ${branchId}.`);
    }
    const existingData = doc.data() as Trader;

    const dataForUpdate = {
      ...traderData,
      lastActivity: FieldValue.serverTimestamp(), // Always update last activity on any change
      callBackDate: traderData.callBackDate ? Timestamp.fromDate(new Date(traderData.callBackDate)) : null,
    };

    // Validate a mock object with merged data
    const mockTraderForValidation: Trader = {
        ...existingData,
        ...traderData,
        lastActivity: new Date().toISOString(), // Use current time for validation
        id: traderId,
    };

    const validation = TraderSchema.safeParse(mockTraderForValidation);
    if(!validation.success) {
        console.error("[Trader Service] Invalid trader data for update:", validation.error.flatten().fieldErrors);
        throw new Error(`Invalid trader data provided for update: ${JSON.stringify(validation.error.flatten().fieldErrors)}`);
    }
    
    await traderRef.update(dataForUpdate);

    // Fetch and return the updated document
    const updatedDoc = await traderRef.get();
    const updatedDocData = updatedDoc.data();
    const finalTrader = TraderSchema.parse({
      ...updatedDocData,
      id: updatedDoc.id,
      lastActivity: (updatedDocData!.lastActivity as Timestamp).toDate().toISOString(),
      callBackDate: (updatedDocData!.callBackDate as Timestamp)?.toDate().toISOString() || null,
    });

    return finalTrader;
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
        const traderForFirestore = {
            name: parsedData.name,
            status: parsedData.status || 'New Lead',
            lastActivity: parsedData.lastActivity ? Timestamp.fromDate(new Date(parsedData.lastActivity)) : FieldValue.serverTimestamp(),
            description: parsedData.description || null,
            reviews: parsedData.reviews || null,
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
            callBackDate: parsedData.callBackDate ? Timestamp.fromDate(new Date(parsedData.callBackDate)) : null,
            totalAssets: parsedData.totalAssets || null,
            estimatedAnnualRevenue: parsedData.estimatedAnnualRevenue || null,
            estimatedCompanyValue: parsedData.estimatedCompanyValue || null,
            employeeCount: parsedData.employeeCount || null,
        };
        
        const mockTraderForValidation: Trader = {
          ...traderForFirestore,
          id: newDocRef.id,
          lastActivity: new Date().toISOString(), // for validation
          callBackDate: traderForFirestore.callBackDate ? traderForFirestore.callBackDate.toDate().toISOString() : null,
        }

        const validation = TraderSchema.safeParse(mockTraderForValidation);
        if (validation.success) {
            batch.set(newDocRef, traderForFirestore);
            newTraders.push(validation.data); // This is slightly incorrect as timestamp isn't resolved, but OK for returning a list of what was added.
        } else {
            console.warn(`[Trader Service] Skipping invalid trader object in bulk add for branch ${branchId}:`, validation.error.flatten().fieldErrors);
        }
    }
    
    await batch.commit();
    // Note: The returned traders will have placeholder dates, not the final server-generated ones.
    // A full re-fetch from the client might be better to get accurate data.
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
