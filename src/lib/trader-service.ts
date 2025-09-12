
'use server';

import { getDb } from './trader-service-firestore';
import { type Trader, type BaseBranchId, type ParsedTraderData, TraderSchema } from '@/types';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { INITIAL_SEED_TRADERS_DATA } from './seed-data';

function ensureFirestore() {
    return getDb();
}

async function seedInitialData(branchId: BaseBranchId): Promise<Trader[]> {
    const firestore = ensureFirestore();
    const branchCollectionRef = firestore.collection('traders').doc(branchId).collection('branch_traders');
    const batch = firestore.batch();

    const tradersToSeed: Trader[] = INITIAL_SEED_TRADERS_DATA.map(traderData => {
      const docRef = branchCollectionRef.doc(); 
      
      const newTraderWithTimestamp: Omit<Trader, 'id'> & { id?: string, lastActivity: Timestamp, callBackDate: Timestamp | null } = {
        ...traderData,
        lastActivity: Timestamp.fromDate(new Date(traderData.lastActivity)),
        callBackDate: traderData.callBackDate ? Timestamp.fromDate(new Date(traderData.callBackDate)) : null
      };

      const newTrader: Trader = {
        ...newTraderWithTimestamp,
        id: docRef.id,
        lastActivity: newTraderWithTimestamp.lastActivity.toDate().toISOString(),
        callBackDate: newTraderWithTimestamp.callBackDate ? newTraderWithTimestamp.callBackDate.toDate().toISOString() : null
      };

      const validation = TraderSchema.safeParse(newTrader);
      if(validation.success) {
        batch.set(docRef, newTraderWithTimestamp);
        return validation.data;
      } else {
        console.warn(`[Seed Data] Skipping invalid seed trader object for branch ${branchId}:`, validation.error.flatten().fieldErrors);
        return null;
      }
    }).filter((t): t is Trader => t !== null);

    await batch.commit();
    return tradersToSeed;
}

export async function getTraders(branchId: BaseBranchId): Promise<Trader[]> {
    const firestore = ensureFirestore();
    const branchDocRef = firestore.collection('traders').doc(branchId);
    const branchCollectionRef = branchDocRef.collection('branch_traders');
    
    const snapshot = await branchCollectionRef.orderBy('lastActivity', 'desc').get();
    
    if (snapshot.empty) {
        return await seedInitialData(branchId);
    }
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
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
        return null;
      }
    }).filter((t): t is Trader => t !== null);
}

export async function addTrader(branchId: BaseBranchId, traderData: Omit<Trader, 'id' | 'lastActivity'>): Promise<Trader> {
    const firestore = ensureFirestore();
    const branchCollectionRef = firestore.collection('traders').doc(branchId).collection('branch_traders');
    const newDocRef = branchCollectionRef.doc();
    
    const newTraderForFirestore = {
        ...traderData,
        lastActivity: FieldValue.serverTimestamp(),
        callBackDate: traderData.callBackDate ? Timestamp.fromDate(new Date(traderData.callBackDate)) : null
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
      lastActivity: FieldValue.serverTimestamp(),
      callBackDate: traderData.callBackDate ? Timestamp.fromDate(new Date(traderData.callBackDate)) : null,
    };

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
          lastActivity: new Date().toISOString(),
          callBackDate: traderForFirestore.callBackDate ? traderForFirestore.callBackDate.toDate().toISOString() : null,
        }

        const validation = TraderSchema.safeParse(mockTraderForValidation);
        if (validation.success) {
            batch.set(newDocRef, traderForFirestore);
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
