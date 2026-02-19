#!/bin/bash
# ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***
# Auto Company — Install/Uninstall launchd Daemon (macOS)
# ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***
# Generates a launchd plist dynamically based on current paths,
# installs it to ~/Library/LaunchAgents/, and loads it.
#
# Usage:
#   ./install-daemon.sh             # Install and start
#   ./install-daemon.sh --uninstall # Stop and remove
# ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***

set -euo pipefail

SCRIPT_DIR***REMOVED***"$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR***REMOVED***"$(cd "$SCRIPT_DIR/../.." && pwd)"
LABEL***REMOVED***"com.autocompany.loop"
PLIST_PATH***REMOVED***"$HOME/Library/LaunchAgents/${LABEL}.plist"
PAUSE_FLAG***REMOVED***"${PROJECT_DIR}/.auto-loop-paused"
OS_NAME***REMOVED***"$(uname -s)"
ENGINE***REMOVED***"${ENGINE:-claude}"
ENGINE***REMOVED***"$(echo "$ENGINE" | tr '[:upper:]' '[:lower:]')"
MODEL***REMOVED***"${MODEL:-}"
CLAUDE_BIN***REMOVED***"${CLAUDE_BIN:-}"
CLAUDE_PERMISSION_MODE***REMOVED***"${CLAUDE_PERMISSION_MODE:-bypassPermissions}"
CODEX_BIN***REMOVED***"${CODEX_BIN:-}"
CODEX_SANDBOX_MODE***REMOVED***"${CODEX_SANDBOX_MODE:-danger-full-access}"

if [ "$ENGINE" !***REMOVED*** "claude" ] && [ "$ENGINE" !***REMOVED*** "codex" ]; then
    echo "Error: ENGINE must be 'claude' or 'codex' (received: '$ENGINE')."
    exit 1
fi

if [ "$OS_NAME" !***REMOVED*** "Darwin" ]; then
    echo "install-daemon.sh supports macOS launchd only."
    echo "Current OS: $OS_NAME"
    echo "Use foreground mode instead: make start"
    exit 1
fi

# --- Uninstall ---
if [ "${1:-}" ***REMOVED*** "--uninstall" ]; then
    echo "Uninstalling Auto Company daemon..."
    if launchctl list | grep -q "$LABEL"; then
        launchctl unload "$PLIST_PATH" 2>/dev/null || true
        echo "Service unloaded."
    fi
    if [ -f "$PLIST_PATH" ]; then
        rm -f "$PLIST_PATH"
        echo "Plist removed: $PLIST_PATH"
    fi
    echo "Done. Daemon uninstalled."
    exit 0
fi

# --- Install ---

# Check dependencies
if ! command -v codex &>/dev/null; then
    echo "Error: 'codex' CLI not found. Install Codex CLI first."
    exit 1
fi

CODEX_PATH***REMOVED***"$(command -v codex)"
CODEX_DIR***REMOVED***"$(dirname "$CODEX_PATH")"

# Detect node path (for wrangler/npx)
NODE_DIR***REMOVED***""
if command -v node &>/dev/null; then
    NODE_DIR***REMOVED***"$(dirname "$(command -v node)")"
fi

# Build PATH: include all tool directories
DAEMON_PATH***REMOVED***"${CODEX_DIR}"
[ -n "$NODE_DIR" ] && DAEMON_PATH***REMOVED***"${DAEMON_PATH}:${NODE_DIR}"
DAEMON_PATH***REMOVED***"${DAEMON_PATH}:/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

echo "Installing Auto Company daemon..."
echo "  Project: $PROJECT_DIR"
echo "  Codex:   $CODEX_PATH"
echo "  PATH:    $DAEMON_PATH"

mkdir -p "$HOME/Library/LaunchAgents" "$PROJECT_DIR/logs"
# Install implies active running state
rm -f "$PAUSE_FLAG"

# Unload existing if running
if launchctl list 2>/dev/null | grep -q "$LABEL"; then
    launchctl unload "$PLIST_PATH" 2>/dev/null || true
fi

# Generate plist
cat > "$PLIST_PATH" << EOF
<?xml version***REMOVED***"1.0" encoding***REMOVED***"UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version***REMOVED***"1.0">
<dict>
    <key>Label</key>
    <string>${LABEL}</string>

    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>${PROJECT_DIR}/scripts/core/auto-loop.sh</string>
        <string>--daemon</string>
    </array>

    <key>WorkingDirectory</key>
    <string>${PROJECT_DIR}</string>

    <key>KeepAlive</key>
    <dict>
        <key>PathState</key>
        <dict>
            <key>${PAUSE_FLAG}</key>
            <false/>
        </dict>
    </dict>

    <key>RunAtLoad</key>
    <true/>

    <key>StandardOutPath</key>
    <string>${PROJECT_DIR}/logs/launchd-stdout.log</string>

    <key>StandardErrorPath</key>
    <string>${PROJECT_DIR}/logs/launchd-stderr.log</string>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>${DAEMON_PATH}</string>
        <key>HOME</key>
        <string>${HOME}</string>
    </dict>

    <key>ThrottleInterval</key>
    <integer>30</integer>
</dict>
</plist>
EOF

echo "Plist written: $PLIST_PATH"

# Load
launchctl load "$PLIST_PATH"
echo ""
echo "Daemon installed and started!"
echo ""
echo "Commands:"
echo "  ./monitor.sh            # Watch live logs"
echo "  ./monitor.sh --status   # Check status"
echo "  ./stop-loop.sh          # Stop the loop (daemon will restart it)"
echo "  ./stop-loop.sh --pause-daemon   # Pause daemon (no auto-restart)"
echo "  ./stop-loop.sh --resume-daemon  # Resume daemon"
echo "  ./install-daemon.sh --uninstall  # Remove daemon completely"
