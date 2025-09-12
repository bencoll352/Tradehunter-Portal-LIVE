// src/app/api/traders/[branchId]/route.ts
import { NextResponse } from 'next/server';
import { getTraders } from '@/lib/trader-service';
import { VALID_BRANCH_IDS, type BaseBranchId } from '@/types';

/**
 * API route to get all traders for a specific branch.
 * This endpoint is protected by an API key.
 *
 * Usage:
 * GET /api/traders/{branchId}
 * Headers:
 *   x-api-key: YOUR_SECRET_API_KEY
 */
export async function GET(
  request: Request,
  { params }: { params: { branchId: string } }
) {
  // 1. Authenticate the request
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== process.env.TRADERS_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized: Invalid API Key' }, { status: 401 });
  }

  // 2. Validate the branchId
  const branchId = params.branchId.toUpperCase() as BaseBranchId;
  if (!VALID_BRANCH_IDS.includes(branchId)) {
    return NextResponse.json({ error: `Invalid branchId. Must be one of: ${VALID_BRANCH_IDS.join(', ')}` }, { status: 400 });
  }

  // 3. Fetch and return the data
  try {
    const traders = await getTraders(branchId);
    return NextResponse.json({
      branchId: branchId,
      traderCount: traders.length,
      traders: traders,
    });
  } catch (error: any) {
    console.error(`[API ERROR /api/traders/${branchId}]`, error);
    return NextResponse.json({ error: 'Failed to fetch trader data from the database.', details: error.message }, { status: 500 });
  }
}