# api-security-scanner

CLI that scans Express/Fastify/NestJS routes and reports security issues.

## Installation

```bash
npm install -g api-security-scanner
```

## Usage

### Scan a project

```bash
api-security scan [path]
```

### Generate config

```bash
api-security init
```

Creates `.api-securityrc`:

```json
{
  "severity": "critical|warning|info",
  "ignore": ["node_modules", ".git", "dist"],
  "framework": "express|auto",
  "customChecks": []
}
```

### Options

```bash
api-security scan . --json                 # JSON output
api-security scan . -o report.json         # Write to file
api-security scan . -s critical            # Only critical issues
api-security report report.json            # View saved report
```

## Security Checks

| Check | Severity | Description |
|-------|----------|-------------|
| Auth Required | Critical | Routes without auth middleware |
| Open Endpoints | Warning | Publicly accessible routes |
| Rate Limiting | Warning | Missing rate limit middleware |
| Security Headers | Warning | Missing helmet middleware |
| Input Validation | Info | Routes without validation |
| SQL Injection | Critical | Raw query patterns |
| Secret Exposure | Critical | Hardcoded keys in files |

## Exit Codes

- `0` - No critical issues
- `1` - Critical issues found
- `2` - Error

## CI/CD Integration

```yaml
- name: Security Scan
  run: npx api-security-scanner scan .
```

## License

MIT
