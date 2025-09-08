
import { z } from 'zod';

// --- Branch & User Management ---

export const VALID_BRANCH_IDS = ["PURLEY", "LEATHERHEAD", "DORKING", "REDHILL", "BRANCH_D"] as const;
export const VALID_LOGIN_IDS = [...VALID_BRANCH_IDS, "MANAGER"] as const;
export const VALID_USER_EMAILS = [
    "vikram.sundrani@jewson.co.uk",
    "george.smith@jewson.co.uk",
    "samantha.jones@jewson.co.uk",
    "peter.williams@jewson.co.uk",
    "manager@jewson.co.uk"
] as const;

export type BranchId = typeof VALID_BRANCH_IDS[number];
export type BranchLoginId = typeof VALID_LOGIN_IDS[number];
export type UserEmail = typeof VALID_USER_EMAILS[number];
export type UserRole = "user" | "manager" | "unknown";
export type BaseBranchId = Exclude<BranchLoginId, 'MANAGER'>;


export interface BranchInfo {
  baseBranchId: BaseBranchId | null; // The actual branch for data, null if manager isn't associated with one
  displayLoginId: BranchLoginId | null; // What the user logged in as
  role: UserRole;
  user: UserEmail | null;
  branchName: string;
  branchAddress: string;
}

const branchDetails: Record<BaseBranchId, { name: string; address: string; }> = {
    PURLEY: { name: "Jewson Purley", address: "Purley Way, Croydon" },
    LEATHERHEAD: { name: "Jewson Leatherhead", address: "Kingston Road, Leatherhead" },
    DORKING: { name: "Jewson Dorking", address: "Vincent Lane, Dorking" },
    REDHILL: { name: "Jewson Redhill", address: "Brighton Road, Redhill" },
    BRANCH_D: { name: "Jewson Branch D", address: "Somewhere, UK" },
};


export const getBranchInfo = (
  loginId: BranchLoginId | null,
  userEmail?: string | null
): BranchInfo => {
  const isManagerEmail = userEmail === "manager@jewson.co.uk";
  
  if (isManagerEmail) {
      // If manager logs in with a specific branch ID, associate them with it.
      if (loginId && loginId !== 'MANAGER' && VALID_BRANCH_IDS.includes(loginId)) {
        return {
            baseBranchId: loginId,
            displayLoginId: loginId,
            role: "manager",
            user: "manager@jewson.co.uk",
            branchName: branchDetails[loginId].name,
            branchAddress: branchDetails[loginId].address,
        };
      }
      // If manager logs in as 'MANAGER' or with an invalid/null branch ID, they have no specific branch.
      return {
        baseBranchId: null,
        displayLoginId: 'MANAGER',
        role: "manager",
        user: "manager@jewson.co.uk",
        branchName: "Manager View",
        branchAddress: "All Branches",
      };
  }

  // Regular user login
  if (loginId && loginId !== 'MANAGER' && VALID_BRANCH_IDS.includes(loginId)) {
    const userForBranch = VALID_USER_EMAILS.find(email => email !== "manager@jewson.co.uk"); // simplified logic
    return {
      baseBranchId: loginId,
      displayLoginId: loginId,
      role: "user",
      user: userForBranch || null,
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
    estimatedAnnualRevenue: z.number().optional().nullable(),
    estimatedCompanyValue: z.number().optional().nullable(),
    employeeCount: z.number().optional().nullable(),
});

export type Trader = z.infer<typeof TraderSchema>;


// Represents the data parsed from a CSV file, before it's validated and converted to a full Trader object
export const ParsedTraderDataSchema = z.object({
  name: z.string(),
  status: TraderStatusSchema.optional().default('New Lead'),
  lastActivity: z.string().optional(), // Date string from CSV
  description: z.string().optional(),
  rating: z.number().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  ownerName: z.string().optional(),
  mainCategory: z.string().optional(),
  categories: z.string().optional(),
  workdayTiming: z.string().optional(),
  address: z.string().optional(),
  ownerProfileLink: z.string().optional(),
  notes: z.string().optional(),
  estimatedAnnualRevenue: z.number().optional(),
  estimatedCompanyValue: z.number().optional(),
  employeeCount: z.number().optional(),
});

export type ParsedTraderData = z.infer<typeof ParsedTraderDataSchema>;

export interface BulkDeleteTradersResult {
  successCount: number;
  failureCount: number;
  error?: string | null;
}
