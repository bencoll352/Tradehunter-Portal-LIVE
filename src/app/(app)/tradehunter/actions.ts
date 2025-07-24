
'use server';

import 'dotenv/config';

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
import type { Trader, BaseBranchId, ParsedTraderData, BulkDeleteTradersResult } from "@/types";
import type { z } from 'zod';
import type { traderFormSchema } from '@/components/dashboard/TraderForm';
import { db } from '@/lib/firebase';

// ====================================================================
// Consolidated Trader Service Logic
// ====================================================================

const TRADERS_COLLECTION = 'traders';

function cleanDataForFirestoreWrite<T extends Record<string, any>>(data: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      cleaned[key] = data[key] === undefined ? null : data[key];
    }
  }
  return cleaned;
}

const StandardCategories = {
  CARPENTERS_JOINERS: "Carpenters & Joiners",
  GENERAL_BUILDERS: "General Builders",
  GROUNDWORKERS: "Groundworkers",
  ROOFING_SPECIALISTS: "Roofing Specialists",
  INTERIOR_DESIGNER: "Interior Designer",
  PROPERTY_MAINTENANCE: "Property Maintenance",
  PLASTERERS: "Plasterers",
  LANDSCAPERS: "Landscapers",
  HANDYMAN_HOME_IMPROVEMENTS: "Handy Man - Home Improvements",
  PROPERTY_DEVELOPERS: "Property developers",
  PAINTERS_DECORATORS: "Painters & Decorators",
  KITCHEN_BATHROOM_INSTALLERS: "Kitchen and Bathroom installers",
};

