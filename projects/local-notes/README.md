# local-notes

![npm](https://img.shields.io/npm/v/local-notes-cli)
![License: MIT](https://img.shields.io/npm/l/local-notes-cli)
![Node](https://img.shields.io/node/v/local-notes-cli)
![GitHub stars](https://img.shields.io/github/stars/eylulsenakumral/auto-company-clean?style=social)

> Terminal-based note-taking. Zero cloud. Zero BS.

**Repository:** [github.com/eylulsenakumral/auto-company-clean](https://github.com/eylulsenakumral/auto-company-clean/tree/main/projects/local-notes)

A minimal CLI for capturing thoughts without leaving your terminal. Notes stored locally as Markdown — yours forever, searchable instantly.

## Why local-notes?

- **Zero friction** — Type `ln add` and keep typing
- **No account required** — Your notes live on your machine
- **Plain Markdown** — Future-proof, grep-friendly, works with any editor
- **Privacy first** — No cloud, no telemetry, no tracking

## Installation

### Option 1: Direct from GitHub (Recommended)

No token required. Clone and install:

```bash
git clone https://github.com/eylulsenakumral/auto-company-clean.git
cd auto-company-clean/projects/local-notes
npm install -g .
```

### Option 2: npm

```bash
npm install -g local-notes-cli
```

Or use with `npx` (no install):

```bash
npx local-notes-cli add "my note"
```

## Quick Start

```bash
# Create a note (opens your $EDITOR)
ln add "meeting notes"

# Quick capture with inline content
ln add "api idea" -c "Add rate limiting to /api/search endpoint"

# Tag important notes
ln add "urgent bug" -t production -t fix-asap

# Find what you need
ln list
ln search "authentication"

# View or delete
ln view 2025-06-10-api-idea
ln delete "old draft"
```

## Commands

| Command | Description |
|---------|-------------|
| `add <title>` | Create a new note |
| `list` | List all notes (sorted by date) |
| `search <query>` | Full-text search across notes |
| `view <id\|title>` | View a specific note |
| `delete <id\|title>` | Delete a note (with confirmation) |

## Options

| Flag | Description |
|------|-------------|
| `-c, --content <text>` | Add note with content directly (skip editor) |
| `-t, --tag <tag>` | Add tag (use multiple times) |
| `-f, --force` | Skip confirmation (for delete) |
| `-h, --help` | Show command help |
| `-v, --version` | Show version |

## Storage

Notes live at `~/.local-notes/notes/` as plain Markdown:

```markdown
---
title: "Note Title"
created: "2025-06-10T10:30:00Z"
modified: "2025-06-10T10:30:00Z"
tags: ["idea", "project"]
---

# Note Title

Your content here.
```

Use any editor to edit them directly — the CLI reads the same files.

## Requirements

- Node.js >= 18.0.0

## License

MIT © Auto Company
