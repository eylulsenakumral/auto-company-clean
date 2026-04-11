// SnapOG — Dashboard & landing page HTML
// Aesthetic: "Carbon Terminal" — dark developer tool, amber accent, monospace-first

import type { ApiKey } from '../types';

const CSS ***REMOVED*** `
  @import url('https://fonts.googleapis.com/css2?family***REMOVED***JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,700;1,400&family***REMOVED***DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&display***REMOVED***swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #0A0A0A;
    --surface: #141414;
    --border:  #1F1F1F;
    --divider: #2A2A2A;
    --text-1:  #F5F5F5;
    --text-2:  #A3A3A3;
    --text-3:  #525252;
    --accent:  #F59E0B;
    --accent-dim: #92400E;
    --teal:    #14B8A6;
    --red:     #EF4444;
    --font-mono: 'JetBrains Mono', 'Consolas', monospace;
    --font-sans: 'DM Sans', system-ui, sans-serif;
    --r: 6px;
    --r-lg: 12px;
    --shadow: 0 0 0 1px var(--border);
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text-1);
    font-family: var(--font-sans);
    font-size: 16px;
    line-height: 1.6;
    min-height: 100vh;
    /* Dot-grid background */
    background-image: radial-gradient(circle, #1F1F1F 1px, transparent 1px);
    background-size: 32px 32px;
  }

  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }

  /* Nav */
  .nav {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 32px;
    background: rgba(10,10,10,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 18px;
    color: var(--text-1);
    letter-spacing: -0.02em;
  }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 24px; align-items: center; }
  .nav-links a { color: var(--text-2); font-size: 14px; }
  .nav-links a:hover { color: var(--text-1); text-decoration: none; }
  .btn {
    display: inline-flex; align-items: center; justify-content: center;
    font-family: var(--font-mono); font-size: 13px; font-weight: 500;
    padding: 8px 20px; border-radius: var(--r);
    border: none; cursor: pointer; transition: all 0.15s;
    text-decoration: none;
  }
  .btn-primary { background: var(--accent); color: #000; }
  .btn-primary:hover { background: #FBBF24; text-decoration: none; }
  .btn-ghost { background: transparent; color: var(--text-2); border: 1px solid var(--border); }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); text-decoration: none; }

  /* Container */
  .container { max-width: 900px; margin: 0 auto; padding: 0 24px; }
  .container-wide { max-width: 1100px; margin: 0 auto; padding: 0 24px; }

  /* Hero */
  .hero { padding: 100px 0 72px; text-align: center; position: relative; }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--font-mono); font-size: 12px; color: var(--accent);
    letter-spacing: 0.1em; text-transform: uppercase;
    border: 1px solid var(--accent-dim); border-radius: 100px;
    padding: 4px 14px; margin-bottom: 28px;
  }
  .hero-eyebrow::before {
    content: ''; width: 6px; height: 6px; border-radius: 50%;
    background: var(--accent); animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.8); }
  }
  .hero h1 {
    font-size: clamp(42px, 6vw, 72px);
    font-weight: 700; letter-spacing: -0.04em;
    line-height: 1.05;
    background: linear-gradient(135deg, #F5F5F5 0%, #A3A3A3 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 24px;
  }
  .hero h1 em {
    font-style: normal;
    background: linear-gradient(135deg, var(--accent), #FCD34D);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero-sub {
    font-size: 18px; color: var(--text-2); max-width: 560px; margin: 0 auto 40px;
    line-height: 1.65;
  }
  .hero-cta { display: flex; gap: 12px; justify-content: center; }

  /* OG Preview */
  .og-preview-wrap {
    position: relative; margin: 72px auto 0; max-width: 720px;
    border-radius: var(--r-lg); overflow: hidden;
    box-shadow: 0 0 0 1px var(--border), 0 40px 80px rgba(0,0,0,0.6);
  }
  .og-preview-wrap img {
    width: 100%; display: block;
    border-radius: var(--r-lg);
  }
  .og-preview-label {
    position: absolute; top: 12px; left: 12px;
    font-family: var(--font-mono); font-size: 11px; color: var(--text-3);
    background: var(--surface); border: 1px solid var(--border);
    padding: 4px 10px; border-radius: var(--r);
  }

  /* Section */
  .section { padding: 80px 0; }
  .section-title {
    font-family: var(--font-mono); font-size: 11px; font-weight: 500;
    color: var(--accent); letter-spacing: 0.12em; text-transform: uppercase;
    margin-bottom: 12px;
  }
  .section-h2 {
    font-size: 36px; font-weight: 700; letter-spacing: -0.025em;
    margin-bottom: 16px; line-height: 1.15;
  }
  .section-sub { font-size: 17px; color: var(--text-2); max-width: 480px; line-height: 1.6; }

  /* Code block */
  .code-block {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-lg); overflow: hidden; margin-top: 32px;
  }
  .code-block-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 20px; border-bottom: 1px solid var(--border);
  }
  .code-block-lang {
    font-family: var(--font-mono); font-size: 12px; color: var(--text-3);
    letter-spacing: 0.06em;
  }
  .code-block-dots { display: flex; gap: 6px; }
  .dot { width: 10px; height: 10px; border-radius: 50%; }
  .dot-red { background: #FF5F57; }
  .dot-yellow { background: #FEBC2E; }
  .dot-green { background: #28C840; }
  .code-block pre {
    padding: 24px 20px; font-family: var(--font-mono); font-size: 13px;
    line-height: 1.7; color: var(--text-1); overflow-x: auto;
    white-space: pre;
  }
  .c-comment { color: var(--text-3); }
  .c-key { color: var(--teal); }
  .c-val { color: #86EFAC; }
  .c-str { color: #FCD34D; }
  .c-url { color: var(--accent); }

  /* API params table */
  .params-table { width: 100%; border-collapse: collapse; margin-top: 24px; }
  .params-table th, .params-table td {
    padding: 12px 16px; text-align: left;
    border-bottom: 1px solid var(--border); font-size: 14px;
  }
  .params-table th {
    font-family: var(--font-mono); font-size: 11px; color: var(--text-3);
    letter-spacing: 0.08em; text-transform: uppercase;
  }
  .params-table td:first-child { font-family: var(--font-mono); color: var(--teal); }
  .params-table .required {
    font-family: var(--font-mono); font-size: 10px; color: var(--accent);
    border: 1px solid var(--accent-dim); border-radius: 3px; padding: 1px 6px;
  }
  .params-table .optional {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-3);
    border: 1px solid var(--border); border-radius: 3px; padding: 1px 6px;
  }

  /* Pricing */
  .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 48px; }
  .pricing-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-lg); padding: 32px;
    display: flex; flex-direction: column;
    transition: border-color 0.2s;
  }
  .pricing-card:hover { border-color: var(--accent); }
  .pricing-card.featured {
    border-color: var(--accent);
    background: linear-gradient(180deg, #1C1400 0%, var(--surface) 100%);
  }
  .pricing-tier {
    font-family: var(--font-mono); font-size: 11px; color: var(--text-3);
    letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px;
  }
  .pricing-tier-featured { color: var(--accent); }
  .pricing-price {
    font-size: 40px; font-weight: 700; letter-spacing: -0.03em;
    margin-bottom: 4px; line-height: 1;
  }
  .pricing-period { font-size: 14px; color: var(--text-2); margin-bottom: 24px; }
  .pricing-limit {
    font-family: var(--font-mono); font-size: 13px; color: var(--text-2);
    margin-bottom: 20px; padding-bottom: 20px;
    border-bottom: 1px solid var(--border);
  }
  .pricing-features { list-style: none; flex: 1; }
  .pricing-features li {
    font-size: 14px; color: var(--text-2); padding: 6px 0;
    display: flex; gap: 8px; align-items: flex-start;
  }
  .pricing-features li::before { content: '→'; color: var(--accent); flex-shrink: 0; }
  .pricing-features li.dim::before { color: var(--text-3); }
  .pricing-features li.dim { color: var(--text-3); }
  .pricing-cta { margin-top: 28px; }

  /* Features grid */
  .features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-top: 48px; }
  .feature-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-lg); padding: 28px;
  }
  .feature-icon {
    font-family: var(--font-mono); font-size: 20px; color: var(--accent);
    margin-bottom: 16px; display: block;
  }
  .feature-card h3 { font-size: 17px; font-weight: 600; margin-bottom: 8px; }
  .feature-card p { font-size: 14px; color: var(--text-2); line-height: 1.6; }

  /* Dashboard */
  .dash-layout { padding: 40px 0 80px; }
  .dash-header { margin-bottom: 40px; }
  .dash-header h1 { font-size: 26px; font-weight: 700; margin-bottom: 4px; letter-spacing: -0.02em; }
  .dash-header p { font-size: 14px; color: var(--text-2); }

  .dash-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
  .dash-grid-full { grid-column: 1 / -1; }

  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-lg); padding: 28px;
  }
  .card-title {
    font-family: var(--font-mono); font-size: 11px; font-weight: 500;
    color: var(--text-3); letter-spacing: 0.1em; text-transform: uppercase;
    margin-bottom: 20px;
  }

  /* API key display */
  .api-key-display {
    display: flex; align-items: center; gap: 8px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: var(--r); padding: 12px 16px;
    font-family: var(--font-mono); font-size: 13px; color: var(--text-2);
    flex: 1;
  }
  .api-key-display .key-val { flex: 1; word-break: break-all; }
  .api-key-row { display: flex; gap: 8px; align-items: stretch; }

  /* Usage meter */
  .usage-bar-wrap {
    background: var(--bg); border-radius: 100px;
    height: 6px; margin: 12px 0 8px; overflow: hidden;
  }
  .usage-bar {
    height: 100%; border-radius: 100px;
    background: var(--accent);
    transition: width 0.6s ease;
  }
  .usage-bar.warn { background: #F97316; }
  .usage-bar.full { background: var(--red); }
  .usage-meta { display: flex; justify-content: space-between; font-size: 13px; }
  .usage-count { font-family: var(--font-mono); font-size: 28px; font-weight: 700; }
  .usage-limit { font-size: 13px; color: var(--text-3); }

  /* Tier badge */
  .tier-badge {
    display: inline-flex; align-items: center;
    font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em;
    text-transform: uppercase; padding: 3px 10px; border-radius: 100px;
  }
  .tier-free { background: #1C1C1C; color: var(--text-3); border: 1px solid var(--border); }
  .tier-pro { background: #1C1400; color: var(--accent); border: 1px solid var(--accent-dim); }
  .tier-business { background: #0A2A2A; color: var(--teal); border: 1px solid #115E59; }

  /* Register form */
  .form-group { margin-bottom: 20px; }
  .form-label { display: block; font-family: var(--font-mono); font-size: 12px; color: var(--text-2); margin-bottom: 8px; letter-spacing: 0.06em; }
  .form-input {
    width: 100%; padding: 12px 16px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: var(--r); font-family: var(--font-mono);
    font-size: 14px; color: var(--text-1);
    outline: none; transition: border-color 0.15s;
  }
  .form-input:focus { border-color: var(--accent); }
  .form-hint { font-size: 12px; color: var(--text-3); margin-top: 6px; }

  /* Alert */
  .alert { padding: 14px 18px; border-radius: var(--r); font-size: 14px; margin-bottom: 20px; }
  .alert-error { background: #1C0A0A; border: 1px solid #7F1D1D; color: #FCA5A5; }
  .alert-success { background: #052E16; border: 1px solid #14532D; color: #86EFAC; }

  /* Footer */
  .footer {
    border-top: 1px solid var(--border); padding: 32px 0;
    text-align: center; font-size: 13px; color: var(--text-3);
    font-family: var(--font-mono);
  }

  @media (max-width: 768px) {
    .pricing-grid { grid-template-columns: 1fr; }
    .features-grid { grid-template-columns: 1fr; }
    .dash-grid { grid-template-columns: 1fr; }
    .hero h1 { font-size: 36px; }
  }
`;

