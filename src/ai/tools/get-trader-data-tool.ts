
'use server';
/**
 * @fileOverview A Genkit tool for securely fetching trader data from the internal API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { VALID_BASE_BRANCH_IDS, type BaseBranchId } from '@/types';

export const getTraderDataByBranch = ai.defineTool(
  {
    name: 'getTraderDataByBranch',
    description: 'Fetches the complete and live list of all traders for a given branch ID using a secure internal API. This is the preferred method for getting up-to-date trader data.',
    inputSchema: z.object({
      branchId: z.enum(VALID_BASE_BRANCH_IDS).describe('The base ID of the branch to fetch data for (e.g., "PURLEY", "DOVER").'),
    }),
    outputSchema: z.string().describe('A JSON string representing an array of trader objects.'),
  },
  async (input) => {
    const { branchId } = input;

    // Determine the base URL. In a real app, this should be more dynamic.
    // For Vercel/Firebase App Hosting, we can construct it from environment variables.
    const isProduction = process.env.NODE_ENV === 'production';
    // This will be the localhost URL for dev, or the deployed URL for prod.
    // NEXT_PUBLIC_VERCEL_URL is a system env var on Vercel. We can use a custom one for App Hosting.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (isProduction ? 'https://your-deployed-app-url.com' : 'http://localhost:3000');
    
    const apiUrl = `${baseUrl}/api/traders/${branchId}`;
    const apiKey = process.env.TRADERS_API_KEY;

    if (!apiKey) {
      console.error('[getTraderDataByBranch Tool] Error: TRADERS_API_KEY is not set in the environment.');
      return JSON.stringify({ error: 'Tool is not configured: Missing API Key on the server.' });
    }

    try {
      console.log(`[getTraderDataByBranch Tool] Fetching data from internal API: ${apiUrl}`);
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[getTraderDataByBranch Tool] API Error: ${response.status} ${response.statusText}`, errorBody);
        return JSON.stringify({ 
          error: `Failed to fetch trader data from the internal API.`,
          status: response.status,
          details: errorBody 
        });
      }

      const data = await response.json();
      console.log(`[getTraderDataByBranch Tool] Successfully fetched ${data.length} traders for branch ${branchId}.`);
      return JSON.stringify(data);

    } catch (error) {
      console.error(`[getTraderDataByBranch Tool] Network or tool error fetching from ${apiUrl}:`, error);
      if (error instanceof Error) {
        return JSON.stringify({ error: `Tool execution failed: ${error.message}` });
      }
      return JSON.stringify({ error: 'An unknown error occurred while the tool was fetching trader data.' });
    }
  }
);
