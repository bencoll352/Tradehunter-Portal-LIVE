
import { FieldValue } from 'firebase-admin/firestore';
import { getFirebaseAdmin } from './trader-service-firestore';
import type { BaseBranchId, ParsedTraderData, Trader, TraderStatus } from '@/types';
import { traderFormSchema } from '@/components/dashboard/TraderForm';
import type { z } from 'zod';
import { normalizePhoneNumber } from './utils';

type TraderFormValues = z.infer<typeof traderFormSchema>;

// --- Firestore Collection Reference ---
const getTradersCollection = async (branchId: BaseBranchId) => {
  const { firestore } = await getFirebaseAdmin();
  return firestore.collection('traders').doc(branchId).collection('branchTraders');
};


// --- Helper Functions ---

/**
 * Checks if a trader with the given phone number already exists in the branch.
 * Throws an error if a duplicate is found.
 */
async function checkDuplicatePhone(branchId: BaseBranchId, phone: string | null | undefined, currentTraderId?: string) {
  if (!phone) return; // Cannot check for duplicates if phone is not provided

  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return;

  const tradersCollection = await getTradersCollection(branchId);
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
function parseActivityDate(dateString: string | undefined): string {
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


// --- Main Service Functions ---

export async function getTraders(branchId: BaseBranchId): Promise<Trader[]> {
  try {
    const tradersCollection = await getTradersCollection(branchId);
    const snapshot = await tradersCollection.get();
    if (snapshot.empty) {
      return [];
    }
    const traders = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'N/A',
        status: data.status || 'Inactive',
        lastActivity: data.lastActivity ? (data.lastActivity.toDate ? data.lastActivity.toDate().toISOString() : new Date(data.lastActivity).toISOString()) : new Date(0).toISOString(),
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
        callBackDate: data.callBackDate ? (data.callBackDate.toDate ? data.callBackDate.toDate().toISOString() : new Date(data.callBackDate).toISOString()) : null,
        totalAssets: data.totalAssets ?? null,
        estimatedAnnualRevenue: data.estimatedAnnualRevenue ?? null,
        estimatedCompanyValue: data.estimatedCompanyValue ?? null,
        employeeCount: data.employeeCount ?? null,
      } as Trader;
    });
    return traders;
  } catch (error: any) {
    console.error('[TRADER_SERVICE_ERROR:getTraders]', error);
    throw new Error('Failed to get traders from database.');
  }
}

export async function addTrader(branchId: BaseBranchId, traderData: TraderFormValues): Promise<Trader> {
  try {
    await checkDuplicatePhone(branchId, traderData.phone);
    const tradersCollection = await getTradersCollection(branchId);

    const newTraderData = {
      ...traderData,
      phone: normalizePhoneNumber(traderData.phone),
      lastActivity: FieldValue.serverTimestamp(), // Set on creation
    };

    const docRef = await tradersCollection.add(newTraderData);
    const newTraderDoc = await docRef.get();
    const data = newTraderDoc.data();

    if (!data) throw new Error("Could not retrieve new trader after creation.");

    return {
      id: docRef.id,
      name: data.name,
      status: data.status,
      lastActivity: data.lastActivity.toDate().toISOString(),
      ...data
    } as Trader;
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
      lastActivity: FieldValue.serverTimestamp(), // Update on every modification
    };

    await traderRef.update(updatedData);
    
    const updatedDoc = await traderRef.get();
    const data = updatedDoc.data();

    if (!data) throw new Error("Could not retrieve updated trader.");

    return {
      id: traderId,
      name: data.name,
      status: data.status,
      lastActivity: data.lastActivity.toDate().toISOString(),
      ...data
    } as Trader;
  } catch (error: any) {
    console.error('[TRADER_SERVICE_ERROR:updateTrader]', error);
    throw new Error(`Could not update trader. Reason: ${error.message}`);
  }
}


export async function deleteTrader(branchId: BaseBranchId, traderId: string): Promise<void> {
  try {
    const tradersCollection = await getTradersCollection(branchId);
    await tradersCollection.doc(traderId).delete();
  } catch (error: any) {
    console.error('[TRADER_SERVICE_ERROR:deleteTrader]', error);
    throw new Error(`Could not delete trader. Reason: ${error.message}`);
  }
}

export async function bulkAddTraders(branchId: BaseBranchId, tradersData: ParsedTraderData[]): Promise<Trader[]> {
  const { firestore } = await getFirebaseAdmin();
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
    const { firestore } = await getFirebaseAdmin();
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

// Function to seed initial data if a branch has no traders
async function seedInitialData(branchId: BaseBranchId) {
    // This is a placeholder, actual implementation depends on seed data format
    console.log(`Seeding initial data for branch ${branchId}...`);
    // Example: await bulkAddTraders(branchId, INITIAL_SEED_DATA_FOR_PURLEY);
}
