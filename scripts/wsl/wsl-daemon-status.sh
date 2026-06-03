#!/bin/bash
# ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***
# Auto Company — WSL daemon status helper
# ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***

set -euo pipefail

SERVICE_NAME***REMOVED***"auto-company.service"
SERVICE_PATH***REMOVED***"$HOME/.config/systemd/user/$SERVICE_NAME"

if ! command -v systemctl >/dev/null 2>&1; then
    echo "systemctl: unavailable"
    exit 1
fi

if [ ! -f "$SERVICE_PATH" ]; then
    echo "Service: NOT INSTALLED ($SERVICE_PATH missing)"
    exit 2
fi

active_state***REMOVED***"$(systemctl --user is-active "$SERVICE_NAME" 2>/dev/null || true)"
enabled_state***REMOVED***"$(systemctl --user is-enabled "$SERVICE_NAME" 2>/dev/null || true)"

echo "Service file: $SERVICE_PATH"
echo "Enabled: ${enabled_state:-unknown}"
echo "Active: ${active_state:-unknown}"
systemctl --user show "$SERVICE_NAME" -p MainPID -p ActiveState -p SubState --no-pager 2>/dev/null || true
