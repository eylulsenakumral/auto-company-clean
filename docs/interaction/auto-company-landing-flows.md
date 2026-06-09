# Auto Company Landing Page — Interaction Flows & Specifications

**Designer:** interaction-cooper (Alan Cooper)
**Date:** 2025-06-09
**Version:** 1.0

---

## 1. Primary Persona

### "Task-Driven Taner"

**Demographics:**
- 28-35 years old, full-stack developer
- Works at a mid-sized SaaS company or runs freelance projects
- Comfortable with CLI tools, npm, and terminal workflows
- Values time — has too many problems to solve and too little time

**Experience Goals:**
- "I want to feel like I'm making progress, not hunting for tools"
- "I don't want to read marketing copy — just tell me what it does"
- "I want to trust this tool before I install it"

**End Goals:**
1. Find a tool that solves a specific problem (e.g., "I need to detect flaky tests")
2. Quickly understand if the tool fits their workflow
3. Install and try it with minimal friction
4. Get back to actual work

**Life Goals:**
- Build reliable, maintainable software
- Stay current without drowning in new tools
- Ship confidently

---

## 2. Core Principle: Scan → Select → Install

The landing page is not a marketing page. It's a **tool discovery interface**. Every interaction serves the goal: "Get Taner from problem to install command as fast as possible."

### The Golden Path

```
[LAND] → [SCAN] → [SELECT] → [COPY] → [EXIT]
         ↑        ↑         ↑        ↑
      See all   Preview   Copy cmd   Back to
      tools    details   instantly  work
```

**Time to Install (TTI) Target:** Under 15 seconds from landing to copied install command.

---

## 3. User Flow Diagrams

### 3.1 Discovery Flow (Primary Entry)

```
┌─────────────────────────────────────────────────────────────────┐
│                    LANDING: HERO SECTION                        │
│  "CLI tools that solve real problems. Find what you need."      │
│                                                                │
│  [                      Search Box                             ]  ← Focus on load
│  "Search by problem, name, or keyword..."                     │
│                                                                │
│  Category Pills: [All] [Security] [Testing] [Performance]      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PRODUCT GRID                                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │flaky-test    │ │api-security  │ │bundle-size   │            │
│  │detector      │ │scanner       │ │analyzer      │            │
│  ├──────────────┤ ├──────────────┤ ├──────────────┤            │
│  │Detect flaky  │ │Scan Express   │ │Analyze       │            │
│  │tests by...   │ │routes for... │ │bundle sizes  │            │
│  │              │ │              │ │              │            │
│  │[npm i -g]    │ │[npm i -g]    │ │[npm i -g]    │            │
│  │[Copy]        │ │[Copy]        │ │[Copy]        │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                │
│  Sort: [Newest ▼]  |  Filter: [Category] [Tags]               │
└─────────────────────────────────────────────────────────────────┘
         │                              │
         │                              ▼
         │                    ┌──────────────────┐
         │                    │  FILTER PANEL    │
         │                    │  (Optional)      │
         │                    │  □ Security      │
         │                    │  □ Testing       │
         │                    │  □ Performance   │
         │                    └──────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      QUICK VIEW (Hover/Click)                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ flaky-test-detector v0.1.0                                │ │
│  │ Detect flaky tests by running test suites multiple...    │ │
│  │                                                            │ │
│  │ npm install -g flaky-test-detector                       │ │
│  │ [Copy to clipboard]  [View Details →]  [GitHub ↗]        │ │
│  │                                                            │ │
│  │ Tags: testing, ci, jest, vitest, pytest                    │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**States:**
1. **Initial Load:** All products visible, search box focused, sorted by Newest
2. **Typing in Search:** Real-time filtering, show matching count (e.g., "5 of 31 tools")
3. **Category Selection:** Replace grid with filtered results, show "Clear filters" button
4. **Hover Product Card:** Quick view overlay with description + copy button

---

### 3.2 Product Detail Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCT DETAIL PAGE                          │
│                                                                │
│  # flaky-test-detector                                         │
│  v0.1.0 • Published 2 days ago • MIT License                   │
│                                                                │
│  Detect flaky tests by running test suites multiple times     │
│  and analyzing pass/fail patterns. Supports Jest, Vitest,    │
│  and pytest.                                                   │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ $ npm install -g flaky-test-detector                     │  │
│  │                                                          │  │
│  │ [Copy Command] [View on npm] [View on GitHub]          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ## Usage                                                      │
│  ```bash                                                       │
│  $ flaky-detect --runs***REMOVED***5                                        │
│  Running test suite 5 times...                                  │
│  Found 2 flaky tests:                                          │
│    - test_user_login (3/5 passed)                              │
│    - test_payment_flow (2/5 passed)                            │
│  ```                                                           │
│                                                                │
│  ## Use Cases                                                  │
│  • CI/CD pipelines — fail build on flaky test detection       │
│  • Pre-commit hooks — catch flakes before push               │
│  • Test suite debugging — identify unreliable tests          │
│                                                                │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐     │
│  │  Related      │  │  Similar      │  │  Category     │     │
│  │  Tools        │  │  Tools        │  │  Navigation   │     │
│  └───────────────┘  └───────────────┘  └───────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

**States:**
1. **View Detail:** Full product info, installation command highlighted
2. **Copy Clicked:** "Copied!" feedback (2 seconds), command copied to clipboard
3. **External Link:** Open GitHub/npm in new tab, landing page stays open

---

### 3.3 Search Flow with Autocomplete

```
┌─────────────────────────────────────────────────────────────────┐
│                    SEARCH INTERACTION                           │
│                                                                │
│  [              flaky te...                ]                   │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🔍 flaky test detector                                     │  │
│  │    Detect flaky tests by running...                       │  │
│  │    npm i -g flaky-test-detector                          │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ 🔍 test coverage diff                                     │  │
│  │    Compare test coverage between...                      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ 🔍 Test (category)                                         │  │
│  │    View all 8 testing tools                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  Keyboard: [↑↓] Navigate | [Enter] Select | [Esc] Close       │
└─────────────────────────────────────────────────────────────────┘
```

**States:**
1. **Input Active:** Show autocomplete after 2 characters
2. **Navigate Results:** Arrow keys move selection, highlight active
3. **Select:** Enter key opens product detail, closes dropdown
4. **No Results:** Show "No tools found" + suggest browsing by category

---

### 3.4 Category Navigation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CATEGORY BROWSE                              │
│                                                                │
│  Categories:                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🔒 Security (7 tools)                                    │  │
│  │   api-security-scanner, serverless-security-scanner...  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ 🧪 Testing (6 tools)                                     │  │
│  │   flaky-test-detector, test-coverage-diff...           │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ ⚡ Performance (5 tools)                                 │  │
│  │   bundle-size-analyzer, perf-budget-cli...             │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ 🗄️ Database (4 tools)                                  │  │
│  │   migration-validator, dep-breakage-detector...        │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ 🚀 DevOps (9 tools)                                     │  │
│  │   dockerfile-linter, ci-config-validator...             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  [View All Tools]                                              │
└─────────────────────────────────────────────────────────────────┘
```

