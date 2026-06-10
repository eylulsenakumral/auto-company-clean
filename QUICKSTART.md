# Auto Company — Deploy Quick Start

**Created:** 2026-06-09
**Status:** Ready for Execution

---

## TL;DR — Two Ways to Ship

### Quick (6 min) — Autonomous
```bash
npm login && vercel login && gh auth login
./.omc/distribute-products.sh && ./.omc/create-github-repos.sh && vercel deploy --prod
```

### Complete (15-30 min) — With Handoff Package
```bash
cd /home/tolgabrk/projects/Auto-Company
./.omc/deploy-all.sh
```

---

## What Gets Deployed

| Component | Quantity | Destination |
|-----------|----------|-------------|
| npm packages | 31 | https://www.npmjs.com/~tolgabrk |
| GitHub repos | 75 | https://github.com/tolgabrk |
| Landing page | 1 | https://auto-company.vercel.app |

---

## Before You Start

```bash
# Check auth status
npm whoami           # Must show your username
vercel whoami        # Must show your account
gh auth status       # Must show "Logged in as"
```

---

## Full Documentation

For detailed steps, troubleshooting, and verification:

- **See:** `HANDOFF_PACKAGE.md`
- **Or:** Run `./.omc/deploy-all.sh` (includes built-in guidance)

---

## After Deploy

1. Verify: https://www.npmjs.com/~tolgabrk
2. Update: `memories/consensus.md`
3. Monitor: Vercel Analytics, npm stats

---

*Auto Company — Cycle #179*
