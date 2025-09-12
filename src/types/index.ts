
import { z } from 'zod';

// --- Branch & User Management ---

export const VALID_BRANCH_IDS = ["PURLEY", "LEATHERHEAD", "DORKING", "REDHILL", "BRANCH_D", "MARGATE"] as const;
export const VALID_LOGIN_IDS = [...VALID_BRANCH_IDS, "MANAGER"] as const;

export type BranchId = typeof VALID_BRANCH_IDS[number];
export type BranchLoginId = typeof VALID_LOGIN_IDS[number];
export type UserRole = "user" | "manager" | "unknown";
export type BaseBranchId = Exclude<BranchLoginId, 'MANAGER'>;


export interface BranchInfo {
  baseBranchId: BaseBranchId | null; // The actual branch for data, null if manager isn't associated with one
  displayLoginId: BranchLoginId | null; // What the user logged in as
  role: UserRole;
  user: string | null;
  branchName: string;
  branchAddress: string;
}

const branchDetails: Record<BaseBranchId, { name: string; address: string; }> = {
    PURLEY: { name: "Jewson Purley", address: "Purley Way, Croydon" },
    LEATHERHEAD: { name: "Jewson Leatherhead", address: "Kingston Road, Leatherhead" },
    DORKING: { name: "Jewson Dorking", address: "Vincent Lane, Dorking" },
    REDHILL: { name: "Jewson Redhill", address: "Brighton Road, Redhill" },
    BRANCH_D: { name: "Jewson Branch D", address: "Somewhere, UK" },
    MARGATE: { name: "Jewson Margate", address: "Margate, UK" },
};


export const getBranchInfo = (
  loginId: BranchLoginId | null
): BranchInfo => {
  
  if (loginId === 'MANAGER') {
      return {
        baseBranchId: null,
        displayLoginId: 'MANAGER',
        role: "manager",
        user: "Manager",
        branchName: "Manager View",
        branchAddress: "All Branches",
      };
  }

  if (loginId && loginId !== 'MANAGER' && VALID_BRANCH_IDS.includes(loginId)) {
    return {
      baseBranchId: loginId,
      displayLoginId: loginId,
      role: "user",
      user: `${loginId} User`,
      branchName: branchDetails[loginId].name,
      branchAddress: branchDetails[loginId].address,
    };
  }

  return {
    baseBranchId: null,
    displayLoginId: null,
    role: "unknown",
    user: null,
    branchName: "Unknown",
    branchAddress: "N/A",
  };
};

// --- Trader Data Management ---

export const TraderStatusSchema = z.enum(["Active", "Inactive", "Call-Back", "New Lead"]);
export type TraderStatus = z.infer<typeof TraderStatusSchema>;

// Represents the full Trader object, as stored in Firestore and used in the UI
export const TraderSchema = z.object({
    id: z.string(),
    name: z.string(),
    status: TraderStatusSchema,
    lastActivity: z.string(), // ISO 8601 date string
    description: z.string().optional().nullable(),
    reviews: z.number().optional().nullable(),
    rating: z.number().optional().nullable(),
    website: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    ownerName: z.string().optional().nullable(),
    mainCategory: z.string().optional().nullable(),
    categories: z.string().optional().nullable(), // comma-separated
    workdayTiming: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    ownerProfileLink: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    callBackDate: z.string().optional().nullable(), // ISO 8601 date string
    totalAssets: z.number().optional().nullable(),
    estimatedAnnualRevenue: z.number().optional().nullable(),
    estimatedCompanyValue: z.number().optional().nullable(),
    employeeCount: z.number().optional().nullable(),
});

export type Trader = z.infer<typeof TraderSchema>;


// Represents the data parsed from a CSV file, before it's validated and converted to a full Trader object
export const ParsedTraderDataSchema = z.object({
  name: z.string(),
  status: TraderStatusSchema.optional(),
  lastActivity: z.string().optional(), // Date string from CSV
  description: z.string().optional(),
  reviews: z.coerce.number().optional(),
  rating: z.coerce.number().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  ownerName: z.string().optional(),
  mainCategory: z.string().optional(),
  categories: z.string().optional(),
  workdayTiming: z.string().optional(),
  address: z.string().optional(),
  ownerProfileLink: z.string().optional(),
  notes: z.string().optional(),
  totalAssets: z.coerce.number().optional(),
  estimatedAnnualRevenue: z.coerce.number().optional(),
  estimatedCompanyValue: z.coerce.number().optional(),
  employeeCount: z.coerce.number().optional(),
  callBackDate: z.string().optional(),
});

export type ParsedTraderData = z.infer<typeof ParsedTraderDataSchema>;

export interface BulkDeleteTradersResult {
  successCount: number;
  failureCount: number;
  error?: string | null;
}
