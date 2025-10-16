#!/bin/bash
# ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***
# Auto Company — Uninstall WSL/Linux systemd user daemon
# ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***

set -euo pipefail

SERVICE_NAME***REMOVED***"auto-company.service"
SYSTEMD_USER_DIR***REMOVED***"$HOME/.config/systemd/user"
SERVICE_PATH***REMOVED***"$SYSTEMD_USER_DIR/$SERVICE_NAME"

if ! command -v systemctl >/dev/null 2>&1; then
    echo "Error: systemctl not found."
    exit 1
fi

if systemctl --user --version >/dev/null 2>&1; then
    systemctl --user disable --now "$SERVICE_NAME" >/dev/null 2>&1 || true
fi

if [ -f "$SERVICE_PATH" ]; then
    rm -f "$SERVICE_PATH"
    echo "Removed: $SERVICE_PATH"
else
    echo "Service file not found: $SERVICE_PATH"
fi

if systemctl --user --version >/dev/null 2>&1; then
    systemctl --user daemon-reload
    systemctl --user reset-failed >/dev/null 2>&1 || true
fi

echo "Uninstall complete."
