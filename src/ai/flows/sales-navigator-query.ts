
'use server';
/**
 * @fileOverview A Sales & Strategy Navigator tool for providing advanced strategic insights.
 * This flow communicates with an external service.
 *
 * - salesNavigatorQuery - A function that handles the query process.
 * - SalesNavigatorQueryInput - The input type for the salesNavigatorQuery function.
 * - SalesNavigatorQueryOutput - The return type for the salesNavigatorQuery function.
 */

import { z } from 'genkit'; // Using genkit's Zod for consistency if other parts use it

const SALES_NAVIGATOR_EXTERNAL_URL = "https://sales-and-strategy-navigator-302177537641.us-west1.run.app/";

const SalesNavigatorQueryInputSchema = z.object({
  query: z.string().describe('The strategic question or analysis request for the Sales Navigator.'),
  traderData: z.string().describe('The current trader data CSV string for the branch.'),
  branchId: z.string().describe('The base branch ID for context.'),
  uploadedFileContent: z.string().optional().describe('Optional: Content of an uploaded file (e.g., market data, competitor info) for analysis. Expected format: raw text content of the file.'),
});
export type SalesNavigatorQueryInput = z.infer<typeof SalesNavigatorQueryInputSchema>;

const SalesNavigatorQueryOutputSchema = z.object({
  strategy: z.string().describe('The strategic advice, analysis, or answer from the Sales Navigator.'),
  // Add any other fields the external Sales Navigator API might return
});
export type SalesNavigatorQueryOutput = z.infer<typeof SalesNavigatorQueryOutputSchema>;


export async function salesNavigatorQuery(input: SalesNavigatorQueryInput): Promise<SalesNavigatorQueryOutput> {
  console.log(`[SalesNavigatorQuery] Sending query to external service: "${input.query}" for branch ${input.branchId}`);
  if (input.uploadedFileContent) {
    console.log(`[SalesNavigatorQuery] Including uploaded file content (length: ${input.uploadedFileContent.length} chars).`);
  }
  
  try {
    const response = await fetch(SALES_NAVIGATOR_EXTERNAL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // The body will now include uploadedFileContent if present
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

      // Check for common "Cannot POST /" type error from external service
      if (response.status === 404 && errorDetails.toLowerCase().includes("cannot post /")) {
         throw new Error(`Sales Navigator service (404 Not Found): The endpoint at ${SALES_NAVIGATOR_EXTERNAL_URL} was reached, but it's not configured to accept POST requests at its root path ('/'). Please verify if a more specific path is needed (e.g., /api/analyze) or check the external service's routing configuration.`);
      }
      
      console.error(`[SalesNavigatorQuery] External service error: ${response.status} ${response.statusText}. Details: ${errorDetails}`);
      throw new Error(`Sales Navigator service failed with status ${response.status}: ${response.statusText}. Details: ${errorDetails.substring(0,150)}...`);
    }

    const result = await response.json();
    
    // Validate the output against the schema (optional but good practice)
    const parsedOutput = SalesNavigatorQueryOutputSchema.safeParse(result);
    if (!parsedOutput.success) {
      console.error("[SalesNavigatorQuery] Invalid response structure from external service:", parsedOutput.error.flatten());
      throw new Error("Sales Navigator service returned an invalid response format.");
    }
    
    console.log('[SalesNavigatorQuery] Successfully received strategy from external service.');
    return parsedOutput.data;

  } catch (error) {
    console.error('[SalesNavigatorQuery] Error during external service call:', error);
    let detailedErrorMessage = 'An unexpected error occurred while contacting the Sales Navigator service.';
    if (error instanceof Error) {
      detailedErrorMessage = error.message;
    }
    // Ensure the error message passed to the client is concise but informative
    throw new Error(`Sales Navigator analysis failed: ${detailedErrorMessage.length > 300 ? detailedErrorMessage.substring(0, 297) + '...' : detailedErrorMessage}. Check server logs for full details.`);
  }
}
