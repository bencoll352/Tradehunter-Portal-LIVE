
import type { Trader, BranchId, ParsedTraderData } from '@/types';
import { format, parseISO } from 'date-fns';

let MOCK_TRADERS: Trader[] = [
  { id: 'trader-1', name: 'Alice Wonderland', branchId: 'BRANCH_A', totalSales: 125000, tradesMade: 150, status: 'Active', lastActivity: new Date(2024, 6, 15).toISOString(), description: 'Curiouser and curiouser goods. Specializes in whimsical party supplies and enchanted garden ornaments. Known for excellent customer service.', website: 'https://alice.example.com', phone: '01234 567801', address: '123 Rabbit Hole Lane, Wonderland, WDC 123', mainCategory: 'Retail', ownerName: "Mad Hatter", ownerProfileLink: "https://example.com/madhatter", categories: "Party Supplies, Garden, Gifts", workdayTiming: "Mon-Sat 10am-6pm", closedOn: "Sundays", reviewKeywords: "tea, party, fun, whimsical, charming" },
  { id: 'trader-2', name: 'Bob The Builder', branchId: 'BRANCH_A', totalSales: 98000, tradesMade: 120, status: 'Active', lastActivity: new Date(2024, 6, 10).toISOString(), description: 'Can he fix it? Yes, he can! General construction and home repair services. Reliable and efficient.', rating: 4.8, phone: '01234 567802', mainCategory: 'Construction', categories: 'Building, Repairs, Home Improvement', address: "456 Fixit Ave, Builderville, BLD 456", ownerName: "Bob", ownerProfileLink: "https://example.com/bob", workdayTiming: "Mon-Fri 8am-5pm", closedOn: "Weekends", reviewKeywords: "reliable, efficient, construction" },
  { id: 'trader-3', name: 'Charlie Brown', branchId: 'BRANCH_A', totalSales: 75000, tradesMade: 90, status: 'Inactive', lastActivity: new Date(2024, 3, 5).toISOString(), mainCategory: 'Services', address: '456 Kite Street, Townsville, TWN 789', workdayTiming: "Mon-Fri 9am-5pm", description: "Good grief! Offering comic strip consultation and kite flying lessons. Currently on hiatus.", phone: "01234567810", ownerName: "Charles M. Schulz (Estate)", reviewKeywords:"comic, kite, peanuts" },
  { id: 'trader-4', name: 'Diana Prince', branchId: 'BRANCH_B', totalSales: 210000, tradesMade: 200, status: 'Active', lastActivity: new Date(2024, 6, 18).toISOString(), address: '789 Amazon Way, Themyscira, THM 001', phone: '01234 567803', mainCategory: 'Consulting', closedOn: 'Weekends', description: "Antiquities expert and diplomatic consultant. Handles sensitive international relations.", rating: 5.0, website: "https://diana.example.com", categories: "Diplomacy, History, Art", reviewKeywords: "wise, strong, expert"},
  { id: 'trader-5', name: 'Edward Scissorhands', branchId: 'BRANCH_B', totalSales: 150000, tradesMade: 180, status: 'Active', lastActivity: new Date(2024, 6, 12).toISOString(), website: 'https://edwardcuts.example.com', description: 'Unique topiary and avant-garde hairdressing services. Gentle and artistic.', rating: 4.9, ownerProfileLink: 'https://example.com/edward', mainCategory: "Personal Care", categories: "Hairdressing, Landscaping, Art", phone: "01234567811", address: "1 Suburbia Drive, Castle Hill, CHL 555", reviewKeywords: "artistic, unique, gentle"},
  { id: 'trader-6', name: 'Fiona Gallagher', branchId: 'BRANCH_C', totalSales: 180000, tradesMade: 165, status: 'Active', lastActivity: new Date(2024, 6, 20).toISOString(), description: 'South Side resilience. Runs a local cafe and diner. Known for hearty meals and a welcoming atmosphere.', mainCategory: 'Cafe', phone: '01234 567804', address: "222 South Side St, Chicago, CHI 606", ownerName: "Fiona Gallagher", categories: "Food, Diner, Coffee", workdayTiming: "Mon-Sun 7am-10pm", reviewKeywords: "family, hearty, local" },
];

export const getTradersByBranch = (branchId: BranchId): Trader[] => {
  return MOCK_TRADERS.filter(trader => trader.branchId === branchId);
};

export const addTrader = (traderData: Omit<Trader, 'id' | 'lastActivity'> & { lastActivity?: string }): Trader => {
  const newTrader: Trader = {
    id: `trader-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: traderData.name,
    branchId: traderData.branchId,
    totalSales: traderData.totalSales,
    tradesMade: traderData.tradesMade,
    status: traderData.status,
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
  MOCK_TRADERS.push(newTrader);
  return newTrader;
};

export const updateTrader = (updatedTrader: Trader): Trader | null => {
  const index = MOCK_TRADERS.findIndex(trader => trader.id === updatedTrader.id && trader.branchId === updatedTrader.branchId);
  if (index !== -1) {
    MOCK_TRADERS[index] = { ...MOCK_TRADERS[index], ...updatedTrader, lastActivity: new Date().toISOString() }; // Always update lastActivity on any update
    return MOCK_TRADERS[index];
  }
  return null;
};

export const deleteTrader = (traderId: string, branchId: BranchId): boolean => {
  const initialLength = MOCK_TRADERS.length;
  MOCK_TRADERS = MOCK_TRADERS.filter(trader => !(trader.id === traderId && trader.branchId === branchId));
  return MOCK_TRADERS.length < initialLength;
};

// Helper to format trader data for the Branch Booster
export const formatTraderDataForAI = (traders: Trader[]): string => {
  if (!traders || traders.length === 0) {
    return "No trader data available for this branch.";
  }
  return traders.map(trader => {
    let details = `Trader: ${trader.name}, Sales: £${trader.totalSales.toLocaleString('en-GB')}, Trades: ${trader.tradesMade}, Status: ${trader.status}, Last Activity: ${format(parseISO(trader.lastActivity), 'dd/MM/yyyy')}`;
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
    if (trader.closedOn) details += `, Closed: ${trader.closedOn}`;
    if (trader.reviewKeywords) details += `, Keywords: ${trader.reviewKeywords}`;
    return details;
  }).join('; \n');
};

export const bulkAddTraders = (
  tradersToCreate: Array<ParsedTraderData>,
  branchId: BranchId
): Trader[] => {
  const createdTraders: Trader[] = [];
  tradersToCreate.forEach(traderData => {
    // Default totalSales to 0 and status to 'Active' for bulk uploaded traders
    // Ensure all fields from ParsedTraderData are mapped to the Trader creation
    const newTraderPayload: Omit<Trader, 'id' | 'lastActivity'> = {
      name: traderData.name,
      branchId: branchId,
      totalSales: 0, // Default for new bulk uploads
      tradesMade: traderData.tradesMade || 0,
      status: 'Active', // Default for new bulk uploads
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
    const createdTrader = addTrader(newTraderPayload);
    createdTraders.push(createdTrader);
  });
  return createdTraders;
};

