
// lib/scraper.ts
import { Page } from 'puppeteer';
import { BrowserManager } from './browser-manager';
import { ScrapingOptions, ScrapingResult } from '@/types';
import axios from 'axios';

export class Scraper {
  private browserManager: BrowserManager;

  constructor(browserConfig?: any) {
    this.browserManager = new BrowserManager(browserConfig);
  }

  async scrape<T = any>(options: ScrapingOptions): Promise<ScrapingResult<T>> {
    const startTime = Date.now();
    let page: Page | null = null;

    try {
      page = await this.browserManager.createPage(options);
      
      if (options.proxy) {
        await page.authenticate({
          username: '',
          password: ''
        });
      }

      await page.goto(options.url, { 
        waitUntil: 'networkidle2',
        timeout: options.timeout || 30000
      });

      if (options.waitFor) {
        if (typeof options.waitFor === 'number') {
          await page.waitForTimeout(options.waitFor);
        } else {
          await page.waitForSelector(options.waitFor);
        }
      }

      const data = await this.extractData<T>(page);
      
      return {
        data,
        metadata: {
          url: options.url,
          timestamp: new Date(),
          responseTime: Date.now() - startTime
        }
      };

    } catch (error) {
      throw new Error(`Scraping failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  private async extractData<T>(page: Page): Promise<T> {
    // Default extraction - can be overridden
    const html = await page.content();
    const title = await page.title();
    const url = page.url();
    
    return {
      html,
      title,
      url,
      timestamp: new Date()
    } as unknown as T;
  }

  async close(): Promise<void> {
    await this.browserManager.close();
  }
}
