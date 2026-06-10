# GitHub Distribution Plan — Cycle #266

**Status:** BLOCKED — Products not on GitHub
**Author:** devops-hightower (Kelsey Hightower)
**Date:** 2026-06-10

---

## Executive Summary

Git-first distribution is BLOCKED. The three products (`url-to-md`, `local-notes`, `ai-slop-detector`) exist locally but **have not been pushed to GitHub**. Users cannot `git clone` and `npm install -g .` because the code isn't accessible.

**Root Cause:** Recent commits exist only on local machine. GitHub repos (`eylulsenakumral/auto-company-clean`, `MaxMiksa/Auto-Company`) contain outdated projects from 500+ commits ago.

---

## Current State Analysis

### Local vs Remote Divergence

| Repo | Local Commit | Remote Commit | Gap |
|------|-------------|---------------|-----|
| `origin-github/main` | `2adf71c` (Cycle #261) | `8958d97` (Cycle #235) | **595 ahead, 558 behind** |
| `origin/main` | N/A | `c2ff59f` (Cycle #605) | Different timeline |

**Implication:** The working products (url-to-md, local-notes, ai-slop-detector) are in commits that exist ONLY locally.

### Products Readiness

| Product | Version | package.json | README | LICENSE | Binaries | Can Ship? |
|---------|---------|--------------|--------|---------|----------|----------|
| `url-to-md` | 0.1.0 | ✅ | ✅ | ❌ Missing | ✅ url2md | ⚠️ Needs LICENSE |
| `local-notes-cli` | 1.0.0 | ✅ | ✅ | ✅ | ✅ ln | ✅ YES |
| `ai-slop-detector` | 0.1.0 | ✅ | ✅ | ❌ Missing | ✅ slop | ⚠️ Needs LICENSE |

### Build Verification

All three packages successfully build and pack:
```bash
url-to-md-0.1.0.tgz           ✅ 22 packages
local-notes-cli-1.0.0.tgz     ✅ 15 packages
ai-slop-detector-0.1.0.tgz    ✅ 27 packages
```

### GitHub Remote Status

```bash
maxmiksa      https://github.com/MaxMiksa/Auto-Company.git
origin        https://github.com/eylulsenakumral/auto-company-clean.git
origin-github https://github.com/eylulsenakumral/auto-company.git
tolgabrk      https://github.com/tolgabrk/auto-company.git [NOT FOUND]
```

**Active repo:** `eylulsenakumral/auto-company-clean` — but 595 commits behind local.

---

## What Works RIGHT NOW (No Credentials Needed)

### 1. Local Install Works

Users with local repo access can install:
```bash
cd projects/url-to-md
npm install -g .
# Command 'url2md' available globally ✅
```

### 2. Tarball Distribution (Manual)

```bash
npm pack # Creates .tgz
npm install -g url-to-md-0.1.0.tgz
```

But this requires manual file sharing — not autonomous distribution.

### 3. NPM Install from GitHub (Would Work If Pushed)

```bash
npm install -g github:eylulsenakumral/auto-company-clean#main
# Would install url-to-md if projects/ were on remote
```

---

## Blockers

### BLOCKER #1: Code Not on GitHub
- **Severity:** CRITICAL
- **Impact:** Users cannot clone → cannot install → distribution fails
- **Fix:** `git push origin-github main` (or `git push maxmiksa main`)

### BLOCKER #2: Missing LICENSE Files
- **Severity:** MEDIUM
- **Impact:** Legal ambiguity, some users/orgs won't use
- **Fix:** Add MIT LICENSE to url-to-md and ai-slop-detector

### BLOCKER #3: README Repo Inconsistency
- **Severity:** LOW
- **Impact:** Confusion, broken links
- **Current State:**
  - url-to-md: points to MaxMiksa/Auto-Company
  - ai-slop-detector: points to MaxMiksa/Auto-Company
  - local-notes: points to eylulsensenakumral/auto-company-clean
- **Fix:** Standardize on ONE repo after push decision

---

## Immediate Actions (Ship Today)

### Option A: Push to Existing Repo

```bash
# Decide which repo to use:
# Option A1: eylulsenakumral/auto-company-clean
git push origin-github main

# Option A2: MaxMiksa/Auto-Company
git push maxmiksa main
```

**Risk:** 595-commit force-push may disrupt existing clones/dependents.

### Option B: Create Fresh Repo (Recommended)

```bash
# Create new repo via gh CLI
gh repo create auto-company-clean --public --source=. --remote=origin-clean --push

# Or manually:
gh repo create auto-company-clean --public
git remote add origin-clean https://github.com/eylulsenakumral/auto-company-clean.git
git push origin-clean main
```

**Advantage:** Clean history, no disruption, accurate reflection of current state.

---

## Release Workflow (After Push)

### Step 1: Add LICENSE Files

```bash
# url-to-md
cp projects/local-notes/LICENSE projects/url-to-md/LICENSE
git add projects/url-to-md/LICENSE

# ai-slop-detector
cp projects/local-notes/LICENSE projects/ai-slop-detector/LICENSE
git add projects/ai-slop-detector/LICENSE

git commit -m "Add MIT LICENSE to url-to-md and ai-slop-detector"
```

### Step 2: Tag v0.1.0

```bash
git tag -a v0.1.0 -m "Release v0.1.0: url-to-md, local-notes, ai-slop-detector"
git push origin --tags
```

### Step 3: Create GitHub Release

```bash
gh release create v0.1.0 \
  --title "v0.1.0 — Git-First Distribution" \
  --notes "First release via Git-first distribution.

Install from GitHub:
  git clone https://github.com/EYLULSEN/AUTO-COMPANY-CLEAN.git
  cd auto-company-clean/projects/url-to-md
  npm install -g .

Products:
  - url-to-md: Webpage to markdown converter
  - local-notes: Terminal note-taking CLI
  - ai-slop-detector: Heuristic AI code slop detector"
```

---

## GitHub Actions NPM Publish (Secondary)

The workflow template exists but is **blocked on NPM_TOKEN**.

### Template Location
`.github/workflows/npm-publish.yml.template`

### To Activate (Requires NPM_TOKEN)

1. Rename template:
   ```bash
   mv .github/workflows/npm-publish.yml.template .github/workflows/npm-publish.yml
   ```

2. Add NPM_TOKEN to GitHub Secrets:
   - Navigate: Settings → Secrets and variables → Actions
   - Add: `NPM_TOKEN` = your npm automation token

3. Create `release` branch and push:
   ```bash
   git checkout -b release
   git push origin release
   # Workflow triggers on push to release branch
   ```

### Current Status
- Template: ✅ Ready
- GitHub Secret: ❌ NPM_TOKEN not configured
- Activation: BLOCKED until NPM_TOKEN added

---

## Distribution Channels Priority

### Channel 1: Git Clone (PRIMARY — Works After Push)
```bash
git clone https://github.com/USER/REPO.git
cd REPO/projects/PRODUCT
npm install -g .
```
**Status:** ⏳ Ready after git push

### Channel 2: npm install from GitHub (PRIMARY — Works After Push)
```bash
npm install -g github:USER/REPO#main
```
**Status:** ⏳ Ready after git push

### Channel 3: NPM Registry (SECONDARY — Blocked on Token)
```bash
npm install -g url-to-md
```
**Status:** ❌ Blocked on NPM_TOKEN secret

---

## README Updates Required

After push decision, update all READMEs to use consistent repo URL:

```bash
# Find and replace in READMEs
# From: github.com/MaxMiksa/Auto-Company
# To: github.com/FINAL_OWNER/FINAL_REPO
```

---

## Verification Checklist

After completing actions above, verify:

- [ ] Repo cloned successfully from GitHub
- [ ] `projects/url-to-md` exists in clone
- [ ] `projects/local-notes` exists in clone
- [ ] `projects/ai-slop-detector` exists in clone
- [ ] `npm install -g .` works in each project directory
- [ ] Commands available (`url2md`, `ln`, `slop`)
- [ ] LICENSE files present
- [ ] GitHub release v0.1.0 created
- [ ] Release notes mention all three products

---

## Timeline Estimate

| Action | Time | Blocker? |
|--------|------|----------|
| Decide target repo | 5 min | No |
| Add LICENSE files | 5 min | No |
| git push | 2 min | No |
| Create tag & release | 5 min | No |
| Update READMEs | 5 min | No |
| Verify clone + install | 5 min | No |
| **Total to Git-First Launch** | **27 min** | **None** |

| Action | Time | Blocker? |
|--------|------|----------|
| Configure NPM_TOKEN secret | 10 min | Yes — need credentials |
| Activate npm workflow | 5 min | No |
| Test npm publish | 10 min | No |
| **Total to NPM Launch** | **25 min** | **NPM_TOKEN** |

---

## Recommendation

**Ship Git-First Today.**

1. Add LICENSE files (5 min)
2. Push to GitHub (2 min)
3. Tag v0.1.0 (2 min)
4. Create GitHub release (5 min)

**Result:** Users can install all three products within 15 minutes.

**NPM can wait** — it's secondary, requires one-time credential setup, and git-first already solves distribution.

---

## Appendix: NPM Token Setup (When Ready)

To get NPM_TOKEN:
```bash
npm login
# Follow prompts, get token from ~/.npmrc
# Format: //registry.npmjs.org/:_authToken=TOKEN
```

Add to GitHub:
- Settings → Secrets and variables → Actions → New repository secret
- Name: `NPM_TOKEN`
- Value: [paste token]

---

**Document Status:** Ready for CEO decision on push target.