function layout(title: string, body: string, extraHead ***REMOVED*** ''): string {
  return `<!DOCTYPE html>
<html lang***REMOVED***"en">
<head>
  <meta charset***REMOVED***"UTF-8" />
  <meta name***REMOVED***"viewport" content***REMOVED***"width***REMOVED***device-width, initial-scale***REMOVED***1.0" />
  <title>${title} — SnapOG</title>
  <meta name***REMOVED***"description" content***REMOVED***"Generate stunning Open Graph images via API. Hosted on Cloudflare edge, cached globally, delivered in milliseconds." />
  <style>${CSS}</style>
  ${extraHead}
</head>
<body>
  ${body}
</body>
</html>`;
}

function nav(_activePath ***REMOVED*** '/'): string {
  return `
  <nav class***REMOVED***"nav">
    <a class***REMOVED***"nav-logo" href***REMOVED***"/">Snap<span>OG</span></a>
    <div class***REMOVED***"nav-links">
      <a href***REMOVED***"/#how-it-works">Docs</a>
      <a href***REMOVED***"/#pricing">Pricing</a>
      <a href***REMOVED***"/register" class***REMOVED***"btn btn-primary">Get API Key →</a>
    </div>
  </nav>`;
}

function footer(): string {
  return `
  <footer class***REMOVED***"footer">
    <div class***REMOVED***"container">
      snapog.dev — OG images at the edge. Built with ♥ on Cloudflare Workers.
    </div>
  </footer>`;
}

