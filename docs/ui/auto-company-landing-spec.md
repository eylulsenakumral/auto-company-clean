# Auto Company Landing Page — Design Specification

**Version:** 1.0
**Designer:** ui-duarte (Matías Duarte)
**Date:** 2025-06-09
**Target Audience:** Developers, DevOps Engineers, CTOs

---

## 1. Design Philosophy

### Core Principles

**Material Minimalism for Developers**

The design follows GitHub's aesthetic philosophy: functional, minimal, and code-centric. Every element serves a purpose. No decoration without function.

- **Typography is the interface** — The visual hierarchy is established through type scale, not decoration
- **Dark mode native** — Designed dark-first, supporting the developer's natural habitat
- **Monospace as primary accent** — Code is the product, so code aesthetics permeate the design
- **Grid-based clarity** — Information density optimized for scanning, not staring

### Visual Hierarchy Strategy

```
Eyepath:
1. Hero Statement (H1) → Immediate value proposition
2. Primary CTA → "Explore Products"
3. Stats Strip → Social proof through numbers
4. Products Grid → The meat of the page
5. Philosophy Section → The why
6. Revenue Model → The how
```

---

## 2. Color System

### Dark Theme Palette (GitHub-Inspired)

```css
/* Surface & Background */
--bg-primary: #0d1117;        /* GitHub dark bg */
--bg-secondary: #161b22;      /* Cards, elevated surfaces */
--bg-tertiary: #21262d;       /* Borders, dividers, inputs */

/* Text Hierarchy */
--text-primary: #f0f6fc;      /* Headlines, important text */
--text-secondary: #8b949e;    /* Body text, descriptions */
--text-tertiary: #6e7681;    /* Metadata, timestamps */

/* Accent Colors */
--accent-primary: #58a6ff;    /* Links, CTAs, active states */
--accent-secondary: #238636;  /* Success, shipped status */
--accent-warning: #d29922;    /* Warnings, pending status */
--accent-error: #f85149;      /* Errors, critical alerts */

/* Monospace Accent */
--code-green: #3fb950;        /* Code blocks, success indicators */
--code-blue: #58a6ff;         /* Function names, links in code */
--code-purple: #bc8cff;       /* Keywords, special tokens */
--code-orange: #d29922;       /* Strings, literals */

/* Semantic Status */
--status-shipped: #238636;    /* Green */
--status-ready: #58a6ff;      /* Blue */
--status-pending: #d29922;    /* Yellow */
--status-planned: #6e7681;    /* Gray */
```

### Usage Guidelines

- **Primary CTAs**: `--accent-primary` background, `--bg-primary` text
- **Secondary CTAs**: Transparent with `--accent-primary` border
- **Product Tags**: `--bg-tertiary` background, `--text-secondary` text
- **Code Snippets**: Monospace with syntax highlighting colors

---

## 3. Typography System

### Font Families

```css
/* Primary: System UI (GitHub's approach) */
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI",
             "Noto Sans", Helvetica, Arial, sans-serif,
             "Apple Color Emoji", "Segoe UI Emoji";

/* Monospace: Developer-native */
--font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
             "Liberation Mono", monospace;
```

### Type Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--display-1` | 48px | 700 | 1.1 | Hero H1 (desktop) |
| `--display-2` | 40px | 700 | 1.15 | Hero H1 (tablet) |
| `--display-3` | 32px | 700 | 1.2 | Section headings |
| `--h1` | 24px | 600 | 1.25 | Page title |
| `--h2` | 20px | 600 | 1.3 | Card titles |
| `--h3` | 16px | 600 | 1.4 | Subsection titles |
| `--body` | 14px | 400 | 1.5 | Body text |
| `--caption` | 12px | 400 | 1.4 | Metadata, timestamps |
| `--mono-sm` | 12px | 400 | 1.4 | Code inline |
| `--mono-md` | 14px | 400 | 1.5 | Code blocks |

### Responsive Adjustments

```css
@media (max-width: 768px) {
  --display-1: 32px;
  --display-2: 28px;
  --display-3: 24px;
}
```

---

## 4. Spacing System

### 4px Grid Base

All spacing values follow the 4px grid, ensuring consistent rhythm.

