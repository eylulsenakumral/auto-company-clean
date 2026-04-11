// SnapOG — Main Cloudflare Worker
// Routes: GET /og (image gen), GET / (landing), GET/POST /register, GET /dashboard

import { Hono } from 'hono';
import { generateOGImage, buildCacheKey } from './og/render';
import {
  landingPage,
  registerPage,
  keyCreatedPage,
  dashboardPage,
  errorPage,
} from './dashboard/pages';
import type { ApiKey, Env, OGParams, Tier } from './types';
import { TIER_LIMITS } from './types';

const app ***REMOVED*** new Hono<{ Bindings: Env }>();

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function sha256(text: string): Promise<string> {
  const buf ***REMOVED*** await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text)
  );
  return Array.from(new Uint8Array(buf))
    .map(b ***REMOVED***> b.toString(16).padStart(2, '0'))
    .join('');
}

function generateRawKey(): string {
  const bytes ***REMOVED*** new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return 'sk_' + Array.from(bytes).map(b ***REMOVED***> b.toString(16).padStart(2, '0')).join('');
}

function htmlResponse(html: string, status ***REMOVED*** 200): Response {
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset***REMOVED***utf-8' },
  });
}

// Validate an API key from request and return the DB row, or null
async function resolveApiKey(
  db: D1Database,
  rawKey: string | null
): Promise<ApiKey | null> {
  if (!rawKey) return null;
  const hash ***REMOVED*** await sha256(rawKey);
  const row ***REMOVED*** await db
    .prepare('SELECT * FROM api_keys WHERE key_hash ***REMOVED*** ?')
    .bind(hash)
    .first<ApiKey>();
  return row ?? null;
}

// Reset monthly usage if billing month rolled over
async function maybeResetUsage(db: D1Database, key: ApiKey): Promise<ApiKey> {
  const resetAt ***REMOVED*** new Date(key.usage_reset_at);
  const now ***REMOVED*** new Date();
  const thisMonth ***REMOVED*** new Date(now.getFullYear(), now.getMonth(), 1);

  if (resetAt < thisMonth) {
    const newResetAt ***REMOVED*** thisMonth.toISOString();
    await db
      .prepare(
        'UPDATE api_keys SET usage_count ***REMOVED*** 0, usage_reset_at ***REMOVED*** ? WHERE id ***REMOVED*** ?'
      )
      .bind(newResetAt, key.id)
      .run();
    return { ...key, usage_count: 0, usage_reset_at: newResetAt };
  }
  return key;
}

// Increment usage counter and record event
async function recordUsage(
  db: D1Database,
  key: ApiKey,
  template: string,
  cacheHit: boolean
): Promise<void> {
  const eventId ***REMOVED*** crypto.randomUUID();
  await db.batch([
    db
      .prepare('UPDATE api_keys SET usage_count ***REMOVED*** usage_count + 1 WHERE id ***REMOVED*** ?')
      .bind(key.id),
    db
      .prepare(
        'INSERT INTO usage_events (id, api_key_id, template, cache_hit) VALUES (?, ?, ?, ?)'
      )
      .bind(eventId, key.id, template, cacheHit ? 1 : 0),
  ]);
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Landing page
app.get('/', c ***REMOVED***> {
  const host ***REMOVED*** new URL(c.req.url).host;
  return htmlResponse(landingPage(host));
});

// ── OG image generation ────────────────────────────────────────────────────────
app.get('/og', async c ***REMOVED***> {
  const q ***REMOVED*** c.req.query();
  const rawKey ***REMOVED*** q['key'] ?? null;

  // Validate required param
  const title ***REMOVED*** (q['title'] ?? '').trim().slice(0, 120);
  if (!title) {
    return c.json({ error: 'title parameter is required' }, 400);
  }

  // Resolve API key (required)
  if (!rawKey) {
    return c.json({ error: 'key parameter is required. Get a free key at /register' }, 401);
  }
  let apiKey ***REMOVED*** await resolveApiKey(c.env.DB, rawKey);
  if (!apiKey) {
    return c.json({ error: 'Invalid API key' }, 401);
  }

  // Reset usage if month rolled
  apiKey ***REMOVED*** await maybeResetUsage(c.env.DB, apiKey);

  // Check rate limit
  if (apiKey.usage_count >***REMOVED*** apiKey.monthly_limit) {
    return c.json(
      {
        error: 'Monthly image limit reached',
        tier: apiKey.tier,
        limit: apiKey.monthly_limit,
        upgrade_url: '/register?tier***REMOVED***pro',
      },
      429
    );
  }

  const params: OGParams ***REMOVED*** {
    title,
    description: (q['description'] ?? '').trim().slice(0, 200) || undefined,
    domain: (q['domain'] ?? '').trim().slice(0, 100) || undefined,
    author: (q['author'] ?? '').trim().slice(0, 80) || undefined,
    tag: (q['tag'] ?? '').trim().slice(0, 40) || undefined,
    theme: (q['theme'] ***REMOVED******REMOVED******REMOVED*** 'light' ? 'light' : 'dark') as 'dark' | 'light',
    template: (['blog', 'article'].includes(q['template'] ?? '')
      ? q['template']
      : 'default') as OGParams['template'],
  };

  const watermark ***REMOVED*** apiKey.tier ***REMOVED******REMOVED******REMOVED*** 'free';
  const cacheKey ***REMOVED*** await buildCacheKey(params, watermark);
  const r2Key ***REMOVED*** `og/${cacheKey}.png`;

  // ── R2 cache lookup ──
  const cached ***REMOVED*** await c.env.OG_CACHE.get(r2Key);
  if (cached) {
    // Cache hit — return stored PNG, still track usage (counts toward limit)
    await recordUsage(c.env.DB, apiKey, params.template ?? 'default', true);
    const imageData ***REMOVED*** await cached.arrayBuffer();
    return new Response(imageData, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age***REMOVED***86400, s-maxage***REMOVED***604800',
        'X-Cache': 'HIT',
        'X-SnapOG-Tier': apiKey.tier,
      },
    });
  }

  // ── Generate image ──
  const imageResponse ***REMOVED*** await generateOGImage(params, watermark);
  const imageBuffer ***REMOVED*** await imageResponse.arrayBuffer();

  // Store in R2 (fire-and-forget, don't block response)
  c.executionCtx.waitUntil(
    c.env.OG_CACHE.put(r2Key, imageBuffer.slice(0), {
      httpMetadata: { contentType: 'image/png' },
      customMetadata: { tier: apiKey.tier, template: params.template ?? 'default' },
    })
  );

  // Record usage (also fire-and-forget after we have the image)
  c.executionCtx.waitUntil(
    recordUsage(c.env.DB, apiKey, params.template ?? 'default', false)
  );

  return new Response(imageBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age***REMOVED***86400, s-maxage***REMOVED***604800',
      'X-Cache': 'MISS',
      'X-SnapOG-Tier': apiKey.tier,
    },
  });
});

