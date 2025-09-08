

// Consistent throughout the app, e.g., 'PURLEY', 'LEATHERHEAD'
export type BaseBranchId = 'PURLEY' | 'LEATHERHEAD' | 'DOVER' | 'BRANCH_B' | 'BRANCH_C' | 'BRANCH_D';

// This is what the user might type in, e.g., 'PURLEY' or 'PURLEY MANAGER'.
// The 'baseBranchId' is derived from this.
export type BranchLoginId = BaseBranchId;

export const VALID_LOGIN_IDS: BranchLoginId[] = ['PURLEY', 'LEATHERHEAD', 'DOVER', 'BRANCH_B', 'BRANCH_C', 'BRANCH_D'];

// Role is determined by the login credentials
export type UserRole = 'manager' | 'staff' | 'unknown';

export interface BranchInfo {
  loginId: BranchLoginId | null; // The ID used to log in, e.g., 'PURLEY'
  baseBranchId: BaseBranchId | null; // The core identifier, e.g., 'PURLEY'
  branchName: string; // The display name, e.g., 'Purley Branch'
  displayLoginId: string; // Formatted for display, e.g., 'PURLEY'
  role: UserRole;
  userEmail: string | null;
}

export const getBranchInfo = (loginId: BranchLoginId | null, userEmail: string | null = ''): BranchInfo => {
    const baseId = loginId ? (loginId.replace(' MANAGER', '').trim() as BaseBranchId) : null;
    let role: UserRole = 'unknown';
    
    if (userEmail) {
        if (userEmail.startsWith('manager.')) {
            role = 'manager';
        } else if (userEmail.startsWith('staff.')) {
            role = 'staff';
        }
    } else if (loginId?.includes('MANAGER')) {
        role = 'manager';
    } else if (baseId && VALID_LOGIN_IDS.includes(baseId)) {
        role = 'staff'; // Default to staff if no specific role identifier
    }

    let branchName = "Unknown Branch";
    if (baseId) {
        switch(baseId) {
            case 'PURLEY': branchName = 'Purley Branch'; break;
            case 'LEATHERHEAD': branchName = 'Leatherhead Branch'; break;
            case 'DOVER': branchName = 'Dover Branch'; break;
            case 'BRANCH_B': branchName = 'Branch B'; break;
            case 'BRANCH_C': branchName = 'Branch C'; break;
            case 'BRANCH_D': branchName = 'Branch D'; break;
            default: branchName = 'Unknown Branch'; break;
        }
    }
    
    return {
        loginId: loginId,
        baseBranchId: baseId,
        branchName: branchName,
        displayLoginId: loginId || 'N/A',
        role: role,
        userEmail: userEmail
    };
};


export interface Trader {
  id: string;
  name: string;
  branchId: BaseBranchId;
  status: 'Active' | 'Inactive' | 'Call-Back' | 'New Lead';
  lastActivity: string; // ISO 8601 date string
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
  callBackDate: string | null; // ISO 8601 date string
  estimatedAnnualRevenue: number | null;
  estimatedCompanyValue: number | null;
  employeeCount: number | null;
}

export type ParsedTraderData = Omit<Trader, 'id' | 'branchId' | 'lastActivity'> & {
  lastActivity?: string; 
};


export interface BulkDeleteTradersResult {
  successCount: number;
  failureCount: number;
  error?: string | null;
}


// --- Types from Botasaurus Conversion ---

export interface BrowserConfig {
  headless?: boolean;
  args?: string[];
  timeout?: number;
  [key: string]: any; // For other puppeteer launch options
}

export interface ScrapingOptions {
  url: string;
  userAgent?: string;
  proxy?: string; // e.g., 'http://user:pass@host:port'
  timeout?: number;
  waitFor?: string | number; // Selector or milliseconds
  [key: string]: any;
}

export interface ScrapingResult<T = any> {
  data: T;
  metadata: {
    url: string;
    timestamp: Date;
    responseTime: number; // in milliseconds
  };
}
