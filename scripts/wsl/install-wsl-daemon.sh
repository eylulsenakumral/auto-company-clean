#!/bin/bash
# ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***
# Auto Company — Install WSL/Linux systemd user daemon
# ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***
# Installs a per-user systemd service:
#   ~/.config/systemd/user/auto-company.service
# ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***

set -euo pipefail

SCRIPT_DIR***REMOVED***"$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR***REMOVED***"$(cd "$SCRIPT_DIR/../.." && pwd)"
SERVICE_NAME***REMOVED***"auto-company.service"
SYSTEMD_USER_DIR***REMOVED***"$HOME/.config/systemd/user"
SERVICE_PATH***REMOVED***"$SYSTEMD_USER_DIR/$SERVICE_NAME"
CURRENT_USER***REMOVED***"$(id -un)"

if ! command -v systemctl >/dev/null 2>&1; then
    echo "Error: systemctl not found. Enable systemd in WSL first."
    exit 1
fi

if ! systemctl --user --version >/dev/null 2>&1; then
    echo "Error: systemctl --user is unavailable for this session."
    echo "Check WSL systemd setup and login session."
    exit 1
fi

mkdir -p "$SYSTEMD_USER_DIR"

cat > "$SERVICE_PATH" << EOF
[Unit]
Description***REMOVED***Auto Company Loop
After***REMOVED***default.target

[Service]
Type***REMOVED***simple
WorkingDirectory***REMOVED***$PROJECT_DIR
EnvironmentFile***REMOVED***-$PROJECT_DIR/.auto-loop.env
ExecStart***REMOVED***/usr/bin/bash $PROJECT_DIR/scripts/core/auto-loop.sh
Restart***REMOVED***always
RestartSec***REMOVED***10
TimeoutStopSec***REMOVED***45

[Install]
WantedBy***REMOVED***default.target
EOF

systemctl --user daemon-reload
systemctl --user enable "$SERVICE_NAME" >/dev/null

echo "Installed: $SERVICE_PATH"
echo "Enabled: $SERVICE_NAME"

if command -v loginctl >/dev/null 2>&1; then
    linger_state***REMOVED***"$(loginctl show-user "$CURRENT_USER" -p Linger --value 2>/dev/null || true)"
    if [ "$linger_state" ***REMOVED*** "no" ]; then
        echo ""
        echo "Note: linger is disabled for user '$CURRENT_USER'."
        echo "Run once to improve background persistence:"
        echo "  sudo loginctl enable-linger $CURRENT_USER"
    fi
fi

echo ""
echo "Next commands:"
echo "  systemctl --user start $SERVICE_NAME"
echo "  systemctl --user status $SERVICE_NAME --no-pager"
