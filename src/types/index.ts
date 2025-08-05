
// A "base" branch ID is one of the core, non-aliased identifiers.
export type BaseBranchId = 'PURLEY' | 'BRANCH_B' | 'BRANCH_C' | 'DOVER' | 'LEATHERHEAD';
// A "login" ID is what a user might use, which could be an alias.
export type BranchLoginId = BaseBranchId | 'BRANCH_A' | 'BRANCH_D';

// All valid IDs that can be entered in the login form or URL.
export const VALID_LOGIN_IDS: BranchLoginId[] = ['PURLEY', 'BRANCH_B', 'BRANCH_C', 'DOVER', 'LEATHERHEAD', 'BRANCH_A', 'BRANCH_D'];

// This maps login IDs to their canonical base ID. 'BRANCH_A' is an alias for 'PURLEY'.
const branchIdMapping: Record<BranchLoginId, BaseBranchId> = {
  'PURLEY': 'PURLEY',
  'BRANCH_A': 'PURLEY', 
  'BRANCH_B': 'BRANCH_B',
  'BRANCH_C': 'BRANCH_C',
  'DOVER': 'DOVER',
  'LEATHERHEAD': 'LEATHERHEAD',
  'BRANCH_D': 'LEATHERHEAD', // Example: Branch D is also an alias for Leatherhead
};

export type UserRole = 'manager' | 'staff' | 'unknown';

export interface BranchInfo {
  baseBranchId: BaseBranchId | null;
  displayLoginId: BranchLoginId | null;
  userEmail: string | null;
  role: UserRole;
  branchName: string;
}

// Defines who is a manager for which branch.
const managerMap: Partial<Record<BaseBranchId, string[]>> = {
    'PURLEY': ['manager.purley@example.com'],
    'LEATHERHEAD': ['manager.leatherhead@example.com'],
};

// Main function to get branch and user info
export const getBranchInfo = (loginId: BranchLoginId | null, email: string | null): BranchInfo => {
    if (!loginId || !VALID_LOGIN_IDS.includes(loginId) || !email) {
        return { baseBranchId: null, displayLoginId: null, userEmail: null, role: 'unknown', branchName: 'Unknown Branch' };
    }

    const baseBranchId = branchIdMapping[loginId];
    
    // Determine user role
    const managersForBranch = managerMap[baseBranchId];
    const isManager = managersForBranch ? managersForBranch.includes(email.toLowerCase()) : false;
    const role: UserRole = isManager ? 'manager' : 'staff';
    
    // A simple mapping for display names.
    const branchNameMap: Record<BaseBranchId, string> = {
        'PURLEY': 'Purley Branch',
        'BRANCH_B': 'Branch B',
        'BRANCH_C': 'Branch C',
        'DOVER': 'Dover Branch',
        'LEATHERHEAD': 'Leatherhead Branch',
    };

    return {
        baseBranchId,
        displayLoginId: loginId,
        userEmail: email,
        role,
        branchName: branchNameMap[baseBranchId] || 'Unknown Branch',
    };
};

export interface Trader {
  id: string;
  name: string;
  branchId: string;
  status: 'Active' | 'Inactive' | 'Call-Back' | 'New Lead';
  lastActivity: string; // ISO 8601 string
  description: string | null;
  rating: number | null;
  website: string | null;
  phone: string | null;
  address: string | null;
  mainCategory: string | null;
  ownerName: string | null;
  ownerProfileLink: string | null;
  categories: string | null;
  workdayTiming: string | null;
  closedOn: string | null;
  reviewKeywords: string | null;
  notes: string | null;
  callBackDate: string | null; // ISO 8601 string
  estimatedAnnualRevenue: number | null;
  estimatedCompanyValue: number | null;
  employeeCount: number | null;
}

export type ParsedTraderData = Omit<Trader, 'id' | 'branchId' | 'closedOn' | 'reviewKeywords' | 'lastActivity'> & {
    lastActivity?: string; // Optional because it might not be in the CSV
};

export interface BulkDeleteTradersResult {
  successCount: number;
  failureCount: number;
  error: string | null;
}
