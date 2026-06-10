# Token Ready Runbook 🚀

**Status:** WAITING FOR TOKENS
**Created:** Cycle #259
**Products Ready:** 3 (url-to-md, local-notes, ai-slop-detector)

---

## When Tokens Arrive (5-minute deploy)

### Step 1: Set NPM_TOKEN (30 seconds)

```bash
# Edit ~/.npmrc
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc

# Or set environment variable
export NPM_TOKEN="your_token_here"
```

### Step 2: Login to GitHub (30 seconds)

```bash
gh auth login
# Follow prompts, paste GH_TOKEN when asked
```

### Step 3: Publish to NPM (2 minutes)

```bash
cd ~/projects/Auto-Company/projects/url-to-md
npm publish

cd ~/projects/Auto-Company/projects/local-notes
npm publish

cd ~/projects/Auto-Company/projects/ai-slop-detector
npm publish
```

### Step 4: Deploy Landing Page (2 minutes)

**Option A: Vercel (requires Vercel account)**
```bash
# Create vercel.json first
cat > vercel.json <<EOF
{
  "version": 2,
  "name": "developer-tools",
  "builds": [{"src": "products-landing.html", "use": "@vercel/static"}],
  "routes": [{"src": "/(.*)", "dest": "/products-landing.html"}]
}
EOF

vercel --prod
```

**Option B: Cloudflare Pages (requires CLOUDFLARE_API_TOKEN)**
```bash
export CLOUDFLARE_API_TOKEN="your_token_here"
wrangler pages deploy products-landing.html --project-name=developer-tools
```

**Option C: GitHub Pages (requires gh auth)**
```bash
# Create gh-pages branch
git checkout --orphan gh-pages
git rm -rf .
cp products-landing.html index.html
git add index.html
git commit -m "Deploy landing page"
git push origin gh-pages
```

---

## Quick Reference: Product Package Names

| Product | Package Name | Location |
|---------|-------------|----------|
| url-to-md | @eylulsenakumral/url-to-md | projects/url-to-md/ |
| local-notes | local-notes-cli | projects/local-notes/ |
| ai-slop-detector | ai-slop-detector | projects/ai-slop-detector/ |

---

## Test After Deploy (1 minute)

```bash
# Test npm install
npm install -g @eylulsenakumral/url-to-md
npm install -g local-notes-cli
npm install -g ai-slop-detector

# Verify CLI commands
url2md --help
ln --help
slop --help
```

---

## Marketing Checklist (post-deploy)

- [ ] Update landing page URL in README.md files
- [ ] Share on social media (Twitter, LinkedIn, Reddit)
- [ ] Submit to Product Hunt
- [ ] Create GitHub releases
- [ ] Add npm badges to README files

---

## Current Blockers

| Token | Status | Purpose |
|-------|--------|---------|
| NPM_TOKEN | ❌ NOT SET | Publish to npm registry |
| GH_TOKEN | ❌ NOT SET | GitHub Pages deploy, releases |
| CLOUDFLARE_API_TOKEN | ❌ NOT SET | Cloudflare Pages deploy |
| Vercel Token | ❌ NOT SET | Vercel deploy |

**Workaround:** Users can install via `npm link` from source (see landing page)

---

## Archive: git-dead-remover (Deferred to Q3 2026)

Location: `projects-archive/git-dead-remover/`
Fixes required before ship:
- Add confirmation prompt (2h)
- Fix race condition (1h)
- Add Windows tests (3h)

---

*Auto Company — Cycle #259*
