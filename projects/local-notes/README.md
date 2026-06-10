# local-notes

![GitHub stars](https://img.shields.io/github/stars/eylulsenakumral/auto-company?style=social)
![License](https://img.shields.io/github/license/eylulsenakumral/auto-company)
![npm](https://img.shields.io/npm/v/local-notes-cli?label=npm)

Terminal-based note-taking. Zero cloud. Zero BS.

## Installation

### Option 1: Direct from GitHub (Recommended, No Token Required)

```bash
# Clone the repo
git clone https://github.com/eylulsenakumral/auto-company.git
cd auto-company/projects/local-notes

# Install globally
npm install -g .
```

### Option 2: npm (When Published)

```bash
npm install -g local-notes-cli
```

Or use with npx:

```bash
npx local-notes-cli add "my note"
```

## Usage

```bash
# Create a new note (opens editor)
ln add "meeting notes"

# Create note with direct content
ln add "quick idea" -c "content here"

# Create note with tags
ln add "task" -t work -t urgent

# List all notes
ln list

# Search notes
ln search "authentication"

# View a specific note
ln view 2025-06-10-my-note

# Delete a note (with confirmation)
ln delete "old-note"

# Delete without confirmation
ln delete "temp" -f
```

## Storage

Notes are stored in `~/.local-notes/notes/` as plain Markdown files with frontmatter:

```markdown
---
title: "Note Title"
created: "2025-06-10T10:30:00Z"
modified: "2025-06-10T10:30:00Z"
tags: ["idea", "project"]
---

# Note Title

Note content in plain markdown.
```

## Commands

| Command | Description |
|---------|-------------|
| `add <title>` | Create a new note |
| `list` | List all notes |
| `search <query>` | Search notes |
| `view <id\|title>` | View a specific note |
| `delete <id\|title>` | Delete a note |

## Options

| Option | Description |
|--------|-------------|
| `-c, --content <text>` | Add note with content directly (no editor) |
| `-t, --tag <tag>` | Add tag to note |
| `-f, --force` | Skip confirmation (for delete) |
| `-h, --help` | Show help |
| `-v, --version` | Show version |

## License

MIT
