# bundle-size-analyzer

CLI that analyzes bundle sizes, detects bloat, and enforces budgets.

Every 100ms of latency costs 1% in sales. Bundle bloat creeps in silently — this tool helps you catch it early.

## Features

- **Analyze** — Get size breakdown by module with color-coded warnings
- **Compare** — Diff between builds, detect regressions
- **Budget** — Enforce size limits with CI/CD-ready exit codes
- **Blame** — Identify which npm packages contribute most to bloat

## Installation

```bash
npm install -g bundle-size-analyzer
```

Or use with npx:

```bash
npx bundle-size-analyzer <command>
```

## Usage

### Analyze bundle size

```bash
bundle-analyzer analyze dist/bundle.js
```

Output:
```
📦 Bundle Analysis (JS)

Total Size: 245.5 KB

┌──────────────────────┬─────────────────┬───────────┬────────────┐
│ Module               │ Size             │ %          │ Status     │
├──────────────────────┼─────────────────┼───────────┼────────────┤
│ react                │ 61.38 KB         │ 25.0%     │ ⚠️ TOO BIG│
│ lodash               │ 36.83 KB         │ 15.0%     │ ⚡ WARNING │
│ ui components        │ 36.83 KB         │ 15.0%     │ ⚡ WARNING │
│ core utilities       │ 49.10 KB         │ 20.0%     │ ⚠️ TOO BIG│
│ axios                │ 24.55 KB         │ 10.0%     │ ✓ OK       │
└──────────────────────┴─────────────────┴───────────┴────────────┘
```

### Compare two builds

```bash
bundle-analyzer compare dist/old.js dist/new.js
```

```
🔄 Bundle Comparison

Total Size Change: +15.2 KB

✅ Added Modules:
  + new-feature: 8.5 KB

❌ Removed Modules:
  - old-dep: 3.2 KB

📝 Changed Modules:
  ~ react: 61 KB → 68 KB (+7 KB)
```

### Enforce budget (CI/CD ready)

```bash
bundle-analyzer budget dist/bundle.js 200KB
```

Exit codes:
- `0` — Within budget
- `1` — Over budget
- `2` — Error

```yaml
# GitHub Actions example
- name: Check bundle size
  run: bundle-analyzer budget dist/bundle.js 200KB
```

### Identify bloated packages

```bash
bundle-analyzer blame dist/bundle.js
```

```
🔍 Package Blame Analysis

┌──────────────────────┬─────────────────┬───────────┬────────────────────────┐
│ Package              │ Size             │ %          │ Modules                │
├──────────────────────┼─────────────────┼───────────┼────────────────────────┤
│ ⚠️ react              │ 61.38 KB         │ 25.0%     │ react, react-dom       │
│ ⚠️ @mui/material      │ 49.10 KB         │ 20.0%     │ @mui/material, icons   │
│ application-code      │ 53.99 KB         │ 22.0%     │ components, utils       │
│ lodash               │ 36.83 KB         │ 15.0%     │ lodash, lodash-es      │
└──────────────────────┴─────────────────┴───────────┴────────────────────────┘
```

## JSON Output

All commands support `--json` for automation:

```bash
bundle-analyzer analyze bundle.js --json
bundle-analyzer compare old.js new.js --json
bundle-analyzer budget bundle.js 200KB --json
bundle-analyzer blame bundle.js --json
```

## Supported Formats

- JavaScript bundles (`.js`, `.mjs`, `.cjs`)
- CSS bundles (`.css`)
- JSON manifests (`.json`)

## Size Limits

Budget commands accept human-readable sizes:
- `200KB` — kilobytes
- `1.5MB` — megabytes
- `500000` — raw bytes

## Exit Codes

- `0` — Success
- `1` — Budget exceeded / regression detected
- `2` — Error

## License

MIT
