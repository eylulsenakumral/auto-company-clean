# Auto Company — Handoff Package

**Created:** 2026-06-09
**Status:** Ready for Manual Execution
**Timeline:** 15-30 minutes execution time

---

## Quick Start

```bash
cd /home/tolgabrk/projects/Auto-Company

# Step 1: Auth (2 minutes)
npm login
vercel login
gh auth login

# Step 2: Deploy everything (10-15 minutes)
./.omc/distribute-products.sh     # 31 npm packages
./.omc/create-github-repos.sh      # 75 GitHub repos
vercel deploy --prod               # Landing page
```

---

## What Gets Deployed

| Component | Quantity | Script | Output |
|-----------|----------|--------|--------|
| npm packages | 31 | `distribute-products.sh` | https://www.npmjs.com/~tolgabrk |
| GitHub repos | 75 | `create-github-repos.sh` | https://github.com/tolgabrk |
| Landing page | 1 | `vercel deploy --prod` | https://auto-company.vercel.app |

---

## Prerequisites Checklist

Before running deploy scripts, verify:

- [ ] `npm` installed and `npm whoami` works
- [ ] `vercel` CLI installed (`npm i -g vercel`)
- [ ] `gh` CLI installed (`brew install gh` or `sudo apt install gh`)
- [ ] GitHub Personal Access Token (optional, for repo creation)
- [ ] Network connection stable

---

## Step-by-Step Deploy

### Phase 1: Authentication (2 minutes)

#### 1.1 npm Auth

```bash
npm login
# Username: tolgabrk
# Password: (your npm token)
# Email: (your email)
```

Verify:
```bash
npm whoami
# Should output: tolgabrk
```

#### 1.2 Vercel Auth

```bash
vercel login
# Follow browser flow
```

Verify:
```bash
vercel whoami
# Should show your account
```

#### 1.3 GitHub Auth

```bash
gh auth login
# Select: GitHub.com > HTTPS > Yes (upload SSH key)
```

Verify:
```bash
gh auth status
# Should show "Logged in as tolgabrk"
```

---

### Phase 2: npm Distribution (8-10 minutes)

```bash
./.omc/distribute-products.sh
```

**What it does:**
- Publishes 31 production-ready CLI tools to npm
- Each package gets `--access public`
- Creates GitHub repos for each (if gh auth works)
- Logs output to `/tmp/npm-publish-*.log`

**Expected output:**
```

Auto Company Distribution Pipeline


✓ Authenticated as: tolgabrk
✓ GitHub authenticated

[1/31] pool-leak-detector
  ✓ Published: https://www.npmjs.com/package/@auto-company/pool-leak-detector
  ✓ GitHub repo: https://github.com/tolgabrk/pool-leak-detector

...

✓ Published: 31
⚠ Skipped: 0
✗ Failed: 0
```

**If failures occur:**
- Check `/tmp/npm-publish-*.log` for error details
- Common issue: package name conflict → rename in package.json
- Re-run script - it skips already-published packages

---

### Phase 3: GitHub Repos (5 minutes)

```bash
./.omc/create-github-repos.sh
```

**What it does:**
- Creates 75 public repos (one per product)
- Adds MIT License to each
- Initializes git and pushes initial commit
- Adds topics: cli, tool, automation, developer-tools
- Logs to `.omc/repo-creation-*.log`

**Expected output:**
```
═══════════════════════════════════════════════════════════════
   Auto Company - GitHub Repo Oluşturma Script'i
═══════════════════════════════════════════════════════════════

✓ GitHub auth aktif: tolgabrk

Bulunan Ürün Sayısı: 75

...

═══════════════════════════════════════════════════════════════
   ÖZET RAPOR
═══════════════════════════════════════════════════════════════

  Başarılı:     75
  Atlanan:      0
  Başarısız:    0
  Toplam:       75
```

**Created repos list saved to:** `.omc/created-repos.txt`

---

### Phase 4: Landing Page Deploy (2 minutes)

```bash
cd /home/tolgabrk/projects/Auto-Company
vercel deploy --prod
```

**What it does:**
- Builds Next.js app
- Deploys to Vercel edge network
- Assigns production domain
- Sets up auto-deploy from main branch

**Expected output:**
```
Vercel CLI
✔ Linked to existing project
✔ Production: https://auto-company.vercel.app [2m]
✔ Built in 45s
```

**Verify:**
```bash
curl -I https://auto-company.vercel.app
# Should return 200
```

---

## Verification Checklist

After deploy completes:

### npm Verification

```bash
# Check your profile
npm profile get --json | jq '.username'
# Should show: "tolgabrk"

# Count published packages
npm search @auto-company | grep "@auto-company/" | wc -l
# Should show: 31

# Test install one package
npm install -g @auto-company/pool-leak-detector
pool-leak-detector --help
```

### GitHub Verification

```bash
# Check created repos
cat .omc/created-repos.txt
# Should list 75 URLs

# Verify one repo
gh repo view pool-leak-detector --json url,name,description
```

### Landing Page Verification

```bash
# Test landing page
curl https://auto-company.vercel.app | grep -o "<title>.*</title>"
# Should show: "Auto Company - 31 CLI Tools for Developers"

# Check all products listed
curl https://auto-company.vercel.app | grep -o "product-card" | wc -l
# Should show: 31
```

---

## Post-Launch Actions

After successful deploy:

1. **Update consensus.md:**
```markdown
## Next Action
- Monitor npm download stats
- Set up GitHub Analytics
- Write Product Hunt launch post
```

2. **Set up monitoring:**
- Vercel Analytics: https://vercel.com/analytics
- npm package stats: https://npm-stat.com
- GitHub traffic: https://github.com/tolgabrk?tabrepositories

3. **Marketing kickoff:**
- Post to r/node
- Write Product Hunt post
- Create Twitter announcement thread

---

## Rollback Procedures

If something goes wrong:

### Rollback npm packages
```bash
# Unpublish specific package
npm unpublish @auto-company/<package-name> --force
# Note: npm only allows unpublish within 72 hours
```

### Rollback Vercel deploy
```bash
vercel rollback
# Or deploy specific commit:
vercel deploy --prod --commit <commit-sha>
```

### Delete GitHub repos
```bash
gh repo delete <repo-name> --yes
# Or bulk delete:
cat .omc/created-repos.txt | while read url; do
    repo$(basename "$url")
    gh repo delete "$repo" --yes
done
```

---

## Troubleshooting

### npm publish fails with "403 Forbidden"

**Cause:** Auth expired or package name conflict

**Fix:**
```bash
npm login
# Check if name exists:
npm view <package-name>
# If exists, rename in package.json and re-publish
```

### GitHub repo creation fails with "Repository already exists"

**Cause:** Repo was created previously

**Fix:** Script auto-skip; check `.omc/created-repos.txt`

### Vercel deploy fails with "Build error"

**Cause:** Dependency issue or build config

**Fix:**
```bash
# Locally test build:
npm run build

# If fails, check:
npm install
npm run build
# Then retry deploy
```

---

## Support Contacts

If you encounter issues not covered here:

- **Vercel:** https://vercel.com/support
- **npm:** https://www.npmjs.com/support
- **GitHub:** https://support.github.com

---

## Summary

**Total Time:** 15-30 minutes
**Prerequisites:** npm, Vercel, GitHub CLI + auth
**Outcome:** 31 packages live, 75 repos, 1 landing page

**After deploy:** Update consensus.md, set up monitoring, begin marketing.

---

*Handoff Package created by Auto Company*
*Cycle #179 — Path B Preparation*
*2026-06-09*
