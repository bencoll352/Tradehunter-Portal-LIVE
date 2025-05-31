
import type { Trader, BranchId, ParsedTraderData } from '@/types';
import { format, parseISO } from 'date-fns';

// Initial seed data for traders. This will be used if localStorage is empty for a branch.
const INITIAL_SEED_TRADERS: Trader[] = [
  { id: 'trader-1', name: 'Alice Wonderland', branchId: 'PURLEY', totalSales: 125000, tradesMade: 150, status: 'Active', lastActivity: new Date(2024, 6, 15).toISOString(), description: 'Curiouser and curiouser goods. Specializes in whimsical party supplies and enchanted garden ornaments. Known for excellent customer service.', website: 'https://alice.example.com', phone: '01234 567801', address: '123 Rabbit Hole Lane, Wonderland, WDC 123', mainCategory: 'Retail', ownerName: "Mad Hatter", ownerProfileLink: "https://example.com/madhatter", categories: "Party Supplies, Garden, Gifts", workdayTiming: "Mon-Sat 10am-6pm", closedOn: "Sundays", reviewKeywords: "tea, party, fun, whimsical, charming" },
  { id: 'trader-2', name: 'Bob The Builder', branchId: 'PURLEY', totalSales: 98000, tradesMade: 120, status: 'Active', lastActivity: new Date(2024, 6, 10).toISOString(), description: 'Can he fix it? Yes, he can! General construction and home repair services. Reliable and efficient.', rating: 4.8, phone: '01234 567802', mainCategory: 'Construction', categories: 'Building, Repairs, Home Improvement', address: "456 Fixit Ave, Builderville, BLD 456", ownerName: "Bob", ownerProfileLink: "https://example.com/bob", workdayTiming: "Mon-Fri 8am-5pm", closedOn: "Weekends", reviewKeywords: "reliable, efficient, construction" },
  { id: 'trader-3', name: 'Charlie Brown', branchId: 'PURLEY', totalSales: 75000, tradesMade: 90, status: 'Inactive', lastActivity: new Date(2024, 3, 5).toISOString(), mainCategory: 'Services', address: '456 Kite Street, Townsville, TWN 789', workdayTiming: "Mon-Fri 9am-5pm", description: "Good grief! Offering comic strip consultation and kite flying lessons. Currently on hiatus.", phone: "01234567810", ownerName: "Charles M. Schulz (Estate)", reviewKeywords:"comic, kite, peanuts" },
  { id: 'trader-4', name: 'Diana Prince', branchId: 'BRANCH_B', totalSales: 210000, tradesMade: 200, status: 'Active', lastActivity: new Date(2024, 6, 18).toISOString(), address: '789 Amazon Way, Themyscira, THM 001', phone: '01234 567803', mainCategory: 'Consulting', closedOn: 'Weekends', description: "Antiquities expert and diplomatic consultant. Handles sensitive international relations.", rating: 5.0, website: "https://diana.example.com", categories: "Diplomacy, History, Art", reviewKeywords: "wise, strong, expert"},
  { id: 'trader-5', name: 'Edward Scissorhands', branchId: 'BRANCH_B', totalSales: 150000, tradesMade: 180, status: 'Active', lastActivity: new Date(2024, 6, 12).toISOString(), website: 'https://edwardcuts.example.com', description: 'Unique topiary and avant-garde hairdressing services. Gentle and artistic.', rating: 4.9, ownerProfileLink: 'https://example.com/edward', mainCategory: "Personal Care", categories: "Hairdressing, Landscaping, Art", phone: "01234567811", address: "1 Suburbia Drive, Castle Hill, CHL 555", reviewKeywords: "artistic, unique, gentle"},
  { id: 'trader-6', name: 'Fiona Gallagher', branchId: 'BRANCH_C', totalSales: 180000, tradesMade: 165, status: 'Active', lastActivity: new Date(2024, 6, 20).toISOString(), description: 'South Side resilience. Runs a local cafe and diner. Known for hearty meals and a welcoming atmosphere.', mainCategory: 'Cafe', phone: '01234 567804', address: "222 South Side St, Chicago, CHI 606", ownerName: "Fiona Gallagher", categories: "Food, Diner, Coffee", workdayTiming: "Mon-Sun 7am-10pm", reviewKeywords: "family, hearty, local" },
];

const getBranchStorageKey = (branchId: BranchId): string => `traders_${branchId}`;

const getStoredTradersForBranch = (branchId: BranchId): Trader[] => {
  if (typeof window === 'undefined') {
    // Fallback for non-browser environments (e.g., build time), though less critical for mock data.
    return INITIAL_SEED_TRADERS.filter(trader => trader.branchId === branchId);
  }
  const key = getBranchStorageKey(branchId);
  const storedData = localStorage.getItem(key);
  if (storedData) {
    try {
      return JSON.parse(storedData) as Trader[];
    } catch (error) {
      console.error(`Error parsing traders from localStorage for branch ${branchId}:`, error);
      // Fallback to initial seed if parsing fails
      const seedData = INITIAL_SEED_TRADERS.filter(trader => trader.branchId === branchId);
      localStorage.setItem(key, JSON.stringify(seedData)); // Attempt to re-initialize
      return seedData;
    }
  } else {
    // If no data in localStorage, seed it from INITIAL_SEED_TRADERS
    const seedData = INITIAL_SEED_TRADERS.filter(trader => trader.branchId === branchId);
    localStorage.setItem(key, JSON.stringify(seedData));
    return seedData;
  }
};

