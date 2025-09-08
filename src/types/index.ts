export interface BrowserConfig {
  headless?: boolean;
  args?: string[];
  timeout?: number;
  [key: string]: any; // For other puppeteer launch options
}

export interface ScrapingOptions {
  url: string;
  userAgent?: string;
  proxy?: string; // e.g., 'http://user:pass@host:port'
  timeout?: number;
  waitFor?: string | number; // Selector or milliseconds
  [key: string]: any;
}

export interface ScrapingResult<T = any> {
  data: T;
  metadata: {
    url: string;
    timestamp: Date;
    responseTime: number; // in milliseconds
  };
}