```css
--space-0: 0px;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

### Component Spacing Patterns

| Component | Padding | Gap | Margin |
|-----------|---------|-----|--------|
| Hero Section | `--space-16` top/bottom | — | — |
| Product Card | `--space-4` | `--space-3` | — |
| Stats Strip | `--space-6` | `--space-8` | `--space-12` |
| Section | `--space-20` top/bottom | — | — |
| Button | `--space-3` `--space-5` | — | — |

---

## 5. Component Specifications

### 5.1 Hero Section

**Layout**: Centered, single column, max-width 1200px

```
┌─────────────────────────────────────────────┐
│              [Logo: Auto Company]           │
│                                             │
│   Autonomous AI Company                    │
│   Building Developer Tools                  │
│                                             │
│   45 shipped products  |  31 ready          │
│                                             │
│   [Explore Products]   [View on GitHub]     │
└─────────────────────────────────────────────┘
```

**Specifications:**

```css
.hero {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-20) var(--space-6);
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
}

.hero-title {
  font-size: var(--display-1);
  font-weight: 700;
  line-height: 1.1;
  color: var(--text-primary);
  margin-bottom: var(--space-4);
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: var(--h1);
  color: var(--text-secondary);
  margin-bottom: var(--space-8);
}

.hero-cta-group {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-6);
}
```

**Hero Copy Options:**

| Option | Headline | Subtitle |
|--------|----------|----------|
| A (Direct) | Autonomous AI Company Building Developer Tools | 45 products shipped. 31 ready to deploy. |
| B (Mission) | Make Money Legally. Build Real Demand. | Fully autonomous AI company shipping developer tools. |
| C (Technical) | 45 Developer Tools. Zero Humans. | Autonomous AI company building, testing, and shipping products. |

**Recommended**: Option A — Clear, value-focused, professional.

---

### 5.2 Stats Strip

**Layout**: Horizontal row, centered, responsive wrap

```css
.stats-strip {
  display: flex;
  justify-content: center;
  gap: var(--space-12);
  padding: var(--space-8) var(--space-6);
  background: var(--bg-secondary);
  border-top: 1px solid var(--bg-tertiary);
  border-bottom: 1px solid var(--bg-tertiary);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: var(--display-3);
  font-weight: 700;
  color: var(--accent-primary);
  font-family: var(--font-mono);
}

.stat-label {
  font-size: var(--body);
  color: var(--text-secondary);
  margin-top: var(--space-1);
}
```

**Content:**

```
45  → Products Shipped
31  → Distribution Ready
14  → AI Agents
$0  → Revenue (Honest)
```

---

### 5.3 Products Grid

**Layout**: Responsive grid, auto-fill with min-width

```css
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-4);
  padding: var(--space-12) var(--space-6);
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
```

**Product Card:**

```css
.product-card {
  background: var(--bg-secondary);
  border: 1px solid var(--bg-tertiary);
  border-radius: 6px;
  padding: var(--space-5);
  transition: all 150ms ease;
  cursor: pointer;
  position: relative;
}

.product-card:hover {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.product-status {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  font-size: var(--caption);
  font-family: var(--font-mono);
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  font-weight: 600;
}

.status-shipped {
  background: rgba(35, 134, 54, 0.15);
  color: var(--accent-secondary);
  border: 1px solid rgba(35, 134, 54, 0.4);
}

.status-ready {
  background: rgba(88, 166, 255, 0.15);
  color: var(--accent-primary);
  border: 1px solid rgba(88, 166, 255, 0.4);
}

.product-name {
  font-size: var(--h2);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  font-family: var(--font-mono);
}

.product-description {
  font-size: var(--body);
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: var(--space-4);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.product-tag {
  font-size: var(--caption);
  font-family: var(--font-mono);
  padding: 2px 6px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: 4px;
}
```

**Tag Categories:**

- **Category**: `cli`, `api`, `web`, `scanner`, `validator`, `automation`
- **Tech**: `node`, `python`, `rust`, `typescript`
- **Status**: `stable`, `beta`, `experimental`

---

### 5.4 Philosophy Section

**Layout**: Two-column on desktop, single on mobile

```css
.philosophy-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-12);
  padding: var(--space-20) var(--space-6);
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .philosophy-section {
    grid-template-columns: 1fr;
  }
}

.principle-item {
  margin-bottom: var(--space-6);
}

.principle-title {
  font-size: var(--h2);
  font-family: var(--font-mono);
  color: var(--accent-primary);
  margin-bottom: var(--space-2);
}

.principle-description {
  font-size: var(--body);
  color: var(--text-secondary);
  line-height: 1.6;
}

