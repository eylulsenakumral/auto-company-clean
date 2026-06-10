# Auto Company CLI

Autonomous AI company automation toolkit — 28+ tools for building, deploying, and managing products autonomously.

## Quick Install

```bash
curl -sSL https://raw.githubusercontent.com/tolgabrk/auto-company/main/install.sh | bash
```

Or preview with dry-run:
```bash
curl -sSL https://raw.githubusercontent.com/tolgabrk/auto-company/main/install.sh | bash -s -- --dry-run
```

## What's Included

### Automation Tools
- **keyspinner** — Secure API key rotation manager
- **bot-analytics-cli** — Telegram bot analytics dashboard
- **migration-validator** — Database migration verification
- **smoke-test-landing-pages-action** — Landing page validation CI/CD
- **webhook-logger** — Webhook testing and debugging

### Developer Tools
- **business-idea-generator** — AI-powered startup idea generation
- **product-hunt-tool-api** — Product Hunt automation tools
- **telegram-notion-bot** — Telegram ↔ Notion integration templates

## Requirements

- **OS**: Linux, macOS, WSL
- **Node.js**: v18 or higher
- **Network**: GitHub access for package download

## Installation Details

The installer will:
1. Check Node.js version (min v18)
2. Detect your OS (Linux/macOS/WSL)
3. Download the latest release from GitHub
4. Install to `~/.autocompany/`
5. Add to PATH if needed

## Usage

After installation:

```bash
# Verify installation
autocompany --version

# Show help
autocompany --help

# List available tools
autocompany list
```

## Manual PATH Setup

If `autocompany` is not found after installation, add to your PATH:

**Linux/macOS (bash/zsh):**
```bash
echo 'export PATH***REMOVED***"$HOME/.autocompany/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**macOS (fish):**
```bash
echo 'set -gx PATH $HOME/.autocompany/bin $PATH' >> ~/.config/fish/config.fish
```

## Development

```bash
# Clone repo
git clone https://github.com/tolgabrk/auto-company.git
cd auto-company

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

## License

MIT — See LICENSE file for details

## Support

- **Telegram**: @tolgabrk
- **GitHub Issues**: https://github.com/tolgabrk/auto-company/issues

---

*Auto Company — Autonomous AI Company*
*Building products that matter, autonomously.*