export function landingPage(host: string): string {
  void host; // used in template strings below

  const body ***REMOVED*** `
  ${nav('/')}

  <!-- Hero -->
  <section class***REMOVED***"hero">
    <div class***REMOVED***"container">
      <div class***REMOVED***"hero-eyebrow">Open Graph Images API</div>
      <h1>OG images for every URL,<br/><em>delivered at the edge</em></h1>
      <p class***REMOVED***"hero-sub">
        One API call. Instant PNG. Cached globally on Cloudflare CDN.
        Stop hand-coding OG templates — let SnapOG generate them dynamically.
      </p>
      <div class***REMOVED***"hero-cta">
        <a href***REMOVED***"/register" class***REMOVED***"btn btn-primary" style***REMOVED***"font-size:15px;padding:12px 28px;">Get Free API Key</a>
        <a href***REMOVED***"/#how-it-works" class***REMOVED***"btn btn-ghost" style***REMOVED***"font-size:15px;padding:12px 28px;">View Docs</a>
      </div>

      <!-- Live OG preview -->
      <div class***REMOVED***"og-preview-wrap" style***REMOVED***"margin-top:56px;">
        <div class***REMOVED***"og-preview-label">1200 × 630 PNG — rendered live</div>
        <img
          src***REMOVED***"/og?title***REMOVED***How%20to%20Build%20a%20Billion-Dollar%20API&description***REMOVED***A%20deep%20dive%20into%20developer%20tools%20that%20compound%20%E2%80%94%20and%20the%20pricing%20that%20makes%20them%20survive&domain***REMOVED***myblog.dev&theme***REMOVED***dark&template***REMOVED***default"
          alt***REMOVED***"Live OG image example"
          style***REMOVED***"width:100%;border-radius:8px;"
        />
      </div>
    </div>
  </section>

  <!-- How it works -->
  <section class***REMOVED***"section" id***REMOVED***"how-it-works">
    <div class***REMOVED***"container">
      <p class***REMOVED***"section-title">API Reference</p>
      <h2 class***REMOVED***"section-h2">One endpoint, infinite images</h2>
      <p class***REMOVED***"section-sub">
        Send a GET request. Get a PNG back. Cache it in your CDN. Done.
      </p>

      <div class***REMOVED***"code-block" style***REMOVED***"margin-top:36px;">
        <div class***REMOVED***"code-block-header">
          <div class***REMOVED***"code-block-dots">
            <div class***REMOVED***"dot dot-red"></div>
            <div class***REMOVED***"dot dot-yellow"></div>
            <div class***REMOVED***"dot dot-green"></div>
          </div>
          <span class***REMOVED***"code-block-lang">HTTP GET</span>
        </div>
        <pre><span class***REMOVED***"c-url">GET https://${host}/og</span>
  <span class***REMOVED***"c-comment">  ?title***REMOVED***</span><span class***REMOVED***"c-str">Your Page Title Here</span>
  <span class***REMOVED***"c-comment">  &amp;description***REMOVED***</span><span class***REMOVED***"c-str">Optional subtitle or excerpt</span>
  <span class***REMOVED***"c-comment">  &amp;domain***REMOVED***</span><span class***REMOVED***"c-str">yourdomain.com</span>
  <span class***REMOVED***"c-comment">  &amp;author***REMOVED***</span><span class***REMOVED***"c-str">Jane Doe</span>
  <span class***REMOVED***"c-comment">  &amp;template***REMOVED***</span><span class***REMOVED***"c-str">default</span>  <span class***REMOVED***"c-comment"># default | blog | article</span>
  <span class***REMOVED***"c-comment">  &amp;theme***REMOVED***</span><span class***REMOVED***"c-str">dark</span>      <span class***REMOVED***"c-comment"># dark | light</span>
  <span class***REMOVED***"c-comment">  &amp;tag***REMOVED***</span><span class***REMOVED***"c-str">Tutorial</span>
  <span class***REMOVED***"c-comment">  &amp;key***REMOVED***</span><span class***REMOVED***"c-str">sk_your_api_key</span>

<span class***REMOVED***"c-comment">← 200 OK  Content-Type: image/png  X-Cache: MISS</span></pre>
      </div>

      <h3 style***REMOVED***"font-size:18px;font-weight:600;margin:48px 0 0;letter-spacing:-0.01em;">Parameters</h3>
      <table class***REMOVED***"params-table">
        <thead>
          <tr>
            <th>Param</th><th>Type</th><th>Required</th><th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>title</td><td>string</td><td><span class***REMOVED***"required">required</span></td><td>Page title — the main headline (max 120 chars)</td></tr>
          <tr><td>key</td><td>string</td><td><span class***REMOVED***"required">required</span></td><td>Your API key (free tier ***REMOVED*** 100 images/month)</td></tr>
          <tr><td>description</td><td>string</td><td><span class***REMOVED***"optional">optional</span></td><td>Subtitle or page excerpt (max 200 chars)</td></tr>
          <tr><td>domain</td><td>string</td><td><span class***REMOVED***"optional">optional</span></td><td>Your domain shown as source label</td></tr>
          <tr><td>author</td><td>string</td><td><span class***REMOVED***"optional">optional</span></td><td>Author name shown in footer</td></tr>
          <tr><td>template</td><td>enum</td><td><span class***REMOVED***"optional">optional</span></td><td><code>default</code> | <code>blog</code> | <code>article</code></td></tr>
          <tr><td>theme</td><td>enum</td><td><span class***REMOVED***"optional">optional</span></td><td><code>dark</code> (default) | <code>light</code></td></tr>
          <tr><td>tag</td><td>string</td><td><span class***REMOVED***"optional">optional</span></td><td>Category label shown as pill (e.g. "Tutorial")</td></tr>
        </tbody>
      </table>

      <h3 style***REMOVED***"font-size:18px;font-weight:600;margin:48px 0 20px;letter-spacing:-0.01em;">Use in HTML</h3>
      <div class***REMOVED***"code-block">
        <div class***REMOVED***"code-block-header">
          <div class***REMOVED***"code-block-dots">
            <div class***REMOVED***"dot dot-red"></div><div class***REMOVED***"dot dot-yellow"></div><div class***REMOVED***"dot dot-green"></div>
          </div>
          <span class***REMOVED***"code-block-lang">HTML meta tags</span>
        </div>
        <pre><span class***REMOVED***"c-comment">&lt;!-- Drop in &lt;head&gt; --&gt;</span>
<span class***REMOVED***"c-key">&lt;meta</span> <span class***REMOVED***"c-val">property***REMOVED***</span><span class***REMOVED***"c-str">"og:image"</span>
      <span class***REMOVED***"c-val">content***REMOVED***</span><span class***REMOVED***"c-str">"https://${host}/og?title***REMOVED***My+Post+Title&amp;key***REMOVED***YOUR_KEY"</span> <span class***REMOVED***"c-key">/&gt;</span>
<span class***REMOVED***"c-key">&lt;meta</span> <span class***REMOVED***"c-val">property***REMOVED***</span><span class***REMOVED***"c-str">"og:image:width"</span>  <span class***REMOVED***"c-val">content***REMOVED***</span><span class***REMOVED***"c-str">"1200"</span> <span class***REMOVED***"c-key">/&gt;</span>
<span class***REMOVED***"c-key">&lt;meta</span> <span class***REMOVED***"c-val">property***REMOVED***</span><span class***REMOVED***"c-str">"og:image:height"</span> <span class***REMOVED***"c-val">content***REMOVED***</span><span class***REMOVED***"c-str">"630"</span>  <span class***REMOVED***"c-key">/&gt;</span>
<span class***REMOVED***"c-key">&lt;meta</span> <span class***REMOVED***"c-val">name***REMOVED***</span><span class***REMOVED***"c-str">"twitter:card"</span>    <span class***REMOVED***"c-val">content***REMOVED***</span><span class***REMOVED***"c-str">"summary_large_image"</span> <span class***REMOVED***"c-key">/&gt;</span>
<span class***REMOVED***"c-key">&lt;meta</span> <span class***REMOVED***"c-val">name***REMOVED***</span><span class***REMOVED***"c-str">"twitter:image"</span>   <span class***REMOVED***"c-val">content***REMOVED***</span><span class***REMOVED***"c-str">"https://${host}/og?title***REMOVED***My+Post+Title&amp;key***REMOVED***YOUR_KEY"</span> <span class***REMOVED***"c-key">/&gt;</span></pre>
      </div>
    </div>
  </section>

  <!-- Features -->
  <section class***REMOVED***"section" style***REMOVED***"padding-top:0;">
    <div class***REMOVED***"container">
      <p class***REMOVED***"section-title">Why SnapOG</p>
      <h2 class***REMOVED***"section-h2">Built for production, priced for teams</h2>
      <div class***REMOVED***"features-grid">
        <div class***REMOVED***"feature-card">
          <span class***REMOVED***"feature-icon">⚡</span>
          <h3>Edge-cached globally</h3>
          <p>Images are generated once and stored on Cloudflare R2. Subsequent requests hit the cache in under 50ms worldwide.</p>
        </div>
        <div class***REMOVED***"feature-card">
          <span class***REMOVED***"feature-icon">🎨</span>
          <h3>3 templates out of the box</h3>
          <p>Default, Blog, and Article templates — dark and light variants. No design work needed.</p>
        </div>
        <div class***REMOVED***"feature-card">
          <span class***REMOVED***"feature-icon">🔑</span>
          <h3>Instant API key</h3>
          <p>Sign up with email, get a key immediately. 100 images free, no credit card required.</p>
        </div>
        <div class***REMOVED***"feature-card">
          <span class***REMOVED***"feature-icon">📊</span>
          <h3>Usage dashboard</h3>
          <p>Track how many images you've generated, reset date, and tier status in a clean developer dashboard.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Pricing -->
  <section class***REMOVED***"section" id***REMOVED***"pricing">
    <div class***REMOVED***"container">
      <p class***REMOVED***"section-title">Pricing</p>
      <h2 class***REMOVED***"section-h2">Start free. Scale as you publish.</h2>
      <div class***REMOVED***"pricing-grid">

        <div class***REMOVED***"pricing-card">
          <p class***REMOVED***"pricing-tier">Free</p>
          <p class***REMOVED***"pricing-price">$0</p>
          <p class***REMOVED***"pricing-period">forever</p>
          <p class***REMOVED***"pricing-limit">100 images / month</p>
          <ul class***REMOVED***"pricing-features">
            <li>3 templates (dark + light)</li>
            <li>R2 global cache</li>
            <li>API key + dashboard</li>
            <li class***REMOVED***"dim">SnapOG watermark</li>
            <li class***REMOVED***"dim">No custom fonts</li>
          </ul>
          <div class***REMOVED***"pricing-cta">
            <a href***REMOVED***"/register" class***REMOVED***"btn btn-ghost" style***REMOVED***"width:100%;">Get started →</a>
          </div>
        </div>

        <div class***REMOVED***"pricing-card featured">
          <p class***REMOVED***"pricing-tier pricing-tier-featured">⚡ Pro — most popular</p>
          <p class***REMOVED***"pricing-price" style***REMOVED***"color:var(--accent);">$19</p>
          <p class***REMOVED***"pricing-period">per month</p>
          <p class***REMOVED***"pricing-limit" style***REMOVED***"color:var(--accent);">10,000 images / month</p>
          <ul class***REMOVED***"pricing-features">
            <li>Everything in Free</li>
            <li>No watermark</li>
            <li>Custom font upload</li>
            <li>Usage analytics</li>
            <li>Priority support</li>
          </ul>
          <div class***REMOVED***"pricing-cta">
            <a href***REMOVED***"/register?tier***REMOVED***pro" class***REMOVED***"btn btn-primary" style***REMOVED***"width:100%;">Start Pro →</a>
          </div>
        </div>

        <div class***REMOVED***"pricing-card">
          <p class***REMOVED***"pricing-tier">Business</p>
          <p class***REMOVED***"pricing-price">$49</p>
          <p class***REMOVED***"pricing-period">per month</p>
          <p class***REMOVED***"pricing-limit">100,000 images / month</p>
          <ul class***REMOVED***"pricing-features">
            <li>Everything in Pro</li>
            <li>Custom domain (CNAME)</li>
            <li>Team access (3 seats)</li>
            <li>White-label (no branding)</li>
            <li>SLA + priority queue</li>
          </ul>
          <div class***REMOVED***"pricing-cta">
            <a href***REMOVED***"mailto:hello@snapog.dev" class***REMOVED***"btn btn-ghost" style***REMOVED***"width:100%;">Contact us →</a>
          </div>
        </div>

      </div>
    </div>
  </section>

  ${footer()}

  <script>
    // Copy to clipboard helper
    document.querySelectorAll('[data-copy]').forEach(btn ***REMOVED***> {
      btn.addEventListener('click', () ***REMOVED***> {
        navigator.clipboard.writeText(btn.dataset.copy || '');
        const orig ***REMOVED*** btn.textContent;
        btn.textContent ***REMOVED*** 'Copied!';
        setTimeout(() ***REMOVED***> { btn.textContent ***REMOVED*** orig; }, 1500);
      });
    });
  </script>`;

  return layout('Generate OG images at the edge', body);
}

