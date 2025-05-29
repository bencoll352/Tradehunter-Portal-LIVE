
export interface Trader {
  id: string;
  name: string;
  branchId: string;
  totalSales: number;
  tradesMade: number;
  status: 'Active' | 'Inactive';
  lastActivity: string; // ISO Date string e.g. "2023-10-26T10:00:00.000Z"
  description?: string;
  rating?: number;
  website?: string;
  phone?: string;
  address?: string;
  mainCategory?: string;
}

export type BranchId = 'BRANCH_A' | 'BRANCH_B' | 'BRANCH_C';

export const VALID_BRANCH_IDS: BranchId[] = ['BRANCH_A', 'BRANCH_B', 'BRANCH_C'];

// For bulk upload parsing
export type ParsedTraderData = Partial<Omit<Trader, 'id' | 'branchId' | 'lastActivity' | 'totalSales' | 'status'>> & {
  name: string; // Name is mandatory for a new trader
  // tradesMade will come from 'reviews'
  // rating, website, phone, address, mainCategory, description are optional
};
