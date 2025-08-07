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
