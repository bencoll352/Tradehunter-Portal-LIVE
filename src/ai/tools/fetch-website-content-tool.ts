
'use server';
/**
 * @fileOverview A Genkit tool to fetch content from a website URL.
 *
 * - fetchWebsiteContentTool - The tool definition.
 * - FetchWebsiteContentInputSchema - Input schema for the tool.
 * - FetchWebsiteContentOutputSchema - Output schema for the tool.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const FetchWebsiteContentInputSchema = z.object({
  url: z.string().url().describe('The URL of the website to fetch content from.'),
});
export type FetchWebsiteContentInput = z.infer<typeof FetchWebsiteContentInputSchema>;

export const FetchWebsiteContentOutputSchema = z.object({
  url: z.string().url(),
  content: z.string().nullable().describe('The fetched text content of the website, or null if fetching failed or content was not suitable.'),
  error: z.string().nullable().describe('An error message if fetching failed, otherwise null.'),
});
export type FetchWebsiteContentOutput = z.infer<typeof FetchWebsiteContentOutputSchema>;

export const fetchWebsiteContentTool = ai.defineTool(
  {
    name: 'fetchWebsiteContentTool',
    description: 'Fetches the primary text content from a given public website URL. Returns the text content or an error if fetching fails. This tool does not handle sites requiring login or complex JavaScript rendering perfectly.',
    inputSchema: FetchWebsiteContentInputSchema,
    outputSchema: FetchWebsiteContentOutputSchema,
  },
  async (input: FetchWebsiteContentInput): Promise<FetchWebsiteContentOutput> => {
    try {
      console.log(`[fetchWebsiteContentTool] Attempting to fetch: ${input.url}`);
      const response = await fetch(input.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', // Try to mimic a common crawler
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        console.warn(`[fetchWebsiteContentTool] Failed to fetch ${input.url}. Status: ${response.status}`);
        return {
          url: input.url,
          content: null,
          error: `Failed to fetch URL. Status: ${response.status} ${response.statusText}. The website might be down, inaccessible, or blocking requests.`,
        };
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || (!contentType.includes('text/html') && !contentType.includes('text/plain'))) {
        console.warn(`[fetchWebsiteContentTool] Non-HTML/text content type for ${input.url}: ${contentType}`);
        return {
          url: input.url,
          content: null,
          error: `Unsupported content type: ${contentType}. Only HTML or plain text pages can be processed.`,
        };
      }

      const textContent = await response.text();
      // Basic check for meaningful content length
      if (textContent.trim().length < 100) {
         console.warn(`[fetchWebsiteContentTool] Fetched content for ${input.url} seems very short or empty.`);
         // Return it anyway, LLM can decide if it's useful
      }
      console.log(`[fetchWebsiteContentTool] Successfully fetched content from ${input.url}. Length: ${textContent.length}`);
      // For simplicity, we are returning the full text. In a real scenario, you might parse/clean this.
      return { url: input.url, content: textContent, error: null };
    } catch (err) {
      console.error(`[fetchWebsiteContentTool] Error fetching URL ${input.url}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during fetch.';
      if (errorMessage.includes('aborted')) {
        return { url: input.url, content: null, error: `Timeout fetching URL: ${input.url}. The server took too long to respond.` };
      }
      return { url: input.url, content: null, error: `Error fetching URL ${input.url}: ${errorMessage}. The website might be offline or blocking access.` };
    }
  }
);
