---
name: deep-reading-analyst
description: "Comprehensive framework for deep analysis of articles, papers, and long-form content using 10+ thinking models (SCQA, 5W2H, critical thinking, inversion, mental models, first principles, systems thinking, six thinking hats). Use when users want to: (1) deeply understand complex articles/content, (2) analyze arguments and identify logical flaws, (3) extract actionable insights from reading materials, (4) create study notes or learning summaries, (5) compare multiple sources, (6) transform knowledge into practical applications, or (7) apply specific thinking frameworks. Triggered by phrases like 'analyze this article,' 'help me understand,' 'deep dive into,' 'extract insights from,' 'use [framework name],' or when users provide URLs/long-form content for analysis."
---

# Deep Reading Analyst

Transforms surface-level reading into deep learning through systematic analysis using 10+ proven thinking frameworks. Guides users from understanding to application through structured workflows.

## Framework Arsenal

### Quick Analysis (15min)
- 📋 **SCQA** - Structure thinking (Situation-Complication-Question-Answer)
- 🔍 **5W2H** - Completeness check (What, Why, Who, When, Where, How, How much)

### Standard Analysis (30min)
- 🎯 **Critical Thinking** - Argument evaluation
- 🔄 **Inversion Thinking** - Risk identification

### Deep Analysis (60min)
- 🧠 **Mental Models** - Multi-perspective analysis (physics, biology, psychology, economics)
- ⚡ **First Principles** - Essence extraction
- 🔗 **Systems Thinking** - Relationship mapping
- 🎨 **Six Thinking Hats** - Structured creativity

### Research Analysis (120min+)
- 📊 **Cross-Source Comparison** - Multi-article synthesis

## Workflow Decision Tree

```
User provides content
    ↓
Ask: Purpose + Depth Level + Preferred Frameworks
    ↓
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│   Level 1       │   Level 2       │   Level 3       │   Level 4       │
│   Quick         │   Standard      │   Deep          │   Research      │
│   15min         │   30min         │   60min         │   120min+       │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ • SCQA          │ Level 1 +       │ Level 2 +       │ Level 3 +       │
│ • 5W2H          │ • Critical      │ • Mental Models │ • Cross-source  │
│ • Structure     │ • Inversion     │ • First Princ.  │ • Web search    │
│                 │                 │ • Systems       │ • Synthesis     │
│                 │                 │ • Six Hats      │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

## Step 1: Initialize Analysis

**Ask User (conversationally):**
1. "What's your main goal for reading this?"
   - Problem-solving / Learning / Writing / Decision-making / Curiosity
2. "How deep do you want to go?"
   - Quick (15min) / Standard (30min) / Deep (60min) / Research (120min+)
3. "Any specific frameworks you'd like to use?"
   - Suggest based on content type (see Framework Selection Guide below)

**Default if no response:** Level 2 (Standard mode) with auto-selected frameworks

### Framework Selection Guide

Based on content type, auto-suggest:

```markdown
📄 Strategy/Business articles → SCQA + Mental Models + Inversion
📊 Research papers → 5W2H + Critical Thinking + Systems Thinking
💡 How-to guides → SCQA + 5W2H + First Principles
🎯 Opinion pieces → Critical Thinking + Inversion + Six Hats
📈 Case studies → SCQA + Mental Models + Systems Thinking
```

## Step 2: Structural Understanding

**Always start here regardless of depth level.**

### Phase 2A: Basic Structure

```markdown
📄 Content Type: [Article/Paper/Report/Guide]
⏱️ Estimated reading time: [X minutes]
🎯 Core Thesis: [One sentence]

Structure Overview:
├─ Main Argument 1
│   ├─ Supporting point 1.1
│   └─ Supporting point 1.2
├─ Main Argument 2
└─ Main Argument 3

Key Concepts: [3-5 terms with brief definitions]
```

### Phase 2B: SCQA Analysis (Quick Framework)

Load `references/scqa_framework.md` and apply:

```markdown
## SCQA Structure

