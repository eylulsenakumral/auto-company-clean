#!/bin/bash
# ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***
# Auto Company — 24/7 Autonomous Loop
# ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***
# Keeps Codex CLI running continuously to drive the AI team.
# Uses fresh sessions with consensus.md as the relay baton.
#
# Usage:
#   ./auto-loop.sh              # Run in foreground
#   ./auto-loop.sh --daemon     # Run via launchd (macOS only)
#
# Stop:
#   ./stop-loop.sh              # Graceful stop
#   kill $(cat .auto-loop.pid)  # Force stop
#
# Config (env vars):
#   MODEL***REMOVED***...                   # Optional Codex model override (default: Codex config)
#   CODEX_BIN***REMOVED***...               # Optional Codex executable override
#   CODEX_SANDBOX_MODE***REMOVED***danger-full-access
#   LOOP_INTERVAL***REMOVED***30            # Seconds between cycles (default: 30)
#   CYCLE_TIMEOUT_SECONDS***REMOVED***1800  # Max seconds per cycle before force-kill
#   MAX_CONSECUTIVE_ERRORS***REMOVED***5    # Circuit breaker threshold
#   COOLDOWN_SECONDS***REMOVED***300        # Cooldown after circuit break
#   LIMIT_WAIT_SECONDS***REMOVED***3600     # Wait on usage limit
#   MAX_LOGS***REMOVED***200                # Max cycle logs to keep
# ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***

set -euo pipefail

# ***REMOVED******REMOVED******REMOVED*** Resolve project root (always relative to this script) ***REMOVED******REMOVED******REMOVED***
SCRIPT_DIR***REMOVED***"$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR***REMOVED***"$(cd "$SCRIPT_DIR/../.." && pwd)"

LOG_DIR***REMOVED***"$PROJECT_DIR/logs"
CONSENSUS_FILE***REMOVED***"$PROJECT_DIR/memories/consensus.md"
PROMPT_FILE***REMOVED***"$PROJECT_DIR/PROMPT.md"
PID_FILE***REMOVED***"$PROJECT_DIR/.auto-loop.pid"
STATE_FILE***REMOVED***"$PROJECT_DIR/.auto-loop-state"

# Loop settings (all overridable via env vars)
MODEL***REMOVED***"${MODEL:-}"
MODEL_LABEL***REMOVED***"${MODEL:-config-default}"
CODEX_BIN***REMOVED***"${CODEX_BIN:-}"
CODEX_SANDBOX_MODE***REMOVED***"${CODEX_SANDBOX_MODE:-danger-full-access}"
LOOP_INTERVAL***REMOVED***"${LOOP_INTERVAL:-30}"
CYCLE_TIMEOUT_SECONDS***REMOVED***"${CYCLE_TIMEOUT_SECONDS:-1800}"
MAX_CONSECUTIVE_ERRORS***REMOVED***"${MAX_CONSECUTIVE_ERRORS:-5}"
COOLDOWN_SECONDS***REMOVED***"${COOLDOWN_SECONDS:-300}"
LIMIT_WAIT_SECONDS***REMOVED***"${LIMIT_WAIT_SECONDS:-3600}"
MAX_LOGS***REMOVED***"${MAX_LOGS:-200}"
RESOLVED_CODEX_BIN***REMOVED***""

# Keep Agent Teams compatibility for legacy prompts/config.
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS***REMOVED***1

# ***REMOVED******REMOVED******REMOVED*** Functions ***REMOVED******REMOVED******REMOVED***

log() {
    local timestamp
    timestamp***REMOVED***$(date '+%Y-%m-%d %H:%M:%S')
    local msg***REMOVED***"[$timestamp] $1"
    echo "$msg" >> "$LOG_DIR/auto-loop.log"
    if [ -t 1 ]; then
        echo "$msg"
    fi
}

log_cycle() {
    local cycle_num***REMOVED***$1
    local status***REMOVED***$2
    local msg***REMOVED***$3
    local timestamp
    timestamp***REMOVED***$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] Cycle #$cycle_num [$status] $msg" >> "$LOG_DIR/auto-loop.log"
    if [ -t 1 ]; then
        echo "[$timestamp] Cycle #$cycle_num [$status] $msg"
    fi
}

check_usage_limit() {
    local output***REMOVED***"$1"
    if echo "$output" | grep -qi "usage limit\|rate limit\|too many requests\|resource_exhausted\|overloaded\|quota\|429\|billing\|insufficient credits"; then
        return 0
    fi
    return 1
}

check_stop_requested() {
    if [ -f "$PROJECT_DIR/.auto-loop-stop" ]; then
        rm -f "$PROJECT_DIR/.auto-loop-stop"
        return 0
    fi
    return 1
}

save_state() {
    cat > "$STATE_FILE" << EOF
LOOP_COUNT***REMOVED***$loop_count
ERROR_COUNT***REMOVED***$error_count
LAST_RUN***REMOVED***$(date '+%Y-%m-%d %H:%M:%S')
STATUS***REMOVED***$1
MODEL***REMOVED***$MODEL_LABEL
ENGINE***REMOVED***codex
EOF
}

cleanup() {
    log "***REMOVED******REMOVED******REMOVED*** Auto Loop Shutting Down (PID $$) ***REMOVED******REMOVED******REMOVED***"
    rm -f "$PID_FILE"
    save_state "stopped"
    exit 0
}

get_file_size_bytes() {
    local target_file***REMOVED***"$1"
    if [ ! -f "$target_file" ]; then
        echo 0
        return
    fi

    if stat -c%s "$target_file" >/dev/null 2>&1; then
        stat -c%s "$target_file"
        return
    fi

    if stat -f%z "$target_file" >/dev/null 2>&1; then
        stat -f%z "$target_file"
        return
    fi

    wc -c < "$target_file" | tr -d ' '
}

rotate_logs() {
    # Keep only the latest N cycle logs
    local count
    count***REMOVED***$(find "$LOG_DIR" -name "cycle-*.log" -type f 2>/dev/null | wc -l | tr -d ' ')
    if [ "$count" -gt "$MAX_LOGS" ]; then
        local to_delete***REMOVED***$((count - MAX_LOGS))
        find "$LOG_DIR" -name "cycle-*.log" -type f | sort | head -n "$to_delete" | xargs rm -f 2>/dev/null || true
        log "Log rotation: removed $to_delete old cycle logs"
    fi

    # Rotate main log if over 10MB
    local log_size
    log_size***REMOVED***$(get_file_size_bytes "$LOG_DIR/auto-loop.log")
    if [ "$log_size" -gt 10485760 ]; then
        mv "$LOG_DIR/auto-loop.log" "$LOG_DIR/auto-loop.log.old"
        log "Main log rotated (was ${log_size} bytes)"
    fi
}

backup_consensus() {
    if [ -f "$CONSENSUS_FILE" ]; then
        cp "$CONSENSUS_FILE" "$CONSENSUS_FILE.bak"
    fi
