
'use server';

import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getFirebaseAdmin } from './firebase-admin'; 
import type { BaseBranchId, ParsedTraderData, Trader, TraderStatus, Task, ParsedFinancialData } from '@/types';
import { traderFormSchema } from '@/components/dashboard/TraderForm';
import type { z } from 'zod';
import { normalizePhoneNumber } from './utils';
import * as admin from 'firebase-admin';

type TraderFormValues = z.infer<typeof traderFormSchema>;
type Goals = { weeklyNewLeadsGoal?: number; monthlyActiveTradersGoal?: number };


const getBranchDoc = async (branchId: BaseBranchId) => {
  const { firestore } = await getFirebaseAdmin();
  return firestore.collection('traders').doc(branchId);
};

export async function getGoals(branchId: BaseBranchId): Promise<Goals> {
  try {
    const branchDoc = await getBranchDoc(branchId);
    const doc = await branchDoc.get();
    if (!doc.exists) {
      return {};
    }
    const data = doc.data();
    return {
      weeklyNewLeadsGoal: data?.weeklyNewLeadsGoal,
      monthlyActiveTradersGoal: data?.monthlyActiveTradersGoal,
    };
  } catch (error: any) {
    console.error('[TRADER_SERVICE_ERROR:getGoals]', error);
    throw new Error('Failed to get goals from database.');
  }
}

export async function updateGoals(branchId: BaseBranchId, goals: Goals): Promise<Goals> {
  try {
    const branchDoc = await getBranchDoc(branchId);
    // Use merge: true to create the doc if it doesn't exist or update it if it does
    await branchDoc.set(goals, { merge: true });
    return goals;
  } catch (error: any) {
    console.error('[TRADER_SERVICE_ERROR:updateGoals]', error);
    throw new Error(`Could not update goals. Reason: ${error.message}`);
  }
}


// --- Firestore Collection References ---
const getTradersCollection = async (branchId: BaseBranchId) => {
  const { firestore } = await getFirebaseAdmin();
  return firestore.collection('traders').doc(branchId).collection('branchTraders');
};

const getTasksCollection = async (branchId: BaseBranchId, traderId: string) => {
  const { firestore } = await getFirebaseAdmin();
  return firestore.collection('traders').doc(branchId).collection('branchTraders').doc(traderId).collection('tasks');
}

// --- Helper Functions ---

async function checkDuplicatePhone(branchId: BaseBranchId, phone: string | null | undefined, currentTraderId?: string) {
  if (!phone) return;

  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return;

  const tradersCollection = await getTradersCollection(branchId);
  const querySnapshot = await tradersCollection.where('phone', '==', normalizedPhone).get();

  if (!querySnapshot.empty) {
    for (const doc of querySnapshot.docs) {
      if (doc.id !== currentTraderId) {
        throw new Error('A trader with this phone number already exists.');
      }
    }
  }
}

function parseActivityDate(dateString: string | undefined | null): string {
    if (!dateString) {
        return new Date().toISOString();
    }
    try {
        const isoDate = new Date(dateString);
        if (!isNaN(isoDate.getTime())) {
            return isoDate.toISOString();
        }
    } catch (e) {}

    const parts = dateString.split('/');
    if (parts.length === 3) {
        const [day, month, year] = parts;
        const fullYear = year.length === 2 ? `20${year}` : year;
        const parsedDate = new Date(parseInt(fullYear, 10), parseInt(month, 10) - 1, parseInt(day, 10));
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString();
        }
    }

    const fallbackDate = new Date(dateString);
    return !isNaN(fallbackDate.getTime()) ? fallbackDate.toISOString() : new Date().toISOString();
}

const safeToISOString = (value: any): string | null => {
    if (!value) return null;
    if (value instanceof Timestamp) {
        return value.toDate().toISOString();
    }
    if (typeof value === 'object' && value !== null && typeof (value as any).toDate === 'function') {
        return (value as any).toDate().toISOString();
    }
    if (typeof value === 'string') {
        try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return date.toISOString();
            }
        } catch(e) {
            return null;
        }
    }
    return null;
}

// --- Main Service Functions ---

