
export interface Trader {
  id: string;
  name: string;
  branchId: string;
  totalSales: number; // Will be £
  tradesMade: number;
  status: 'Active' | 'Inactive' | 'Call-Back' | 'New Lead'; // Updated status
  lastActivity: string; // ISO Date string e.g. "2023-10-26T10:00:00.000Z"
  description?: string | null;
  rating?: number | null;
  website?: string | null;
  phone?: string | null;
  address?: string | null;
  mainCategory?: string | null;
  ownerName?: string | null;
  ownerProfileLink?: string | null;
  categories?: string | null; // Storing as a single string for simplicity, could be string[]
  workdayTiming?: string | null;
  closedOn?: string | null; 
  reviewKeywords?: string | null;
}

export type BranchId = 'PURLEY' | 'BRANCH_B' | 'BRANCH_C' | 'BRANCH_D'; // Renamed BRANCH_A to PURLEY

export const VALID_BRANCH_IDS: BranchId[] = ['PURLEY', 'BRANCH_B', 'BRANCH_C', 'BRANCH_D']; // Renamed BRANCH_A to PURLEY

// For bulk upload parsing, reflecting the 16 specified headers
export type ParsedTraderData = {
  name: string; // Mandatory
  totalSales?: number;
  status?: 'Active' | 'Inactive' | 'Call-Back' | 'New Lead'; // Updated status
  lastActivity?: string; // Expected as ISO string or a format Date.parse() can handle
  description?: string | null;
  tradesMade?: number; // from 'Reviews' header
  rating?: number | null;
  website?: string | null;
  phone?: string | null;
  ownerName?: string | null;
  mainCategory?: string | null;
  categories?: string | null;
  workdayTiming?: string | null;
  address?: string | null;
  ownerProfileLink?: string | null; // from 'Link' header
  // 'Actions' column from CSV is ignored
};