// ── Registration ──────────────────────────────────────────────────────────────
app.get('/register', c ***REMOVED***> {
  const tier ***REMOVED*** c.req.query('tier');
  return htmlResponse(registerPage(undefined, tier));
});

app.post('/register', async c ***REMOVED***> {
  let email: string, keyname: string, tier: string;
  try {
    const form ***REMOVED*** await c.req.formData();
    email ***REMOVED*** (form.get('email') as string ?? '').trim().toLowerCase();
    keyname ***REMOVED*** (form.get('keyname') as string ?? '').trim() || 'default';
    tier ***REMOVED*** (form.get('tier') as string ?? 'free').trim();
  } catch {
    return htmlResponse(registerPage('Invalid form data'), 400);
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return htmlResponse(registerPage('Please enter a valid email address', tier), 400);
  }

  const validTiers: Tier[] ***REMOVED*** ['free', 'pro', 'business'];
  const safeTier: Tier ***REMOVED*** validTiers.includes(tier as Tier) ? (tier as Tier) : 'free';

  // Upsert user
  const userId ***REMOVED*** crypto.randomUUID();
  await c.env.DB
    .prepare(
      'INSERT INTO users (id, email) VALUES (?, ?) ON CONFLICT(email) DO NOTHING'
    )
    .bind(userId, email)
    .run();

  const user ***REMOVED*** await c.env.DB
    .prepare('SELECT id FROM users WHERE email ***REMOVED*** ?')
    .bind(email)
    .first<{ id: string }>();
  if (!user) {
    return htmlResponse(registerPage('Database error — please try again'), 500);
  }

  // Generate API key
  const rawKey ***REMOVED*** generateRawKey();
  const keyHash ***REMOVED*** await sha256(rawKey);
  const keyPrefix ***REMOVED*** rawKey.slice(0, 12);
  const keyId ***REMOVED*** crypto.randomUUID();
  const resetAt ***REMOVED*** new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const monthlyLimit ***REMOVED*** TIER_LIMITS[safeTier];

  await c.env.DB
    .prepare(
      `INSERT INTO api_keys
         (id, user_id, name, key_prefix, key_hash, tier, monthly_limit, usage_reset_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(keyId, user.id, keyname, keyPrefix, keyHash, safeTier, monthlyLimit, resetAt)
    .run();

  return htmlResponse(keyCreatedPage(rawKey, email, safeTier));
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
app.get('/dashboard', async c ***REMOVED***> {
  const rawKey ***REMOVED*** c.req.query('key');
  if (!rawKey) {
    return htmlResponse(registerPage('Enter your API key or create a new one below'), 400);
  }

  const apiKey ***REMOVED*** await resolveApiKey(c.env.DB, rawKey);
  if (!apiKey) {
    return htmlResponse(errorPage(404, 'API key not found'), 404);
  }

  const refreshed ***REMOVED*** await maybeResetUsage(c.env.DB, apiKey);

  // Count recent events (last 24h)
  const yesterday ***REMOVED*** new Date(Date.now() - 86_400_000).toISOString();
  const recent ***REMOVED*** await c.env.DB
    .prepare(
      'SELECT COUNT(*) as cnt FROM usage_events WHERE api_key_id ***REMOVED*** ? AND generated_at > ?'
    )
    .bind(refreshed.id, yesterday)
    .first<{ cnt: number }>();

  return htmlResponse(dashboardPage(refreshed, recent?.cnt ?? 0));
});

// ── Health / ops ──────────────────────────────────────────────────────────────
app.get('/health', c ***REMOVED***> c.json({ ok: true, ts: new Date().toISOString() }));

// 404 fallback
app.notFound(_c ***REMOVED***> htmlResponse(errorPage(404, 'Page not found'), 404));
app.onError((err, _c) ***REMOVED***> {
  console.error('Unhandled error:', err);
  return htmlResponse(errorPage(500, 'Internal server error'), 500);
});

export default app;
