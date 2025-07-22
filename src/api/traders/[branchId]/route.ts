
// src/app/api/traders/[branchId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getTradersByBranch } from '@/lib/trader-service';
import { VALID_BASE_BRANCH_IDS, type BaseBranchId } from '@/types';

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Correct type definition for the route handler's second argument
interface RouteParams {
  params: { branchId: string };
}

// This function handles GET requests to /api/traders/[branchId]
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { branchId } = params;
  const apiKey = request.headers.get('x-api-key');

  // 1. API Key Validation
  const serverApiKey = process.env.TRADERS_API_KEY;
  if (!serverApiKey) {
    console.error('[API /traders] TRADERS_API_KEY is not set on the server. Access denied.');
    return NextResponse.json(
      { error: 'API service is not configured correctly. API key is missing on the server.' },
      { status: 500 }
    );
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Unauthorized: Missing API key. Please include "x-api-key" in your headers.' },
      { status: 401 }
    );
  }

  if (apiKey !== serverApiKey) {
    return NextResponse.json({ error: 'Unauthorized: Invalid API key.' }, { status: 403 });
  }

  // 2. Branch ID Validation
  const upperCaseBranchId = branchId.toUpperCase() as BaseBranchId;
  if (!VALID_BASE_BRANCH_IDS.includes(upperCaseBranchId)) {
    return NextResponse.json(
      { error: `Invalid branch ID: '${branchId}'.` },
      { status: 400 }
    );
  }

  // 3. Fetch Data
  try {
    const traders = await getTradersByBranch(upperCaseBranchId);
    return NextResponse.json(traders);
  } catch (error) {
    console.error(`[API /traders] Error fetching traders for branch ${upperCaseBranchId}:`, error);
    const errorMessage = extractErrorMessage(error);
    return NextResponse.json(
      { error: 'An internal server error occurred while fetching trader data.', details: errorMessage },
      { status: 500 }
    );
  }
}