const saveTradersForBranch = (branchId: BranchId, traders: Trader[]): void => {
  if (typeof window === 'undefined') {
    console.warn("localStorage is not available. Cannot save traders.");
    return;
  }
  const key = getBranchStorageKey(branchId);
  localStorage.setItem(key, JSON.stringify(traders));
};

export const getTradersByBranch = (branchId: BranchId): Trader[] => {
  return getStoredTradersForBranch(branchId);
};

export const getTraderById = (id: string, branchId: BranchId): Trader | undefined => {
  const branchTraders = getStoredTradersForBranch(branchId);
  return branchTraders.find(trader => trader.id === id);
};

export const addTrader = (traderData: Omit<Trader, 'id' | 'lastActivity'> & { lastActivity?: string }): Trader => {
  const branchTraders = getStoredTradersForBranch(traderData.branchId as BranchId);
  const newTrader: Trader = {
    id: `trader-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: traderData.name,
    branchId: traderData.branchId,
    totalSales: traderData.totalSales ?? 0,
    tradesMade: traderData.tradesMade ?? 0,
    status: traderData.status ?? 'Active',
    lastActivity: traderData.lastActivity || new Date().toISOString(),
    description: traderData.description,
    rating: traderData.rating,
    website: traderData.website,
    phone: traderData.phone,
    address: traderData.address,
    mainCategory: traderData.mainCategory,
    ownerName: traderData.ownerName,
    ownerProfileLink: traderData.ownerProfileLink,
    categories: traderData.categories,
    workdayTiming: traderData.workdayTiming,
    closedOn: traderData.closedOn,
    reviewKeywords: traderData.reviewKeywords,
  };
  const updatedTraders = [...branchTraders, newTrader];
  saveTradersForBranch(traderData.branchId as BranchId, updatedTraders);
  return newTrader;
};

export const updateTrader = (updatedTraderData: Trader): Trader | null => {
  const branchId = updatedTraderData.branchId as BranchId;
  const branchTraders = getStoredTradersForBranch(branchId);
  const index = branchTraders.findIndex(trader => trader.id === updatedTraderData.id);
  if (index !== -1) {
    const finalTrader = { 
      ...branchTraders[index], 
      ...updatedTraderData, 
      lastActivity: new Date().toISOString() // Always update lastActivity on any update
    };
    branchTraders[index] = finalTrader;
    saveTradersForBranch(branchId, branchTraders);
    return finalTrader;
  }
  return null;
};

export const deleteTrader = (traderId: string, branchId: BranchId): boolean => {
  const branchTraders = getStoredTradersForBranch(branchId);
  const initialLength = branchTraders.length;
  const updatedTraders = branchTraders.filter(trader => trader.id !== traderId);
  if (updatedTraders.length < initialLength) {
    saveTradersForBranch(branchId, updatedTraders);
    return true;
  }
  return false;
};

export const formatTraderDataForAnalysis = (traders: Trader[]): string => {
  if (!traders || traders.length === 0) {
    return "No trader data available for this branch.";
  }
  // This function now receives traders already sourced from localStorage via getTradersByBranch
  return traders.map(trader => {
    let details = `Trader: ${trader.name}, Sales: £${(trader.totalSales ?? 0).toLocaleString('en-GB')}, Trades: ${trader.tradesMade ?? 0}, Status: ${trader.status}, Last Activity: ${format(parseISO(trader.lastActivity), 'dd/MM/yyyy')}`;
    if (trader.description) details += `, Description: ${trader.description}`;
    if (trader.rating) details += `, Rating: ${trader.rating}`;
    if (trader.website) details += `, Website: ${trader.website}`;
    if (trader.phone) details += `, Phone: ${trader.phone}`;
    if (trader.address) details += `, Address: ${trader.address}`;
    if (trader.mainCategory) details += `, Main Category: ${trader.mainCategory}`;
    if (trader.ownerName) details += `, Owner: ${trader.ownerName}`;
    if (trader.ownerProfileLink) details += `, Owner Profile: ${trader.ownerProfileLink}`;
    if (trader.categories) details += `, Categories: ${trader.categories}`;
    if (trader.workdayTiming) details += `, Hours: ${trader.workdayTiming}`;
    return details;
  }).join('; \n');
};

export const bulkAddTraders = (
  tradersToCreate: Array<ParsedTraderData>,
  branchId: BranchId
): Trader[] => {
  const branchTraders = getStoredTradersForBranch(branchId);
  const createdTraders: Trader[] = [];

  tradersToCreate.forEach(parsedData => {
    const newTrader: Trader = {
      id: `trader-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      branchId: branchId,
      name: parsedData.name,
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
      // Fields not in ParsedTraderData like closedOn, reviewKeywords will be undefined
    };
    branchTraders.push(newTrader);
    createdTraders.push(newTrader);
  });

  saveTradersForBranch(branchId, branchTraders);
  return createdTraders;
};
