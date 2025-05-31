
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
  serverTimestamp,
  setDoc,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import type { Trader, BranchId, ParsedTraderData } from '@/types';

const TRADERS_COLLECTION = 'traders';

// Initial seed data for traders. Used if Firestore is empty for a branch.
// Note: 'id' field will be assigned by Firestore.
const INITIAL_SEED_TRADERS_DATA: Omit<Trader, 'id'>[] = [
  { name: 'Alice Wonderland', branchId: 'PURLEY', totalSales: 125000, tradesMade: 150, status: 'Active', lastActivity: new Date(2024, 6, 15).toISOString(), description: 'Curiouser and curiouser goods. Specializes in whimsical party supplies and enchanted garden ornaments. Known for excellent customer service.', website: 'https://alice.example.com', phone: '01234 567801', address: '123 Rabbit Hole Lane, Wonderland, WDC 123', mainCategory: 'Retail', ownerName: "Mad Hatter", ownerProfileLink: "https://example.com/madhatter", categories: "Party Supplies, Garden, Gifts", workdayTiming: "Mon-Sat 10am-6pm", closedOn: "Sundays", reviewKeywords: "tea, party, fun, whimsical, charming" },
  { name: 'Bob The Builder', branchId: 'PURLEY', totalSales: 98000, tradesMade: 120, status: 'Active', lastActivity: new Date(2024, 6, 10).toISOString(), description: 'Can he fix it? Yes, he can! General construction and home repair services. Reliable and efficient.', rating: 4.8, phone: '01234 567802', mainCategory: 'Construction', categories: 'Building, Repairs, Home Improvement', address: "456 Fixit Ave, Builderville, BLD 456", ownerName: "Bob", ownerProfileLink: "https://example.com/bob", workdayTiming: "Mon-Fri 8am-5pm", closedOn: "Weekends", reviewKeywords: "reliable, efficient, construction" },
  { name: 'Charlie Brown', branchId: 'PURLEY', totalSales: 75000, tradesMade: 90, status: 'Inactive', lastActivity: new Date(2024, 3, 5).toISOString(), mainCategory: 'Services', address: '456 Kite Street, Townsville, TWN 789', workdayTiming: "Mon-Fri 9am-5pm", description: "Good grief! Offering comic strip consultation and kite flying lessons. Currently on hiatus.", phone: "01234567810", ownerName: "Charles M. Schulz (Estate)", reviewKeywords:"comic, kite, peanuts" },
  { name: 'Diana Prince', branchId: 'BRANCH_B', totalSales: 210000, tradesMade: 200, status: 'Active', lastActivity: new Date(2024, 6, 18).toISOString(), address: '789 Amazon Way, Themyscira, THM 001', phone: '01234 567803', mainCategory: 'Consulting', closedOn: 'Weekends', description: "Antiquities expert and diplomatic consultant. Handles sensitive international relations.", rating: 5.0, website: "https://diana.example.com", categories: "Diplomacy, History, Art", reviewKeywords: "wise, strong, expert"},
  { name: 'Edward Scissorhands', branchId: 'BRANCH_B', totalSales: 150000, tradesMade: 180, status: 'Active', lastActivity: new Date(2024, 6, 12).toISOString(), website: 'https://edwardcuts.example.com', description: 'Unique topiary and avant-garde hairdressing services. Gentle and artistic.', rating: 4.9, ownerProfileLink: 'https://example.com/edward', mainCategory: "Personal Care", categories: "Hairdressing, Landscaping, Art", phone: "01234567811", address: "1 Suburbia Drive, Castle Hill, CHL 555", reviewKeywords: "artistic, unique, gentle"},
  { name: 'Fiona Gallagher', branchId: 'BRANCH_C', totalSales: 180000, tradesMade: 165, status: 'Active', lastActivity: new Date(2024, 6, 20).toISOString(), description: 'South Side resilience. Runs a local cafe and diner. Known for hearty meals and a welcoming atmosphere.', mainCategory: 'Cafe', phone: '01234 567804', address: "222 South Side St, Chicago, CHI 606", ownerName: "Fiona Gallagher", categories: "Food, Diner, Coffee", workdayTiming: "Mon-Sun 7am-10pm", reviewKeywords: "family, hearty, local" },
];


const mapDocToTrader = (docData: any, id: string): Trader => {
  const data = docData as Omit<Trader, 'id'>; // Assume docData matches Trader structure minus id
  return {
    ...data,
    id,
    // Ensure lastActivity is a string. Firestore timestamps would need .toDate().toISOString()
    // For this prototype, we assume lastActivity is stored as an ISO string.
    lastActivity: typeof data.lastActivity === 'string' ? data.lastActivity : (data.lastActivity as any instanceof Timestamp ? (data.lastActivity as any).toDate().toISOString() : new Date().toISOString()),
  };
};

