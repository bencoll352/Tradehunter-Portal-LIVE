

import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { firestore } from './firebase-admin'; // Correctly import from server-only file
import type { BaseBranchId, ParsedTraderData, Trader, TraderStatus, Task } from '@/types';
import { traderFormSchema } from '@/components/dashboard/TraderForm';
import type { z } from 'zod';
import { normalizePhoneNumber } from './utils';
import { INITIAL_SEED_TRADERS_DATA } from './seed-data';

type TraderFormValues = z.infer<typeof traderFormSchema>;

// --- Firestore Helper ---
function ensureFirestore() {
    if (!firestore) {
        throw new Error("Firestore is not initialized. This is a server configuration issue. Please check your Firebase Admin SDK setup.");
    }
    return firestore;
}


// --- Firestore Collection Reference ---
const getTradersCollection = (branchId: BaseBranchId) => {
  const db = ensureFirestore();
  return db.collection('traders').doc(branchId).collection('branchTraders');
};

const getTasksCollection = (branchId: BaseBranchId, traderId: string) => {
    const db = ensureFirestore();
    return db.collection('traders').doc(branchId).collection('branchTraders').doc(traderId).collection('tasks');
}


// --- Helper Functions ---

/**
 * Checks if a trader with the given phone number already exists in the branch.
 * Throws an error if a duplicate is found.
 */
async function checkDuplicatePhone(branchId: BaseBranchId, phone: string | null | undefined, currentTraderId?: string) {
  if (!phone) return; // Cannot check for duplicates if phone is not provided

  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return;

  const tradersCollection = getTradersCollection(branchId);
  const querySnapshot = await tradersCollection.where('phone', '==', normalizedPhone).get();

  if (!querySnapshot.empty) {
    // If we're updating a trader, we need to make sure the found duplicate isn't the trader itself.
    for (const doc of querySnapshot.docs) {
      if (doc.id !== currentTraderId) {
        throw new Error('A trader with this phone number already exists.');
      }
    }
  }
}


/**
 * Converts a date string from various formats into an ISO string.
 * Handles UK formats like dd/MM/yyyy and dd/MM/yy.
 */
function parseActivityDate(dateString: string | undefined | null): string {
    if (!dateString) {
        return new Date().toISOString();
    }
    try {
        // Attempt to parse as ISO 8601 directly
        const isoDate = new Date(dateString);
        if (!isNaN(isoDate.getTime())) {
            return isoDate.toISOString();
        }
    } catch (e) {
        // Ignore if direct parsing fails
    }

    // Handle UK date format dd/MM/yyyy or dd/MM/yy
    const parts = dateString.split('/');
    if (parts.length === 3) {
        const [day, month, year] = parts;
        const fullYear = year.length === 2 ? `20${year}` : year;
        // Month is 0-indexed in JS Date
        const parsedDate = new Date(parseInt(fullYear, 10), parseInt(month, 10) - 1, parseInt(day, 10));
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString();
        }
    }

    // Fallback for other potential formats, or return now if all else fails
    const fallbackDate = new Date(dateString);
    return !isNaN(fallbackDate.getTime()) ? fallbackDate.toISOString() : new Date().toISOString();
}

/**
 * Safely converts a Firestore Timestamp or a string to an ISO string.
 * Returns null if the input is invalid or cannot be converted.
 */
const safeToISOString = (value: any): string | null => {
    if (!value) return null;

    if (value instanceof Timestamp) {
        return value.toDate().toISOString();
    }
    // Handle cases where it might be a plain object from Firestore SDK on the client
    if (typeof value === 'object' && value !== null && typeof (value as any).toDate === 'function') {
        return (value as any).toDate().toISOString();
    }
    // Handle if it's already a string
    if (typeof value === 'string') {
        try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return date.toISOString();
            }
        } catch(e) {
            // Invalid date string format
            return null;
        }
    }
    // Return null for any other invalid type
    return null;
}

// --- Main Service Functions ---

export async function getTraders(branchId: BaseBranchId): Promise<Trader[]> {
  try {
    const tradersCollection = getTradersCollection(branchId);
    const snapshot = await tradersCollection.get();

    if (snapshot.empty) {
      console.log(`[getTraders] Branch ${branchId} is empty. Seeding initial data...`);
      await bulkAddTraders(branchId, INITIAL_SEED_TRADERS_DATA);
      const seededSnapshot = await tradersCollection.get();
      console.log(`[getTraders] Re-fetching data for branch ${branchId} after seeding. Found ${seededSnapshot.size} documents.`);
      return await mapSnapshotToTraders(seededSnapshot);
    }
    
    console.log(`[getTraders] Found ${snapshot.size} documents for branch ${branchId}.`);
    return await mapSnapshotToTraders(snapshot);
  } catch (error: any) {
    console.error('[TRADER_SERVICE_ERROR:getTraders]', error);
    throw new Error('Failed to get traders from database.');
  }
}

