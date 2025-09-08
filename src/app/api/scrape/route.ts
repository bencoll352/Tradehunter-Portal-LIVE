
// app/api/scrape/route.ts
import { NextResponse } from 'next/server';
import { Scraper } from '@/lib/scraper';
import { ScrapingOptions } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, ...options }: ScrapingOptions = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const scraper = new Scraper();
    const result = await scraper.scrape({ url, ...options });
    await scraper.close();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Scraping error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Scraping failed', details: errorMessage }, { status: 500 });
  }
}