const INITIAL_SEED_TRADERS_DATA_RAW: Omit<Trader, 'id' | 'lastActivity'>[] = [
  { name: 'Alice Wonderland', branchId: 'PURLEY', status: 'Active', description: 'Curiouser and curiouser goods. Specialises in whimsical party supplies and enchanted garden ornaments. Known for excellent customer service.', website: 'https://alice.example.com', phone: '01234 567801', address: '123 Rabbit Hole Lane, Wonderland, WDC 123', 
    mainCategory: StandardCategories.LANDSCAPERS, ownerName: "Mad Hatter", ownerProfileLink: "https://example.com/madhatter", categories: StandardCategories.LANDSCAPERS, workdayTiming: "Mon-Sat 10am-6pm", closedOn: "Sundays", reviewKeywords: "tea, party, fun, whimsical, charming", rating: 4.5, notes: "Prefers Earl Grey tea for meetings. Important client for seasonal events.", callBackDate: null, estimatedAnnualRevenue: 250000, estimatedCompanyValue: 500000, employeeCount: 15 },
  
  { name: 'Bob The Builder', branchId: 'PURLEY', status: 'Call-Back', description: 'Can he fix it? Yes, he can! General construction and home repair services. Reliable and efficient.', rating: 4.8, phone: '01234 567802', 
    mainCategory: StandardCategories.GENERAL_BUILDERS, categories: StandardCategories.GENERAL_BUILDERS, address: "456 Fixit Ave, Builderville, BLD 456", ownerName: "Bob", ownerProfileLink: "https://example.com/bob", workdayTiming: "Mon-Fri 8am-5pm", closedOn: "Weekends", reviewKeywords: "reliable, efficient, construction", website: null, notes: "Needs follow-up on new concrete mixer availability.", callBackDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), estimatedAnnualRevenue: 180000, estimatedCompanyValue: 300000, employeeCount: 5 },
  
  { name: 'Charlie Brown', branchId: 'PURLEY', status: 'Inactive', 
    mainCategory: StandardCategories.HANDYMAN_HOME_IMPROVEMENTS, address: '456 Kite Street, Townsville, TWN 789', workdayTiming: "Mon-Fri 9am-5pm", description: "Good grief! Offering comic strip consultation and kite flying lessons. Currently on hiatus.", phone: "01234567810", ownerName: "Charles M. Schulz (Estate)", reviewKeywords:"comic, kite, peanuts", rating: 3.0, website: null, ownerProfileLink: null, categories: StandardCategories.HANDYMAN_HOME_IMPROVEMENTS, closedOn: null, notes: "Account inactive for 6+ months.", callBackDate: null, estimatedAnnualRevenue: 50000, estimatedCompanyValue: 10000, employeeCount: 1 },
  
  { name: 'Diana Prince', branchId: 'BRANCH_B', status: 'Active', address: '789 Amazon Way, Themyscira, THM 001', phone: '01234 567803', 
    mainCategory: StandardCategories.INTERIOR_DESIGNER, closedOn: 'Weekends', description: "Antiquities expert and diplomatic consultant. Handles sensitive international relations.", rating: 5.0, website: "https://diana.example.com", categories: StandardCategories.INTERIOR_DESIGNER, reviewKeywords: "wise, strong, expert", ownerName: "Diana Prince", ownerProfileLink: null, workdayTiming: "By Appointment", notes: "High profile client, requires discreet handling.", callBackDate: null, estimatedAnnualRevenue: 500000, estimatedCompanyValue: 10000000, employeeCount: 50 },
  
  { name: 'Edward Scissorhands', branchId: 'BRANCH_B', status: 'New Lead', website: 'https://edwardcuts.example.com', description: 'Unique topiary and avant-garde hairdressing services. Gentle and artistic.', rating: 4.9, ownerProfileLink: 'https://example.com/edward', 
    mainCategory: StandardCategories.LANDSCAPERS, categories: StandardCategories.LANDSCAPERS, phone: "01234567811", address: "1 Suburbia Drive, Castle Hill, CHL 555", reviewKeywords: "artistic, unique, gentle", ownerName: "Edward", workdayTiming: "Varies", closedOn: null, notes: "Potential for large landscaping projects.", callBackDate: null, estimatedAnnualRevenue: 80000, estimatedCompanyValue: 20000, employeeCount: 1 },
  
  { name: 'Fiona Gallagher', branchId: 'BRANCH_C', status: 'Active', description: 'South Side resilience. Runs a local cafe and diner. Known for hearty meals and a welcoming atmosphere.', 
    mainCategory: StandardCategories.KITCHEN_BATHROOM_INSTALLERS, phone: '01234 567804', address: "222 South Side St, Chicago, CHI 606", ownerName: "Fiona Gallagher", categories: StandardCategories.KITCHEN_BATHROOM_INSTALLERS, workdayTiming: "Mon-Sun 7am-10pm", reviewKeywords: "family, hearty, local", rating: 4.2, website: null, ownerProfileLink: null, closedOn: null, notes: "Always orders supplies on Tuesdays.", callBackDate: null, estimatedAnnualRevenue: 350000, estimatedCompanyValue: 150000, employeeCount: 8 },
  
  { name: 'George Jetson', branchId: 'DOVER', status: 'New Lead', description: 'Digital Indexer at Spacely Space Sprockets. Future-proof solutions.', rating: 4.0, phone: '01234 567805', 
    mainCategory: StandardCategories.HANDYMAN_HOME_IMPROVEMENTS, categories: StandardCategories.HANDYMAN_HOME_IMPROVEMENTS, address: "Orbit City Apartments", ownerName: "George Jetson", workdayTiming: "Mon-Fri 9am-5pm (21st Century Time)", website: null, ownerProfileLink: null, closedOn: null, notes: "Interested in our latest robotic tools.", callBackDate: null, estimatedAnnualRevenue: 1200000, estimatedCompanyValue: 500000, employeeCount: 200 },
  
  { name: 'Laura Croft', branchId: 'LEATHERHEAD', status: 'Active', description: 'Supplier of rare archaeological equipment and expedition gear. Expert in ancient artifacts.', website: 'https://croftarch.example.com', phone: '01372 100201', address: 'Croft Manor, Leatherhead, SUR 123', 
    mainCategory: StandardCategories.INTERIOR_DESIGNER, ownerName: "Lara Croft", ownerProfileLink: "https://example.com/laracroft", categories: StandardCategories.INTERIOR_DESIGNER, workdayTiming: "Mon-Fri 9am-6pm", closedOn: "Weekends", reviewKeywords: "rare, artifacts, adventure, quality", rating: 4.9, notes: "Key supplier for university expeditions.", callBackDate: null, estimatedAnnualRevenue: 400000, estimatedCompanyValue: 1200000, employeeCount: 12 },
  
  { name: 'Henry "Indiana" Jones Jr.', branchId: 'LEATHERHEAD', status: 'Call-Back', description: 'Procurement of ancient relics and historical items. Often on field assignments.', rating: 4.7, phone: '01372 100202', 
    mainCategory: StandardCategories.INTERIOR_DESIGNER, categories: StandardCategories.INTERIOR_DESIGNER, address: "Barnett College Dept. of Archaeology", ownerName: "Dr. Henry Jones Jr.", ownerProfileLink: "https://example.com/indy", workdayTiming: "Varies (often unavailable)", closedOn: null, reviewKeywords: "knowledgeable, adventurous, rare finds", website: null, notes: "Follow up regarding the Crystal Skull shipment. Prefers to be called Indy.", callBackDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), estimatedAnnualRevenue: 200000, estimatedCompanyValue: 600000, employeeCount: 3 },
  
  { name: 'Nathan Drake', branchId: 'LEATHERHEAD', status: 'Inactive', 
    mainCategory: StandardCategories.HANDYMAN_HOME_IMPROVEMENTS, address: 'Unknown - Last seen heading to Shambhala', workdayTiming: "Irregular", description: "Treasure hunter and adventurer. Supplier of climbing gear and maps. Currently on a long expedition.", phone: "01372100203", ownerName: "Nathan Drake", reviewKeywords:"treasure, adventure, maps", rating: 4.2, website: null, ownerProfileLink: null, categories: StandardCategories.HANDYMAN_HOME_IMPROVEMENTS, closedOn: null, notes: "Account inactive, expected back in 6 months.", callBackDate: null, estimatedAnnualRevenue: 90000, estimatedCompanyValue: 50000, employeeCount: 2 },
  
  { name: 'Elara Vance', branchId: 'LEATHERHEAD', status: 'New Lead', description: 'Provides cartography services and exploration planning. New to the area.', rating: null, phone: '01372 100204', 
    mainCategory: StandardCategories.GROUNDWORKERS, categories: StandardCategories.GROUNDWORKERS, address: "The Map Room, Leatherhead", ownerName: "Elara Vance", workdayTiming: "Mon-Fri 10am-4pm", website: 'https://elarasmaps.example.com', ownerProfileLink: null, closedOn: "Weekends", notes: "New lead, interested in surveying equipment.", callBackDate: null, estimatedAnnualRevenue: 30000, estimatedCompanyValue: 10000, employeeCount: 1 },
  
  { name: 'Pete The Plasterer', branchId: 'PURLEY', status: 'Active', description: 'Smooth finishes every time. Residential and commercial plastering.', rating: 4.6, phone: '01234 567812',
    mainCategory: StandardCategories.PLASTERERS, categories: StandardCategories.PLASTERERS, address: "1 Skim Coat Close, Purley", ownerName: "Pete Smooth", workdayTiming: "Mon-Fri 8am-5pm", website: null, ownerProfileLink: null, closedOn: "Weekends", reviewKeywords: "smooth, plaster, reliable", notes: "Orders specific brand of plaster.", callBackDate: null, estimatedAnnualRevenue: 90000, estimatedCompanyValue: 40000, employeeCount: 4 },

  { name: 'Roger The Roofer', branchId: 'BRANCH_B', status: 'Call-Back', description: 'Top quality roofing solutions, from repairs to new installations.', rating: 4.7, phone: '01234 567813',
    mainCategory: StandardCategories.ROOFING_SPECIALISTS, categories: StandardCategories.ROOFING_SPECIALISTS, address: "2 Ridge Tile Row, Branch B Town", ownerName: "Roger Slate", workdayTiming: "Mon-Sat 7am-6pm", website: 'https://rogerroofs.example.com', ownerProfileLink: null, closedOn: "Sundays", reviewKeywords: "roofing, quality, repair, new build", notes: "Call back about new tile adhesive stock.", callBackDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), estimatedAnnualRevenue: 220000, estimatedCompanyValue: 110000, employeeCount: 6 },

  { name: 'Dave The Developer', branchId: 'BRANCH_C', status: 'Active', description: 'Large scale property development and new builds.', rating: 4.3, phone: '01234 567814',
    mainCategory: StandardCategories.PROPERTY_DEVELOPERS, categories: StandardCategories.PROPERTY_DEVELOPERS, address: "Plot 1, New Estate, Branch C City", ownerName: "David King", workdayTiming: "Mon-Fri 9am-6pm", website: 'https://kingdevelopments.example.com', ownerProfileLink: 'https://example.com/davidking', closedOn: "Weekends", reviewKeywords: "new builds, development, large scale", notes: "Requires bulk order discounts.", callBackDate: null, estimatedAnnualRevenue: 5000000, estimatedCompanyValue: 10000000, employeeCount: 45 },

  { name: 'Paula The Painter', branchId: 'DOVER', status: 'New Lead', description: 'Interior and exterior painting and decorating services. Meticulous work.', rating: 4.9, phone: '01234 567815',
    mainCategory: StandardCategories.PAINTERS_DECORATORS, categories: StandardCategories.PAINTERS_DECORATORS, address: "3 Brush Stroke Boulevard, Dover", ownerName: "Paula Hue", workdayTiming: "Mon-Fri 9am-5pm", website: null, ownerProfileLink: null, closedOn: "Weekends", reviewKeywords: "painting, decorating, meticulous, interior, exterior", notes: "New lead, enquired about eco-friendly paints.", callBackDate: null, estimatedAnnualRevenue: 70000, estimatedCompanyValue: 25000, employeeCount: 2 },
  
  { name: 'Carl The Carpenter', branchId: 'LEATHERHEAD', status: 'Active', description: 'Custom carpentry, joinery, and bespoke furniture.', rating: 4.8, phone: '01372 100205',
    mainCategory: StandardCategories.CARPENTERS_JOINERS, categories: StandardCategories.CARPENTERS_JOINERS, address: "Unit 5, Woodwork Way, Leatherhead", ownerName: "Carl Wood", workdayTiming: "Mon-Fri 8am-6pm", website: 'https://carlscarpentry.example.com', ownerProfileLink: 'https://example.com/carlwood', closedOn: "Sundays", reviewKeywords: "carpentry, joinery, bespoke, quality wood", notes: "Specializes in oak furniture.", callBackDate: null, estimatedAnnualRevenue: 150000, estimatedCompanyValue: 75000, employeeCount: 7 }
];