**States:**
1. **Browse Categories:** Expandable accordion, shows tool count
2. **Click Category:** Filter grid to category, update URL with query param
3. **Shareable URL:** `/?category***REMOVED***security` — direct link to filtered view

---

## 4. Interaction Patterns

### 4.1 Filter by Category/Tag

**Pattern:** Pills + Combined Filters

```
[Security] [Testing] [Performance] [Database] [DevOps] [+ Custom Tag]
    ↓          ↓          ↓             ↓           ↓
   Toggle     Toggle     Toggle        Toggle      Toggle
```

**Behavior:**
- Click pill → Toggle filter (add/remove)
- Multiple filters active ***REMOVED*** AND logic (show tools matching ALL)
- Filter count badge shows active filters: "Filters (3)"
- "Clear all" button appears when 1+ filters active

**Visual Feedback:**
- Active filter: Solid color, white text
- Inactive filter: Outline, brand color
- Filter count updates in real-time as grid filters

---

### 4.2 Sort Options

**Pattern:** Dropdown with preserved selection

```
Sort: [Newest ▼]
        ├── Newest (default)
        ├── Popular (npm downloads)
        ├── Recently Updated
        └── Name A-Z
```

**Behavior:**
- Selection persists across category changes
- URL updates: `/?sort***REMOVED***popular`
- Sort applies to currently filtered results only

**Error Prevention:** No sort option is ever "disabled" — all options work on any result set.

---

### 4.3 Quick Copy to Clipboard

**Pattern:** One-click copy with non-intrusive feedback

```
[npm install -g flaky-test-detector] [Copy]
                                              ↓
                                        Click once
                                              ↓
┌──────────────────────────────────────────────────────────────┐
│ [✓ Copied!]                                                    │
└──────────────────────────────────────────────────────────────┘
        ↓
  Auto-dismiss after 2s
```

