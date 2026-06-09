# flaky-test-detector

> Detect flaky tests by running test suites multiple times and analyzing pass/fail patterns

A CLI tool that identifies unreliable tests by running your test suite repeatedly and flagging tests that fail intermittently. Supports Jest, Vitest, Pytest, and custom test runners.

## Features

- **Multi-iteration detection** — Run tests N times to catch intermittent failures
- **Pattern analysis** — Identify common flakiness patterns (race conditions, order dependency, resource leaks)
- **Smart suggestions** — Get actionable fix recommendations for flaky tests
- **Multiple runners** — Built-in support for Jest, Vitest, Pytest, and custom runners
- **Configurable thresholds** — Set custom flakiness thresholds per project
- **JSON export** — Machine-readable output for CI/CD integration
- **Exit codes** — Script-friendly exit codes for automation

## Installation

```bash
npm install -g flaky-test-detector
```

Or use directly with npx:

```bash
npx flaky-test-detector detect
```

## Quick Start

```bash
# Run with defaults (10 iterations, 30% threshold)
flaky detect

# Custom iterations and threshold
flaky detect --iterations 20 --threshold 25

# Use custom test command
flaky detect --command "pnpm test:e2e"

# JSON output for CI/CD
flaky detect --json > flaky-report.json
```

## Commands

### `detect`

Run test suite N times and detect flaky tests.

```bash
flaky detect [options]
```

**Options:**

| Option | Alias | Default | Description |
|--------|-------|---------|-------------|
| `--iterations <n>` | `-i` | `10` | Number of times to run the test suite |
| `--threshold <%>` | `-t` | `30` | Flakiness threshold (0-100) |
| `--command <cmd>` | `-c` | `npm test` | Test command to execute |
| `--runner <type>` | `-r` | `jest` | Test runner: jest, vitest, pytest, custom |
| `--cwd <path>` | | `process.cwd()` | Working directory |
| `--timeout <ms>` | | `60000` | Timeout per test run |
| `--json` | | `false` | Output as JSON |
| `--verbose` | `-v` | `false` | Verbose output |

**Exit codes:**

- `0` — No flaky tests detected
- `1` — Flaky tests found
- `2` — Error occurred

### `report`

Display a previously saved report.

```bash
flaky report <file> [options]
```

### `analyze`

Run detailed pattern analysis with suspected causes.

```bash
flaky analyze [options]
```

Same options as `detect`, but provides detailed analysis of flakiness patterns and suggested fixes.

### `init`

Generate a `.flakyrc` configuration file.

```bash
flaky init [--force]
```

## Configuration

Create a `.flakyrc` file in your project root:

```json
{
  "iterations": 15,
  "threshold": 25,
  "testCommand": "vitest run",
  "runner": "vitest",
  "verbose": false,
  "timeout": 90000
}
```

## Output Examples

### Console Output

```
═══════════════════════════════════════════════════════════════
  Flaky Test Detector Report
═══════════════════════════════════════════════════════════════

Configuration:
  Iterations: 10
  Threshold: 30%
  Test Command: npm test

Summary:
  Total Runs: 10
  Total Duration: 45.23s
  Tests Analyzed: 42
  Flaky Tests: 3

Flaky Tests:

Test Name                                              | Fail/Total | Flakiness | Status
──────────────────────────────────────────────────────────────────────────────────
src/auth/login.spec.ts > login with invalid creds    |    4/10   |  40.0%  | FLAKY
src/api/users.spec.ts > create user                   |    5/10   |  50.0%  | FLAKY
src/components/Button.test.tsx > click handler        |    3/10   |  30.0%  | FLAKY
```

### JSON Output

```json
{
  "config": {
    "iterations": 10,
    "threshold": 30,
    "testCommand": "npm test"
  },
  "totalRuns": 10,
  "totalDuration": 45230,
  "flakyTests": [
    {
      "name": "src/auth/login.spec.ts > login with invalid creds",
      "file": "src/auth/login.spec.ts",
      "passCount": 6,
      "failCount": 4,
      "totalRuns": 10,
      "flakinessRate": 40.0,
      "isFlaky": true,
      "pattern": "PPFPFFPPFP"
    }
  ],
  "timestamp": "2026-06-09T12:34:56.789Z"
}
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Flaky Test Check
on: [push, pull_request]

jobs:
  flaky-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install -g flaky-test-detector
      - run: flaky detect --json --threshold 20 > report.json
      - uses: actions/upload-artifact@v4
        with:
          name: flaky-report
          path: report.json
```

### GitLab CI

```yaml
flaky-test-check:
  script:
    - npm install -g flaky-test-detector
    - flaky detect --iterations 20 --threshold 15
  allow_failure: true
```

## How It Works

1. **Run repeatedly** — Executes your test suite N times
2. **Track patterns** — Records pass/fail for each test per run
3. **Calculate flakiness** — Computes failure rate per test
4. **Flag suspect tests** — Highlights tests exceeding threshold
5. **Suggest fixes** — Analyzes patterns for common causes

## Common Flakiness Patterns

| Pattern | Cause | Fix |
|---------|-------|-----|
| `FPF` / `PFP` | Race condition / timeout | Add explicit waits, increase timeout |
| `F...P` | Test order dependency | Ensure isolation, clean fixtures |
| `PPPPF` | Resource leakage | Check handles, connections, memory |
| High rate | Async/await issues | Verify promises, error handling |

## License

MIT
