#!/usr/bin/env bash
#
# Auto Company CLI Installer
# Autonomous AI company automation toolkit
#
# Usage:
#   curl -sSL https://raw.githubusercontent.com/tolgabrk/auto-company/main/install.sh | bash
#   curl -sSL https://raw.githubusercontent.com/tolgabrk/auto-company/main/install.sh | bash -s -- --dry-run
#

set -e

# Colors
RED***REMOVED***'\033[0;31m'
GREEN***REMOVED***'\033[0;32m'
YELLOW***REMOVED***'\033[1;33m'
BLUE***REMOVED***'\033[0;34m'
NC***REMOVED***'\033[0m' # No Color

# Configuration
REPO***REMOVED***"tolgabrk/auto-company"
INSTALL_DIR***REMOVED***"$HOME/.autocompany"
BIN_DIR***REMOVED***"$INSTALL_DIR/bin"
VERSION***REMOVED***${VERSION:-"latest"}
DRY_RUN***REMOVED***false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN***REMOVED***true
      shift
      ;;
    --version)
      VERSION***REMOVED***"$2"
      shift 2
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║     Auto Company CLI Installer                       ║"
echo "║     Autonomous AI Company Toolkit                    ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Detect OS
OS***REMOVED***"$(uname -s)"
case "$OS" in
  Linux*)     MACHINE***REMOVED***Linux;;
  Darwin*)    MACHINE***REMOVED***Mac;;
  CYGWIN*)    MACHINE***REMOVED***Cygwin;;
  MINGW*)     MACHINE***REMOVED***MinGW;;
  MSYS*)      MACHINE***REMOVED***MSYS;;
  *)          MACHINE***REMOVED***"UNKNOWN:${OS}"
esac

# Check Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js is not installed${NC}"
  echo "Please install Node.js v18 or higher from https://nodejs.org/"
  exit 1
fi