async function mapSnapshotToTraders(snapshot: admin.firestore.QuerySnapshot): Promise<Trader[]> {
  const traders: Trader[] = [];
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const traderId = doc.id;
    const branchId = doc.ref.parent.parent!.id as BaseBranchId;

    const tasksSnapshot = await getTasksCollection(branchId, traderId).get();
    const tasks: Task[] = tasksSnapshot.docs.map(taskDoc => {
        const taskData = taskDoc.data();
        return {
            id: taskDoc.id,
            traderId: traderId,
            title: taskData.title,
            dueDate: safeToISOString(taskData.dueDate) || new Date().toISOString(),
            completed: taskData.completed || false,
        };
    });

    const lastActivity = safeToISOString(data.lastActivity) || new Date(0).toISOString();
    traders.push({
      id: traderId,
      name: data.name || 'N/A',
      status: data.status || 'Inactive',
      lastActivity: lastActivity,
      description: data.description ?? null,
      reviews: data.reviews ?? null,
      rating: data.rating ?? null,
      website: data.website ?? null,
      phone: data.phone ?? null,
      ownerName: data.ownerName ?? null,
      mainCategory: data.mainCategory ?? null,
      categories: data.categories ?? null,
      workdayTiming: data.workdayTiming ?? null,
      temporarilyClosedOn: data.temporarilyClosedOn ?? null,
      address: data.address ?? null,
      ownerProfileLink: data.ownerProfileLink ?? null,
      notes: data.notes ?? null,
      callBackDate: safeToISOString(data.callBackDate),
      totalAssets: data.totalAssets ?? null,
      estimatedAnnualRevenue: data.estimatedAnnualRevenue ?? null,
      estimatedCompanyValue: data.estimatedCompanyValue ?? null,
      employeeCount: data.employeeCount ?? null,
      tasks: tasks,
    });
  }
  return traders;
}


export async function addTrader(branchId: BaseBranchId, traderData: TraderFormValues): Promise<Trader> {
  try {
    await checkDuplicatePhone(branchId, traderData.phone);
    const tradersCollection = getTradersCollection(branchId);

    const newTraderData = {
      ...traderData,
      phone: normalizePhoneNumber(traderData.phone),
      lastActivity: FieldValue.serverTimestamp(), 
      tasks: [], // Initialize with an empty array of tasks
    };

    const docRef = await tradersCollection.add(newTraderData);
    const newTraderDoc = await docRef.get();
    
    // We create a temporary snapshot-like object to pass to the mapper
    const snapshot = {
        docs: [newTraderDoc]
    } as unknown as admin.firestore.QuerySnapshot;

    const mappedTraders = await mapSnapshotToTraders(snapshot);
    if (mappedTraders.length === 0) {
        throw new Error("Failed to map newly created trader.");
    }
    
    return mappedTraders[0];

  } catch (error: any) {
    console.error('[TRADER_SERVICE_ERROR:addTrader]', error);
    throw new Error(`Could not add trader. Reason: ${error.message}`);
  }
}

export async function updateTrader(branchId: BaseBranchId, traderId: string, traderData: TraderFormValues): Promise<Trader> {
  try {
    await checkDuplicatePhone(branchId, traderData.phone, traderId);
    const tradersCollection = getTradersCollection(branchId);
    const traderRef = tradersCollection.doc(traderId);

    const updatedData = {
      ...traderData,
      phone: normalizePhoneNumber(traderData.phone),
      lastActivity: FieldValue.serverTimestamp(), 
    };

    await traderRef.update(updatedData);
    
    const updatedDoc = await traderRef.get();
     // We create a temporary snapshot-like object to pass to the mapper
    const snapshot = {
        docs: [updatedDoc]
    } as unknown as admin.firestore.QuerySnapshot;

    const mappedTraders = await mapSnapshotToTraders(snapshot);
    if (mappedTraders.length === 0) {
        throw new Error("Failed to map updated trader.");
    }
    
    return mappedTraders[0];

  } catch (error: any) {
    console.error('[TRADER_SERVICE_ERROR:updateTrader]', error);
    throw new Error(`Could not update trader. Reason: ${error.message}`);
  }
}


export async function deleteTrader(branchId: BaseBranchId, traderId: string): Promise<void> {
    const db = ensureFirestore();
    const traderRef = getTradersCollection(branchId).doc(traderId);
    const tasksSnapshot = await getTasksCollection(branchId, traderId).get();

    const batch = db.batch();

    tasksSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });

    batch.delete(traderRef);

    try {
        await batch.commit();
    } catch (error: any) {
        console.error('[TRADER_SERVICE_ERROR:deleteTrader]', error);
        throw new Error(`Could not delete trader and their tasks. Reason: ${error.message}`);
    }
}