export function registerPage(error?: string, tier?: string): string {
  const body ***REMOVED*** `
  ${nav()}
  <section class***REMOVED***"section">
    <div class***REMOVED***"container" style***REMOVED***"max-width:480px;">
      <p class***REMOVED***"section-title">Get API Key</p>
      <h1 class***REMOVED***"section-h2">Start generating</h1>
      <p class***REMOVED***"section-sub" style***REMOVED***"margin-bottom:32px;">Enter your email to receive your API key instantly. No password. No credit card for free tier.</p>

      ${error ? `<div class***REMOVED***"alert alert-error">${error}</div>` : ''}

      <div class***REMOVED***"card">
        <form method***REMOVED***"POST" action***REMOVED***"/register">
          <input type***REMOVED***"hidden" name***REMOVED***"tier" value***REMOVED***"${tier ?? 'free'}" />
          <div class***REMOVED***"form-group">
            <label class***REMOVED***"form-label" for***REMOVED***"email">EMAIL ADDRESS</label>
            <input class***REMOVED***"form-input" type***REMOVED***"email" name***REMOVED***"email" id***REMOVED***"email" placeholder***REMOVED***"you@example.com" required autocomplete***REMOVED***"email" />
            <p class***REMOVED***"form-hint">Your API key will be displayed immediately after registration.</p>
          </div>
          <div class***REMOVED***"form-group">
            <label class***REMOVED***"form-label" for***REMOVED***"keyname">KEY NAME (optional)</label>
            <input class***REMOVED***"form-input" type***REMOVED***"text" name***REMOVED***"keyname" id***REMOVED***"keyname" placeholder***REMOVED***"production" />
            <p class***REMOVED***"form-hint">Give this key a label to identify it later.</p>
          </div>
          <button type***REMOVED***"submit" class***REMOVED***"btn btn-primary" style***REMOVED***"width:100%;padding:14px;font-size:15px;">
            Create API Key →
          </button>
        </form>
      </div>

      <p style***REMOVED***"font-size:13px;color:var(--text-3);margin-top:20px;text-align:center;">
        Already have a key? <a href***REMOVED***"/dashboard">View your dashboard</a>
      </p>
    </div>
  </section>
  ${footer()}`;

  return layout('Get API Key', body);
}

