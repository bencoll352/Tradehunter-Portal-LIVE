
'use server';

import { getDb } from './trader-service-firestore';
import { type Trader, type BaseBranchId, type ParsedTraderData, TraderSchema } from '@/types';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { INITIAL_SEED_TRADERS_DATA } from './seed-data';
import { normalizePhoneNumber } from './utils';

/**
 * Ensures Firestore is initialized and returns the instance.
 * This is a simple wrapper for getDb() to be used internally.
 */
function ensureFirestore() {
    try {
        return getDb();
    } catch(e) {
        console.error("[Trader Service] Firestore could not be initialized.", e);
        throw new Error("Failed to connect to the database service.");
    }
}

/**
 * Seeds a branch's trader collection with initial data if it's empty.
 * @param branchId The ID of the branch to seed.
 * @returns A promise that resolves with the array of seeded traders.
 */
async function seedInitialData(branchId: BaseBranchId): Promise<Trader[]> {
    console.log(`[Seed Data] Attempting to seed initial data for branch: ${branchId}`);
    try {
        const firestore = ensureFirestore();
        const branchCollectionRef = firestore.collection('traders').doc(branchId).collection('branch_traders');
        const batch = firestore.batch();

        const tradersToSeed: Trader[] = INITIAL_SEED_TRADERS_DATA.map(traderData => {
        const docRef = branchCollectionRef.doc(); // Auto-generate ID
        
        const newTraderWithTimestamp = {
            ...traderData,
            lastActivity: traderData.lastActivity ? Timestamp.fromDate(new Date(traderData.lastActivity)) : FieldValue.serverTimestamp(),
            callBackDate: traderData.callBackDate ? Timestamp.fromDate(new Date(traderData.callBackDate)) : null
        };

        const newTraderForValidation: Trader = {
            ...traderData,
            id: docRef.id,
            lastActivity: new Date().toISOString(),
            callBackDate: traderData.callBackDate ? new Date(traderData.callBackDate).toISOString() : null,
        };

        const validation = TraderSchema.safeParse(newTraderForValidation);
        if(validation.success) {
            batch.set(docRef, newTraderWithTimestamp);
            return validation.data;
        } else {
            console.warn(`[Seed Data] Skipping invalid seed trader object for branch ${branchId}:`, validation.error.flatten().fieldErrors);
            return null;
        }
        }).filter((t): t is Trader => t !== null);

        await batch.commit();
        console.log(`[Seed Data] Successfully seeded ${tradersToSeed.length} traders for branch: ${branchId}`);
        return tradersToSeed;
    } catch (error) {
        console.error(`[Trader Service] Error during seedInitialData for branch ${branchId}:`, error);
        throw new Error(`Failed to seed initial data. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Fetches all traders for a given branch, seeding data if the collection is empty.
 * @param branchId The ID of the branch to fetch traders for.
 * @returns A promise that resolves with an array of Trader objects.
 */
export async function getTraders(branchId: BaseBranchId): Promise<Trader[]> {
    try {
        const firestore = ensureFirestore();
        const branchDocRef = firestore.collection('traders').doc(branchId);
        const branchCollectionRef = branchDocRef.collection('branch_traders');
        
        const snapshot = await branchCollectionRef.orderBy('lastActivity', 'desc').get();
        
        // If the collection for the branch is empty, seed it with initial data.
        if (snapshot.empty) {
            console.log(`[Trader Service] No traders found for branch ${branchId}. Seeding initial data.`);
            return await seedInitialData(branchId);
        }
        
        // Map Firestore documents to Trader objects
        return snapshot.docs.map(doc => {
        const data = doc.data();
        const dataWithISOString = {
            ...data,
            lastActivity: (data.lastActivity as Timestamp)?.toDate().toISOString(),
            callBackDate: (data.callBackDate instanceof Timestamp) ? (data.callBackDate as Timestamp).toDate().toISOString() : null,
        }

        const validatedData = TraderSchema.safeParse({ ...dataWithISOString, id: doc.id });
        if (validatedData.success) {
            return validatedData.data;
        } else {
            console.warn(`[Trader Service] Invalid data in Firestore for trader ${doc.id} in branch ${branchId}:`, validatedData.error.flatten().fieldErrors);
            return null;
        }
        }).filter((t): t is Trader => t !== null);
    } catch (error) {
        console.error(`[Trader Service] Error in getTraders for branch ${branchId}:`, error);
        throw new Error(`Failed to get traders. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Adds a new trader to a branch.
 * @param branchId The ID of the branch.
 * @param traderData The data for the new trader.
 * @returns A promise that resolves with the newly created Trader object.
 */
export async function addTrader(branchId: BaseBranchId, traderData: Omit<Trader, 'id' | 'lastActivity'>): Promise<Trader> {
    const firestore = ensureFirestore();
    const branchCollectionRef = firestore.collection('traders').doc(branchId).collection('branch_traders');
    
    // Check for duplicate phone number before adding
    if (traderData.phone) {
        const normalizedPhone = normalizePhoneNumber(traderData.phone);
        const querySnapshot = await branchCollectionRef.where('phone', '==', normalizedPhone).get();
        if (!querySnapshot.empty) {
            // A more specific error could be thrown here and caught in the action
            throw new Error(`TRADER_DEUPLICATE_PHONE: A trader with this phone number already exists.`);
        }
    }

    const newDocRef = branchCollectionRef.doc(); // Auto-generate new document ID
    
    const newTraderForFirestore = {
        ...traderData,
        lastActivity: FieldValue.serverTimestamp(), // Use server timestamp for creation
        callBackDate: traderData.callBackDate ? Timestamp.fromDate(new Date(traderData.callBackDate)) : null,
        phone: traderData.phone ? normalizePhoneNumber(traderData.phone) : null,
    };
    
    const mockTraderForValidation: Trader = {
      ...traderData,
      id: newDocRef.id,
      lastActivity: new Date().toISOString(),
    };

    const validation = TraderSchema.safeParse(mockTraderForValidation);
    if(!validation.success) {
        throw new Error(`Invalid trader data provided: ${JSON.stringify(validation.error.flatten().fieldErrors)}`);
    }

    await newDocRef.set(newTraderForFirestore);

    const newDoc = await newDocRef.get();
    const newDocData = newDoc.data();
    
    const finalTrader = TraderSchema.parse({
      ...newDocData,
      id: newDoc.id,
      lastActivity: (newDocData!.lastActivity as Timestamp).toDate().toISOString(),
      callBackDate: (newDocData!.callBackDate instanceof Timestamp) ? (newDocData!.callBackDate as Timestamp).toDate().toISOString() : null,
    });

    return finalTrader;
}

/**
 * Updates an existing trader.
 * @param branchId The ID of the branch.
 * @param traderId The ID of the trader to update.
 * @param traderData The data to update.
 * @returns A promise that resolves with the updated Trader object.
 */
export async function updateTrader(branchId: BaseBranchId, traderId: string, traderData: Partial<Omit<Trader, 'id'>>): Promise<Trader> {
    const firestore = ensureFirestore();
    const traderRef = firestore.collection('traders').doc(branchId).collection('branch_traders').doc(traderId);

    const doc = await traderRef.get();
    if (!doc.exists) {
        throw new Error(`Trader with ID ${traderId} not found in branch ${branchId}.`);
    }
    const existingData = doc.data() as Trader;

    const dataForUpdate: any = {
      ...traderData,
      lastActivity: FieldValue.serverTimestamp(),
      callBackDate: traderData.callBackDate ? Timestamp.fromDate(new Date(traderData.callBackDate)) : null,
    };
    if (traderData.phone) {
        dataForUpdate.phone = normalizePhoneNumber(traderData.phone);
    }

    const mockTraderForValidation: Trader = {
        ...existingData,
        ...traderData,
        lastActivity: new Date().toISOString(),
        id: traderId,
    };

    const validation = TraderSchema.safeParse(mockTraderForValidation);
    if(!validation.success) {
        throw new Error(`Invalid trader data provided for update: ${JSON.stringify(validation.error.flatten().fieldErrors)}`);
    }
    
    await traderRef.update(dataForUpdate);

    const updatedDoc = await traderRef.get();
    const updatedDocData = updatedDoc.data();
    const finalTrader = TraderSchema.parse({
      ...updatedDocData,
      id: updatedDoc.id,
      lastActivity: (updatedDocData!.lastActivity as Timestamp).toDate().toISOString(),
      callBackDate: (updatedDocData!.callBackDate instanceof Timestamp) ? (updatedDocData!.callBackDate as Timestamp).toDate().toISOString() : null,
    });

    return finalTrader;
}

/**
 * Deletes a trader from a branch.
 * @param branchId The ID of the branch.
 * @param traderId The ID of the trader to delete.
 */
export async function deleteTrader(branchId: BaseBranchId, traderId: string): Promise<void> {
    const firestore = ensureFirestore();
    const traderRef = firestore.collection('traders').doc(branchId).collection('branch_traders').doc(traderId);
    await traderRef.delete();
}

/**
 * Adds multiple traders to a branch in a single batch operation, skipping duplicates.
 * @param branchId The ID of the branch.
 * @param traders An array of parsed trader data from a CSV or other source.
 * @returns A promise that resolves with an array of the newly created Trader objects.
 */
export async function bulkAddTraders(branchId: BaseBranchId, traders: ParsedTraderData[]): Promise<Trader[]> {
    try {
        const firestore = ensureFirestore();
        const branchCollectionRef = firestore.collection('traders').doc(branchId).collection('branch_traders');
        
        // 1. Get all existing phone numbers for the branch to check for duplicates.
        const existingTradersSnapshot = await branchCollectionRef.select('phone').get();
        const existingPhones = new Set(existingTradersSnapshot.docs.map(doc => doc.data().phone).filter(Boolean));
        
        const batch = firestore.batch();
        const newTraders: Trader[] = [];
        const phonesInThisBatch = new Set<string>();

        for (const parsedData of traders) {
            const normalizedPhone = parsedData.phone ? normalizePhoneNumber(parsedData.phone) : null;
            
            // 2. Skip if phone number is a duplicate (either in DB or in this batch)
            if (normalizedPhone && (existingPhones.has(normalizedPhone) || phonesInThisBatch.has(normalizedPhone))) {
                console.log(`[Trader Service] Skipping duplicate phone number in bulk add: ${normalizedPhone}`);
                continue; 
            }

            const newDocRef = branchCollectionRef.doc();
            const traderForFirestore = {
                name: parsedData.name,
                status: parsedData.status || 'New Lead',
                lastActivity: parsedData.lastActivity ? Timestamp.fromDate(new Date(parsedData.lastActivity)) : FieldValue.serverTimestamp(),
                description: parsedData.description || null,
                reviews: parsedData.reviews || null,
                rating: parsedData.rating || null,
                website: parsedData.website || null,
                phone: normalizedPhone,
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
                lastActivity: new Date().toISOString(),
                callBackDate: traderForFirestore.callBackDate ? traderForFirestore.callBackDate.toDate().toISOString() : null,
            }

            const validation = TraderSchema.safeParse(mockTraderForValidation);
            if (validation.success) {
                batch.set(newDocRef, traderForFirestore);
                newTraders.push(validation.data);
                if (normalizedPhone) {
                    phonesInThisBatch.add(normalizedPhone);
                }
            } else {
                console.warn(`[Trader Service] Skipping invalid trader object in bulk add for branch ${branchId}:`, validation.error.flatten().fieldErrors);
            }
        }
        
        await batch.commit();
        return newTraders;
    } catch (error) {
        console.error('[Trader Service] Error during bulkAddTraders:', error);
        throw new Error(`A database error occurred during the bulk upload process. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}


/**
 * Deletes multiple traders from a branch in batches.
 * @param branchId The ID of the branch.
 * @param traderIds An array of trader IDs to delete.
 * @returns An object with counts of successful and failed deletions.
 */
export async function bulkDeleteTraders(branchId: BaseBranchId, traderIds: string[]): Promise<{ successCount: number, failureCount: number }> {
    const firestore = ensureFirestore();
    const branchCollectionRef = firestore.collection('traders').doc(branchId).collection('branch_traders');
    let successCount = 0;
    let failureCount = 0;
    const batchPromises = [];

    // Firestore batches are limited to 500 operations.
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
