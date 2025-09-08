// lib/browser-manager.ts
import puppeteer, { Browser, Page } from 'puppeteer';
import { BrowserConfig, ScrapingOptions } from '@/types';

export class BrowserManager {
  private browser: Browser | null = null;
  private config: BrowserConfig;

  constructor(config?: Partial<BrowserConfig>) {
    this.config = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
      timeout: 30000,
      ...config
    };
  }

  async launch(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch(this.config);
    }
    return this.browser;
  }

  async createPage(options?: ScrapingOptions): Promise<Page> {
    const browser = await this.launch();
    const page = await browser.newPage();
    
    if (options?.userAgent) {
      await page.setUserAgent(options.userAgent);
    }
    
    if (options?.timeout) {
      page.setDefaultTimeout(options.timeout);
    }

    // Anti-detection measures
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    return page;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