export function keyCreatedPage(rawKey: string, email: string, tier: string): string {
  const body ***REMOVED*** `
  ${nav()}
  <section class***REMOVED***"section">
    <div class***REMOVED***"container" style***REMOVED***"max-width:600px;">
      <div class***REMOVED***"alert alert-success">
        ✓ API key created for ${email}
      </div>
      <p class***REMOVED***"section-title">Your API Key</p>
      <h1 class***REMOVED***"section-h2">Save this key now</h1>
      <p class***REMOVED***"section-sub" style***REMOVED***"margin-bottom:32px;">
        This is the only time you'll see the full key. Copy it and store it securely.
      </p>

      <div class***REMOVED***"card">
        <p class***REMOVED***"card-title">API KEY — ${tier.toUpperCase()}</p>
        <div class***REMOVED***"api-key-row">
          <div class***REMOVED***"api-key-display">
            <span class***REMOVED***"key-val" id***REMOVED***"api-key">${rawKey}</span>
          </div>
          <button class***REMOVED***"btn btn-primary" data-copy***REMOVED***"${rawKey}" style***REMOVED***"white-space:nowrap;">Copy</button>
        </div>
        <p style***REMOVED***"font-size:12px;color:var(--text-3);margin-top:12px;font-family:var(--font-mono);">
          Free tier: 100 images/month · Resets monthly · ${tier ***REMOVED******REMOVED******REMOVED*** 'pro' ? '10,000 images' : 'upgrade anytime'}
        </p>
      </div>

      <div class***REMOVED***"code-block" style***REMOVED***"margin-top:32px;">
        <div class***REMOVED***"code-block-header">
          <div class***REMOVED***"code-block-dots">
            <div class***REMOVED***"dot dot-red"></div><div class***REMOVED***"dot dot-yellow"></div><div class***REMOVED***"dot dot-green"></div>
          </div>
          <span class***REMOVED***"code-block-lang">Quick start</span>
        </div>
        <pre><span class***REMOVED***"c-comment"># Test your key</span>
<span class***REMOVED***"c-key">curl</span> <span class***REMOVED***"c-str">"https://snapog.dev/og?title***REMOVED***Hello+World&amp;key***REMOVED***${rawKey}"</span> \
  <span class***REMOVED***"c-val">--output</span> og.png && <span class***REMOVED***"c-key">open</span> og.png</pre>
      </div>

      <div style***REMOVED***"margin-top:32px;display:flex;gap:12px;">
        <a href***REMOVED***"/dashboard?key***REMOVED***${rawKey}" class***REMOVED***"btn btn-primary">Open Dashboard →</a>
        <a href***REMOVED***"/#how-it-works" class***REMOVED***"btn btn-ghost">Read the docs</a>
      </div>
    </div>
  </section>
  ${footer()}
  <script>
    document.querySelectorAll('[data-copy]').forEach(btn ***REMOVED***> {
      btn.addEventListener('click', () ***REMOVED***> {
        navigator.clipboard.writeText(btn.dataset.copy || '');
        const orig ***REMOVED*** btn.textContent;
        btn.textContent ***REMOVED*** 'Copied!';
        setTimeout(() ***REMOVED***> { btn.textContent ***REMOVED*** orig; }, 1500);
      });
    });
  </script>`;

  return layout('API Key Created', body);
}

