
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
import type { Trader, BranchId, ParsedTraderData } from '@/types';

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
  { name: 'Alice Wonderland', branchId: 'PURLEY', totalSales: 125000, tradesMade: 150, status: 'Active', description: 'Curiouser and curiouser goods. Specializes in whimsical party supplies and enchanted garden ornaments. Known for excellent customer service.', website: 'https://alice.example.com', phone: '01234 567801', address: '123 Rabbit Hole Lane, Wonderland, WDC 123', mainCategory: 'Retail', ownerName: "Mad Hatter", ownerProfileLink: "https://example.com/madhatter", categories: "Party Supplies, Garden, Gifts", workdayTiming: "Mon-Sat 10am-6pm", closedOn: "Sundays", reviewKeywords: "tea, party, fun, whimsical, charming", rating: 4.5 },
  { name: 'Bob The Builder', branchId: 'PURLEY', totalSales: 98000, tradesMade: 120, status: 'Call-Back', description: 'Can he fix it? Yes, he can! General construction and home repair services. Reliable and efficient.', rating: 4.8, phone: '01234 567802', mainCategory: 'Construction', categories: 'Building, Repairs, Home Improvement', address: "456 Fixit Ave, Builderville, BLD 456", ownerName: "Bob", ownerProfileLink: "https://example.com/bob", workdayTiming: "Mon-Fri 8am-5pm", closedOn: "Weekends", reviewKeywords: "reliable, efficient, construction", website: null },
  { name: 'Charlie Brown', branchId: 'PURLEY', totalSales: 75000, tradesMade: 90, status: 'Inactive', mainCategory: 'Services', address: '456 Kite Street, Townsville, TWN 789', workdayTiming: "Mon-Fri 9am-5pm", description: "Good grief! Offering comic strip consultation and kite flying lessons. Currently on hiatus.", phone: "01234567810", ownerName: "Charles M. Schulz (Estate)", reviewKeywords:"comic, kite, peanuts", rating: 3.0, website: null, ownerProfileLink: null, categories: null, closedOn: null },
  { name: 'Diana Prince', branchId: 'BRANCH_B', totalSales: 210000, tradesMade: 200, status: 'Active', address: '789 Amazon Way, Themyscira, THM 001', phone: '01234 567803', mainCategory: 'Consulting', closedOn: 'Weekends', description: "Antiquities expert and diplomatic consultant. Handles sensitive international relations.", rating: 5.0, website: "https://diana.example.com", categories: "Diplomacy, History, Art", reviewKeywords: "wise, strong, expert", ownerName: "Diana Prince", ownerProfileLink: null, workdayTiming: "By Appointment"},
  { name: 'Edward Scissorhands', branchId: 'BRANCH_B', totalSales: 150000, tradesMade: 180, status: 'New Lead', website: 'https://edwardcuts.example.com', description: 'Unique topiary and avant-garde hairdressing services. Gentle and artistic.', rating: 4.9, ownerProfileLink: 'https://example.com/edward', mainCategory: "Personal Care", categories: "Hairdressing, Landscaping, Art", phone: "01234567811", address: "1 Suburbia Drive, Castle Hill, CHL 555", reviewKeywords: "artistic, unique, gentle", ownerName: "Edward", workdayTiming: "Varies", closedOn: null },
  { name: 'Fiona Gallagher', branchId: 'BRANCH_C', totalSales: 180000, tradesMade: 165, status: 'Active', description: 'South Side resilience. Runs a local cafe and diner. Known for hearty meals and a welcoming atmosphere.', mainCategory: 'Cafe', phone: '01234 567804', address: "222 South Side St, Chicago, CHI 606", ownerName: "Fiona Gallagher", categories: "Food, Diner, Coffee", workdayTiming: "Mon-Sun 7am-10pm", reviewKeywords: "family, hearty, local", rating: 4.2, website: null, ownerProfileLink: null, closedOn: null },
  { name: 'George Jetson', branchId: 'BRANCH_D', totalSales: 300000, tradesMade: 250, status: 'New Lead', description: 'Digital Indexer at Spacely Space Sprockets. Future-proof solutions.', rating: 4.0, phone: '01234 567805', mainCategory: 'Technology', categories: 'Automation, IT, Future Tech', address: "Orbit City Apartments", ownerName: "George Jetson", workdayTiming: "Mon-Fri 9am-5pm (21st Century Time)", website: null, ownerProfileLink: null, closedOn: null },
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
      // Attempt to parse to ensure it's a valid date string, then re-format to ISO
      // This helps normalize various string date formats if they sneak in, though ISO is preferred.
      return new Date(activity).toISOString();
    } catch (e) {
      // If parsing fails, default
      console.warn(`Invalid date string for lastActivity: ${activity}. Defaulting.`);
      return new Date(0).toISOString();
    }
  }
  // Default for null, undefined, or other unexpected types from Firestore
  console.warn(`Unexpected lastActivity type: ${typeof activity}, value: ${activity}. Defaulting.`);
  return new Date(0).toISOString(); 
};


