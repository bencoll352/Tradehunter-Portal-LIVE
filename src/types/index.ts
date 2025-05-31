
export interface Trader {
  id: string;
  name: string;
  branchId: string;
  totalSales: number; // Will be £
  tradesMade: number;
  status: 'Active' | 'Inactive';
  lastActivity: string; // ISO Date string e.g. "2023-10-26T10:00:00.000Z"
  description?: string;
  rating?: number;
  website?: string;
  phone?: string;
  address?: string;
  mainCategory?: string;
  // New fields from bulk upload
  ownerName?: string;
  ownerProfileLink?: string;
  categories?: string; // Storing as a single string for simplicity, could be string[]
  workdayTiming?: string;
  closedOn?: string;
  reviewKeywords?: string;
}

export type BranchId = 'BRANCH_A' | 'BRANCH_B' | 'BRANCH_C' | 'BRANCH_D'; // Added BRANCH_D

export const VALID_BRANCH_IDS: BranchId[] = ['BRANCH_A', 'BRANCH_B', 'BRANCH_C', 'BRANCH_D']; // Added BRANCH_D

// For bulk upload parsing, reflecting the 16 specified headers
export type ParsedTraderData = {
  name: string; // Mandatory
  totalSales?: number;
  status?: 'Active' | 'Inactive';
  lastActivity?: string; // Expected as ISO string or a format Date.parse() can handle
  description?: string;
  tradesMade?: number; // from 'Reviews' header
  rating?: number;
  website?: string;
  phone?: string;
  ownerName?: string;
  mainCategory?: string;
  categories?: string;
  workdayTiming?: string;
  address?: string;
  ownerProfileLink?: string; // from 'Link' header
  // 'Actions' column from CSV is ignored during parsing
  // 'closedOn' and 'reviewKeywords' are no longer expected from CSV based on new header list.
};