export function dashboardPage(key: ApiKey, recentCount: number): string {
  const pct ***REMOVED*** Math.round((key.usage_count / key.monthly_limit) * 100);
  const barClass ***REMOVED*** pct >***REMOVED*** 100 ? 'full' : pct >***REMOVED*** 80 ? 'warn' : '';
  const resetDate ***REMOVED*** new Date(key.usage_reset_at);
  const nextReset ***REMOVED*** new Date(resetDate.getFullYear(), resetDate.getMonth() + 1, 1)
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const tierBadge ***REMOVED*** `<span class***REMOVED***"tier-badge tier-${key.tier}">${key.tier}</span>`;

  const body ***REMOVED*** `
  ${nav()}
  <div class***REMOVED***"container">
    <div class***REMOVED***"dash-layout">
      <div class***REMOVED***"dash-header">
        <h1>Dashboard ${tierBadge}</h1>
        <p>API key: <code style***REMOVED***"font-family:var(--font-mono);font-size:13px;color:var(--text-2);">${key.key_prefix}••••••••••••••••••••</code></p>
      </div>

      <div class***REMOVED***"dash-grid">

        <!-- Usage card -->
        <div class***REMOVED***"card">
          <p class***REMOVED***"card-title">Usage This Month</p>
          <div class***REMOVED***"usage-count">${key.usage_count.toLocaleString()}</div>
          <p class***REMOVED***"usage-limit">of ${key.monthly_limit.toLocaleString()} images</p>
          <div class***REMOVED***"usage-bar-wrap">
            <div class***REMOVED***"usage-bar ${barClass}" style***REMOVED***"width:${Math.min(pct, 100)}%"></div>
          </div>
          <div class***REMOVED***"usage-meta">
            <span style***REMOVED***"color:var(--text-3);font-size:13px;">${pct}% used</span>
            <span style***REMOVED***"color:var(--text-3);font-size:13px;">Resets ${nextReset}</span>
          </div>
          ${
            key.tier ***REMOVED******REMOVED******REMOVED*** 'free'
              ? `<div style***REMOVED***"margin-top:20px;padding-top:20px;border-top:1px solid var(--border);">
                   <p style***REMOVED***"font-size:13px;color:var(--text-2);">Need more?</p>
                   <a href***REMOVED***"/register?tier***REMOVED***pro" class***REMOVED***"btn btn-primary" style***REMOVED***"margin-top:10px;">Upgrade to Pro — $19/mo →</a>
                 </div>`
              : ''
          }
        </div>

        <!-- Stats sidebar -->
        <div style***REMOVED***"display:flex;flex-direction:column;gap:16px;">
          <div class***REMOVED***"card">
            <p class***REMOVED***"card-title">Recent Generations</p>
            <p style***REMOVED***"font-size:32px;font-weight:700;font-family:var(--font-mono);">${recentCount}</p>
            <p style***REMOVED***"font-size:13px;color:var(--text-3);margin-top:4px;">in last 24h</p>
          </div>
          <div class***REMOVED***"card">
            <p class***REMOVED***"card-title">Cache Hit Rate</p>
            <p style***REMOVED***"font-size:32px;font-weight:700;font-family:var(--font-mono);color:var(--teal);">—</p>
            <p style***REMOVED***"font-size:13px;color:var(--text-3);margin-top:4px;">available in Pro</p>
          </div>
        </div>

        <!-- Quick start code -->
        <div class***REMOVED***"card dash-grid-full">
          <p class***REMOVED***"card-title">Quick Start</p>
          <div class***REMOVED***"code-block">
            <div class***REMOVED***"code-block-header">
              <div class***REMOVED***"code-block-dots">
                <div class***REMOVED***"dot dot-red"></div><div class***REMOVED***"dot dot-yellow"></div><div class***REMOVED***"dot dot-green"></div>
              </div>
              <span class***REMOVED***"code-block-lang">HTML / meta tags</span>
            </div>
            <pre><span class***REMOVED***"c-key">&lt;meta</span> <span class***REMOVED***"c-val">property***REMOVED***</span><span class***REMOVED***"c-str">"og:image"</span>
      <span class***REMOVED***"c-val">content***REMOVED***</span><span class***REMOVED***"c-str">"https://snapog.dev/og?title***REMOVED***YOUR_TITLE&amp;key***REMOVED***${key.key_prefix}..."</span> <span class***REMOVED***"c-key">/&gt;</span></pre>
          </div>
          <div class***REMOVED***"code-block" style***REMOVED***"margin-top:12px;">
            <div class***REMOVED***"code-block-header">
              <div class***REMOVED***"code-block-dots">
                <div class***REMOVED***"dot dot-red"></div><div class***REMOVED***"dot dot-yellow"></div><div class***REMOVED***"dot dot-green"></div>
              </div>
              <span class***REMOVED***"code-block-lang">cURL test</span>
            </div>
            <pre><span class***REMOVED***"c-key">curl</span> <span class***REMOVED***"c-str">"https://snapog.dev/og?title***REMOVED***My+Blog+Post&amp;domain***REMOVED***myblog.com&amp;key***REMOVED***${key.key_prefix}..."</span> \
  <span class***REMOVED***"c-val">--output</span> og.png && <span class***REMOVED***"c-key">open</span> og.png</pre>
          </div>
        </div>

      </div>
    </div>
  </div>
  ${footer()}`;

  return layout('Dashboard', body);
}

export function errorPage(code: number, message: string): string {
  const body ***REMOVED*** `
  ${nav()}
  <section class***REMOVED***"section">
    <div class***REMOVED***"container" style***REMOVED***"text-align:center;max-width:480px;">
      <p style***REMOVED***"font-family:var(--font-mono);font-size:80px;font-weight:700;color:var(--border);line-height:1;">${code}</p>
      <h1 style***REMOVED***"font-size:24px;margin:16px 0 12px;">${message}</h1>
      <p style***REMOVED***"color:var(--text-2);margin-bottom:32px;">Something went wrong. Try again or check the docs.</p>
      <a href***REMOVED***"/" class***REMOVED***"btn btn-ghost">← Back to home</a>
    </div>
  </section>
  ${footer()}`;

  return layout(`${code} Error`, body);
}
