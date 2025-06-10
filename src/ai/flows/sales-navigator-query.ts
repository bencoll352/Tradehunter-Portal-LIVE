
'use server';
/**
 * @fileOverview A Sales & Strategy Accelerator tool for providing advanced strategic insights.
 * This flow communicates with an external service.
 *
 * - salesNavigatorQuery - A function that handles the query process.
 * - SalesNavigatorQueryInput - The input type for the salesNavigatorQuery function.
 * - SalesNavigatorQueryOutput - The return type for the salesNavigatorQuery function.
 */

import { z } from 'genkit'; // Using genkit's Zod for consistency if other parts use it

// URL reset to base as per request.
const SALES_NAVIGATOR_EXTERNAL_URL = "https://sales-and-strategy-navigator-302177537641.us-west1.run.app/";

const SalesNavigatorQueryInputSchema = z.object({
  query: z.string().describe('The strategic question or analysis request for the Sales & Strategy Accelerator.'),
  traderData: z.string().describe('The current trader data CSV string for the branch.'),
  branchId: z.string().describe('The base branch ID for context.'),
  uploadedFileContent: z.string().optional().describe('Optional: Content of an uploaded file (e.g., market data, competitor info) for analysis. Expected format: raw text content of the file.'),
});
export type SalesNavigatorQueryInput = z.infer<typeof SalesNavigatorQueryInputSchema>;

const SalesNavigatorQueryOutputSchema = z.object({
  strategy: z.string().describe('The strategic advice, analysis, or answer from the Sales & Strategy Accelerator.'),
  // Add any other fields the external Sales Accelerator API might return
});
export type SalesNavigatorQueryOutput = z.infer<typeof SalesNavigatorQueryOutputSchema>;


export async function salesNavigatorQuery(input: SalesNavigatorQueryInput): Promise<SalesNavigatorQueryOutput> {
  console.log(`[SalesNavigatorQuery] Sending query to external service: "${input.query}" for branch ${input.branchId} at URL: ${SALES_NAVIGATOR_EXTERNAL_URL}`);
  if (input.uploadedFileContent) {
    console.log(`[SalesNavigatorQuery] Including uploaded file content (length: ${input.uploadedFileContent.length} chars).`);
  }

  try {
    const response = await fetch(SALES_NAVIGATOR_EXTERNAL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      let errorDetails = await response.text();
      try {
        // If the error response is JSON, parse it for a more specific message
        const errorJson = JSON.parse(errorDetails);
        if (errorJson && errorJson.message) {
          errorDetails = errorJson.message;
        } else if (errorJson && errorJson.error) {
            errorDetails = errorJson.error;
        }
      } catch (e) {
        // Ignore if error response is not JSON
      }

      // Specific handling for "Method Not Allowed" or "Cannot POST /" at a specific path
      if (response.status === 404 || response.status === 405) { // 405 is Method Not Allowed
        if (errorDetails.toLowerCase().includes("cannot post") || response.status === 405) {
          // Check if it's the root path or a specific sub-path like /api/analyse/
          if (SALES_NAVIGATOR_EXTERNAL_URL.endsWith('/') && !SALES_NAVIGATOR_EXTERNAL_URL.substring(0, SALES_NAVIGATOR_EXTERNAL_URL.length -1).includes('/')) {
             // This means it's likely the root path (e.g., "https://example.com/")
             throw new Error(`Sales & Strategy Accelerator service (${response.status} ${response.statusText}): The endpoint at ${SALES_NAVIGATOR_EXTERNAL_URL} was reached, but it's not configured to accept POST requests at its root path ('/'). Please verify if a more specific path is needed (e.g., /api/analyse) or check the external service's routing configuration.`);
          } else {
             // This means it's a specific sub-path (e.g., "https://example.com/api/analyse/")
            throw new Error(`Sales & Strategy Accelerator service (${response.status} ${response.statusText}): The endpoint at ${SALES_NAVIGATOR_EXTERNAL_URL} was reached, but it's not configured to accept POST requests at this specific path. Please verify the path is correct or check the external service's routing and method handling.`);
          }
        } else { // Generic 404 if "cannot post" is not in details and it's not a 405
          throw new Error(`Sales & Strategy Accelerator service (${response.status} Not Found): The endpoint at ${SALES_NAVIGATOR_EXTERNAL_URL} was not found. Please verify the URL path is correct.`);
        }
      }
      // For other non-ok statuses (e.g., 500, 401, 403)
      console.error(`[SalesNavigatorQuery] External service error: ${response.status} ${response.statusText}. Details: ${errorDetails}`);
      throw new Error(`Sales & Strategy Accelerator service failed with status ${response.status}: ${response.statusText}. Details: ${errorDetails.substring(0,150)}...`);
    }

    const result = await response.json();

    const parsedOutput = SalesNavigatorQueryOutputSchema.safeParse(result);
    if (!parsedOutput.success) {
      console.error("[SalesNavigatorQuery] Invalid response structure from external service:", parsedOutput.error.flatten());
      throw new Error("Sales & Strategy Accelerator service returned an invalid response format.");
    }

    console.log('[SalesNavigatorQuery] Successfully received strategy from external service.');
    return parsedOutput.data;

  } catch (error) {
    console.error('[SalesNavigatorQuery] Error during external service call:', error);
    let detailedErrorMessage = 'An unexpected error occurred while contacting the Sales & Strategy Accelerator service.';
    if (error instanceof Error) {
      detailedErrorMessage = error.message;
    }
    
    let finalMessagePart1 = `Sales & Strategy Accelerator analysis failed: ${detailedErrorMessage.length > 300 ? detailedErrorMessage.substring(0, 297) + '...' : detailedErrorMessage}`;
    if (!finalMessagePart1.endsWith('.') && !finalMessagePart1.endsWith('!') && !finalMessagePart1.endsWith('?')) {
      finalMessagePart1 += '.';
    }
    
    throw new Error(`${finalMessagePart1} Check server logs for full details.`);
  }
}
