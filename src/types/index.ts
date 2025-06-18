
export interface Trader {
  id: string;
  name: string;
  branchId: string; // This will store the BaseBranchId
  totalSales: number; 
  tradesMade: number;
  status: 'Active' | 'Inactive' | 'Call-Back' | 'New Lead';
  lastActivity: string; 
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
  notes?: string | null;
  callBackDate?: string | null; 
  annualTurnover?: number | null;
  totalAssets?: number | null;
}

export type BranchLoginId = 
  | 'PURLEY' | 'PURLEYMANAGER'
  | 'BRANCH_B' | 'BRANCH_BMANAGER'
  | 'BRANCH_C' | 'BRANCH_CMANAGER'
  | 'BRANCH_D' | 'BRANCH_DMANAGER'
  | 'DOVER' | 'DOVERMANAGER'
  | 'COLCHESTER' | 'COLCHESTERMANAGER'
  | 'CHELMSFORD' | 'CHELMSFORDMANAGER'
  | 'SITTINGBOURNE' | 'SITTINGBOURNEMANAGER'
  | 'MARGATE' | 'MARGATEMANAGER'
  | 'LEATHERHEAD' | 'LEATHERHEADMANAGER';

export type BaseBranchId = 
  | 'PURLEY' 
  | 'BRANCH_B' 
  | 'BRANCH_C' 
  | 'BRANCH_D' 
  | 'DOVER'
  | 'COLCHESTER'
  | 'CHELMSFORD'
  | 'SITTINGBOURNE'
  | 'MARGATE'
  | 'LEATHERHEAD';

export type UserRole = 'team' | 'manager' | 'unknown';

export const VALID_LOGIN_IDS: BranchLoginId[] = [
  'PURLEY', 'PURLEYMANAGER',
  'BRANCH_B', 'BRANCH_BMANAGER',
  'BRANCH_C', 'BRANCH_CMANAGER',
  'BRANCH_D', 'BRANCH_DMANAGER',
  'DOVER', 'DOVERMANAGER',
  'COLCHESTER', 'COLCHESTERMANAGER',
  'CHELMSFORD', 'CHELMSFORDMANAGER',
  'SITTINGBOURNE', 'SITTINGBOURNEMANAGER',
  'MARGATE', 'MARGATEMANAGER',
  'LEATHERHEAD', 'LEATHERHEADMANAGER'
];

export const VALID_BASE_BRANCH_IDS: BaseBranchId[] = [
  'PURLEY', 
  'BRANCH_B', 
  'BRANCH_C', 
  'BRANCH_D', 
  'DOVER',
  'COLCHESTER',
  'CHELMSFORD',
  'SITTINGBOURNE',
  'MARGATE',
  'LEATHERHEAD'
];

export interface BranchInfo {
  baseBranchId: BaseBranchId | null;
  role: UserRole;
  displayLoginId: BranchLoginId | null;
}

export function getBranchInfo(loginId: string | null): BranchInfo {
  if (!loginId || !VALID_LOGIN_IDS.includes(loginId.toUpperCase() as BranchLoginId)) {
    return { baseBranchId: null, role: 'unknown', displayLoginId: null };
  }

  const upperLoginId = loginId.toUpperCase();

  if (upperLoginId.endsWith('MANAGER')) {
    const baseId = upperLoginId.replace('MANAGER', '') as BaseBranchId;
    if (VALID_BASE_BRANCH_IDS.includes(baseId)) {
      return { baseBranchId: baseId, role: 'manager', displayLoginId: loginId.toUpperCase() as BranchLoginId };
    }
  } else {
    if (VALID_BASE_BRANCH_IDS.includes(upperLoginId as BaseBranchId)) {
      return { baseBranchId: upperLoginId as BaseBranchId, role: 'team', displayLoginId: loginId.toUpperCase() as BranchLoginId };
    }
  }
  return { baseBranchId: null, role: 'unknown', displayLoginId: loginId.toUpperCase() as BranchLoginId };
}


// For bulk upload parsing
export type ParsedTraderData = {
  name: string; 
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
  notes?: string | null;
  callBackDate?: string | null; 
  annualTurnover?: number | null;
  totalAssets?: number | null;
};

export interface BulkDeleteTradersResult {
  successCount: number;
  failureCount: number;
  error?: string | null;
}
