
export interface Trader {
  id: string;
  name: string;
  branchId: string;
  totalSales: number; // Will be £
  tradesMade: number;
  status: 'Active' | 'Inactive' | 'Call-Back' | 'New Lead';
  lastActivity: string; // ISO Date string e.g. "2023-10-26T10:00:00.000Z"
  description?: string | null;
  rating?: number | null;
  website?: string | null;
  phone?: string | null;
  address?: string | null;
  mainCategory?: string | null;
  ownerName?: string | null;
  ownerProfileLink?: string | null;
  categories?: string | null; 
  workdayTiming?: string | null;
  closedOn?: string | null; 
  reviewKeywords?: string | null;
  notes?: string | null; // New field for notes
}

export type BranchId = 'PURLEY' | 'BRANCH_B' | 'BRANCH_C' | 'BRANCH_D' | 'DOVER';

export const VALID_BRANCH_IDS: BranchId[] = ['PURLEY', 'BRANCH_B', 'BRANCH_C', 'BRANCH_D', 'DOVER'];

// For bulk upload parsing
export type ParsedTraderData = {
  name: string; // Mandatory
  totalSales?: number;
  status?: 'Active' | 'Inactive' | 'Call-Back' | 'New Lead';
  lastActivity?: string; 
  description?: string | null;
  tradesMade?: number; 
  rating?: number | null;
  website?: string | null;
  phone?: string | null;
  ownerName?: string | null;
  mainCategory?: string | null;
  categories?: string | null;
  workdayTiming?: string | null;
  address?: string | null;
  ownerProfileLink?: string | null;
  notes?: string | null; // New field for notes
};

