# serverless-security-scanner

CLI that scans AWS Lambda functions (project code) and reports security issues.

## Installation

```bash
npm install -g serverless-security-scanner
```

## Usage

### Scan a project

```bash
serverless-security scan [path]
```

### Options

- `-s, --severity <level>` - Minimum severity (critical|warning|info). Default: warning
- `-o, --output <format>` - Output format (table|json). Default: table
- `-j, --json` - Output as JSON (alias for --output json)
- `-f, --file <path>` - Save report to file
- `--no-runtime` - Skip runtime deprecation checks

### Examples

```bash
# Scan current directory
serverless-security scan

# Scan with critical issues only
serverless-security scan ./my-lambda-app --severity critical

# Save JSON report
serverless-security scan ./my-lambda-app --file report.json

# Output JSON to stdout
serverless-security scan ./my-lambda-app --json

# Skip runtime checks
serverless-security scan ./my-lambda-app --no-runtime
```

### Report from file

```bash
serverless-security report <file>
```

### Generate config

```bash
serverless-security init
```

Creates `.serverless-securityrc` in the current directory.

## Configuration

`.serverless-securityrc` (JSON):

```json
{
  "severity": "warning",
  "ignore": ["node_modules", ".git", "dist", "build"],
  "framework": "auto",
  "checkRuntime": true
}
```

## Security Checks

| Check | Severity | Description |
|-------|----------|-------------|
| IAM Wildcard | Critical | Detects `Action: *` or `Resource: *` in IAM policies |
| IAM Admin | Critical | Detects AdministratorAccess or PowerUserAccess |
| Hardcoded Secrets | Critical | API keys, tokens, credentials in code |
| Public Exposure | Warning | API Gateway without authentication |
| Env Secrets | Warning | Secrets in environment variables |
| Excessive Timeout | Warning/Critical | High timeout values (60s+, 300s+) |
| Deprecated Runtime | Warning | Deprecated Lambda runtimes |

## Supported Frameworks

- AWS Serverless Framework (`serverless.yml`)
- AWS SAM (`template.yaml` / `template.yml`)
- Plain Lambda handlers (auto-detected)

## Exit Codes

- `0` - No critical issues found
- `1` - Critical issues found
- `2` - Error occurred

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Dev mode
npm run dev

# Run locally
npm run scan -- ./test-project
```

## License

MIT