export async function getTradersByBranch(branchId: BranchId): Promise<Trader[]> {
  const tradersCollectionRef = collection(db, TRADERS_COLLECTION);
  const q = query(tradersCollectionRef, where("branchId", "==", branchId));

  try {
    let querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Seed data for this branch if it's the first time
      console.log(`No traders found for branch ${branchId}, seeding initial data...`);
      const seedDataForBranch = INITIAL_SEED_TRADERS_DATA.filter(t => t.branchId === branchId);
      if (seedDataForBranch.length > 0) {
        const batch = writeBatch(db);
        seedDataForBranch.forEach(traderSeedData => {
          const traderDocRef = doc(tradersCollectionRef); // Auto-generate ID
          // Ensure lastActivity is properly set if not present in seed
          const traderToAdd = {
            ...traderSeedData,
            lastActivity: traderSeedData.lastActivity || new Date().toISOString(),
          };
          batch.set(traderDocRef, traderToAdd);
        });
        await batch.commit();
        console.log(`Seeded ${seedDataForBranch.length} traders for branch ${branchId}.`);
        // Fetch again to get the data with Firestore-generated IDs
        querySnapshot = await getDocs(q);
      } else {
        console.log(`No seed data configured for branch ${branchId}.`);
        return [];
      }
    }
    
    return querySnapshot.docs.map(doc => mapDocToTrader(doc.data(), doc.id));

  } catch (error) {
    console.error(`Error fetching traders for branch ${branchId}:`, error);
    throw new Error(`Failed to fetch traders for branch ${branchId}. Ensure Firestore is set up and rules allow reads.`);
  }
}

export async function getTraderById(id: string, branchId: BranchId): Promise<Trader | null> {
  try {
    const traderDocRef = doc(db, TRADERS_COLLECTION, id);
    const docSnap = await getDoc(traderDocRef);

    if (docSnap.exists()) {
      const trader = mapDocToTrader(docSnap.data(), docSnap.id);
      // Verify branchId if necessary, though Firestore rules should handle this
      if (trader.branchId === branchId) {
        return trader;
      }
      console.warn(`Trader ${id} found but does not belong to branch ${branchId}.`);
      return null; 
    }
    return null;
  } catch (error) {
    console.error(`Error fetching trader ${id}:`, error);
    throw error;
  }
}

export async function addTraderToDb(
  traderData: Omit<Trader, 'id' | 'lastActivity'>,
  branchId: BranchId // Explicitly pass branchId
): Promise<Trader> {
  try {
    const newTraderData = {
      ...traderData,
      branchId: branchId, // Ensure branchId is part of the document
      lastActivity: new Date().toISOString(), // System-managed
      // Firestore will auto-generate the ID
    };
    const tradersCollectionRef = collection(db, TRADERS_COLLECTION);
    const docRef = await addDoc(tradersCollectionRef, newTraderData);
    return { ...newTraderData, id: docRef.id } as Trader; // Return with Firestore-generated ID
  } catch (error) {
    console.error('Error adding trader to Firestore:', error);
    throw error;
  }
}

export async function updateTraderInDb(updatedTraderData: Trader): Promise<Trader | null> {
  try {
    const traderDocRef = doc(db, TRADERS_COLLECTION, updatedTraderData.id);
    // Ensure lastActivity is updated, and branchId/id are not inadvertently changed if they are part of updatedTraderData
    const dataToUpdate = {
      ...updatedTraderData,
      lastActivity: new Date().toISOString(),
    };
    // Remove id from the data to update as it's the document key
    delete (dataToUpdate as any).id; 

    await updateDoc(traderDocRef, dataToUpdate);
    // Return the merged data including the new lastActivity
    return { ...updatedTraderData, lastActivity: dataToUpdate.lastActivity };
  } catch (error) {
    console.error(`Error updating trader ${updatedTraderData.id}:`, error);
    throw error;
  }
}

export async function deleteTraderFromDb(traderId: string, branchId: BranchId): Promise<boolean> {
  // Optional: verify trader belongs to branch before deleting if rules are not restrictive enough
  // const trader = await getTraderById(traderId, branchId);
  // if (!trader) return false; 

  try {
    const traderDocRef = doc(db, TRADERS_COLLECTION, traderId);
    await deleteDoc(traderDocRef);
    return true;
  } catch (error) {
    console.error(`Error deleting trader ${traderId}:`, error);
    throw error;
  }
}

export async function bulkAddTradersToDb(
  tradersToCreate: ParsedTraderData[],
  branchId: BranchId
): Promise<Trader[]> {
  const tradersCollectionRef = collection(db, TRADERS_COLLECTION);
  const batch = writeBatch(db);
  const createdTraders: Trader[] = [];

  tradersToCreate.forEach(parsedData => {
    const newTraderDocRef = doc(tradersCollectionRef); // Firestore generates ID
    const newTrader: Omit<Trader, 'id'> = { // Build the object matching Trader type (without id)
      name: parsedData.name,
      branchId: branchId,
      totalSales: parsedData.totalSales ?? 0,
      tradesMade: parsedData.tradesMade ?? 0,
      status: parsedData.status ?? 'Active',
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
      // closedOn, reviewKeywords will be undefined if not in ParsedTraderData
    };
    batch.set(newTraderDocRef, newTrader);
    createdTraders.push({ ...newTrader, id: newTraderDocRef.id });
  });

  try {
    await batch.commit();
    return createdTraders;
  } catch (error) {
    console.error(`Error bulk adding traders for branch ${branchId}:`, error);
    throw error;
  }
}