.principle-code {
  background: var(--bg-tertiary);
  padding: var(--space-3) var(--space-4);
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: var(--mono-sm);
  color: var(--code-green);
  margin-top: var(--space-2);
}
```

**Content:**

```
Ship > Plan > Discuss
If you can ship, do not over-discuss. Action at 70% information.

Ramen Profitability First
Revenue before vanity growth. Self-funding > VC dependency.

Boring Technology First
Proven tech unless new tech gives clear 10x upside.
```

---

### 5.5 Revenue Model Section

**Layout**: Feature comparison table

```css
.revenue-section {
  padding: var(--space-20) var(--space-6);
  max-width: 1000px;
  margin: 0 auto;
}

.pricing-table {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--space-4);
  margin-top: var(--space-8);
}

@media (max-width: 768px) {
  .pricing-table {
    grid-template-columns: 1fr;
  }
}

.pricing-column {
  background: var(--bg-secondary);
  border: 1px solid var(--bg-tertiary);
  border-radius: 6px;
  padding: var(--space-6);
  text-align: center;
}

.pricing-column.featured {
  border-color: var(--accent-primary);
  position: relative;
}

.pricing-title {
  font-size: var(--h1);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.pricing-price {
  font-size: var(--display-3);
  font-weight: 700;
  color: var(--accent-primary);
  font-family: var(--font-mono);
  margin-bottom: var(--space-4);
}

.pricing-features {
  list-style: none;
  padding: 0;
  text-align: left;
}

.pricing-feature {
  font-size: var(--body);
  color: var(--text-secondary);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--bg-tertiary);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.pricing-feature::before {
  content: "✓";
  color: var(--accent-secondary);
  font-family: var(--font-mono);
}
```

**Tiers:**

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Local execution, CLI tools, 100 API calls/day |
| **Pro** | $9/mo | Cloud execution, unlimited API calls, priority support |
| **Team** | $49/mo | Shared workspaces, team analytics, SSO |

---

## 6. Interactive Elements

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  padding: var(--space-3) var(--space-5);
  font-size: var(--body);
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 150ms ease;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-sans);
}

.btn-primary:hover {
  background: #79c0ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(88, 166, 255, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--accent-primary);
  border: 1px solid var(--bg-tertiary);
  padding: var(--space-3) var(--space-5);
  font-size: var(--body);
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 150ms ease;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-sans);
}

.btn-secondary:hover {
  border-color: var(--accent-primary);
  background: rgba(88, 166, 255, 0.1);
}
```

### Links

```css
a {
  color: var(--accent-primary);
  text-decoration: none;
  transition: color 150ms ease;
}

a:hover {
  color: #79c0ff;
  text-decoration: underline;
}

/* Code-style links */
.code-link {
  font-family: var(--font-mono);
  color: var(--code-blue);
  background: rgba(88, 166, 255, 0.1);
  padding: 2px 4px;
  border-radius: 4px;
}

.code-link:hover {
  background: rgba(88, 166, 255, 0.2);
  text-decoration: none;
}
```

---

## 7. Responsive Breakpoints

```css
/* Mobile First Approach */

/* Small phones */
@media (max-width: 480px) {
  --display-1: 28px;
  --display-3: 20px;
}

/* Tablets */
@media (min-width: 768px) {
  --display-1: 40px;
  --display-3: 28px;
}

/* Desktop */
@media (min-width: 1024px) {
  --display-1: 48px;
  --display-3: 32px;
}

/* Large desktop */
@media (min-width: 1440px) {
  .hero, .products-grid {
    max-width: 1400px;
  }
}
```

---

## 8. Accessibility

### Color Contrast

All combinations meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text):

| Foreground | Background | Ratio | Pass |
|------------|------------|-------|------|
| `--text-primary` on `--bg-primary` | 15.6:1 | AAA |
| `--text-secondary` on `--bg-primary` | 7.2:1 | AAA |
| `--accent-primary` on `--bg-primary` | 4.8:1 | AA |
| `--accent-primary` on itself | 2.8:1 | Fail (use white text) |

### Keyboard Navigation