**Behavior:**
- Single click ***REMOVED*** instant copy
- No modal, no "Are you sure?"
- Toast notification appears near button (not center screen)
- Button shows "Copied!" state briefly

**Accessibility:**
- Keyboard: Tab to button, Enter/Space to copy
- Screen reader: "Copy install command to clipboard" + "Copied" announcement

---

### 4.4 External Links

**Pattern:** New tab, stay on landing page

```
[GitHub ↗] [npm ↗]
```

**Behavior:**
- All external links open in new tab (`target***REMOVED***"_blank"`)
- Landing page remains open — Taner can browse more tools
- Icon indicator (↗) signals "leaves site"

**Security:**
- `rel***REMOVED***"noopener noreferrer"` on all external links

---

## 5. Navigation Structure

### 5.1 Primary Nav

```
┌─────────────────────────────────────────────────────────────────┐
│  Auto Company     [Tools]     [About]     [GitHub]              │
│       ↑              ↑           ↑           ↑                  │
│    Home        Product list    Context    External (new tab)  │
└─────────────────────────────────────────────────────────────────┘
```

**Current Page Indicator:** Underline or bold text on active nav item.

---

### 5.2 Breadcrumbs

Only needed on Product Detail page:

```
Tools > flaky-test-detector
  ↑           ↑
 All     Current product
```

**Behavior:** Click "Tools" → return to previous filter state (e.g., if user came from "Security" category filter, restore it).

---

### 5.3 Footer Navigation

```
[About] • [Privacy] • [Terms] • [Contact] • [RSS]
```

Minimal, non-intrusive, legal/compliance only.

---

## 6. Filtering & Sorting Requirements

### 6.1 Category Taxonomy

Based on product keyword analysis:

| Category        | Description                        | Example Tools                      |
|-----------------|------------------------------------|-----------------------------------|
| Security        | Scanning, linting, vulnerability  | api-security-scanner, secret-leak-scanner |
| Testing         | Test runners, coverage, flaky     | flaky-test-detector, test-coverage-diff |
| Performance     | Bundle size, budgets, profiling   | bundle-size-analyzer, perf-budget-cli |
| Database        | Migrations, validation, queries   | migration-validator, dep-breakage-detector |
| DevOps          | CI/CD, Docker, K8s, config       | dockerfile-linter, ci-config-validator |
| Git             | Commits, branches, workflows     | commit-lint-cli, git-conflict-resolver |
| Developer Tools | CLI utilities, helpers, formatters | depsearch, npm-run-info |

**Fallback:** Uncategorized → Show in "All" but not in category filters.

---

### 6.2 Tag System

**Source:** Extract from `package.json` keywords field.

**Display:**
- Max 5 tags shown per product card
- Click tag ***REMOVED*** add to filter (OR logic within tags, AND with categories)
- Tag cloud in sidebar shows top 20 tags by frequency

**Example Tag Flow:**
```
Click "pytest" tag →
  Filter grid to tools with "pytest" keyword OR
  Combine with active category filter (if set)
```

---

### 6.3 Sorting Logic

| Sort Option    | Implementation                    | Fallback                  |
|----------------|----------------------------------|---------------------------|
| Newest         | `package.json` version compare  | Creation date (git)       |
| Popular        | npm downloads (API)              | Randomize (no API access) |
| Recently Updated | git commit timestamp           | Package publish date      |
| Name A-Z       | Alphabetical by package name     | Case-insensitive         |

**Default:** Newest (most recently published/updated).

---

## 7. Responsive Behavior

### 7.1 Mobile (< 640px)

- Product grid: 1 column
- Search: Full-width, sticky at top
- Filters: Horizontal scroll pill bar
- Detail page: Stack layout, tabs for sections

### 7.2 Tablet (640px - 1024px)

- Product grid: 2 columns
- Search: Full-width
- Filters: Pill bar + expandable "More filters"
- Detail page: Side-by-side layout

### 7.3 Desktop (> 1024px)

- Product grid: 3 columns
- Search: Centered, max-width 600px
- Filters: Sidebar with category tree
- Detail page: Content max-width 800px, centered

---

## 8. Performance & Loading States

### 8.1 Initial Load

**Perceived Performance:**
1. Show skeleton grid immediately (no layout shift)
2. Load first 12 products, render
3. Lazy-load remaining products as scroll

**Skeleton Design:**
```
┌──────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓  │  Shimmer animation
│ ▓▓▓▓▓▓▓▓      │
│ ▓▓▓▓▓▓▓▓▓▓▓▓  │
└──────────────┘
```

