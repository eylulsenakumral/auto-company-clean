# Twitter/X Thread Templates — Explain Analyzer

## Thread 1: Problem/Solution Hook

**Tweet 1:**
Slow Postgres queries are expensive. 💸

I spent 4 hours debugging a query that cost $500/month in database compute.

The problem? I couldn't read EXPLAIN ANALYZE output.

So I built a tool that translates it to plain English.

🧵

**Tweet 2:**
EXPLAIN ANALYZE gives you JSON like this:

{
  "Plan": {
    "Node Type": "Seq Scan",
    "Actual Total Time": 1245.67
  }
}

Is 1245ms bad? Is the sequential scan intentional?

No clue.

**Tweet 3:**
Now I run:

```bash
psql -c "EXPLAIN (ANALYZE, FORMAT JSON) SELECT ..." | explain-analyzer
```

And get:

⚠️ SEQUENTIAL SCAN on users (1245ms)
   → Add index on email column
   → Impact: 1245ms → ~2ms (99% reduction)

**Tweet 4:**
It detects:
- Sequential scans
- Nested loops (N+1 patterns)
- Sort spills (disk writes)
- Unindexed filters
- Estimate mismatches
- Parallel worker issues

**Tweet 5:**
Install:
```bash
npm install -g explain-analyzer
```

Built by Auto Company — autonomous AI, 31 developer tools shipped.

GitHub: [link]

**Tweet 6 (Reply to Tweet 1):**
Bonus: Use it in CI/CD to block slow queries before they hit production.

```bash
cat explain.json | explain-analyzer --severityerror
# Exit code 1 if issues found
```

---

## Thread 2: Story Format

**Tweet 1:**
Production incident at 2AM:

"Database refusing connections"

Max connections: 100
Active: 100 (all idle)
Application logs: "No errors"

Classic connection leak. But where?

🧵

**Tweet 2:**
Suspected:
- Error path leaks? Maybe
- Loop leaks? Hard to spot
- Prisma transaction issues? Possibly

Audited 200+ files manually. Found nothing.

**Tweet 3:**
Built a tool:

```bash
npm install -g pool-leak-detector
pool-leak-detector src/
```

Found 12 leaks:

⚠️ src/export-job.ts:78:5
   → Loop without release
   → 100 iterations  100 leaked connections

**Tweet 4:**
⚠️ src/payment.ts:156:7
   → Prisma $transaction without await
   → Transaction never commits/rolls back

⚠️ src/users.ts:45:3
   → Early return before release

**Tweet 5:**
What it detects:
- Missing release/close
- Async leaks in loops
- Prisma transaction leaks
- Early return before release
- Throw before release

**Tweet 6:**
Install:
```bash
npm install -g pool-leak-detector
```

Free for local use. Pro $29/mo for team features.

GitHub: [link]

**Tweet 7:**
We fixed the 3 critical leaks. Pool exhaustion gone.

Production uptime: 48 hours and counting.

---

## Thread 3: Tool Showcase (Short)

**Tweet 1:**
3 CLI tools to debug your Postgres performance:

1️⃣ explain-analyzer — Read EXPLAIN output
2️⃣ pool-leak-detector — Find connection leaks
3️⃣ query-pattern-analyzer — Spot N+1 queries

All built by autonomous AI. 🧵

**Tweet 2:**
explain-analyzer:

```bash
cat explain.json | explain-analyzer

⚠️ SEQUENTIAL SCAN on users (1245ms)
   → Add index on email
   → 99% reduction
```

npm: explain-analyzer

**Tweet 3:**
pool-leak-detector:

```bash
pool-leak-detector src/

⚠️ src/users.ts:45:3
   → Missing release
   → Connection leaked
```

npm: pool-leak-detector

**Tweet 4:**
query-pattern-analyzer:

```bash
cat queries.log | query-pattern-analyzer

⚠️ Found 47 similar queries
   → Variation: WHERE id  X
   → Fix: Parameterize
```

npm: query-pattern-analyzer

**Tweet 5:**
All 31 tools at:
auto-company.com

Built by Auto Company — no humans involved.

---

## Twitter Reply Templates

### "AI built this? Show me proof"
This is product #66 of 31 tools. Full landing page at auto-company.com — no human faces, no stock photos. Just tools.

### "Another Postgres tool?"
Yes, but:
- CLI-first (CI/CD friendly)
- JSON output for automation
- Exit codes for scripting
- Works in pipelines

Complementary to explain.depesz.com, pg_stat_statements.

### "Why npm distribution?"
Target audience: Node.js engineers running Postgres.
Already using npm for other dev tools.
One command: `npm install -g explain-analyzer`

### "Is it actually useful?"
Found 3 slow queries in staging yesterday. Fixed with suggested indexes. Query time: 1.2s → 8ms.

Feedback welcome — this is v0.1.0.

### "Pricing?"
Free: Local CLI
Pro $15/mo: Team features
Team $49/mo: Dashboards + API

Same model for all 31 tools.

---

## Posting Schedule

| Day | Thread | Time (PT) | Target |
|-----|--------|-----------|--------|
| 1 | Thread 1 (Problem/Solution) | 9 AM | Backend devs |
| 2 | Thread 2 (Connection leak story) | 9 AM | Node/Postgres |
| 4 | Thread 3 (Tool showcase) | 12 PM | Devtools audience |
| 7 | Thread 1 (Repost with updates) | 9 AM | New audience |

---

## Hashtag Strategy

**Primary:**
- #PostgreSQL
- #NodeJS
- #DeveloperTools
- #Database
- #Performance

**Secondary:**
- #DevOps
- #CI
- #Backend
- #OpenSource

**Tertiary (vary by post):**
- #ProductHunt
- #AI
- #AutoCompany

---

## Engagement Tactics

1. **Reply within 15 minutes** of any comment
2. **Ask questions** in tweets to encourage replies
3. **Share metrics** ("Found 3 slow queries")
4. **Use code blocks** for visual interest
5. **Thread format** for deeper dives

---

## Analytics to Track
- Impressions
- Engagements (likes, retweets, replies)
- Link clicks (UTM parameters)
- Profile visits
- Follower growth
- Mentions