export async function getTraders(branchId: BaseBranchId): Promise<Trader[]> {
  try {
    const tradersCollection = await getTradersCollection(branchId);
    const snapshot = await tradersCollection.get();

    if (snapshot.empty) {
      console.log(`[getTraders] Branch ${branchId} is empty. No data to return.`);
      return [];
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

    const tasksCollection = await getTasksCollection(branchId, traderId);
    const tasksSnapshot = await tasksCollection.get();
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
    const tradersCollection = await getTradersCollection(branchId);

    const dataToSave = {
      ...traderData,
      phone: normalizePhoneNumber(traderData.phone),
      lastActivity: FieldValue.serverTimestamp(),
      callBackDate: traderData.callBackDate ? Timestamp.fromDate(new Date(traderData.callBackDate)) : null,
    };

    const docRef = await tradersCollection.add(dataToSave);
    const newTraderDoc = await docRef.get();
    
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
    const tradersCollection = await getTradersCollection(branchId);
    const traderRef = tradersCollection.doc(traderId);

    const updatedData = {
      ...traderData,
      phone: normalizePhoneNumber(traderData.phone),
      lastActivity: FieldValue.serverTimestamp(), 
      callBackDate: traderData.callBackDate ? Timestamp.fromDate(new Date(traderData.callBackDate)) : null,
    };

    await traderRef.update(updatedData);
    
    const updatedDoc = await traderRef.get();
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
    const { firestore } = await getFirebaseAdmin();
    const traderRef = (await getTradersCollection(branchId)).doc(traderId);
    const tasksCollection = await getTasksCollection(branchId, traderId);
    const tasksSnapshot = await tasksCollection.get();

    const batch = firestore.batch();

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
    const { firestore } = await getFirebaseAdmin();
    const tradersCollection = await getTradersCollection(branchId);
    const batch = firestore.batch();
    const addedTraders: Trader[] = [];

    const existingPhonesSnapshot = await tradersCollection.select('phone').get();
    const existingDbPhones = new Set<string>();
    existingPhonesSnapshot.forEach(doc => {
        const phone = doc.data().phone;
        if (phone) { 
            existingDbPhones.add(phone);
        }
    });

    const batchPhoneNumbers = new Set<string>();

    for (const rawTrader of tradersData) {
        const normalizedPhone = normalizePhoneNumber(rawTrader.phone);

        if (normalizedPhone) {
            if (existingDbPhones.has(normalizedPhone) || batchPhoneNumbers.has(normalizedPhone)) {
                console.log(`[bulkAddTraders] Skipping duplicate trader by phone: ${normalizedPhone}`);
                continue; 
            }
            batchPhoneNumbers.add(normalizedPhone); 
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
    }

    try {
        await batch.commit();
        return addedTraders;
    } catch (error: any) {
        console.error('[TRADER_SERVICE_ERROR:bulkAddTraders]', error);
        throw new Error(`Database batch write failed: ${error.message}`);
    }
}

export async function bulkUpdateFinancials(
  branchId: BaseBranchId,
  financialData: ParsedFinancialData[]
): Promise<{ updatedCount: number; notFoundCount: number }> {
  const { firestore } = await getFirebaseAdmin();
  const tradersCollection = await getTradersCollection(branchId);
  const batch = firestore.batch();
  let updatedCount = 0;
  let notFoundCount = 0;

  // Create a map of trader names to their document IDs for efficient lookup
  const nameToIdMap = new Map<string, string>();
  const snapshot = await tradersCollection.select('name').get();
  snapshot.forEach(doc => {
    const name = doc.data().name;
    if (name) {
      nameToIdMap.set(name.trim().toLowerCase(), doc.id);
    }
  });

  for (const item of financialData) {
    const traderId = nameToIdMap.get(item.name.trim().toLowerCase());

    if (traderId) {
      const traderRef = tradersCollection.doc(traderId);
      const dataToUpdate: { [key: string]: any } = {};

      if (item.totalAssets !== undefined) dataToUpdate.totalAssets = item.totalAssets;
      if (item.estimatedAnnualRevenue !== undefined) dataToUpdate.estimatedAnnualRevenue = item.estimatedAnnualRevenue;
      if (item.estimatedCompanyValue !== undefined) dataToUpdate.estimatedCompanyValue = item.estimatedCompanyValue;
      if (item.employeeCount !== undefined) dataToUpdate.employeeCount = item.employeeCount;

      if (Object.keys(dataToUpdate).length > 0) {
        batch.update(traderRef, dataToUpdate);
        updatedCount++;
      }
    } else {
      notFoundCount++;
    }
  }

  if (updatedCount > 0) {
    await batch.commit();
  }

  return { updatedCount, notFoundCount };
}


export async function bulkDeleteTraders(branchId: BaseBranchId, traderIds: string[]): Promise<{ successCount: number; failureCount: number }> {
  try {
    const { firestore } = await getFirebaseAdmin();
    const tradersCollection = await getTradersCollection(branchId);
    const batch = firestore.batch();

    for (const traderId of traderIds) {
        const traderRef = tradersCollection.doc(traderId);
        const tasksCollection = await getTasksCollection(branchId, traderId);
        const tasksSnapshot = await tasksCollection.get();
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
    const tasksCollection = await getTasksCollection(branchId, taskData.traderId);
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
        const taskRef = (await getTasksCollection(branchId, traderId)).doc(taskId);
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
    const tasksCollection = await getTasksCollection(branchId, traderId);
    await tasksCollection.doc(taskId).delete();
} catch (error: any) {
    console.error('[TRADER_SERVICE_ERROR:deleteTask]', error);
    throw new Error(`Could not delete task. Reason: ${error.message}`);
  }
}

    