const INITIAL_SEED_TRADERS_DATA: Omit<Trader, 'id'>[] = INITIAL_SEED_TRADERS_DATA_RAW.map((trader, index) => {
  const date = new Date(2024, 6, 20 - index);
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
      if (!isNaN(parsedDate.getTime())) {
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
    branchId: data.branchId ?? 'UNKNOWN_BRANCH',
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
    estimatedAnnualRevenue: data.estimatedAnnualRevenue ?? null,
    estimatedCompanyValue: data.estimatedCompanyValue ?? null,
    employeeCount: data.employeeCount ?? null,
  };
};

async function dbGetTradersByBranch(baseBranchId: BaseBranchId): Promise<Trader[]> {
  if (!db) {
    console.error("[TraderService:getTradersByBranch] Firestore (db) is not initialized. Aborting operation.");
    throw new Error("Firestore not initialised. Cannot fetch traders.");
  }
  const tradersCollectionRef = collection(db, TRADERS_COLLECTION);
  const q = query(tradersCollectionRef, where("branchId", "==", baseBranchId));
  try {
    let querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      const seedDataForBranch = INITIAL_SEED_TRADERS_DATA.filter(t => t.branchId === baseBranchId);
      if (seedDataForBranch.length > 0) {
        const batch = writeBatch(db);
        seedDataForBranch.forEach(traderSeedData => {
          const traderDocRef = doc(tradersCollectionRef);
          batch.set(traderDocRef, traderSeedData);
        });
        await batch.commit();
        querySnapshot = await getDocs(q);
      } else {
        return [];
      }
    }
    return querySnapshot.docs.map(doc => mapDocToTrader(doc.data(), doc.id));
  } catch (error) {
    console.error(`[TraderService:getTradersByBranch] Error fetching traders for branch ${baseBranchId}:`, error);
    throw new Error(`Failed to fetch traders for branch ${baseBranchId}. Ensure Firestore is set up and rules allow reads.`);
  }
}

