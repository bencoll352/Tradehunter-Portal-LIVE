export interface Trader {
  id: string;
  name: string;
  branchId: string;
  totalSales: number;
  tradesMade: number;
  status: 'Active' | 'Inactive';
  lastActivity: string; // ISO Date string e.g. "2023-10-26T10:00:00.000Z"
}

export type BranchId = 'BRANCH_A' | 'BRANCH_B' | 'BRANCH_C';

export const VALID_BRANCH_IDS: BranchId[] = ['BRANCH_A', 'BRANCH_B', 'BRANCH_C'];
