# Cloudflare Workers Runtime APIs

Key runtime APIs for Workers development.

## Fetch API

```typescript
// Subrequest
const response ***REMOVED*** await fetch('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key: 'value' }),
  cf: {
    cacheTtl: 3600,
    cacheEverything: true
  }
});

const data ***REMOVED*** await response.json();
```

## Headers API

```typescript
// Read headers
const userAgent ***REMOVED*** request.headers.get('User-Agent');

// Cloudflare-specific
const country ***REMOVED*** request.cf?.country;
const colo ***REMOVED*** request.cf?.colo;
const clientIP ***REMOVED*** request.headers.get('CF-Connecting-IP');

// Set headers
const headers ***REMOVED*** new Headers();
headers.set('Content-Type', 'application/json');
headers.append('X-Custom-Header', 'value');
```

## HTMLRewriter

```typescript
export default {
  async fetch(request: Request): Promise<Response> {
    const response ***REMOVED*** await fetch(request);

    return new HTMLRewriter()
      .on('title', {
        element(element) {
          element.setInnerContent('New Title');
        }
      })
      .on('a[href]', {
        element(element) {
          const href ***REMOVED*** element.getAttribute('href');
          element.setAttribute('href', href.replace('http://', 'https://'));
        }
      })
      .transform(response);
  }
};
```

## WebSockets

```typescript
export default {
  async fetch(request: Request): Promise<Response> {
    const upgradeHeader ***REMOVED*** request.headers.get('Upgrade');
    if (upgradeHeader !***REMOVED******REMOVED*** 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }

    const pair ***REMOVED*** new WebSocketPair();
    const [client, server] ***REMOVED*** Object.values(pair);

    server.accept();

    server.addEventListener('message', (event) ***REMOVED***> {
      server.send(`Echo: ${event.data}`);
    });

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }
};
```

## Streams API

```typescript
const { readable, writable } ***REMOVED*** new TransformStream();

const writer ***REMOVED*** writable.getWriter();
writer.write(new TextEncoder().encode('chunk 1'));
writer.write(new TextEncoder().encode('chunk 2'));
writer.close();

return new Response(readable, {
  headers: { 'Content-Type': 'text/plain' }
});
```

## Web Crypto API

```typescript
// Generate hash
const data ***REMOVED*** new TextEncoder().encode('message');
const hashBuffer ***REMOVED*** await crypto.subtle.digest('SHA-256', data);
const hashArray ***REMOVED*** Array.from(new Uint8Array(hashBuffer));
const hashHex ***REMOVED*** hashArray.map(b ***REMOVED***> b.toString(16).padStart(2, '0')).join('');

// HMAC signature
const key ***REMOVED*** await crypto.subtle.importKey(
  'raw',
  new TextEncoder().encode('secret'),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign', 'verify']
);

const signature ***REMOVED*** await crypto.subtle.sign('HMAC', key, data);
const valid ***REMOVED*** await crypto.subtle.verify('HMAC', key, signature, data);

// Random values
const randomBytes ***REMOVED*** crypto.getRandomValues(new Uint8Array(32));
const uuid ***REMOVED*** crypto.randomUUID();
```

## Encoding APIs

```typescript
// TextEncoder
const encoder ***REMOVED*** new TextEncoder();
const bytes ***REMOVED*** encoder.encode('Hello');

// TextDecoder
const decoder ***REMOVED*** new TextDecoder();
const text ***REMOVED*** decoder.decode(bytes);

// Base64
const base64 ***REMOVED*** btoa('Hello');
const decoded ***REMOVED*** atob(base64);
```

## URL API

```typescript
const url ***REMOVED*** new URL(request.url);
const hostname ***REMOVED*** url.hostname;
const pathname ***REMOVED*** url.pathname;
const search ***REMOVED*** url.search;

// Query parameters
const name ***REMOVED*** url.searchParams.get('name');
url.searchParams.set('page', '2');
url.searchParams.delete('old');
```

## FormData API