**S (Situation)**: [Background/context the article establishes]
**C (Complication)**: [Problem/challenge identified]
**Q (Question)**: [Core question being addressed]
**A (Answer)**: [Main solution/conclusion]

📊 Structure Quality:
- Clarity: [★★★★☆]
- Logic flow: [★★★★★]
- Completeness: [★★★☆☆]
```

### Phase 2C: 5W2H Completeness Check (if Level 1+)

Quick scan using `references/5w2h_analysis.md`:

```markdown
## Information Completeness

✅ Well-covered: [What, Why, How]
⚠️  Partially covered: [Who, When]
❌ Missing: [Where, How much]

🔴 Critical gaps: [List 1-2 most important missing pieces]
```

## Step 3: Apply Thinking Models

**Select based on depth level and user preference:**

### Level 1 (Quick - 15 min)
**Core**: Structure + SCQA + 5W2H Quick Check

Output:
- SCQA breakdown
- Information gaps (from 5W2H)
- TOP 3 insights
- 1 immediate action item

### Level 2 (Standard - 30 min)
**Add**: Critical Thinking + Inversion

Load and apply:
- `references/critical_thinking.md`:
  - Argument quality assessment
  - Logic flaw identification
  - Evidence evaluation
  - Alternative perspectives

- `references/inversion_thinking.md`:
  - How to ensure failure? (reverse the advice)
  - What assumptions if wrong?
  - Missing risks
  - Pre-mortem analysis

```markdown
## Critical Analysis

### Argument Strength: [X/10]
Strengths:
- [Point 1]

Weaknesses:
- [Point 1]

Logical fallacies detected:
- [If any]

## Inversion Analysis

🚨 How this could fail:
1. [Failure mode 1] → Mitigation: [...]
2. [Failure mode 2] → Mitigation: [...]

Missing risk factors:
- [Risk 1]
```

### Level 3 (Deep - 60 min)
**Add**: Mental Models + First Principles + Systems + Six Hats

Load and apply:
- `references/mental_models.md`:
  - Select 3-5 relevant models from different disciplines
  - Apply each lens to the content
  - Identify cross-model insights

- `references/first_principles.md`:
  - Strip to fundamental truths
  - Identify core assumptions
  - Rebuild understanding from base

- `references/systems_thinking.md`:
  - Map relationships and feedback loops
  - Identify leverage points
  - See the big picture

- `references/six_hats.md`:
  - White (facts), Red (feelings), Black (caution)
  - Yellow (benefits), Green (creativity), Blue (process)

```markdown
## Multi-Model Analysis

### Mental Models Applied:
1. **[Model 1 from X discipline]**
   Insight: [...]

2. **[Model 2 from Y discipline]**
   Insight: [...]

3. **[Model 3 from Z discipline]**
   Insight: [...]

Cross-model pattern: [Key insight from combining models]

### First Principles Breakdown:
Core assumptions:
1. [Assumption 1] → Valid: [Yes/No/Conditional]
2. [Assumption 2] → Valid: [Yes/No/Conditional]

Fundamental truth: [What remains after stripping assumptions]

### Systems Map:
```
[Variable A] ──reinforces──> [Variable B]
      ↑                          |
      |                          |
   balances                  reinforces
      |                          |
      └─────────<────────────────┘

Leverage point: [Where small change ***REMOVED*** big impact]
```

### Six Hats Perspective:
🤍 Facts: [Objective data]
❤️ Feelings: [Intuitive response]
🖤 Cautions: [Risks and downsides]
💛 Benefits: [Positive aspects]
💚 Ideas: [Creative alternatives]
💙 Process: [Meta-thinking]
```

### Level 4 (Research - 120 min+)
**Add**: Cross-source comparison via web_search

Use web_search to find 2-3 related sources, then:
- Load `references/comparison_matrix.md`
- Compare SCQA across sources
- Identify consensus vs. divergence
- Synthesize integrated perspective