export async function bulkAddTraders(branchId: BaseBranchId, tradersData: ParsedTraderData[]): Promise<Trader[]> {
  const db = ensureFirestore();
  const tradersCollection = getTradersCollection(branchId);
  const batch = db.batch();
  const addedTraders: Trader[] = [];
  
  // Use a Set to track phone numbers processed *within this batch* to prevent self-duplication.
  const batchPhoneNumbers = new Set<string>();

  const existingPhonesSnapshot = await tradersCollection.select('phone').get();
  const existingDbPhones = new Set(existingPhonesSnapshot.docs.map(doc => doc.data().phone).filter(Boolean));

  for (const rawTrader of tradersData) {
    const normalizedPhone = normalizePhoneNumber(rawTrader.phone);

    // Skip if the phone number is already in the DB or has been added in this same batch.
    // This correctly handles null/undefined phones, as they won't be in the sets.
    if (normalizedPhone && (existingDbPhones.has(normalizedPhone) || batchPhoneNumbers.has(normalizedPhone))) {
      continue;
    }
    
    const docRef = tradersCollection.doc();
    const newTrader = {
      name: rawTrader.name || "Unnamed Trader",
      status: rawTrader.status || "New Lead" as TraderStatus,
      lastActivity: parseActivityDate(rawTrader.lastActivity),
      description: rawTrader.description ?? null,
      reviews: rawTrader.reviews ?? null,
      rating: rawTrader.rating ?? null,
      website: rawTrader.website ?? null,
      phone: normalizedPhone,
      ownerName: rawTrader.ownerName ?? null,
      mainCategory: rawTrader.mainCategory ?? null,
      categories: rawTrader.categories ?? null,
      workdayTiming: rawTrader.workdayTiming ?? null,
      temporarilyClosedOn: rawTrader.temporarilyClosedOn ?? null,
      address: rawTrader.address ?? null,
      ownerProfileLink: rawTrader.ownerProfileLink ?? null,
      notes: rawTrader.notes ?? null,
      callBackDate: rawTrader.callBackDate ? new Date(rawTrader.callBackDate).toISOString() : null,
      totalAssets: rawTrader.totalAssets ?? null,
      estimatedAnnualRevenue: rawTrader.estimatedAnnualRevenue ?? null,
      estimatedCompanyValue: rawTrader.estimatedCompanyValue ?? null,
      employeeCount: rawTrader.employeeCount ?? null,
      tasks: [],
    };
    batch.set(docRef, newTrader);

    const traderForClient: Trader = {
      id: docRef.id,
      ...newTrader,
      lastActivity: new Date(newTrader.lastActivity).toISOString(),
      tasks: [],
    };

    addedTraders.push(traderForClient);
    if (normalizedPhone) {
      batchPhoneNumbers.add(normalizedPhone);
    }
  }

  try {
    await batch.commit();
    return addedTraders;
  } catch (error: any) {
    console.error('[TRADER_SERVICE_ERROR:bulkAddTraders]', error);
    throw new Error(`Database batch write failed: ${error.message}`);
  }
}

export async function bulkDeleteTraders(branchId: BaseBranchId, traderIds: string[]): Promise<{ successCount: number; failureCount: number }> {
  try {
    const db = ensureFirestore();
    const tradersCollection = getTradersCollection(branchId);
    const batch = db.batch();

    for (const traderId of traderIds) {
        const traderRef = tradersCollection.doc(traderId);
        const tasksSnapshot = await getTasksCollection(branchId, traderId).get();
        tasksSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        batch.delete(traderRef);
    }

    await batch.commit();
    return { successCount: traderIds.length, failureCount: 0 };
  } catch (error: any) {
    console.error('[TRADER_SERVICE_ERROR:bulkDeleteTraders]', error);
    return { successCount: 0, failureCount: traderIds.length };
  }
}

export async function createTask(branchId: BaseBranchId, taskData: Omit<Task, 'id'>): Promise<Task> {
  try {
    const tasksCollection = getTasksCollection(branchId, taskData.traderId);
    const docRef = await tasksCollection.add(taskData);
    return { id: docRef.id, ...taskData } as Task;
  } catch (error: any) {
    console.error('[TRADER_SERVICE_ERROR:createTask]', error);
    throw new Error(`Could not create task. Reason: ${error.message}`);
  }
}

export async function updateTask(
  branchId: BaseBranchId,
  traderId: string, 
  taskId: string,
  taskData: Partial<Omit<Task, 'id' | 'traderId'>>
): Promise<Task> {
    try {
        if (!traderId) throw new Error('traderId is required to update a task.');
        const taskRef = getTasksCollection(branchId, traderId).doc(taskId);
        await taskRef.update(taskData);
        const updatedDoc = await taskRef.get();
        const updatedData = updatedDoc.data();
        if (!updatedData) throw new Error('Failed to retrieve updated task data.');
        return { 
            id: taskId, 
            traderId: traderId,
            ...updatedData 
        } as Task;
    } catch (error: any) {
        console.error('[TRADER_SERVICE_ERROR:updateTask]', error);
        throw new Error(`Could not update task. Reason: ${error.message}`);
    }
}

export async function deleteTask(branchId: BaseBranchId, traderId: string, taskId: string): Promise<void> {
  try {
    const tasksCollection = getTasksCollection(branchId, traderId);
    await tasksCollection.doc(taskId).delete();
} catch (error: any) {
    console.error('[TRADER_SERVICE_ERROR:deleteTask]', error);
    throw new Error(`Could not delete task. Reason: ${error.message}`);
  }
}

    