# Auto Company - Manual Deployment Guide

## Overview

This distribution package contains everything needed to deploy Auto Company products and landing page. Deployment requires authentication with npm, Vercel, and GitHub.

## Package Contents

```
auto-company-dist/
├── landing/
│   ├── .next/          # Next.js build output
│   └── public/         # Static assets
├── products/
│   ├── env-diff-0.1.0.tgz
│   ├── gh-analytics-0.1.0.tgz
│   ├── keyspinner-scan-1.0.0.tgz
│   └── eylulsenakumral-reviewflow-cli-0.2.0.tgz
├── scripts/
│   └── deploy-all.sh   # One-command deploy
└── MANUAL_DEPLOY.md     # This file
```

## Prerequisites

Before deployment, authenticate with all services:

```bash
# npm authentication (2 minutes)
npm login
# Follow prompts to enter username, password, and OTP

# Vercel authentication
vercel login
# Choose GitHub login in browser

# GitHub authentication
gh auth login
# Follow the login flow
```

## Deployment Methods

### Method 1: One-Command Deploy (Recommended)

```bash
cd auto-company-dist
./scripts/deploy-all.sh
```

This script will:
- Verify all authentications
- Publish 4 products to npm
- Deploy landing to Vercel production

### Method 2: Manual Step-by-Step

#### Publish Products to npm

```bash
cd auto-company-dist/products
npm publish env-diff-0.1.0.tgz
npm publish gh-analytics-0.1.0.tgz
npm publish keyspinner-scan-1.1.0.tgz
npm publish eylulsenakumral-reviewflow-cli-0.2.0.tgz
```

#### Deploy Landing to Vercel

```bash
cd auto-company-dist/landing
vercel --prod
```

## Launch Timeline

- **Target Date:** July 8, 2026 at 10:01 AM Istanbul
- **Product Hunt:** Submit at 12:01 AM PT (10:01 AM Istanbul)
- **Reddit r/SaaS:** Post at 3:00 PM Istanbul
- **Twitter Thread:** Post morning of launch

## Verification

After deployment, verify:

1. **Landing Page:** Check Vercel dashboard for deployment URL
2. **npm Packages:** Visit https://www.npmjs.com/~[your-username]
3. **GitHub Repos:** Check your GitHub profile

## Troubleshooting

**npm publish fails with 403:**
- Check package name availability
- Verify npm authentication with `npm whoami`

**vercel deploy fails:**
- Run `vercel logout` then `vercel login` again
- Check Vercel dashboard for project status

**GitHub auth fails:**
- Run `gh auth logout` then `gh auth login` again
- Verify GitHub token is valid

## Support

For issues or questions, refer to the Auto Company consensus document or check the project documentation.

---

*Auto Company — Autonomous AI Company*
*Distribution Package v1.0 — 2026-06-09*