async function dbGetTraderById(id: string, baseBranchId: BaseBranchId): Promise<Trader | null> {
  if (!db) {
    console.error("[TraderService:getTraderById] Firestore (db) is not initialized. Aborting operation.");
    throw new Error("Firestore not initialised. Cannot fetch trader.");
  }
  try {
    const traderDocRef = doc(db, TRADERS_COLLECTION, id);
    const docSnap = await getDoc(traderDocRef);
    if (docSnap.exists()) {
      const trader = mapDocToTrader(docSnap.data(), docSnap.id);
      if (trader.branchId === baseBranchId) {
        return trader;
      }
      return null;
    }
    return null;
  } catch (error) {
    console.error(`[TraderService:getTraderById] Error fetching trader ${id}:`, error);
    throw error;
  }
}


async function dbAddTrader(
  traderData: Omit<Trader, 'id' | 'lastActivity' | 'branchId'>,
  baseBranchId: BaseBranchId
): Promise<Trader> {
  if (!db) {
    console.error("[TraderService:addTraderToDb] Firestore (db) is not initialized. Aborting operation.");
    throw new Error("Firestore not initialised. Cannot add trader.");
  }
  try {
    const dataWithSystemFields = {
      ...traderData,
      branchId: baseBranchId,
      lastActivity: new Date().toISOString(),
    };
    const cleanedData = cleanDataForFirestoreWrite(dataWithSystemFields);
    const tradersCollectionRef = collection(db, TRADERS_COLLECTION);
    const docRef = await addDoc(tradersCollectionRef, cleanedData);
    return { ...cleanedData, id: docRef.id } as Trader;
  } catch (error) {
    console.error(`[TraderService:addTraderToDb] Error adding trader ${traderData.name} to Firestore:`, error);
    throw error;
  }
}