### 8.2 Filter/Sort Updates

- No loading spinner (local filtering is instant)
- If external API (npm stats), show skeleton for affected data only

### 8.3 Search Debouncing

- Wait 300ms after last keystroke before filtering
- Show "Filtering..." text only if delay > 500ms

---

## 9. Error Handling

### 9.1 No Results

```
┌─────────────────────────────────────────────────────────────────┐
│  No tools found for "xyz123"                                    │
│                                                                │
│  Try:                                                          │
│  • Clearing filters                                            │
│  • Browsing by category: [Security] [Testing] [Performance]    │
│  • Searching for a problem: "test flakiness"                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 External API Failure

**npm stats down:**
- Silently fall back to "Popular" ***REMOVED*** random order
- No error message to user (graceful degradation)

**GitHub API down:**
- Show tool info, omit star count/activity
- No error banner

---

## 10. Accessibility Requirements

### 10.1 Keyboard Navigation

- `Tab` → Focus through interactive elements
- `Enter/Space` → Activate buttons/links
- `Escape` → Close autocomplete/modal
- `Arrow keys` → Navigate autocomplete results

### 10.2 Screen Reader Support

- Product cards: `aria-label` with name + description
- Filter changes: Announce "Showing X of Y tools"
- Copy feedback: `aria-live` announcement
- Focus management: Return focus after modal closes

### 10.3 Color & Contrast

- WCAG AA minimum contrast ratios
- Focus indicators: 2px outline, brand color
- Not color-dependent: Use icons + labels

---

## 11. Metrics to Track

**User Behavior:**
1. Time to first install command copy
2. Filter usage by category
3. Search vs. browse ratio
4. External click-through (GitHub/npm)

**Technical:**
1. Initial render time (< 2s target)
2. Time to interactive (< 3s target)
3. Filter/sort latency (target: < 100ms local)

---

## 12. Implementation Notes for ui-duarte & fullstack-dhh

### 12.1 Component Breakdown

```
LandingPage
├── Hero (search + category pills)
├── ProductGrid
│   ├── ProductCard (repeated)
│   │   ├── QuickView (hover)
│   │   └── InstallCommand (copy)
│   └── FilterBar
└── ProductDetail (separate route)
    ├── Header
    ├── InstallCommand
    ├── Usage
    ├── UseCases
    └── RelatedTools
```

### 12.2 State Management

**Minimal state:**
- `searchQuery`: string
- `activeCategories`: string[]
- `activeTags`: string[]
- `sortBy`: 'newest' | 'popular' | 'updated' | 'name'

**URL as source of truth:**
- All state reflected in URL query params
- Back button restores previous state
- Shareable links work

### 12.3 Data Shape

```typescript
interface Product {
  name: string;
  version: string;
  description: string;
  installCommand: string;
  category: Category;
  tags: string[];
  githubUrl?: string;
  npmUrl?: string;
  publishedAt: Date;
  updatedAt: Date;
}
```

---

## 13. Anti-Patterns to Avoid

❌ **Modal on detail page** — Use separate route, shareable URL
❌ "Confirm copy" dialog — Copy instantly, undo not needed
❌ Marketing fluff in descriptions — One sentence, problem-focused
❌ Pagination — Infinite scroll or "Load more" (31 tools fits on one page)
❌ Hidden filters — Always visible, always accessible
❌ "Sign up to see more" — No gatekeeping, tools first

---

## 14. Success Criteria

**Taner can:**
1. Land on page and immediately know what the site is for
2. Type "flaky" and see the flaky test detector in < 2 seconds
3. Click a product card and see the install command
4. Copy the install command in one click
5. Get back to browsing all tools without page reload
6. Share a link to a filtered view with a teammate

**Time metrics:**
- Landing to copied install command: < 15 seconds
- Search results appear: < 300ms after typing stops
- Filter update: < 100ms

---

## Appendix A: URL Design

```
/                          # All tools, default sort
/?category***REMOVED***security       # Security tools only
/?category***REMOVED***security&sort***REMOVED***popular  # Security tools, sorted by popularity
/?search***REMOVED***flaky             # Search results
/flaky-test-detector       # Product detail page
```

---

## Appendix B: Copy Guidelines

**Product description (max 100 chars):**
- Focus on problem solved, not features
- Use active voice: "Detect X" not "X detection"
- Avoid marketing words: "powerful," "revolutionary," "best"

**Example:**
- ✅ "Detect flaky tests by running test suites multiple times"
- ❌ "The most powerful flaky test detection tool"

---

*End of Specification*