```typescript
// Parse form data
const formData ***REMOVED*** await request.formData();
const name ***REMOVED*** formData.get('name');
const file ***REMOVED*** formData.get('file');

// Create form data
const form ***REMOVED*** new FormData();
form.append('name', 'value');
form.append('file', blob, 'filename.txt');
```

## Response Types

```typescript
// Text
return new Response('Hello');

// JSON
return Response.json({ message: 'Hello' });

// Stream
return new Response(readable);

// Redirect
return Response.redirect('https://example.com', 302);

// Error
return new Response('Not Found', { status: 404 });
```

## Request Cloning

```typescript
// Clone for multiple reads
const clone ***REMOVED*** request.clone();
const body1 ***REMOVED*** await request.json();
const body2 ***REMOVED*** await clone.json();
```

## AbortController

```typescript
const controller ***REMOVED*** new AbortController();
const { signal } ***REMOVED*** controller;

setTimeout(() ***REMOVED***> controller.abort(), 5000);

try {
  const response ***REMOVED*** await fetch('https://slow-api.com', { signal });
} catch (error) {
  if (error.name ***REMOVED******REMOVED******REMOVED*** 'AbortError') {
    console.log('Request timed out');
  }
}
```

## Scheduling APIs

```typescript
// setTimeout
const timeoutId ***REMOVED*** setTimeout(() ***REMOVED***> {
  console.log('Delayed');
}, 1000);

// setInterval
const intervalId ***REMOVED*** setInterval(() ***REMOVED***> {
  console.log('Repeated');
}, 1000);

// Clear
clearTimeout(timeoutId);
clearInterval(intervalId);
```

## Console API

```typescript
console.log('Info message');
console.error('Error message');
console.warn('Warning message');
console.debug('Debug message');

// Structured logging
console.log(JSON.stringify({
  level: 'info',
  message: 'Request processed',
  url: request.url,
  timestamp: new Date().toISOString()
}));
```

## Performance API

```typescript
const start ***REMOVED*** performance.now();
await processRequest();
const duration ***REMOVED*** performance.now() - start;
console.log(`Processed in ${duration}ms`);
```

## Bindings Reference

### KV Operations
```typescript
await env.KV.put(key, value, { expirationTtl: 3600, metadata: { userId: '123' } });
const value ***REMOVED*** await env.KV.get(key, 'json');
const { value, metadata } ***REMOVED*** await env.KV.getWithMetadata(key);
await env.KV.delete(key);
const list ***REMOVED*** await env.KV.list({ prefix: 'user:' });
```

### D1 Operations
```typescript
const result ***REMOVED*** await env.DB.prepare('SELECT * FROM users WHERE id ***REMOVED*** ?').bind(userId).first();
const { results } ***REMOVED*** await env.DB.prepare('SELECT * FROM users').all();
await env.DB.prepare('INSERT INTO users (name) VALUES (?)').bind(name).run();
await env.DB.batch([stmt1, stmt2, stmt3]);
```

### R2 Operations
```typescript
await env.R2.put(key, value, { httpMetadata: { contentType: 'image/jpeg' } });
const object ***REMOVED*** await env.R2.get(key);
await env.R2.delete(key);
const list ***REMOVED*** await env.R2.list({ prefix: 'uploads/' });
const multipart ***REMOVED*** await env.R2.createMultipartUpload(key);
```

### Queue Operations
```typescript
await env.QUEUE.send({ type: 'email', to: 'user@example.com' });
await env.QUEUE.sendBatch([{ body: msg1 }, { body: msg2 }]);
```

### Workers AI
```typescript
const response ***REMOVED*** await env.AI.run('@cf/meta/llama-3-8b-instruct', {
  messages: [{ role: 'user', content: 'What is edge computing?' }]
});
```

## Resources

- Runtime APIs: https://developers.cloudflare.com/workers/runtime-apis/
- Web Standards: https://developers.cloudflare.com/workers/runtime-apis/web-standards/
- Bindings: https://developers.cloudflare.com/workers/runtime-apis/bindings/