async function dbUpdateTrader(updatedTraderData: Trader): Promise<Trader | null> {
  if (!db) {
    console.error("[TraderService:updateTraderInDb] Firestore (db) is not initialized. Aborting operation.");
    throw new Error("Firestore not initialised. Cannot update trader.");
  }
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
    console.error(`[TraderService:updateTraderInDb] Error updating trader ${updatedTraderData.id}:`, error);
    throw error;
  }
}

async function dbDeleteTrader(traderId: string, baseBranchId: BaseBranchId): Promise<boolean> {
  if (!db) {
    console.error("[TraderService:deleteTraderFromDb] Firestore (db) is not initialized. Aborting operation.");
    throw new Error("Firestore not initialised. Cannot delete trader.");
  }
  try {
    const traderDocRef = doc(db, TRADERS_COLLECTION, traderId);
    await deleteDoc(traderDocRef);
    return true;
  } catch (error) {
    console.error(`[TraderService:deleteTraderFromDb] Error deleting trader ${traderId}:`, error);
    throw error;
  }
}

async function dbBulkAddTraders(
  tradersToCreate: ParsedTraderData[],
  baseBranchId: BaseBranchId
): Promise<Trader[]> {
  if (!db) {
    console.error("[TraderService:bulkAddTradersToDb] Firestore (db) is not initialized. Aborting operation.");
    throw new Error("Firestore not initialised. Cannot bulk add traders.");
  }
  const tradersCollectionRef = collection(db, TRADERS_COLLECTION);
  const createdTraders: Trader[] = [];
  const chunkSize = 499;
  for (let i = 0; i < tradersToCreate.length; i += chunkSize) {
    const chunk = tradersToCreate.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    chunk.forEach((parsedData) => {
      const newTraderDocRef = doc(tradersCollectionRef);
      const newTraderObject: Omit<Trader, 'id'> = {
        name: parsedData.name ?? 'Unnamed Trader',
        branchId: baseBranchId,
        status: parsedData.status ?? 'New Lead',
        lastActivity: parsedData.lastActivity || new Date().toISOString(),
        description: parsedData.description ?? null,
        rating: parsedData.rating ?? null,
        website: parsedData.website ?? null,
        phone: parsedData.phone ?? null,
        address: parsedData.address ?? null,
        mainCategory: parsedData.mainCategory ?? null,
        ownerName: parsedData.ownerName ?? null,
        ownerProfileLink: parsedData.ownerProfileLink ?? null,
        categories: parsedData.categories ?? null,
        workdayTiming: parsedData.workdayTiming ?? null,
        notes: parsedData.notes ?? null,
        callBackDate: parsedData.callBackDate ?? null,
        estimatedAnnualRevenue: parsedData.estimatedAnnualRevenue ?? null,
        estimatedCompanyValue: parsedData.estimatedCompanyValue ?? null,
        employeeCount: parsedData.employeeCount ?? null,
        closedOn: null,
        reviewKeywords: null,
      };
      const finalTraderDataForDb = cleanDataForFirestoreWrite(newTraderObject);
      batch.set(newTraderDocRef, finalTraderDataForDb);
      createdTraders.push({ ...(finalTraderDataForDb as Omit<Trader, 'id'>), id: newTraderDocRef.id });
    });
    try {
      await batch.commit();
    } catch (error) {
      console.error(`[TraderService:bulkAddTradersToDb] Error committing chunk for branch ${baseBranchId}:`, error);
      throw new Error(`Failed to commit a batch of traders. Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return createdTraders;
}


// ====================================================================
// Server Actions
// ====================================================================

function extractErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
    if ('code' in error) {
       return `Error Code: ${(error as any).code} - ${(error as any).message}`;
    }
    return (error as any).message;
  }
  try {
    const stringifiedError = JSON.stringify(error);
    if (stringifiedError && stringifiedError !== '{}' && stringifiedError !== '[object Object]') {
      return stringifiedError;
    }
  } catch (e) {
    // Ignore stringify error
  }
  return defaultMessage;
}

// Action now expects BaseBranchId
export async function getTradersAction(baseBranchId: BaseBranchId): Promise<{ data: Trader[] | null; error: string | null }> {
  try {
    const traders = await dbGetTradersByBranch(baseBranchId);
    return { data: traders, error: null };
  } catch (error) {
    const errorMessage = extractErrorMessage(error, `Failed to get traders for branch ${baseBranchId}.`);
    console.error(`getTradersAction for ${baseBranchId} failed:`, errorMessage, "Original error:", error);
    return { data: null, error: errorMessage };
  }
}

// Action now expects BaseBranchId
export async function addTraderAction(baseBranchId: BaseBranchId, values: z.infer<typeof traderFormSchema>): Promise<{ data: Trader | null; error: string | null }> {
  try {
    const newTraderData: Omit<Trader, 'id' | 'lastActivity' | 'branchId'> = {
      name: values.name,
      status: values.status,
      description: values.description ?? null,
      rating: values.rating ?? null,
      website: values.website ?? null,
      phone: values.phone ?? null,
      address: values.address ?? null,
      mainCategory: values.mainCategory ?? null,
      ownerName: values.ownerName ?? null,
      ownerProfileLink: values.ownerProfileLink ?? null,
      categories: values.categories ?? null,
      workdayTiming: values.workdayTiming ?? null,
      notes: values.notes ?? null,
      callBackDate: values.callBackDate ?? null,
      estimatedAnnualRevenue: values.estimatedAnnualRevenue ?? null,
      estimatedCompanyValue: values.estimatedCompanyValue ?? null,
      employeeCount: values.employeeCount ?? null,
      closedOn: null, 
      reviewKeywords: null, 
    };
    const newTrader = await dbAddTrader(newTraderData, baseBranchId);
    return { data: newTrader, error: null };
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to add trader due to an unknown server error.");
    console.error("addTraderAction failed:", errorMessage, "Original error:", error);
    return { data: null, error: errorMessage };
  }
}

// Action now expects BaseBranchId
export async function updateTraderAction(baseBranchId: BaseBranchId, traderId: string, values: z.infer<typeof traderFormSchema>): Promise<{ data: Trader | null; error: string | null }> {
  try {
    const existingTrader = await dbGetTraderById(traderId, baseBranchId);
    
    if (!existingTrader) {
      const errorMessage = `Trader with ID ${traderId} in branch ${baseBranchId} not found for update.`;
      console.error(errorMessage);
      return { data: null, error: errorMessage };
    }

    // This ensures that values from the form are merged with existing data to prevent data loss.
    const traderToUpdate: Trader = {
      ...existingTrader, 
      name: values.name,
      status: values.status,
      description: values.description ?? existingTrader.description,
      rating: values.rating ?? existingTrader.rating,
      website: values.website ?? existingTrader.website,
      phone: values.phone ?? existingTrader.phone,
      address: values.address ?? existingTrader.address,
      mainCategory: values.mainCategory ?? existingTrader.mainCategory,
      ownerName: values.ownerName ?? existingTrader.ownerName,
      ownerProfileLink: values.ownerProfileLink ?? existingTrader.ownerProfileLink,
      categories: values.categories ?? existingTrader.categories,
      workdayTiming: values.workdayTiming ?? existingTrader.workdayTiming,
      notes: values.notes ?? existingTrader.notes,
      callBackDate: values.callBackDate ?? existingTrader.callBackDate,
      estimatedAnnualRevenue: values.estimatedAnnualRevenue ?? existingTrader.estimatedAnnualRevenue,
      estimatedCompanyValue: values.estimatedCompanyValue ?? existingTrader.estimatedCompanyValue,
      employeeCount: values.employeeCount ?? existingTrader.employeeCount,
    };
    const updatedTrader = await dbUpdateTrader(traderToUpdate);
    return { data: updatedTrader, error: null };
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to update trader due to an unknown server error.");
    console.error("updateTraderAction failed:", errorMessage, "Original error:", error);
    return { data: null, error: errorMessage };
  }
}

// Action now expects BaseBranchId
export async function deleteTraderAction(baseBranchId: BaseBranchId, traderId: string): Promise<{ success: boolean; error: string | null; }> {
   try {
    const success = await dbDeleteTrader(traderId, baseBranchId);
    return { success, error: null };
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to delete trader due to an unknown server error.");
    console.error("deleteTraderAction failed:", errorMessage, "Original error:", error);
    return { success: false, error: errorMessage };
  }
}

// Action now expects BaseBranchId
export async function bulkAddTradersAction(baseBranchId: BaseBranchId, tradersToCreate: ParsedTraderData[]): Promise<{ data: Trader[] | null; error: string | null; }> {
  try {
    const data = await dbBulkAddTraders(tradersToCreate, baseBranchId);
    return { data, error: null };
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "An unknown server error occurred during bulk add.");
    console.error("Failed to bulk add traders (action level). Processed Error Message:", errorMessage, "Original Error Object:", error);
    return { data: null, error: errorMessage };
  }
}

// Action now expects BaseBranchId
export async function bulkDeleteTradersAction(baseBranchId: BaseBranchId, traderIds: string[]): Promise<BulkDeleteTradersResult> {
  if (!db) {
    console.error("[TraderService:bulkDeleteTradersAction] Firestore not initialized. Aborting operation. Check Firebase configuration.");
    return { successCount: 0, failureCount: traderIds.length, error: "Firestore not initialized." };
  }
  if (!traderIds || traderIds.length === 0) {
    return { successCount: 0, failureCount: 0, error: "No trader IDs provided for deletion." };
  }

  if (traderIds.length > 499) {
     console.warn(`[TraderService:bulkDeleteTradersAction] Attempting to delete ${traderIds.length} traders from branch ${baseBranchId}, which exceeds the typical batch limit.`);
  }

  const batch = writeBatch(db);
  let successCount = 0;
  let failureCount = 0;

  console.log(`[TraderService:bulkDeleteTradersAction] Attempting to bulk delete ${traderIds.length} traders from branch ${baseBranchId}`);

  for (const traderId of traderIds) {
    const traderDocRef = doc(db, TRADERS_COLLECTION, traderId);
    batch.delete(traderDocRef);
  }

  try {
    await batch.commit();
    successCount = traderIds.length;
    console.log(`[TraderService:bulkDeleteTradersAction] Successfully bulk deleted ${successCount} traders from branch ${baseBranchId}.`);
    return { successCount, failureCount, error: null };
  } catch (error) {
    failureCount = traderIds.length;
    const errorMessage = extractErrorMessage(error, "An unknown server error occurred during bulk delete.");
    console.error(`[TraderService:bulkDeleteTradersAction] Error bulk deleting traders from branch ${baseBranchId}:`, error);
    return { successCount: 0, failureCount, error: errorMessage };
  }
}