NODE_VERSION***REMOVED***$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}✗ Node.js v18 or higher required (found v${NODE_VERSION})${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Node.js v${NODE_VERSION} detected${NC}"
echo -e "${GREEN}✓ OS: ${MACHINE}${NC}"

if [ "$DRY_RUN" ***REMOVED*** true ]; then
  echo -e "${YELLOW}--dry-run mode: Skipping installation${NC}"
  echo "Installation would:"
  echo "  - Download release ${VERSION} from GitHub"
  echo "  - Install to ${INSTALL_DIR}"
  echo "  - Add ${BIN_DIR} to PATH"
  exit 0
fi

# Create install directory
echo -e "${BLUE}Installing to ${INSTALL_DIR}...${NC}"
mkdir -p "${BIN_DIR}"

# Download release
DOWNLOAD_URL***REMOVED***"https://github.com/${REPO}/archive/refs/tags/${VERSION}.tar.gz"
if [ "$VERSION" ***REMOVED*** "latest" ]; then
  DOWNLOAD_URL***REMOVED***"https://github.com/${REPO}/archive/refs/heads/main.tar.gz"
fi

echo -e "${BLUE}Downloading from ${DOWNLOAD_URL}...${NC}"
TMP_DIR***REMOVED***$(mktemp -d)
curl -fsSL "${DOWNLOAD_URL}" -o "${TMP_DIR}/autocompany.tar.gz"

# Extract
tar -xzf "${TMP_DIR}/autocompany.tar.gz" -C "${TMP_DIR}"

# Copy files
EXTRACTED_DIR***REMOVED***"${TMP_DIR}/$(ls "${TMP_DIR}" | grep auto-company)"
if [ ! -d "${EXTRACTED_DIR}" ]; then
  EXTRACTED_DIR***REMOVED***"${TMP_DIR}/$(ls "${TMP_DIR}" | head -1)"
fi

# Create launcher script
cat > "${BIN_DIR}/autocompany" << 'EOF'
#!/usr/bin/env bash
# Auto Company CLI Launcher
AUTOCOMPANY_ROOT***REMOVED***"$HOME/.autocompany"

# List available tools
list_tools() {
  echo "Auto Company - Available Tools:"
  echo ""
  echo "Security:"
  echo "  keyspinner           - API key rotation manager"
  echo ""
  echo "Automation:"
  echo "  bot-analytics-cli    - Telegram bot analytics"
  echo "  migration-validator  - Database migration verification"
  echo "  webhook-logger       - Webhook testing & debugging"
  echo ""
  echo "Developer:"
  echo "  business-idea-generator - Startup idea generation"
  echo "  product-hunt-tool-api   - Product Hunt automation"
  echo ""
  echo "Usage: autocompany <tool-name> [args]"
  echo ""
  echo "Example:"
  echo "  autocompany keyspinner scan myorg/myrepo"
  echo "  autocompany bot-analytics-cli --token YOUR_BOT_TOKEN"
}

case "$1" in
  list|--list|ls)
    list_tools
    ;;
  version|--version|-v)
    echo "Auto Company v1.1.0"
    echo "28+ tools for autonomous AI company operations"
    ;;
  help|--help|-h|"")
    echo "Auto Company CLI - Autonomous AI Company Toolkit"
    echo ""
    echo "Commands:"
    echo "  autocompany list          - List available tools"
    echo "  autocompany version       - Show version"
    echo "  autocompany <tool> [args] - Run a tool"
    echo ""
    list_tools
    ;;
  *)
    # Try to run the tool
    TOOL_NAME***REMOVED***"$1"
    shift
    TOOL_PATH***REMOVED***"$AUTOCOMPANY_ROOT/tools/$TOOL_NAME"

    if [ -f "$TOOL_PATH" ]; then
      node "$TOOL_PATH" "$@"
    elif [ -f "$TOOL_PATH/index.js" ]; then
      node "$TOOL_PATH/index.js" "$@"
    elif [ -f "$TOOL_PATH/cli.js" ]; then
      node "$TOOL_PATH/cli.js" "$@"
    else
      echo -e "\033[0;31mError: Tool '$TOOL_NAME' not found\033[0m"
      echo ""
      echo "Run 'autocompany list' to see available tools"
      exit 1
    fi
    ;;
esac
EOF

chmod +x "${BIN_DIR}/autocompany"

# Clean up
rm -rf "${TMP_DIR}"

# Add to PATH
SHELL_CONFIG***REMOVED***""
case "$SHELL" in
  *zsh*) SHELL_CONFIG***REMOVED***"$HOME/.zshrc" ;;
  *bash*) SHELL_CONFIG***REMOVED***"$HOME/.bashrc" ;;
  *fish*) SHELL_CONFIG***REMOVED***"$HOME/.config/fish/config.fish" ;;
esac

if [ -n "$SHELL_CONFIG" ] && ! grep -q "$BIN_DIR" "$SHELL_CONFIG" 2>/dev/null; then
  echo ""
  echo -e "${YELLOW}Adding ${BIN_DIR} to PATH in ${SHELL_CONFIG}${NC}"

  case "$SHELL" in
    *fish*)
      echo "set -gx PATH $BIN_DIR \$PATH" >> "$SHELL_CONFIG"
      ;;
    *)
      echo "export PATH***REMOVED***\"$BIN_DIR:\$PATH\"" >> "$SHELL_CONFIG"
      ;;
  esac

  echo -e "${YELLOW}Run 'source $SHELL_CONFIG' or restart your shell${NC}"
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Installation Complete! ✓                        ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Run these commands to get started:"
echo ""
echo -e "${BLUE}  autocompany list${NC}          # Show all tools"
echo -e "${BLUE}  autocompany version${NC}       # Show version"
echo ""
echo "Documentation: https://github.com/tolgabrk/auto-company"
echo "Support: @tolgabrk on Telegram"
