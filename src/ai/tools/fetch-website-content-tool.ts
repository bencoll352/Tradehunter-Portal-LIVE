'use server';
/**
 * @fileOverview A Genkit tool for fetching the text content of a website.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define a simple tool to fetch website content.
// Note: This is a simplified implementation. For production, you'd want more robust error handling,
// content sanitization, and potentially a library like Cheerio to parse HTML.
export const fetchWebsiteContent = ai.defineTool(
  {
    name: 'fetchWebsiteContent',
    description: 'Fetches the textual content from a given URL. Useful for accessing information from websites, such as the BuildWise Intel portal.',
    inputSchema: z.object({
      url: z.string().url().describe('The URL of the website to fetch.'),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      console.log(`[fetchWebsiteContent Tool] Fetching content from URL: ${input.url}`);
      const response = await fetch(input.url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Return the raw HTML text. The LLM is capable of parsing this.
      const textContent = await response.text();
      // Truncate for performance and to avoid overly large payloads.
      const truncatedContent = textContent.substring(0, 20000);
      console.log(`[fetchWebsiteContent Tool] Successfully fetched content (truncated to ${truncatedContent.length} chars).`);
      return truncatedContent;
    } catch (error) {
      console.error(`[fetchWebsiteContent Tool] Error fetching URL ${input.url}:`, error);
      if (error instanceof Error) {
        return `Failed to fetch content from ${input.url}. Reason: ${error.message}`;
      }
      return `Failed to fetch content from ${input.url}. An unknown error occurred.`;
    }
  }
);
