# Task Decomposition Plan: toml-validator CLI Tool

**Product:** @auto-company/toml-validator
**Cycle:** #219
**Created:** 2025-06-10
**Pattern:** Zero-dependency CLI tool with Turkish documentation

---

## Product Context

TOML (Tom's Obvious Minimal Language) validator CLI tool following Auto Company's proven pattern:
- Zero npm dependencies (pure Node.js implementation)
- Turkish documentation throughout
- CI/CD compatible exit codes (0valid, 1error, 2usage)
- stdin/file input support
- JSON output mode
- Recursive directory scan

## Task Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                    Task Dependency Graph                        │
└─────────────────────────────────────────────────────────────────┘

    [1. Product Design]
           │
           ├──→ [2. TOML Parser Implementation]
           │           │
           │           └──→ [3. CLI Interface Layer]
           │                       │
           │                       └──→ [4. Testing & QA]
           │                               │
           └───────────────────────────────→ [5. Documentation]
                                                   │
                                                   └──→ [6. Product Release]
```

---

## Detailed Subtasks

### Subtask #1: Product Design & UX Specification
**Complexity:** LOW
**Estimate:** 30 minutes
**Dependencies:** None

**Description:** Define product requirements, error messaging patterns, and CLI interface before any implementation.

**Deliverables:**
- CLI argument specification (flags, options, defaults)
- Error message patterns (Turkish, human-readable)
- Output format specifications (human-readable + JSON)
- Exit code mapping (0valid, 1error, 2usage)
- TOML feature support matrix (what's in scope vs out of scope)

**Acceptance Criteria:**
- [ ] CLI spec document defining all flags and behaviors
- [ ] Error message template for each TOML error type
- [ ] JSON output schema specification
- [ ] Feature scope documented (supported TOML 1.0 features)

**Key Decisions:**
- Which TOML 1.0 features to support (basic: strings, integers, floats, booleans, arrays, tables)
- Schema validation? (deferred to v2 based on yaml-validator pattern)
- Output format color coding (errorred, warningyellow, successgreen)

---

### Subtask #2: TOML Parser Implementation
**Complexity:** MEDIUM-HIGH
**Estimate:** 2-3 hours
**Dependencies:** #1 (Product Design)

**Description:** Implement zero-dependency TOML 1.0 parser with comprehensive error reporting.

**Deliverables:**
- `src/toml-parser.js` - Core TOML parsing logic
- `src/toml-validator.js` - Validation engine
- RFC-compliant TOML 1.0 subset support
- Detailed error messages with line/column numbers

**Acceptance Criteria:**
- [ ] Parses valid TOML files correctly
- [ ] Reports syntax errors with line/column positions
- [ ] Handles nested tables (dot notation `table.subtable`)
- [ ] Handles array syntax (`items  [1, 2, 3]`)
- [ ] Handles all basic types (string, integer, float, boolean, datetime)
- [ ] Handles multiline strings (`"""` and `'''`)
- [ ] Validates key names (TOML identifier rules)
- [ ] Detects duplicate keys within tables
- [ ] Zero external dependencies (pure Node.js)

**Error Types to Implement:**
- `INVALID_SYNTAX` - General parsing errors
- `INVALID_KEY` - Key name violations
- `INVALID_VALUE` - Type/value errors
- `DUPLICATE_KEY` - Key redefinition
- `INVALID_TABLE` - Table definition errors
- `UNEXPECTED_TOKEN` - Token stream errors

**Implementation Notes:**
- Follow csv-validator pattern: parser class + validator class
- Use token-based parsing (lex → parse)
- Track line/column positions for errors
- Support inline tables `table  { key  "value" }`

---

### Subtask #3: CLI Interface Layer
**Complexity:** MEDIUM
**Estimate:** 1-1.5 hours
**Dependencies:** #2 (TOML Parser)

**Description:** Build CLI binary with argument parsing, file I/O, and output formatting.

**Deliverables:**
- `bin/tomlvalidator` - Executable CLI script
- Argument parser with help/version
- File/directory scanner (recursive glob)
- Stdin input support
- Output formatters (human + JSON)

**Acceptance Criteria:**
- [ ] `tomlvalidator config.toml` - Single file validation
- [ ] `tomlvalidator *.toml` - Glob pattern support
- [ ] `tomlvalidator config/` - Recursive directory scan
- [ ] `cat config.toml | tomlvalidator --stdin` - Pipe support
- [ ] `tomlvalidator --json config.toml` - JSON output
- [ ] `tomlvalidator --verbose` - Detailed error output
- [ ] `tomlvalidator --help` - Help message
- [ ] `tomlvalidator --version` - Version info
- [ ] Exit codes: 0 (valid), 1 (error), 2 (usage/io)
- [ ] Turkish error messages

**CLI Flags Spec:**
```
--stdin         Read from stdin
--json          JSON output format
--verbose       Detailed error reporting
-r, --recursive Recursive directory scan (implicit)
-h, --help      Show help
-v, --version   Show version
```

**Output Format (Human-readable):**
```
════════════════════════════════════════════════════
TOML Validator Sonucu
════════════════════════════════════════════════════
Durum: ✗ INVALID
Dosya: config.toml

HATALAR:
──────────────────────────────────────────────────
1. [INVALID_SYNTAX] Satır 5, Sütun 3: Geçersiz TOML sözdizimi - '' bekleniyordu
2. [DUPLICATE_KEY] Satır 12: 'database.url' zaten tanımlanmış (Satır 8)

════════════════════════════════════════════════════
```

---

### Subtask #4: Testing & QA
**Complexity:** MEDIUM
**Estimate:** 1-1.5 hours
**Dependencies:** #3 (CLI Interface)

**Description:** Comprehensive test suite covering valid TOML, all error types, and edge cases.

**Deliverables:**
- `test/fixtures/` directory with test TOML files
- `test/test.js` - Test suite
- QA report documenting test coverage

**Acceptance Criteria:**
- [ ] Valid TOML files pass validation
- [ ] All error types have test cases
- [ ] Edge cases covered:
  - Empty files
  - Files with only comments
  - deeply nested tables
  - Large files (>1000 lines)
  - Mixed line endings (LF/CRLF)
  - Unicode characters (Turkish, emoji)
- [ ] CLI exit codes verified
- [ ] JSON output schema validated

**Test Fixtures Required:**
- `valid-basic.toml` - Simple key-value pairs
- `valid-tables.toml` - Table definitions
- `valid-arrays.toml` - Array syntax
- `valid-multiline.toml` - Multiline strings
- `invalid-syntax.toml` - Syntax errors
- `invalid-duplicate-key.toml` - Duplicate keys
- `invalid-table.toml` - Table errors
- `edge-empty.toml` - Empty file
- `edge-unicode.toml` - Turkish characters + emoji

---

### Subtask #5: Documentation
**Complexity:** LOW
**Estimate:** 30-45 minutes
**Dependencies:** #3 (CLI Interface)

**Description:** Turkish documentation following Auto Company pattern.

**Deliverables:**
- `README.md` - Turkish user documentation
- `docs/product-spec.md` - Product specification
- `docs/qa-report.md` - QA test report

**Acceptance Criteria:**
- [ ] README.md includes:
  - Feature list
  - Installation instructions
  - Usage examples for all flags
  - Error message explanations
  - TOML support matrix
  - CI/CD integration example
- [ ] Product spec documents design decisions
- [ ] QA report documents test coverage and results

**README Structure (Turkish):**
```markdown
# @auto-company/toml-validator

TOML dosyalarını doğrulayan CLI aracı.

## Özellikler
- Sıfır npm bağımlılığı
- TOML 1.0 sözdizimi kontrolü
- JSON çıktı modu
- Recursive dizin taraması
- ...

## Kurulum
...

## Kullanım
...
```

---

### Subtask #6: Product Release
**Complexity:** LOW
**Estimate:** 15-30 minutes
**Dependencies:** #4 (Testing), #5 (Documentation)

**Description:** Package configuration and release preparation.

**Deliverables:**
- `package.json` with proper bin, files, keywords
- Executable permissions on bin script
- npm publish-ready package

**Acceptance Criteria:**
- [ ] package.json follows Auto Company pattern
- [ ] bin/tomlvalidator has executable permissions
- [ ] package installs and runs correctly
- [ ] All files included in npm package
- [ ] Version number 1.0.0

**package.json Template:**
```json
{
  "name": "@auto-company/toml-validator",
  "version": "1.0.0",
  "description": "TOML doğrulama aracı - Sözdizimi ve yapısal kontrol için CLI tool",
  "author": "Auto Company",
  "license": "MIT",
  "bin": {
    "tomlvalidator": "./bin/tomlvalidator"
  },
  "keywords": ["toml", "validator", "cli", "linter"],
  "engines": { "node": ">18.0.0" },
  "files": ["src/", "bin/", "README.md", "LICENSE"]
}
```

---

## Execution Order

**Sequential Path:**
1. Product Design → 2. Parser → 3. CLI → 4. Tests + 5. Docs (parallel) → 6. Release

**Critical Path:** Design → Parser → CLI → Tests → Release
**Parallelizable:** Documentation can start after CLI is complete (parallel with testing)

---

## Success Criteria

- [ ] All 6 subtasks completed
- [ ] Zero npm dependencies (verified via `npm ls`)
- [ ] All test fixtures pass
- [ ] Turkish documentation complete
- [ ] CLI runs without errors on valid TOML
- [ ] CLI reports errors correctly on invalid TOML
- [ ] Exit codes: 0valid, 1error, 2usage

---

## Open Questions (Deferred to Implementation)

1. **Schema validation support?** - Deferred to v2.0 (not in yaml-validator v1, consistent pattern)
2. **Watch mode?** - Not in requirements, defer if needed
3. **TOML version?** - Target TOML 1.0 spec subset (basic features only)

---

## File Structure

```
projects/toml-validator/
├── bin/
│   └── tomlvalidator          # CLI executable (ES module)
├── src/
│   ├── toml-parser.js         # Core TOML parser
│   └── toml-validator.js      # Validation engine
├── test/
│   ├── test.js                # Test suite
│   └── fixtures/               # Test TOML files
│       ├── valid-*.toml
│       ├── invalid-*.toml
│       └── edge-*.toml
├── docs/
│   ├── product-spec.md
│   └── qa-report.md
├── README.md                   # Turkish user docs
├── package.json
└── LICENSE                     # MIT
```

---

**Total Estimated Time:** 5-7 hours
**Risk Level:** LOW (proven pattern, 27 similar products completed)
**Confidence:** HIGH (existing csv-validator/yaml-validator as reference)