```css
/* Focus states */
*:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Skip link for accessibility */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--accent-primary);
  color: var(--bg-primary);
  padding: 8px 16px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### Touch Targets

Minimum 44x44px for all interactive elements (WCAG AAA).

---

## 9. Animation Guidelines

**Principle**: Motion provides meaning, not decoration.

```css
/* Page load */
.fade-in {
  animation: fadeIn 300ms ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Stagger children */
.stagger-in > *:nth-child(1) { animation-delay: 0ms; }
.stagger-in > *:nth-child(2) { animation-delay: 50ms; }
.stagger-in > *:nth-child(3) { animation-delay: 100ms; }
/* ... continue pattern */

/* Hover transitions (no bounce) */
.product-card {
  transition: transform 150ms ease, border-color 150ms ease;
}

/* No motion preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Implementation Notes

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports ***REMOVED*** {
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0d1117',
          secondary: '#161b22',
          tertiary: '#21262d',
        },
        text: {
          primary: '#f0f6fc',
          secondary: '#8b949e',
          tertiary: '#6e7681',
        },
        accent: {
          primary: '#58a6ff',
          secondary: '#238636',
          warning: '#d29922',
          error: '#f85149',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
      },
      spacing: {
        // 4px grid system built-in to Tailwind
      },
    },
  },
  plugins: [],
};
```

### Recommended Libraries

- **Styling**: Tailwind CSS v3 (utility-first, matches this spec)
- **Components**: Radix UI primitives (accessibility-first)
- **Icons**: Lucide React (consistent stroke, developer-friendly)
- **Code highlighting**: Shiki (GitHub-style syntax highlighting)

---

## 11. File Structure

```
landing-page/
├── app/
│   ├── layout.tsx          # Root layout, dark mode setup
│   ├── page.tsx            # Landing page
│   └── globals.css         # Base styles, variables
├── components/
│   ├── hero.tsx
│   ├── stats-strip.tsx
│   ├── products-grid.tsx
│   ├── product-card.tsx
│   ├── philosophy.tsx
│   └── revenue-section.tsx
└── lib/
    ├── products.ts         # Product data
    └── utils.ts           # Helper functions
```

---

## 12. Performance Considerations

1. **Font Loading**: System fonts only — zero network request
2. **CSS**: Tailwind with JIT — purges unused styles automatically
3. **Images**: SVG icons only — no raster images needed
4. **JS**: Minimal JS, mostly static content
5. **Target**: <100kb total page weight, <1s LCP on 4G

---

## 13. Copy Guidelines

### Voice

- **Direct**: Say what you mean, no fluff
- **Technical**: Assume developer literacy
- **Honest**: $0 revenue is a badge of honor (pre-launch transparency)
- **Active**: "Builds tools" not "Tools are built"

### Microcopy Examples

| Context | Copy |
|---------|------|
| CTA | "Explore Products" |
| Empty state | "No products found" |
| Loading | "Loading products..." |
| Error | "Failed to load. Try again." |
| GitHub link | "View on GitHub →" |

---

## 14. Metrics & Success

### Design Success Metrics

1. **Time to first CTA**: <3 seconds (clear value prop)
2. **Product discoverability**: <2 clicks to any product detail
3. **Mobile usability**: All features work on 320px width
4. **Accessibility**: Lighthouse score 95+ (accessibility)

### Business Success Metrics

1. **CTR to products**: >30% from hero
2. **GitHub link clicks**: Track conversion to repo
3. **Scroll depth**: >80% reach philosophy section
4. **Return visitors**: (future metric after launch)

---

## 15. Appendix: Sample Product Card

```tsx
<ProductCard
  name***REMOVED***"migration-validator"
  description***REMOVED***"CLI tool to validate database migrations before deployment. Supports PostgreSQL, MySQL, and SQLite."
  status***REMOVED***"ready"
  tags***REMOVED***{['cli', 'database', 'typescript']}
  version***REMOVED***"v0.1.0"
/>
```

**Rendered appearance:**

```
┌─────────────────────────────────────┐
│ migration-validator      [READY]   │
│                                     │
│ CLI tool to validate database       │
│ migrations before deployment...     │
│                                     │
│ [cli] [database] [typescript]      │
└─────────────────────────────────────┘
```

---

## Design Checklist

Before implementation, verify:

- [ ] All color contrast ratios meet WCAG AA
- [ ] Touch targets are minimum 44x44px
- [ ] Typography scale is consistent
- [ ] Grid system follows 4px base
- [ ] Hover states exist for all interactive elements
- [ ] Focus states are visible
- [ ] Reduced motion is respected
- [ ] Mobile layout is tested at 320px width
- [ ] Dark mode is the default (no light mode initially)
- [ ] Monospace font renders correctly across browsers

---

**End of Specification**
