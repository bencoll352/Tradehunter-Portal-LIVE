
'use server';

import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  setDoc,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import type { Trader, BaseBranchId, ParsedTraderData } from '@/types'; // Use BaseBranchId

const TRADERS_COLLECTION = 'traders';

// Helper function to ensure no 'undefined' values are sent to Firestore
function cleanDataForFirestoreWrite<T extends Record<string, any>>(data: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      // Convert undefined to null, as Firestore supports null but not undefined
      cleaned[key] = data[key] === undefined ? null : data[key];
    }
  }
  return cleaned;
}


// Initial seed data for traders. Used if Firestore is empty for a branch.
const INITIAL_SEED_TRADERS_DATA_RAW: Omit<Trader, 'id' | 'lastActivity'>[] = [
  { name: 'Alice Wonderland', branchId: 'PURLEY', totalSales: 125000, tradesMade: 150, status: 'Active', description: 'Curiouser and curiouser goods. Specializes in whimsical party supplies and enchanted garden ornaments. Known for excellent customer service.', website: 'https://alice.example.com', phone: '01234 567801', address: '123 Rabbit Hole Lane, Wonderland, WDC 123', mainCategory: 'Retail', ownerName: "Mad Hatter", ownerProfileLink: "https://example.com/madhatter", categories: "Party Supplies, Garden, Gifts", workdayTiming: "Mon-Sat 10am-6pm", closedOn: "Sundays", reviewKeywords: "tea, party, fun, whimsical, charming", rating: 4.5, notes: "Prefers Earl Grey tea for meetings. Important client for seasonal events.", callBackDate: null },
  { name: 'Bob The Builder', branchId: 'PURLEY', totalSales: 98000, tradesMade: 120, status: 'Call-Back', description: 'Can he fix it? Yes, he can! General construction and home repair services. Reliable and efficient.', rating: 4.8, phone: '01234 567802', mainCategory: 'Construction', categories: 'Building, Repairs, Home Improvement', address: "456 Fixit Ave, Builderville, BLD 456", ownerName: "Bob", ownerProfileLink: "https://example.com/bob", workdayTiming: "Mon-Fri 8am-5pm", closedOn: "Weekends", reviewKeywords: "reliable, efficient, construction", website: null, notes: "Needs follow-up on new concrete mixer availability.", callBackDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() }, // Call back in 5 days
  { name: 'Charlie Brown', branchId: 'PURLEY', totalSales: 75000, tradesMade: 90, status: 'Inactive', mainCategory: 'Services', address: '456 Kite Street, Townsville, TWN 789', workdayTiming: "Mon-Fri 9am-5pm", description: "Good grief! Offering comic strip consultation and kite flying lessons. Currently on hiatus.", phone: "01234567810", ownerName: "Charles M. Schulz (Estate)", reviewKeywords:"comic, kite, peanuts", rating: 3.0, website: null, ownerProfileLink: null, categories: null, closedOn: null, notes: "Account inactive for 6+ months.", callBackDate: null },
  { name: 'Diana Prince', branchId: 'BRANCH_B', totalSales: 210000, tradesMade: 200, status: 'Active', address: '789 Amazon Way, Themyscira, THM 001', phone: '01234 567803', mainCategory: 'Consulting', closedOn: 'Weekends', description: "Antiquities expert and diplomatic consultant. Handles sensitive international relations.", rating: 5.0, website: "https://diana.example.com", categories: "Diplomacy, History, Art", reviewKeywords: "wise, strong, expert", ownerName: "Diana Prince", ownerProfileLink: null, workdayTiming: "By Appointment", notes: "High profile client, requires discreet handling.", callBackDate: null },
  { name: 'Edward Scissorhands', branchId: 'BRANCH_B', totalSales: 150000, tradesMade: 180, status: 'New Lead', website: 'https://edwardcuts.example.com', description: 'Unique topiary and avant-garde hairdressing services. Gentle and artistic.', rating: 4.9, ownerProfileLink: 'https://example.com/edward', mainCategory: "Personal Care", categories: "Hairdressing, Landscaping, Art", phone: "01234567811", address: "1 Suburbia Drive, Castle Hill, CHL 555", reviewKeywords: "artistic, unique, gentle", ownerName: "Edward", workdayTiming: "Varies", closedOn: null, notes: "Potential for large landscaping projects.", callBackDate: null },
  { name: 'Fiona Gallagher', branchId: 'BRANCH_C', totalSales: 180000, tradesMade: 165, status: 'Active', description: 'South Side resilience. Runs a local cafe and diner. Known for hearty meals and a welcoming atmosphere.', mainCategory: 'Cafe', phone: '01234 567804', address: "222 South Side St, Chicago, CHI 606", ownerName: "Fiona Gallagher", categories: "Food, Diner, Coffee", workdayTiming: "Mon-Sun 7am-10pm", reviewKeywords: "family, hearty, local", rating: 4.2, website: null, ownerProfileLink: null, closedOn: null, notes: "Always orders supplies on Tuesdays.", callBackDate: null },
  { name: 'George Jetson', branchId: 'DOVER', totalSales: 300000, tradesMade: 250, status: 'New Lead', description: 'Digital Indexer at Spacely Space Sprockets. Future-proof solutions.', rating: 4.0, phone: '01234 567805', mainCategory: 'Technology', categories: 'Automation, IT, Future Tech', address: "Orbit City Apartments", ownerName: "George Jetson", workdayTiming: "Mon-Fri 9am-5pm (21st Century Time)", website: null, ownerProfileLink: null, closedOn: null, notes: "Interested in our latest robotic tools.", callBackDate: null },
];

