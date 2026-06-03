#!/bin/bash
# ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***
# Auto Company — macOS Status Report for Dashboard
# ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***

set -euo pipefail

SCRIPT_DIR***REMOVED***"$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR***REMOVED***"$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_DIR***REMOVED***"$PROJECT_DIR/logs"
STATE_FILE***REMOVED***"$PROJECT_DIR/.auto-loop-state"
PID_FILE***REMOVED***"$PROJECT_DIR/.auto-loop.pid"
PAUSE_FLAG***REMOVED***"$PROJECT_DIR/.auto-loop-paused"
CONSENSUS_FILE***REMOVED***"$PROJECT_DIR/memories/consensus.md"
LABEL***REMOVED***"com.autocompany.loop"
PLIST_PATH***REMOVED***"$HOME/Library/LaunchAgents/${LABEL}.plist"

loop_pid***REMOVED***""
if [ -f "$PID_FILE" ]; then
    loop_pid***REMOVED***"$(cat "$PID_FILE")"
fi

echo "***REMOVED******REMOVED******REMOVED*** Guardian ***REMOVED******REMOVED******REMOVED***"
guardian_state***REMOVED***"stopped"
guardian_pid***REMOVED***""
guardian_raw***REMOVED***"Sleep guard: not active"
if [ -n "$loop_pid" ] && kill -0 "$loop_pid" 2>/dev/null; then
    guardian_pid***REMOVED***"$(pgrep -f "caffeinate.*-w $loop_pid" | head -1 || true)"
    if [ -n "$guardian_pid" ]; then
        guardian_state***REMOVED***"running"
        guardian_raw***REMOVED***"caffeinate -w $loop_pid"
    else
        guardian_raw***REMOVED***"Sleep guard: loop running without caffeinate"
    fi
fi
echo "State***REMOVED***$guardian_state"
if [ -n "$guardian_pid" ]; then
    echo "Pid***REMOVED***$guardian_pid"
fi
echo "Raw***REMOVED***$guardian_raw"

echo ""
echo "***REMOVED******REMOVED******REMOVED*** Daemon ***REMOVED******REMOVED******REMOVED***"
daemon_state***REMOVED***"not_installed"
daemon_raw***REMOVED***"LaunchAgent plist not installed"
daemon_pid***REMOVED***""
if [ -f "$PLIST_PATH" ]; then
    if [ -f "$PAUSE_FLAG" ]; then
        daemon_state***REMOVED***"inactive"
        daemon_raw***REMOVED***"LaunchAgent paused (.auto-loop-paused present)"
    elif launchctl list 2>/dev/null | grep -q "$LABEL"; then
        daemon_state***REMOVED***"active"
        daemon_raw***REMOVED***"launchd agent loaded"
        daemon_pid***REMOVED***"$(launchctl list 2>/dev/null | awk -v label***REMOVED***"$LABEL" '$3 ***REMOVED******REMOVED*** label { print $1; exit }' || true)"
    else
        daemon_state***REMOVED***"inactive"
        daemon_raw***REMOVED***"LaunchAgent plist installed but not loaded"
    fi
fi
echo "State***REMOVED***$daemon_state"
if [[ "$daemon_pid" ***REMOVED***~ ^[0-9]+$ ]]; then
    echo "MainPID***REMOVED***$daemon_pid"
fi
echo "Raw***REMOVED***$daemon_raw"

echo ""
echo "***REMOVED******REMOVED******REMOVED*** Autostart ***REMOVED******REMOVED******REMOVED***"
if [ -f "$PLIST_PATH" ]; then
    echo "State***REMOVED***configured"
    echo "Raw***REMOVED***LaunchAgent plist present"
else
    echo "State***REMOVED***not_configured"
    echo "Raw***REMOVED***LaunchAgent plist absent"
fi

echo ""
echo "***REMOVED******REMOVED******REMOVED*** Loop ***REMOVED******REMOVED******REMOVED***"
loop_state***REMOVED***"stopped"
loop_raw***REMOVED***"Loop not running"
if [ -n "$loop_pid" ]; then
    if kill -0 "$loop_pid" 2>/dev/null; then
        loop_state***REMOVED***"running"
        loop_raw***REMOVED***"Loop running"
    else
        loop_raw***REMOVED***"Loop stopped (stale PID $loop_pid)"
    fi
fi
echo "State***REMOVED***$loop_state"
if [ "$loop_state" ***REMOVED*** "running" ]; then
    echo "Pid***REMOVED***$loop_pid"
fi
echo "Raw***REMOVED***$loop_raw"

echo ""
echo "***REMOVED******REMOVED******REMOVED*** State File ***REMOVED******REMOVED******REMOVED***"
if [ -f "$STATE_FILE" ]; then
    cat "$STATE_FILE"
fi

echo ""
echo "***REMOVED******REMOVED******REMOVED*** Latest Consensus ***REMOVED******REMOVED******REMOVED***"
if [ -f "$CONSENSUS_FILE" ]; then
    head -30 "$CONSENSUS_FILE"
else
    echo "(no consensus file)"
fi

echo ""
echo "***REMOVED******REMOVED******REMOVED*** Recent Log ***REMOVED******REMOVED******REMOVED***"
if [ -f "$LOG_DIR/auto-loop.log" ]; then
    tail -20 "$LOG_DIR/auto-loop.log"
else
    echo "(no log file)"
fi
