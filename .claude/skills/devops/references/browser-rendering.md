# Cloudflare Browser Rendering

Headless browser automation with Puppeteer/Playwright on Cloudflare Workers.

## Setup

**wrangler.toml:**
```toml
name ***REMOVED*** "browser-worker"
main ***REMOVED*** "src/index.ts"
compatibility_date ***REMOVED*** "2024-01-01"

browser ***REMOVED*** { binding ***REMOVED*** "MYBROWSER" }
```

## Basic Screenshot Worker

```typescript
import puppeteer from '@cloudflare/puppeteer';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const browser ***REMOVED*** await puppeteer.launch(env.MYBROWSER);
    const page ***REMOVED*** await browser.newPage();

    await page.goto('https://example.com', { waitUntil: 'networkidle2' });
    const screenshot ***REMOVED*** await page.screenshot({ type: 'png' });

    await browser.close();

    return new Response(screenshot, {
      headers: { 'Content-Type': 'image/png' }
    });
  }
};
```

## Session Reuse (Cost Optimization)

```typescript
// Disconnect instead of close
await browser.disconnect();

// Retrieve and reconnect
const sessions ***REMOVED*** await puppeteer.sessions(env.MYBROWSER);
const freeSession ***REMOVED*** sessions.find(s ***REMOVED***> !s.connectionId);

if (freeSession) {
  const browser ***REMOVED*** await puppeteer.connect(env.MYBROWSER, freeSession.sessionId);
}
```

## PDF Generation

```typescript
const browser ***REMOVED*** await puppeteer.launch(env.MYBROWSER);
const page ***REMOVED*** await browser.newPage();

await page.setContent(`
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body { font-family: Arial; padding: 50px; }
        h1 { color: #2c3e50; }
      </style>
    </head>
    <body>
      <h1>Certificate</h1>
      <p>Awarded to: <strong>John Doe</strong></p>
    </body>
  </html>
`);

const pdf ***REMOVED*** await page.pdf({
  format: 'A4',
  printBackground: true,
  margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
});

await browser.close();

return new Response(pdf, {
  headers: { 'Content-Type': 'application/pdf' }
});
```

## Durable Objects for Persistent Sessions

```typescript
export class Browser {
  state: DurableObjectState;
  browser: any;
  lastUsed: number;

  constructor(state: DurableObjectState, env: Env) {
    this.state ***REMOVED*** state;
    this.lastUsed ***REMOVED*** Date.now();
  }

  async fetch(request: Request, env: Env) {
    if (!this.browser) {
      this.browser ***REMOVED*** await puppeteer.launch(env.MYBROWSER);
    }

    this.lastUsed ***REMOVED*** Date.now();
    await this.state.storage.setAlarm(Date.now() + 10000);

    const page ***REMOVED*** await this.browser.newPage();
    const url ***REMOVED*** new URL(request.url).searchParams.get('url');
    await page.goto(url);
    const screenshot ***REMOVED*** await page.screenshot();
    await page.close();

    return new Response(screenshot, {
      headers: { 'Content-Type': 'image/png' }
    });
  }

  async alarm() {
    if (Date.now() - this.lastUsed > 60000) {
      await this.browser?.close();
      this.browser ***REMOVED*** null;
    } else {
      await this.state.storage.setAlarm(Date.now() + 10000);
    }
  }
}
```

## AI-Powered Web Scraper

```typescript
import { Ai } from '@cloudflare/ai';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const browser ***REMOVED*** await puppeteer.launch(env.MYBROWSER);
    const page ***REMOVED*** await browser.newPage();
    await page.goto('https://news.ycombinator.com');
    const content ***REMOVED*** await page.content();
    await browser.close();

    const ai ***REMOVED*** new Ai(env.AI);
    const response ***REMOVED*** await ai.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: 'Extract top 5 article titles and URLs as JSON'
        },
        { role: 'user', content: content }
      ]
    });