// Add lastActivity to seed data and clean it
const INITIAL_SEED_TRADERS_DATA: Omit<Trader, 'id'>[] = INITIAL_SEED_TRADERS_DATA_RAW.map((trader, index) => {
  const date = new Date(2024, 6, 20 - index); // Stagger dates a bit
  return cleanDataForFirestoreWrite({
    ...trader,
    lastActivity: date.toISOString(),
  }) as Omit<Trader, 'id'>;
});

const determineLastActivityString = (activity: any): string => {
  if (activity instanceof Timestamp) {
    return activity.toDate().toISOString();
  }
  if (typeof activity === 'string') {
    try {
      const parsedDate = new Date(activity);
      if (!isNaN(parsedDate.getTime())) { // Check if date is valid
        return parsedDate.toISOString();
      }
      console.warn(`[TraderService] Invalid date string for lastActivity: ${activity}. Defaulting to epoch.`);
      return new Date(0).toISOString();
    } catch (e) {
      console.warn(`[TraderService] Error parsing date string for lastActivity: ${activity}. Defaulting to epoch.`, e);
      return new Date(0).toISOString();
    }
  }
  if (activity && typeof activity.toDate === 'function') { 
    try {
      return activity.toDate().toISOString();
    } catch(e) {
       console.warn(`[TraderService] Error converting object with toDate method for lastActivity: ${activity}. Defaulting to epoch.`, e);
       return new Date(0).toISOString();
    }
  }
  if (activity !== null && activity !== undefined) {
    console.warn(`[TraderService] Unexpected lastActivity type: ${typeof activity}, value: ${JSON.stringify(activity)}. Defaulting to epoch.`);
  }
  return new Date(0).toISOString(); 
};


const mapDocToTrader = (docData: any, id: string): Trader => {
  const data = docData as Partial<Omit<Trader, 'id'>>;

  return {
    id,
    name: data.name ?? 'Unknown Name',
    branchId: data.branchId ?? 'UNKNOWN_BRANCH', // This should be a BaseBranchId
    totalSales: data.totalSales ?? 0,
    tradesMade: data.tradesMade ?? 0,
    status: data.status ?? 'New Lead', 
    lastActivity: determineLastActivityString(data.lastActivity),
    description: data.description ?? null,
    rating: data.rating ?? null,
    website: data.website ?? null,
    phone: data.phone ?? null,
    address: data.address ?? null,
    mainCategory: data.mainCategory ?? null,
    ownerName: data.ownerName ?? null,
    ownerProfileLink: data.ownerProfileLink ?? null,
    categories: data.categories ?? null,
    workdayTiming: data.workdayTiming ?? null,
    closedOn: data.closedOn ?? null,
    reviewKeywords: data.reviewKeywords ?? null,
    notes: data.notes ?? null,
    callBackDate: data.callBackDate ? determineLastActivityString(data.callBackDate) : null,
  };
};

