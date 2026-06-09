# git-conflict-resolver

CLI tool that auto-resolves 80% of git merge conflicts using intelligent heuristics.

## Features

- **Smart detection** - Automatically identifies conflict markers and file types
- **Safe strategies** - Different resolution strategies for different file types:
  - `package.json` - Merges dependencies and dedupes versions
  - Imports - Keeps both imports, deduplicates
  - Config files - Key-value merge (ours wins on conflicts)
  - Tests - Keeps both test blocks
  - Default - Keeps "ours" version
- **Safety first** - Creates git stash before resolving, rolls back on error
- **Preview mode** - See what would change before applying
- **Color output** - Easy to read with chalk

## Installation

```bash
npm install -g git-conflict-resolver
```

## Usage

### Basic resolve

```bash
git-conflict-resolver resolve
```

### Preview mode (see changes without applying)

```bash
git-conflict-resolver resolve --preview
```

### Force mode (skip confirmation)

```bash
git-conflict-resolver resolve --force
```

### Verbose mode (show detailed output)

```bash
git-conflict-resolver resolve --verbose
```

### Combine options

```bash
git-conflict-resolver resolve --preview --verbose
```

## Exit Codes

- `0` - All conflicts resolved successfully
- `1` - Some files need manual resolution
- `2` - Error occurred

## How it works

1. Checks if you're in a git repository
2. Detects conflicted files (`git diff --name-only --diff-filter***REMOVED***U`)
3. Creates a safety stash (unless in preview mode)
4. For each conflicted file:
   - Detects conflict markers
   - Applies file-type-specific strategy
   - Resolves conflicts
5. Applies changes and stages files
6. Cleans up stash

## Strategies

### package.json

Merges dependencies from both sides, keeping the highest version for conflicts.

```json
// Ours
{
  "dependencies": {
    "express": "^4.18.0",
    "lodash": "^4.17.0"
  }
}

// Theirs
{
  "dependencies": {
    "express": "^4.19.0",
    "axios": "^1.6.0"
  }
}

// Resolved
{
  "dependencies": {
    "express": "^4.19.0",
    "lodash": "^4.17.0",
    "axios": "^1.6.0"
  }
}
```

### Imports

Keeps imports from both sides, deduplicating by module name.

```javascript
// Ours
import express from 'express';
import lodash from 'lodash';

// Theirs
import express from 'express';
import axios from 'axios';

// Resolved
import express from 'express';
import lodash from 'lodash';
import axios from 'axios';
```

### Config files

Key-value merge where ours wins on conflicts.

```json
// Ours
{
  "port": 3000,
  "host": "localhost",
  "debug": true
}

// Theirs
{
  "port": 8080,
  "host": "0.0.0.0",
  "logging": "verbose"
}

// Resolved
{
  "port": 3000,
  "host": "localhost",
  "debug": true,
  "logging": "verbose"
}
```

### Tests

Keeps both test blocks, deduplicating by test name.

```javascript
// Resolved keeps both tests if they have different names
```

### Default

Keeps "ours" version (the current branch's changes).

## Safety

The tool creates a git stash before making any changes:

1. Stash is created with message "git-conflict-resolver backup"
2. Changes are applied
3. If successful, stash is dropped
4. If error occurs, stash is popped to restore original state

## Examples

### Resolve conflicts after merge

```bash
$ git merge feature-branch
# ... conflicts occur ...

$ git-conflict-resolver resolve

  git-conflict-resolver v0.1.0

  Found 3 conflicted file(s):

    - package.json
    - src/utils.js
    - src/config.json

  Results:

    ✓ package.json: package.json (2 change(s))
        + axios@1.6.0
        ~ express: ^4.18.0 -> ^4.19.0
    ✓ src/utils.js: javascript (1 change(s))
        + axios
    ✓ src/config.json: config (1 change(s))
        + logging

  All conflicts resolved!
```

### Preview before resolving

```bash
$ git-conflict-resolver resolve --preview

  git-conflict-resolver v0.1.0

  Found 1 conflicted file(s):

    - package.json

  Results:

    ✓ package.json: package.json (2 change(s))

  Preview mode - no changes applied
```

## Requirements

- Node.js >***REMOVED*** 18.0.0
- Git

## License

MIT