const mapDocToTrader = (docData: any, id: string): Trader => {
  const data = docData as Partial<Omit<Trader, 'id'>>;

  return {
    id,
    name: data.name ?? 'Unknown Name',
    branchId: data.branchId ?? 'UNKNOWN_BRANCH',
    totalSales: data.totalSales ?? 0,
    tradesMade: data.tradesMade ?? 0,
    status: data.status ?? 'New Lead', // Default to New Lead if status is missing
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
  };
};

export async function getTradersByBranch(branchId: BranchId): Promise<Trader[]> {
  const tradersCollectionRef = collection(db, TRADERS_COLLECTION);
  const q = query(tradersCollectionRef, where("branchId", "==", branchId));

  try {
    let querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(`No traders found for branch ${branchId}, seeding initial data...`);
      const seedDataForBranch = INITIAL_SEED_TRADERS_DATA.filter(t => t.branchId === branchId);
      if (seedDataForBranch.length > 0) {
        const batch = writeBatch(db);
        seedDataForBranch.forEach(traderSeedData => {
          const traderDocRef = doc(tradersCollectionRef); 
          batch.set(traderDocRef, traderSeedData); // traderSeedData is already cleaned
        });
        await batch.commit();
        console.log(`Seeded ${seedDataForBranch.length} traders for branch ${branchId}.`);
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
  branchId: BranchId
): Promise<Trader> {
  try {
    const dataWithSystemFields = {
      ...traderData,
      branchId: branchId, 
      lastActivity: new Date().toISOString(),
    };
    const cleanedData = cleanDataForFirestoreWrite(dataWithSystemFields);
    
    const tradersCollectionRef = collection(db, TRADERS_COLLECTION);
    const docRef = await addDoc(tradersCollectionRef, cleanedData);
    
    return { ...cleanedData, id: docRef.id } as Trader;
  } catch (error) {
    console.error('Error adding trader to Firestore:', error);
    throw error;
  }
}

export async function updateTraderInDb(updatedTraderData: Trader): Promise<Trader | null> {
  try {
    const traderDocRef = doc(db, TRADERS_COLLECTION, updatedTraderData.id);
    
    const dataToPrepareForUpdate = {
      ...updatedTraderData,
      lastActivity: new Date().toISOString(),
    };
    const { id, ...dataWithoutId } = dataToPrepareForUpdate;
    const cleanedData = cleanDataForFirestoreWrite(dataWithoutId);

    await updateDoc(traderDocRef, cleanedData);
    return { ...cleanedData, id: updatedTraderData.id } as Trader;
  } catch (error) {
    console.error(`Error updating trader ${updatedTraderData.id}:`, error);
    throw error;
  }
}

export async function deleteTraderFromDb(traderId: string, branchId: BranchId): Promise<boolean> {
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
    const newTraderDocRef = doc(tradersCollectionRef); 
    
    const newTraderObject: Omit<Trader, 'id'> = {
      name: parsedData.name,
      branchId: branchId,
      totalSales: parsedData.totalSales ?? 0,
      tradesMade: parsedData.tradesMade ?? 0,
      status: parsedData.status ?? 'New Lead', // Default to New Lead
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
      closedOn: null, 
      reviewKeywords: null,
    };
    
    const finalTraderDataForDb = cleanDataForFirestoreWrite(newTraderObject);
    batch.set(newTraderDocRef, finalTraderDataForDb);
    createdTraders.push({ ...(finalTraderDataForDb as Omit<Trader, 'id'>), id: newTraderDocRef.id });
  });

  try {
    await batch.commit();
    return createdTraders;
  } catch (error) {
    console.error(`Error bulk adding traders for branch ${branchId}:`, error);
    throw error; 
  }
}