// Renamed branchId to baseBranchId to reflect its purpose
export async function getTradersByBranch(baseBranchId: BaseBranchId): Promise<Trader[]> {
  if (!db) {
    console.error("[TraderService:getTradersByBranch] Firestore not initialized. Aborting operation. Check Firebase configuration.");
    throw new Error("Firestore not initialized. Cannot fetch traders.");
  }
  const tradersCollectionRef = collection(db, TRADERS_COLLECTION);
  // Queries Firestore using the baseBranchId (e.g., "PURLEY")
  const q = query(tradersCollectionRef, where("branchId", "==", baseBranchId));

  try {
    let querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      const seedDataForBranch = INITIAL_SEED_TRADERS_DATA.filter(t => t.branchId === baseBranchId);
      if (seedDataForBranch.length > 0) {
        console.log(`[TraderService:getTradersByBranch] No traders found for branch ${baseBranchId}, attempting to seed initial data...`);
        const batch = writeBatch(db);
        seedDataForBranch.forEach(traderSeedData => {
          const traderDocRef = doc(tradersCollectionRef); 
          batch.set(traderDocRef, traderSeedData); 
        });
        await batch.commit();
        console.log(`[TraderService:getTradersByBranch] Seeded ${seedDataForBranch.length} traders for branch ${baseBranchId}. Refetching...`);
        querySnapshot = await getDocs(q); 
      } else {
        console.log(`[TraderService:getTradersByBranch] No traders found for branch ${baseBranchId} and no seed data configured. Returning empty list.`);
        return [];
      }
    }
    
    return querySnapshot.docs.map(doc => mapDocToTrader(doc.data(), doc.id));

  } catch (error) {
    console.error(`[TraderService:getTradersByBranch] Error fetching traders for branch ${baseBranchId}:`, error);
    throw new Error(`Failed to fetch traders for branch ${baseBranchId}. Ensure Firestore is set up and rules allow reads.`);
  }
}

// Renamed branchId to baseBranchId
export async function getTraderById(id: string, baseBranchId: BaseBranchId): Promise<Trader | null> {
  if (!db) {
    console.error("[TraderService:getTraderById] Firestore not initialized. Aborting operation. Check Firebase configuration.");
    throw new Error("Firestore not initialized. Cannot fetch trader.");
  }
  try {
    const traderDocRef = doc(db, TRADERS_COLLECTION, id);
    const docSnap = await getDoc(traderDocRef);

    if (docSnap.exists()) {
      const trader = mapDocToTrader(docSnap.data(), docSnap.id);
      // Ensure fetched trader belongs to the correct base branch
      if (trader.branchId === baseBranchId) {
        return trader;
      }
      console.warn(`[TraderService:getTraderById] Trader ${id} found but does not belong to branch ${baseBranchId}. Belongs to ${trader.branchId}`);
      return null; 
    }
    return null;
  } catch (error) {
    console.error(`[TraderService:getTraderById] Error fetching trader ${id}:`, error);
    throw error;
  }
}

export async function addTraderToDb(
  traderData: Omit<Trader, 'id' | 'lastActivity' | 'branchId'>, // branchId will be added here
  baseBranchId: BaseBranchId // Use BaseBranchId
): Promise<Trader> {
  if (!db) {
    console.error("[TraderService:addTraderToDb] Firestore not initialized. Aborting operation. Check Firebase configuration.");
    throw new Error("Firestore not initialized. Cannot add trader.");
  }
  try {
    const dataWithSystemFields = {
      ...traderData,
      branchId: baseBranchId, // Set the baseBranchId for data storage
      lastActivity: new Date().toISOString(),
    };
    const cleanedData = cleanDataForFirestoreWrite(dataWithSystemFields);
    
    const tradersCollectionRef = collection(db, TRADERS_COLLECTION);
    console.log(`[TraderService:addTraderToDb] Attempting to add trader: ${cleanedData.name} to branch ${baseBranchId}`);
    const docRef = await addDoc(tradersCollectionRef, cleanedData);
    console.log(`[TraderService:addTraderToDb] Successfully added trader ${docRef.id} with name: ${cleanedData.name}`);
    // The returned trader will have the baseBranchId as its branchId field
    return { ...cleanedData, id: docRef.id } as Trader;
  } catch (error) {
    console.error(`[TraderService:addTraderToDb] Error adding trader ${traderData.name} to Firestore:`, error);
    throw error;
  }
}

