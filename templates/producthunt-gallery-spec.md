# ProductHunt Gallery Specification — Explain Analyzer

## Overview
Visual assets for ProductHunt launch. Target: Professional, clear, instant value communication.

## Gallery Items (6 max)

### 1. Hero Screenshot — Main Interface
**Dimensions:** 1200x800px (16:10)
**Content:**
- Left: EXPLAIN JSON output (collapsed, messy)
- Arrow/transition
- Right: explain-analyzer output (clean warnings)
- Bottom: "PostgreSQL query explained in seconds"

**Style:**
- Dark theme (terminal aesthetic)
- Color: Warning badges (yellow/red) for issues
- Green for success/fixed
- Font: JetBrains Mono or similar

**Purpose:** Instant understanding of value prop

---

### 2. Before/After — Performance Fix
**Dimensions:** 1200x675px (16:9)
**Content:**
- Top half: "Before" — EXPLAIN output, 1245ms query time
- Bottom half: "After" — Same query with index, 2ms time
- Annotation: "Sequential scan → Index scan"

**Style:**
- Side-by-side comparison
- Red highlights on "Before" issues
- Green highlights on "After" improvements
- Arrow indicating transformation

**Purpose:** Demonstrate concrete value

---

### 3. Detection Patterns Showcase
**Dimensions:** 1200x800px
**Content:**
- Grid of 6 detection rules:
  1. Sequential Scan
  2. Nested Loop
  3. Sort Spill
  4. Filter Unindexed
  5. Estimate Mismatch
  6. Parallel Workers

- Each with icon + one-line description

**Style:**
- 2x3 grid layout
- Consistent icon style
- Color coding by severity

**Purpose:** Feature breadth

---

### 4. CI/CD Integration Example
**Dimensions:** 1200x500px
**Content:**
- GitHub Actions workflow YAML snippet
- Terminal output: "FAIL: Query exceeds threshold"
- explain-analyzer output inline

**Code snippet:**
```yaml
- name: Check query performance
  run: |
    psql -c "EXPLAIN ..." > explain.json
    cat explain.json | explain-analyzer --severityerror
```

**Style:**
- Syntax-highlighted code
- Terminal aesthetic
- Red "FAILED" badge

**Purpose:** Production use case

---

### 5. CLI Usage Demo
**Dimensions:** 1200x600px (animated GIF preferred, else static)
**Content:**
```bash
$ psql -c "EXPLAIN ..." | explain-analyzer

⚠️ SEQUENTIAL SCAN on users (1245ms)
   → Suggestion: Add index on email column
   → Impact: 1245ms → ~2ms (99% reduction)

⚠️ ESTIMATE MISMATCH: Planned 1000, Actual 50000
   → Cause: Statistics outdated
   → Action: ANALYZE users

✓ 2 issues found
```

**Style:**
- Terminal capture
- Color-coded output
- Scrolled to show all output

**Purpose:** Usability demonstration

---

### 6. Team/Dashboard Preview (Teaser)
**Dimensions:** 1200x600px
**Content:**
- "Team features coming soon"
- Mockup dashboard:
  - Query history timeline
  - Performance regression alerts
  - Team query review
- Pro/Team pricing callout

**Style:**
- Wireframe aesthetic
- "Coming Soon" badge
- Pricing: Pro $15/mo, Team $49/mo

**Purpose:** Upsell path

---

## Hero Image (Twitter/Social)

**Dimensions:** 1200x675px (16:9)
**Content:**
- Center: "explain-analyzer" logo/text
- Subtitle: "PostgreSQL EXPLAIN in plain English"
- Visual: Terminal window with warning badges
- CTA: "npm install -g explain-analyzer"

**Style:**
- Dark background
- Accent: Terminal green (#00FF00)
- Clean, minimalist
- Auto Company logo small in corner

---

## GIF Requirements

### GIF 1: Full Workflow (15 seconds)
**Sequence:**
1. User runs EXPLAIN command
2. JSON output appears
3. Pipe to explain-analyzer
4. Warnings appear
5. User applies suggested index
6. Re-run EXPLAIN
7. Performance improvement shown

**Specs:**
- 1200x800px
- 15 FPS (balance quality/size)
- < 5MB file size

---

### GIF 2: Detection Showcase (10 seconds)
**Sequence:**
1. Start with complex EXPLAIN JSON
2. explain-analyzer parses
3. 6 warnings appear in sequence
4. Each highlights a different issue

**Specs:**
- 1200x600px
- 10 FPS
- < 3MB file size

---

### GIF 3: CI/CD Fail (8 seconds)
**Sequence:**
1. GitHub Actions workflow runs
2. explain-analyzer check fails
3. Build stops
4. Developer sees warning
5. Fixes query
6. Build passes

**Specs:**
- 1200x600px
- 10 FPS
- < 3MB file size

---

## Production Notes

### Tools
- **Screenshots:** Terminalizer, Warp (native recording), or clean HTML mockups
- **GIFs:** Terminalizer + ffmpeg optimization
- **Static graphics:** Figma or Canva

### Color Palette
- Background: #1E1E1E (VS Code dark)
- Terminal text: #D4D4D4
- Warning badge: #FFC107 (amber)
- Error badge: #F44336 (red)
- Success badge: #4CAF50 (green)
- Accent: #00BCD4 (cyan)

### Typography
- Terminal: JetBrains Mono, Fira Code, or similar monospace
- UI: Inter, system-ui
- Headers: Bold, 18-24px
- Body: Regular, 14-16px

### Consistency
- Same terminal theme across all assets
- Same color scheme
- Auto Company branding consistent
- explain-analyzer name/verbiage consistent

---

## File Naming
```
screenshots/
  hero-main.png
  before-after.png
  detection-patterns.png
  cicd-integration.png
  cli-usage.png
  team-dashboard.png

gifs/
  full-workflow.gif
  detection-showcase.gif
  cicd-fail.gif

social/
  twitter-hero.png
  linkedin-hero.png
```

---

## Launch Day Checklist

**Pre-launch:**
- [ ] All screenshots captured
- [ ] GIFs created and optimized
- [ ] Hero image resized for multiple platforms
- [ ] Alt text written for each asset
- [ ] Assets uploaded to ProductHunt (24h before launch)

**Launch day:**
- [ ] First image visible in gallery
- [ ] All 6 gallery items populated
- [ ] GIFs auto-playing (supported browsers)
- [ ] Alt text descriptive

**Post-launch:**
- [ ] A/B test different hero images
- [ ] Update gallery based on feedback
- [ ] Add user-submitted screenshots/testimonials

---

## Asset Creation Timeline

**Week 1 (Auth-dependent):**
- Day 1: Install tools locally (no npm publish needed)
- Day 2: Capture terminal screenshots
- Day 3: Create GIF workflows
- Day 4: Build static graphics
- Day 5: Review and optimize

**Week 2 (Auth-independent):**
- Day 6: Alt text and metadata
- Day 7: ProductHunt upload (when auth available)
