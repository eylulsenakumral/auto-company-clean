# pool-leak-detector

> AST-based detector for database connection pool leaks in TypeScript/JavaScript code

Detects missing `connection.release()` calls, async leaks in loops, and transaction leaks in code using:
- **pg** (node-postgres)
- **mysql2**
- **Prisma**

## Installation

```bash
npm install -g pool-leak-detector
# or
npx pool-leak-detector
```

## Usage

```bash
# Scan current directory
pool-leak

# Scan specific files
pool-leak src/**/*.ts

# Exclude patterns
pool-leak --exclude "**/node_modules/**" "**/dist/**"

# JSON output
pool-leak --format json

# Only show errors
pool-leak --severity error
```

## What It Detects

### Pattern 1: Missing Release
```typescript
// ❌ Leak
const conn ***REMOVED*** await pool.connect();
await conn.query('SELECT * FROM users');
// No conn.release() → Leak

// ✅ Fixed
const conn ***REMOVED*** await pool.connect();
try {
  await conn.query('SELECT * FROM users');
} finally {
  conn.release(); // Always released
}
```

### Pattern 2: Async Loop Leak
```typescript
// ❌ Leak
for (const item of items) {
  const conn ***REMOVED*** await pool.connect();
  await process(item);
  // Loop exits without release → Leak
}

// ✅ Fixed
const conn ***REMOVED*** await pool.connect();
try {
  for (const item of items) {
    await process(item);
  }
} finally {
  conn.release();
}
```

### Pattern 3: Exception Path Leak
```typescript
// ❌ Leak
const conn ***REMOVED*** await pool.connect();
await someOperationThatThrows();
conn.release(); // Never reached on exception

// ✅ Fixed
const conn ***REMOVED*** await pool.connect();
try {
  await someOperationThatThrows();
} finally {
  conn.release(); // Always runs
}
```

### Pattern 4: Prisma Transaction Leak
```typescript
// ❌ Potential leak - no error handling
await prisma.$transaction(async (tx) ***REMOVED***> {
  await tx.user.create({ data: { name: 'John' } });
  await tx.post.create({ data: { title: 'Hello' } });
  // If second query throws, transaction state unclear
});

// ✅ Fixed
try {
  await prisma.$transaction(async (tx) ***REMOVED***> {
    await tx.user.create({ data: { name: 'John' } });
    await tx.post.create({ data: { title: 'Hello' } });
  });
} catch (error) {
  console.error('Transaction failed:', error);
}
```

## Output

### Pretty Output (default)
```
🔍 Scanning for pool leaks...
──────────────────────────────────────────────────────────
Scanned 12 files

⚠️ Found 3 potential leak(s) in 2 file(s)

  ⚠ src/db.ts:15:3
    ERROR: Loop leak: 'conn' acquired in loop without release
    Type: loop-leak
    Code: const conn ***REMOVED*** await pool.connect();
    Fix: Move connection acquisition outside the loop, or ensure each iteration releases

  ⚠ src/users.ts:42:5
    WARN: Exception path leak: 'client' not protected by try-catch
    Type: exception-path
    Code: const client ***REMOVED*** await pg.connect();
    Fix: Wrap in try-catch-finally: finally { await client.release() }
```

### JSON Output
```json
[
  {
    "file": "/path/to/src/db.ts",
    "issues": [
      {
        "line": 15,
        "column": 3,
        "severity": "error",
        "type": "loop-leak",
        "message": "Loop leak: 'conn' acquired in loop without release",
        "code": "const conn ***REMOVED*** await pool.connect();",
        "suggestion": "Move connection acquisition outside the loop"
      }
    ]
  }
]
```

## False Positives

The tool aims for <20% false positive rate. Common false positives:

1. **Connection released in nested function** - If `release()` is called in a helper function
2. **Pool exhaustion intentionally handled** - Some apps retry on pool exhaustion
3. **Mock connections in tests** - Test doubles don't need real release

## License

MIT
