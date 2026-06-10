# AI Slop Detector

![GitHub stars](https://img.shields.io/github/stars/eylulsenakumral/auto-company-clean?style=social)
![License](https://img.shields.io/github/license/eylulsenakumral/auto-company-clean)
![npm](https://img.shields.io/npm/v/ai-slop-detector?label=npm)

A heuristic-based CLI tool to detect AI-generated code slop. No AI required - just statistics and pattern analysis.

**Repository:** [github.com/eylulsenakumral/auto-company-clean](https://github.com/eylulsenakumral/auto-company-clean/tree/main/projects/ai-slop-detector)

## Why?

AI-generated code often has telltale signs:
- Generic, low-entropy comments ("TODO: Implement this", "This function handles X")
- Inconsistent naming patterns mixed together
- Unusually uniform formatting
- Excessive or minimal commenting
- Repeated code structures

This tool uses pure heuristics to flag suspicious files.

## Installation

### Option 1: Direct from GitHub (Recommended)

No token required. Clone and install:

```bash
git clone https://github.com/eylulsenakumral/auto-company-clean.git
cd auto-company-clean/projects/ai-slop-detector
npm install -g .
```

### Option 2: npm

```bash
npm install -g ai-slop-detector
```

Or use directly with npx:

```bash
npx ai-slop-detector analyze <file>
```

## Usage

```bash
# Basic usage
slop <file-or-directory>

# Examples
slop src/app.js              # Analyze single file
slop src/                    # Analyze directory
slop . --threshold 30        # Only show files scoring 30+
slop src/ --verbose          # Show detailed evidence
slop src/ --json             # Output as JSON
```

### Options

| Option | Description |
|--------|-------------|
| `-v, --verbose` | Show detailed evidence for each indicator |
| `-t, --threshold <n>` | Only show results above this score (default: 0) |
| `--json` | Output as JSON |
| `-h, --help` | Show help |
| `-V, --version` | Show version |

## Output Example

```
$ slop ./src

Analyzing 12 files...

🟡 MEDIUM SLOP DETECTED (max score: 45, avg: 18)

Top files:

src/utils/helper.ts
Score: 45/100 (medium)
────────────────────────────────────────
  [MEDIUM] generic-comments
    High proportion of generic comment patterns (8/15)
  [LOW] inconsistent-naming
    Multiple naming conventions detected without clear dominance

src/api/client.ts
Score: 35/100 (medium)
────────────────────────────────────────
  [LOW] high-comment-ratio
    Unusually high comment-to-code ratio

Run with --verbose for per-file breakdown
```

## Detection Heuristics

| Indicator | Description | Weight |
|-----------|-------------|--------|
| `generic-comments` | Generic TODO/FIXME/NOTE patterns | Medium (25) |
| `low-entropy-comments` | Repetitive/predictable comments | Medium (25) |
| `inconsistent-naming` | Mixed naming conventions | Low (10) |
| `generic-identifiers` | Generic names like `myData`, `temp` | Medium (25) |
| `uniform-formatting` | Unusually consistent line lengths | Low (10) |
| `repeated-patterns` | Duplicated code structures | Medium (25) |
| `excessive-spacing` | Too many empty lines | Low (10) |
| `high-comment-ratio` | Too many comments | Low (10) |
| `low-comment-ratio` | Too few comments | Low (10) |

**Score calculation:** Sum of indicator weights (max 100)

**Confidence levels:**
- **High:** 4+ indicators OR score >= 60
- **Medium:** 2-3 indicators OR score >= 30
- **Low:** < 2 indicators OR score < 30

## Programmatic Use

```typescript
import { analyzeFile, analyzeDirectory } from 'ai-slop-detector';

// Analyze a file
const result = analyzeFile('src/app.js');
console.log(result.score);        // 0-100
console.log(result.confidence);   // 'low' | 'medium' | 'high'
console.log(result.indicators);   // Array of indicators

// Analyze a directory
const results = analyzeDirectory('src/');
const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
```

## Limitations

This is a **heuristic tool**, not a definitive AI detector. It looks for patterns commonly found in AI-generated code, but:

- False positives: Clean code with consistent style may be flagged
- False negatives: Well-prompted AI code may pass detection
- Language support: Best for JavaScript/TypeScript/Python

Use it as a signal, not a verdict.

## License

MIT

## Contributing

Contributions welcome! Please read our contributing guidelines before submitting PRs.
