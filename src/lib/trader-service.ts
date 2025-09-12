
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { firestore } from './firebase-admin'; // Correctly import from server-only file
import type { BaseBranchId, ParsedTraderData, Trader, TraderStatus, Task } from '@/types';
import { traderFormSchema } from '@/components/dashboard/TraderForm';
import type { z } from 'zod';
import { normalizePhoneNumber } from './utils';
import { INITIAL_SEED_TRADERS_DATA } from './seed-data';

type TraderFormValues = z.infer<typeof traderFormSchema>;

// --- Firestore Collection Reference ---
const getTradersCollection = (branchId: BaseBranchId) => {
  return firestore.collection('traders').doc(branchId).collection('branchTraders');
};

const getTasksCollection = (branchId: BaseBranchId, traderId: string) => {
    return firestore.collection('traders').doc(branchId).collection('branchTraders').doc(traderId).collection('tasks');
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

    // If the collection is empty, seed it with initial data and refetch.
    if (snapshot.empty) {
      console.log(`[getTraders] Branch ${branchId} is empty. Seeding initial data...`);
      await bulkAddTraders(branchId, INITIAL_SEED_TRADERS_DATA);
      // Re-fetch the data after seeding
      const seededSnapshot = await tradersCollection.get();
      console.log(`[getTraders] Re-fetching data for branch ${branchId} after seeding. Found ${seededSnapshot.size} documents.`);
      return mapSnapshotToTraders(seededSnapshot);
    }
    
    console.log(`[getTraders] Found ${snapshot.size} documents for branch ${branchId}.`);
    return mapSnapshotToTraders(snapshot);
  } catch (error: any) {
    console.error('[TRADER_SERVICE_ERROR:getTraders]', error);
    throw new Error('Failed to get traders from database.');
  }
}

/**
 * Helper function to map a Firestore query snapshot to an array of Trader objects.
 */
function mapSnapshotToTraders(snapshot: admin.firestore.QuerySnapshot): Trader[] {
  return snapshot.docs.map(doc => {
    const data = doc.data();
    // Provide a default for lastActivity to prevent crashes if it's missing
    const lastActivity = safeToISOString(data.lastActivity) || new Date(0).toISOString();
    return {
      id: doc.id,
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
      address: data.address ?? null,
      ownerProfileLink: data.ownerProfileLink ?? null,
      notes: data.notes ?? null,
      callBackDate: safeToISOString(data.callBackDate),
      totalAssets: data.totalAssets ?? null,
      estimatedAnnualRevenue: data.estimatedAnnualRevenue ?? null,
      estimatedCompanyValue: data.estimatedCompanyValue ?? null,
      employeeCount: data.employeeCount ?? null,
      tasks: data.tasks ?? null,
    } as Trader;
  });
}


export async function addTrader(branchId: BaseBranchId, traderData: TraderFormValues): Promise<Trader> {
  try {
    await checkDuplicatePhone(branchId, traderData.phone);
    const tradersCollection = getTradersCollection(branchId);

    const newTraderData = {
      ...traderData,
      phone: normalizePhoneNumber(traderData.phone),
      lastActivity: FieldValue.serverTimestamp(), // Set on creation
    };

    const docRef = await tradersCollection.add(newTraderData);
    const newTraderDoc = await docRef.get();
    const data = newTraderDoc.data();

    if (!data) throw new Error("Could not retrieve new trader after creation.");
     const lastActivity = data.lastActivity as Timestamp;

    return {
      id: docRef.id,
      ...data,
      name: data.name,
      status: data.status,
      lastActivity: lastActivity.toDate().toISOString(),
      tasks: data.tasks ?? null,
    } as Trader;
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
      lastActivity: FieldValue.serverTimestamp(), // Update on every modification
    };

    await traderRef.update(updatedData);
    
    const updatedDoc = await traderRef.get();
    const data = updatedDoc.data();

    if (!data) throw new Error("Could not retrieve updated trader.");
     const lastActivity = data.lastActivity as Timestamp;

    return {
      id: traderId,
      ...data,
      name: data.name,
      status: data.status,
      lastActivity: lastActivity.toDate().toISOString(),
      tasks: data.tasks ?? null,
    } as Trader;
  } catch (error: any) {
    console.error('[TRADER_SERVICE_ERROR:updateTrader]', error);
    throw new Error(`Could not update trader. Reason: ${error.message}`);
  }
}


export async function deleteTrader(branchId: BaseBranchId, traderId: string): Promise<void> {
  try {
    const tradersCollection = getTradersCollection(branchId);
    await tradersCollection.doc(traderId).delete();
  } catch (error: any) {
    console.error('[TRADER_SERVICE_ERROR:deleteTrader]', error);
    throw new Error(`Could not delete trader. Reason: ${error.message}`);
  }
}

export async function bulkAddTraders(branchId: BaseBranchId, tradersData: ParsedTraderData[]): Promise<Trader[]> {
  const tradersCollection = firestore.collection('traders').doc(branchId).collection('branchTraders');
  const batch = firestore.batch();
  const addedTraders: Trader[] = [];
  const addedPhoneNumbers = new Set<string>();

  // Get all existing phone numbers in the branch to check for duplicates
  const existingPhonesSnapshot = await tradersCollection.select('phone').get();
  const existingPhones = new Set(existingPhonesSnapshot.docs.map(doc => doc.data().phone).filter(Boolean));

  for (const rawTrader of tradersData) {
    const normalizedPhone = normalizePhoneNumber(rawTrader.phone);

    // Skip if phone number is a duplicate (either in DB or in this batch)
    if (normalizedPhone && (existingPhones.has(normalizedPhone) || addedPhoneNumbers.has(normalizedPhone))) {
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

    // This is an optimistic add for the UI return. The actual data will have a server timestamp.
    addedTraders.push({ id: docRef.id, ...newTrader } as Trader);
    if (normalizedPhone) {
      addedPhoneNumbers.add(normalizedPhone);
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
    const tradersCollection = firestore.collection('traders').doc(branchId).collection('branchTraders');
    const batch = firestore.batch();

    traderIds.forEach(id => {
      const docRef = tradersCollection.doc(id);
      batch.delete(docRef);
    });

    await batch.commit();
    return { successCount: traderIds.length, failureCount: 0 };
  } catch (error: any) {
    console.error('[TRADER_SERVICE_ERROR:bulkDeleteTraders]', error);
    throw new Error(`Could not bulk delete traders. Reason: ${error.message}`);
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
