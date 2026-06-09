# migration-validator

Static analysis tool for database migrations. Detect destructive operations, lock risks, and schema drift before they reach production.

## Features

- **Zero dependency parsing** - Regex-based, no ORM dependencies
- **Multi-framework support** - Prisma, Django, Flyway, Raw SQL
- **7 validation categories** - Destructive ops, lock risks, rollback capability, data integrity, index impact, schema drift, breaking changes
- **CI/CD friendly** - Exit codes: 0 (no critical), 1 (critical found), 2 (error)
- **JSON export** - Machine-readable output for reports

## Installation

```bash
npm install -g migration-validator
# or
npm install migration-validator
```

## Quick Start

```bash
# Scan default migration directories
migration-validator scan

# Scan specific paths
migration-validator scan ./prisma/migrations ./db/migrations

# Output as JSON
migration-validator scan --json -o report.json

# Quiet mode - only show issues
migration-validator scan --quiet

# Table output
migration-validator scan --table
```

## Commands

### scan

Scan migration files for issues.

```bash
migration-validator scan [paths...] [options]
```

**Options:**
- `-j, --json` - Output as JSON
- `-o, --output <file>` - Write output to file
- `-q, --quiet` - Quiet mode - only show issues
- `-t, --table` - Output as ASCII table

**Exit codes:**
- `0` - No critical issues found
- `1` - Critical issues found
- `2` - Error occurred

### report

Generate detailed report from JSON scan result.

```bash
migration-validator report <file> [options]
```

**Options:**
- `-t, --table` - Output as ASCII table

### init

Initialize `.migration-validatorrc` config file.

```bash
migration-validator init [options]
```

**Options:**
- `-f, --force` - Overwrite existing config

## Validation Categories

| Category | Description | Default Severity |
|----------|-------------|------------------|
| `destructive` | DROP TABLE, DROP COLUMN, TRUNCATE | critical |
| `lock-risk` | Long-running UPDATE, DELETE, INDEX creation | warning |
| `rollback` | Missing rollback definition | warning |
| `data-integrity` | FK violations, NOT NULL without DEFAULT | warning |
| `index-impact` | Missing index on new columns | info |
| `breaking-change` | Type changes, renames | critical |
| `performance` | SELECT * in migrations | info |

## Configuration

Create `.migration-validatorrc` in your project root:

```json
{
  "severity": {
    "critical": ["destructive", "breaking-change"],
    "warning": ["lock-risk", "rollback", "data-integrity"],
    "info": ["index-impact", "performance"]
  },
  "ignore": ["rollback-missing-*"],
  "framework": "prisma",
  "paths": ["./prisma/migrations", "./database/migrations"]
}
```

## Framework Detection

The tool auto-detects migration frameworks:

- **Prisma** - `.sql` files with `-- CreateIndex`, `-- AlterTable`
- **Django** - `.py` files with `migrations.CreateModel`, `migrations.RunSQL`
- **Flyway** - Files matching `V<version>__<name>.sql` pattern
- **Raw SQL** - Files containing SQL keywords (CREATE, ALTER, DROP)

## Examples

### CI/CD Integration

```bash
# In your CI pipeline
migration-validator scan --quiet --json -o report.json
exit_code***REMOVED***$?
if [ $exit_code -eq 1 ]; then
  echo "Critical migration issues found!"
  cat report.json
  exit 1
fi
```

### GitHub Actions

```yaml
- name: Validate Migrations
  run: npx migration-validator scan --quiet
```

### Pre-commit Hook

```bash
#!/bin/bash
migration-validator scan || exit 1
```

## Output Examples

### Default Output

```
🔍 Migration Scan Results
Framework: prisma
Files scanned: 15
Issues found: 3

🔴 CRITICAL (1)
  [destructive]: Destructive operation: DROP TABLE - data loss risk
    └─ ./prisma/migrations/20240101_drop_users.sql:5
    └─ Code: DROP TABLE users;

🟡 WARNING (1)
  [rollback]: Missing rollback definition - manual recovery required
    └─ ./prisma/migrations/20240102_add_admin.sql

🟢 INFO (1)
  [index-impact]: Column "email" added without index - consider for query performance
    └─ ./prisma/migrations/20240103_add_email.sql:10

Summary: 1 critical, 1 warning, 1 info
```

### JSON Output

```json
{
  "framework": "prisma",
  "files": [...],
  "issues": [
    {
      "id": "destructive-drop-table-0",
      "severity": "critical",
      "category": "destructive",
      "message": "Destructive operation: DROP TABLE - data loss risk",
      "file": "./prisma/migrations/20240101_drop_users.sql",
      "line": 5,
      "code": "DROP TABLE users;",
      "framework": "prisma"
    }
  ],
  "summary": {
    "total": 3,
    "critical": 1,
    "warning": 1,
    "info": 1,
    "byCategory": {...}
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## License

MIT

## Contributing

Contributions welcome! Please read our contributing guidelines before submitting PRs.
