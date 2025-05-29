
import type { Trader, BranchId, ParsedTraderData } from '@/types';
import { format } from 'date-fns';

let MOCK_TRADERS: Trader[] = [
  { id: 'trader-1', name: 'Alice Wonderland', branchId: 'BRANCH_A', totalSales: 125000, tradesMade: 150, status: 'Active', lastActivity: new Date(2024, 6, 15).toISOString(), description: 'Curiouser and curiouser goods.', website: 'https://alice.example.com', phone: '01234 567801', address: '123 Rabbit Hole Lane, Wonderland', mainCategory: 'Retail', ownerName: "Mad Hatter", reviewKeywords: "tea, party, fun" },
  { id: 'trader-2', name: 'Bob The Builder', branchId: 'BRANCH_A', totalSales: 98000, tradesMade: 120, status: 'Active', lastActivity: new Date(2024, 6, 10).toISOString(), description: 'Can he fix it? Yes, he can!', rating: 4.8, phone: '01234 567802', mainCategory: 'Construction', categories: 'Building, Repairs' },
  { id: 'trader-3', name: 'Charlie Brown', branchId: 'BRANCH_A', totalSales: 75000, tradesMade: 90, status: 'Inactive', lastActivity: new Date(2024, 3, 5).toISOString(), mainCategory: 'Services', address: '456 Kite Street, Townsville', workdayTiming: "Mon-Fri 9am-5pm" },
  { id: 'trader-4', name: 'Diana Prince', branchId: 'BRANCH_B', totalSales: 210000, tradesMade: 200, status: 'Active', lastActivity: new Date(2024, 6, 18).toISOString(), address: '789 Amazon Way, Themyscira', phone: '01234 567803', mainCategory: 'Consulting', closedOn: 'Weekends' },
  { id: 'trader-5', name: 'Edward Scissorhands', branchId: 'BRANCH_B', totalSales: 150000, tradesMade: 180, status: 'Active', lastActivity: new Date(2024, 6, 12).toISOString(), website: 'https://edwardcuts.example.com', description: 'Topiary and hairdressing services.', rating: 4.9, ownerProfileLink: 'https://example.com/edward' },
  { id: 'trader-6', name: 'Fiona Gallagher', branchId: 'BRANCH_C', totalSales: 180000, tradesMade: 165, status: 'Active', lastActivity: new Date(2024, 6, 20).toISOString(), description: 'South Side resilience.', mainCategory: 'Cafe', phone: '01234 567804' },
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
    MOCK_TRADERS[index] = { ...MOCK_TRADERS[index], ...updatedTrader };
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
    let details = `Trader: ${trader.name}, Sales: £${trader.totalSales.toLocaleString('en-GB')}, Trades: ${trader.tradesMade}, Status: ${trader.status}, Last Activity: ${format(new Date(trader.lastActivity), 'dd/MM/yyyy')}`;
    if (trader.description) details += `, Description: ${trader.description}`;
    if (trader.rating) details += `, Rating: ${trader.rating}`;
    if (trader.website) details += `, Website: ${trader.website}`;
    if (trader.phone) details += `, Phone: ${trader.phone}`;
    if (trader.address) details += `, Address: ${trader.address}`;
    if (trader.mainCategory) details += `, Main Category: ${trader.mainCategory}`;
    if (trader.ownerName) details += `, Owner: ${trader.ownerName}`;
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
    const newTraderPayload: Omit<Trader, 'id' | 'lastActivity'> = {
      name: traderData.name,
      branchId: branchId,
      totalSales: 0,
      tradesMade: traderData.tradesMade || 0,
      status: 'Active',
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

