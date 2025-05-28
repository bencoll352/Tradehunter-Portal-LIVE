import type { Trader, BranchId } from '@/types';
import { format } from 'date-fns';

let MOCK_TRADERS: Trader[] = [
  { id: 'trader-1', name: 'Alice Wonderland', branchId: 'BRANCH_A', totalSales: 125000, tradesMade: 150, status: 'Active', lastActivity: new Date(2024, 6, 15).toISOString() },
  { id: 'trader-2', name: 'Bob The Builder', branchId: 'BRANCH_A', totalSales: 98000, tradesMade: 120, status: 'Active', lastActivity: new Date(2024, 6, 10).toISOString() },
  { id: 'trader-3', name: 'Charlie Brown', branchId: 'BRANCH_A', totalSales: 75000, tradesMade: 90, status: 'Inactive', lastActivity: new Date(2024, 3, 5).toISOString() },
  { id: 'trader-4', name: 'Diana Prince', branchId: 'BRANCH_B', totalSales: 210000, tradesMade: 200, status: 'Active', lastActivity: new Date(2024, 6, 18).toISOString() },
  { id: 'trader-5', name: 'Edward Scissorhands', branchId: 'BRANCH_B', totalSales: 150000, tradesMade: 180, status: 'Active', lastActivity: new Date(2024, 6, 12).toISOString() },
  { id: 'trader-6', name: 'Fiona Gallagher', branchId: 'BRANCH_C', totalSales: 180000, tradesMade: 165, status: 'Active', lastActivity: new Date(2024, 6, 20).toISOString() },
];

export const getTradersByBranch = (branchId: BranchId): Trader[] => {
  return MOCK_TRADERS.filter(trader => trader.branchId === branchId);
};

export const addTrader = (trader: Omit<Trader, 'id' | 'lastActivity'> & { lastActivity?: string }): Trader => {
  const newTrader: Trader = {
    ...trader,
    id: `trader-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    lastActivity: trader.lastActivity || new Date().toISOString(),
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

// Helper to format trader data for AI
export const formatTraderDataForAI = (traders: Trader[]): string => {
  if (!traders || traders.length === 0) {
    return "No trader data available for this branch.";
  }
  return traders.map(trader => 
    `Trader: ${trader.name}, Sales: $${trader.totalSales.toLocaleString()}, Trades: ${trader.tradesMade}, Status: ${trader.status}, Last Activity: ${format(new Date(trader.lastActivity), 'yyyy-MM-dd')}`
  ).join('; ');
};
