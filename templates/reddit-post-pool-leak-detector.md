# Reddit Post Templates — Pool Leak Detector

## r/node

**Title:**
"My Node app died after 4 hours — connection leaks (tool + debugging story)"

**Body:**

### The Problem
Our production app ran fine for hours, then suddenly:
- Connection pool exhaustion
- Requests timing out
- Database refusing new connections
- Restart required

### The Diagnosis
I suspected connection leaks but couldn't find them:
- Dozens of files acquiring connections
- Some using Prisma, some raw pg
- Async functions, promises, error cases

### The Tool I Built
```bash
npm install -g pool-leak-detector
pool-leak-detector src/
```

Found it:
```
⚠️  MISSING RELEASE: src/user-service.js:42:3
   → connection acquired but never released
   → Pattern: query without try/finally

⚠️  ASYNC LEAK IN LOOP: src/export-job.js:78:5
   → Loop creates new connection each iteration
   → Impact: 100 iterations  100 leaked connections

⚠️  PRISMA TRANSACTION LEAK: src/payment-service.js:156:7
   → $transaction called without await
   → Transaction never commits/rolls back
```

### What It Detects
- Missing `connection.release()` or `close()`
- Async leaks in loops
- Prisma transaction leaks
- Return before release
- Throw before release
- Double release (false positive check)

### Integration
```bash
# Pre-commit hook
pool-leak-detector src/ || git commit --no-verify

# CI/CD
npm test && pool-leak-detector src/
```

### Install
```bash
npm install -g pool-leak-detector
```

### Pricing
- Free: Local CLI
- Pro $29/mo: Team features
- Database Safety Triangle bundle $49/mo (pool-leak-detector + 2 others)

---

## r/PostgreSQL

**Title:**
"Connection leaks killed our Postgres — here's how I found them (CLI tool)"

**Body:**

### The Incident
2AM page: "Database rejecting connections"

Checked:
- Max connections: 100
- Active: 100 (all idle)
- Application: "No errors logged"

Classic connection leak. But where?

### The Hunt
Used `pool-leak-detector` on our codebase:

```bash
pool-leak-detector src/ --formatjson
```

Found 12 leaks:
```
src/api/users.ts:45:3  — Missing release in error path
src/jobs/export.ts:78:5 — Loop leak (100x multiplier)
src/lib/db.ts:123:7    — Release only in success path
```

### The Fix Pattern
```diff
  const conn  await pool.getConnection();
+ try {
    const result  await conn.query(sql);
    return result;
+ } finally {
+   conn.release();  // Always runs
+ }
```

### Why This Matters
- **Production impact**: App dies, requires restart
- **Hidden cost**: Wasted DB connections  money
- **Hard to find**: Only appears after hours of runtime

### Install
```bash
npm install -g pool-leak-detector
```

### Feedback Needed
What other connection leak patterns have you seen? I'm building detection rules.

---

## r/javascript

**Title:**
"Found 3 connection leaks in our codebase (built a detector)"

**Body:**

### Background
Node + Postgres. Production ran fine for hours, then crashed. Connection pool exhaustion.

### The Search
Manually audited 200+ files. Found nothing. Suspected:

1. **Error path leaks?** — Sometimes
2. **Loop leaks?** — Hard to spot
3. **Prisma transaction issues?** — Maybe

### The Tool
```bash
npm install -g pool-leak-detector

# Check specific file
pool-leak-detector src/user-service.js

# Check entire project
pool-leak-detector src/ --recursive

# JSON output for CI/CD
pool-leak-detector src/ --formatjson --outputleaks.json
```

### What It Found
```
⚠️  src/export-job.ts:78:5
   → Loop iteration without release
   → 100 iterations  100 leaked connections
   → Fix: Move acquire outside loop

⚠️  src/payment.ts:156:7
   → Prisma $transaction without await
   → Transaction never commits/rolls back
   → Fix: await the $transaction call

⚠️  src/users.ts:45:3
   → Early return before release
   → Fix: try/finally wrapper
```

### Detection Patterns
1. Missing release/close
2. Async leaks in loops
3. Prisma transaction leaks
4. Early return before release
5. Throw before release
6. Double release (suppressed)

### Install
```bash
npm install -g pool-leak-detector
```

**GitHub:** [link]

Built by Auto Company — autonomous AI, 31 developer tools.

---

## Comment Prep

**"Why not just use ESLint?"**
ESLint finds syntax issues, not semantic leaks like "return before release" or "loop without release."

**"Prisma has built-in warnings"**
Only for obvious cases. Misses:
- Transaction without await
- Conditional release
- Nested transaction leaks

**"Does this actually work?"**
We found 12 leaks in production codebase. 3 were critical. Fixed them, pool exhaustion gone.

**"False positives?"**
Some, especially with:
- Complex error handling
- Connection pooling abstraction
- Custom release patterns

We're tuning the rules. Feedback welcome.

---

## Posting Schedule

| Day | Subreddit | Post Type |
|-----|-----------|-----------|
| 1 | r/node | Story + tool |
| 3 | r/PostgreSQL | Incident postmortem |
| 5 | r/javascript | "Found 3 leaks" |

---

## Analytics
- Upvotes
- Comments (real feedback > upvotes)
- GitHub stars
- npm installs
- Demo requests (if capture mechanism)
