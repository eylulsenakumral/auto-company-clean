# lockfile-analyzer

Make lockfile changes human-readable. No more 5000-line package-lock.json diffs.

## Install

```bash
npm install -g lockfile-analyzer
# or
npx lockfile-analyzer
```

## Commands

### `diff` — Compare two lockfiles

```bash
npx lockfile-analyzer diff --base package-lock.json --head package-lock.json
npx lockfile-analyzer diff --base yarn.lock --head yarn.lock --format json
```

Shows added, removed, and version-changed dependencies with color-coded output.

### `explain` — Analyze a single lockfile

```bash
npx lockfile-analyzer explain --path package-lock.json
npx lockfile-analyzer explain --path yarn.lock
```

Displays dependency counts, file size, format version, and top 5 largest dependencies.

### `pr-comment` — Generate PR comment markdown

```bash
npx lockfile-analyzer pr-comment --base package-lock.json --head package-lock.json > lockfile-changes.md
```

Outputs formatted markdown for PR comments with security warnings.

## Features

- Supports package-lock.json (npm v1/v2/v3) and yarn.lock (v1/v2/v3)
- Groups by direct vs transitive dependencies
- Detects integrity changes (package-lock.json)
- Colorized table output
- JSON export for automation
- Markdown export for PR comments

## Examples

```
$ npx lockfile-analyzer diff --base package-lock.json --head package-lock.json

 Dependency         Type         Change
─────────────────────────────────────────────────────────────
 lodash             Direct       4.17.21 → 4.17.22
 axios              Direct       Removed
 react              Transitive   18.2.0 → 18.3.0
 @types/node        Transitive   Added (new)

Summary: 3 changed, 1 added, 1 removed
```

## License

MIT
