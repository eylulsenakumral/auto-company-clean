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

    return Response.json(response);
  }
};
```

## Crawler with Queues

```typescript
export default {
  async queue(batch: MessageBatch<any>, env: Env): Promise<void> {
    const browser ***REMOVED*** await puppeteer.launch(env.MYBROWSER);

    for (const message of batch.messages) {
      const page ***REMOVED*** await browser.newPage();
      await page.goto(message.body.url);

      const links ***REMOVED*** await page.evaluate(() ***REMOVED***> {
        return Array.from(document.querySelectorAll('a')).map(a ***REMOVED***> a.href);
      });

      for (const link of links) {
        await env.QUEUE.send({ url: link });
      }

      await page.close();
      message.ack();
    }

    await browser.close();
  }
};
```

## Configuration

### Timeout
```typescript
await page.goto(url, {
  timeout: 60000,  // 60 seconds max
  waitUntil: 'networkidle2'
});

await page.waitForSelector('.content', { timeout: 45000 });
```

### Viewport
```typescript
await page.setViewport({ width: 1920, height: 1080 });
```

### Screenshot Options
```typescript
const screenshot ***REMOVED*** await page.screenshot({
  type: 'png',       // 'png' | 'jpeg' | 'webp'
  quality: 90,       // JPEG/WebP only
  fullPage: true,    // Full scrollable page
  clip: {            // Crop
    x: 0, y: 0,
    width: 800,
    height: 600
  }
});
```

## Limits & Pricing

### Free Plan
- 10 minutes/day
- 3 concurrent browsers
- 3 new browsers/minute

### Paid Plan
- 10 hours/month included
- 30 concurrent browsers
- 30 new browsers/minute
- $0.09/hour overage
- $2.00/concurrent browser overage

### Cost Optimization
1. Use `disconnect()` instead of `close()`
2. Enable Keep-Alive (10 min max)
3. Pool tabs with browser contexts
4. Cache auth state with KV
5. Implement Durable Objects cleanup

## Best Practices

### Session Management
- Always use `disconnect()` for reuse
- Implement session pooling
- Track session IDs and states

### Performance
- Cache content in KV
- Use browser contexts vs multiple browsers
- Choose appropriate `waitUntil` strategy
- Set realistic timeouts

### Error Handling
- Handle timeout errors gracefully
- Check session availability before connecting
- Validate responses before caching

### Security
- Validate user-provided URLs
- Implement authentication
- Sanitize extracted content
- Set appropriate CORS headers

## Troubleshooting

**Timeout Errors:**
```typescript
await page.goto(url, {
  timeout: 60000,
  waitUntil: 'domcontentloaded'  // Faster than networkidle2
});
```

**Memory Issues:**
```typescript
await page.close();  // Close pages
await browser.disconnect();  // Reuse session
```

**Font Rendering:**
Use supported fonts (Noto Sans, Roboto, etc.) or inject custom:
```html
<link href***REMOVED***"https://fonts.googleapis.com/css2?family***REMOVED***Poppins" rel***REMOVED***"stylesheet">
```

## Key Methods

### Puppeteer
- `puppeteer.launch(binding)` - Start browser
- `puppeteer.connect(binding, sessionId)` - Reconnect
- `puppeteer.sessions(binding)` - List sessions
- `browser.newPage()` - Create page
- `browser.disconnect()` - Disconnect (keep alive)
- `browser.close()` - Close (terminate)
- `page.goto(url, options)` - Navigate
- `page.screenshot(options)` - Capture
- `page.pdf(options)` - Generate PDF
- `page.content()` - Get HTML
- `page.evaluate(fn)` - Execute JS

## Resources

- Docs: https://developers.cloudflare.com/browser-rendering/
- Puppeteer: https://pptr.dev/
- Examples: https://developers.cloudflare.com/workers/examples/
