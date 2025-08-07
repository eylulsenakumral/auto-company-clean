# Cloudflare Workers Advanced Patterns

Advanced techniques for optimization, performance, and complex workflows.

## Session Reuse and Connection Pooling

### Durable Objects for Persistent Sessions
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
    await page.goto(new URL(request.url).searchParams.get('url'));
    const screenshot ***REMOVED*** await page.screenshot();
    await page.close();

    return new Response(screenshot);
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

## Multi-Tier Caching Strategy

```typescript
const CACHE_TTL ***REMOVED*** 3600;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const cache ***REMOVED*** caches.default;
    const cacheKey ***REMOVED*** new Request(request.url);

    // 1. Check edge cache
    let response ***REMOVED*** await cache.match(cacheKey);
    if (response) return response;

    // 2. Check KV cache
    const kvCached ***REMOVED*** await env.MY_KV.get(request.url);
    if (kvCached) {
      response ***REMOVED*** new Response(kvCached);
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    }

    // 3. Fetch from origin
    response ***REMOVED*** await fetch(request);

    // 4. Store in both caches
    ctx.waitUntil(Promise.all([
      cache.put(cacheKey, response.clone()),
      env.MY_KV.put(request.url, await response.clone().text(), {
        expirationTtl: CACHE_TTL
      })
    ]));

    return response;
  }
};
```

## WebSocket with Durable Objects

```typescript
export class ChatRoom {
  state: DurableObjectState;
  sessions: Set<WebSocket>;

  constructor(state: DurableObjectState) {
    this.state ***REMOVED*** state;
    this.sessions ***REMOVED*** new Set();
  }

  async fetch(request: Request) {
    const pair ***REMOVED*** new WebSocketPair();
    const [client, server] ***REMOVED*** Object.values(pair);

    this.state.acceptWebSocket(server);
    this.sessions.add(server);

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string) {
    // Broadcast to all connected clients
    for (const session of this.sessions) {
      session.send(message);
    }
  }

  async webSocketClose(ws: WebSocket) {
    this.sessions.delete(ws);
  }
}
```

## Queue-Based Crawler

```typescript
export default {
  async queue(batch: MessageBatch<any>, env: Env): Promise<void> {
    const browser ***REMOVED*** await puppeteer.launch(env.MYBROWSER);

    for (const message of batch.messages) {
      const page ***REMOVED*** await browser.newPage();
      await page.goto(message.body.url);

      // Extract links
      const links ***REMOVED*** await page.evaluate(() ***REMOVED***> {
        return Array.from(document.querySelectorAll('a'))
          .map(a ***REMOVED***> a.href);
      });

      // Queue new links
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

## Authentication Pattern

```typescript
import { sign, verify } from 'hono/jwt';

async function authenticate(request: Request, env: Env): Promise<any> {
  const authHeader ***REMOVED*** request.headers.get('Authorization');