// updatedTraderData.branchId should already be the BaseBranchId
export async function updateTraderInDb(updatedTraderData: Trader): Promise<Trader | null> {
  if (!db) {
    console.error("[TraderService:updateTraderInDb] Firestore not initialized. Aborting operation. Check Firebase configuration.");
    throw new Error("Firestore not initialized. Cannot update trader.");
  }
  try {
    const traderDocRef = doc(db, TRADERS_COLLECTION, updatedTraderData.id);
    
    const dataToPrepareForUpdate = {
      ...updatedTraderData,
      lastActivity: new Date().toISOString(), 
    };
    const { id, ...dataWithoutId } = dataToPrepareForUpdate;
    const cleanedData = cleanDataForFirestoreWrite(dataWithoutId);

    console.log(`[TraderService:updateTraderInDb] Attempting to update trader ID: ${updatedTraderData.id} in branch ${cleanedData.branchId} with data:`, cleanedData);
    await updateDoc(traderDocRef, cleanedData);
    console.log(`[TraderService:updateTraderInDb] Successfully updated trader ID: ${updatedTraderData.id}`);
    return { ...cleanedData, id: updatedTraderData.id } as Trader;
  } catch (error) {
    console.error(`[TraderService:updateTraderInDb] Error updating trader ${updatedTraderData.id}:`, error);
    throw error;
  }
}

// Renamed branchId to baseBranchId
export async function deleteTraderFromDb(traderId: string, baseBranchId: BaseBranchId): Promise<boolean> {
   if (!db) {
    console.error("[TraderService:deleteTraderFromDb] Firestore not initialized. Aborting operation. Check Firebase configuration.");
    throw new Error("Firestore not initialized. Cannot delete trader.");
  }
  try {
    // It's good practice to verify the trader belongs to the branch before deleting,
    // though Firestore rules should be the primary enforcer.
    // For this action, we assume the client has done its due diligence or rules will prevent cross-branch deletes.
    const traderDocRef = doc(db, TRADERS_COLLECTION, traderId);
    console.log(`[TraderService:deleteTraderFromDb] Attempting to delete trader ID: ${traderId} (associated with base branch ${baseBranchId})`);
    await deleteDoc(traderDocRef);
    console.log(`[TraderService:deleteTraderFromDb] Successfully deleted trader ID: ${traderId}`);
    return true;
  } catch (error) {
    console.error(`[TraderService:deleteTraderFromDb] Error deleting trader ${traderId}:`, error);
    throw error;
  }
}

export async function bulkAddTradersToDb(
  tradersToCreate: ParsedTraderData[],
  baseBranchId: BaseBranchId // Use BaseBranchId
): Promise<Trader[]> {
  if (!db) {
    console.error("[TraderService:bulkAddTradersToDb] Firestore not initialized. Aborting operation. Check Firebase configuration.");
    throw new Error("Firestore not initialized. Cannot bulk add traders.");
  }
  const tradersCollectionRef = collection(db, TRADERS_COLLECTION);
  const batch = writeBatch(db);
  const createdTraders: Trader[] = [];

  console.log(`[TraderService:bulkAddTradersToDb] Attempting to bulk add ${tradersToCreate.length} traders to branch ${baseBranchId}`);

  tradersToCreate.forEach((parsedData, index) => {
    const newTraderDocRef = doc(tradersCollectionRef); 
    
    const newTraderObject: Omit<Trader, 'id'> = {
      name: parsedData.name,
      branchId: baseBranchId, // Set the baseBranchId
      totalSales: parsedData.totalSales ?? 0,
      tradesMade: parsedData.tradesMade ?? 0,
      status: parsedData.status ?? 'New Lead', 
      lastActivity: parsedData.lastActivity || new Date().toISOString(),
      description: parsedData.description,
      rating: parsedData.rating,
      website: parsedData.website,
      phone: parsedData.phone,
      address: parsedData.address,
      mainCategory: parsedData.mainCategory,
      ownerName: parsedData.ownerName,
      ownerProfileLink: parsedData.ownerProfileLink,
      categories: parsedData.categories,
      workdayTiming: parsedData.workdayTiming,
      notes: parsedData.notes,
      callBackDate: parsedData.callBackDate ?? null,
      closedOn: null, 
      reviewKeywords: null,
    };
    
    const finalTraderDataForDb = cleanDataForFirestoreWrite(newTraderObject);
    batch.set(newTraderDocRef, finalTraderDataForDb);
    createdTraders.push({ ...(finalTraderDataForDb as Omit<Trader, 'id'>), id: newTraderDocRef.id });
    if (index < 5) {
        console.log(`[TraderService:bulkAddTradersToDb] Batching trader for add: ${finalTraderDataForDb.name} to branch ${baseBranchId}`);
    }
  });

  try {
    await batch.commit();
    console.log(`[TraderService:bulkAddTradersToDb] Successfully bulk added ${createdTraders.length} traders to branch ${baseBranchId}.`);
    return createdTraders;
  } catch (error) {
    console.error(`[TraderService:bulkAddTradersToDb] Error bulk adding traders for branch ${baseBranchId}:`, error);
    throw error; 
  }
}
