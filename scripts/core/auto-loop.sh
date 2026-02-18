#!/bin/bash
# ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***
# Auto Company — 24/7 Autonomous Loop
# ***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***
# Keeps selected CLI engine (Claude/Codex) running continuously.
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
#   ENGINE***REMOVED***claude               # Engine selection: claude|codex (default: claude)
#   MODEL***REMOVED***...                   # Optional model override (empty ***REMOVED*** engine default)
#   CLAUDE_BIN***REMOVED***...              # Optional Claude executable override
#   CLAUDE_PERMISSION_MODE***REMOVED***bypassPermissions
#                               # Claude permission mode (default: bypassPermissions)
#   CODEX_BIN***REMOVED***...               # Optional Codex executable override
#   CODEX_SANDBOX_MODE***REMOVED***danger-full-access
#                               # Codex sandbox mode (only for ENGINE***REMOVED***codex)
#   LOOP_INTERVAL***REMOVED***30            # Seconds between cycles (default: 30)
#   CYCLE_TIMEOUT_SECONDS***REMOVED***1800  # Max seconds per cycle before force-kill
#   MAX_CONSECUTIVE_ERRORS***REMOVED***5    # Circuit breaker threshold
#   COOLDOWN_SECONDS***REMOVED***300        # Cooldown after circuit break
#   LIMIT_WAIT_SECONDS***REMOVED***3600     # Wait on usage limit
#   MAX_LOGS***REMOVED***200                # Max cycle logs to keep
#   AUTO_LOOP_PROTECT_GITIGNORE***REMOVED***1
#                               # Restore .gitignore if a cycle mutates it
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
ENGINE***REMOVED***"${ENGINE:-claude}"
ENGINE***REMOVED***"$(echo "$ENGINE" | tr '[:upper:]' '[:lower:]')"
MODEL***REMOVED***"${MODEL:-}"
MODEL_LABEL***REMOVED***"${MODEL:-config-default}"
CLAUDE_BIN***REMOVED***"${CLAUDE_BIN:-}"
CLAUDE_PERMISSION_MODE***REMOVED***"${CLAUDE_PERMISSION_MODE:-bypassPermissions}"
CODEX_BIN***REMOVED***"${CODEX_BIN:-}"
CODEX_SANDBOX_MODE***REMOVED***"${CODEX_SANDBOX_MODE:-danger-full-access}"
LOOP_INTERVAL***REMOVED***"${LOOP_INTERVAL:-30}"
CYCLE_TIMEOUT_SECONDS***REMOVED***"${CYCLE_TIMEOUT_SECONDS:-1800}"
MAX_CONSECUTIVE_ERRORS***REMOVED***"${MAX_CONSECUTIVE_ERRORS:-5}"
COOLDOWN_SECONDS***REMOVED***"${COOLDOWN_SECONDS:-300}"
LIMIT_WAIT_SECONDS***REMOVED***"${LIMIT_WAIT_SECONDS:-3600}"
MAX_LOGS***REMOVED***"${MAX_LOGS:-200}"
AUTO_LOOP_PROTECT_GITIGNORE***REMOVED***"${AUTO_LOOP_PROTECT_GITIGNORE:-1}"
RESOLVED_ENGINE_BIN***REMOVED***""

if [ "$ENGINE" !***REMOVED*** "claude" ] && [ "$ENGINE" !***REMOVED*** "codex" ]; then
    echo "Error: ENGINE must be 'claude' or 'codex' (received: '$ENGINE')."
    exit 1
fi

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
ENGINE***REMOVED***$ENGINE
EOF
}

cleanup() {
    log "***REMOVED******REMOVED******REMOVED*** Auto Loop Shutting Down (PID $$) ***REMOVED******REMOVED******REMOVED***"
    rm -f "$PID_FILE"
    save_state "stopped"
    exit 0
}

snapshot_gitignore() {
    if [ "$AUTO_LOOP_PROTECT_GITIGNORE" ***REMOVED*** "0" ]; then
        echo ""
        return
    fi

    local gitignore_file***REMOVED***"$PROJECT_DIR/.gitignore"
    local snapshot_file***REMOVED***""
    if [ -f "$gitignore_file" ]; then
        snapshot_file***REMOVED***$(mktemp)
        cp "$gitignore_file" "$snapshot_file"
    fi
    echo "$snapshot_file"
}

restore_gitignore_if_changed() {
    local snapshot_file***REMOVED***"$1"
    if [ "$AUTO_LOOP_PROTECT_GITIGNORE" ***REMOVED*** "0" ]; then
        [ -n "$snapshot_file" ] && rm -f "$snapshot_file"
        return
    fi

    local gitignore_file***REMOVED***"$PROJECT_DIR/.gitignore"
    local changed***REMOVED***0

    if [ -f "$gitignore_file" ]; then
        if [ -z "$snapshot_file" ] || [ ! -f "$snapshot_file" ]; then
            changed***REMOVED***1
        elif ! cmp -s "$gitignore_file" "$snapshot_file"; then
            changed***REMOVED***1
        fi
    else
        if [ -n "$snapshot_file" ] && [ -f "$snapshot_file" ]; then
            changed***REMOVED***1
        fi
    fi

    if [ "$changed" -eq 1 ]; then
        if [ -n "$snapshot_file" ] && [ -f "$snapshot_file" ]; then
            cp "$snapshot_file" "$gitignore_file"
            log_cycle "$loop_count" "GUARD" "Blocked cycle mutation of .gitignore and restored baseline"
        else
            rm -f "$gitignore_file"
            log_cycle "$loop_count" "GUARD" "Blocked cycle-created .gitignore and removed it"
        fi
    fi

    [ -n "$snapshot_file" ] && rm -f "$snapshot_file"
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

cleanup_accidental_root_artifacts() {
    local removed***REMOVED***0
    local removed_names***REMOVED***""
    local f base

    # Known accidental artifacts caused by malformed shell redirections in generated commands.
    for f in "$PROJECT_DIR"/***REMOVED**** "$PROJECT_DIR"/口径说明*; do
        [ -f "$f" ] || continue
        if [ ! -s "$f" ]; then
            rm -f "$f"
            removed***REMOVED***$((removed + 1))
            base***REMOVED***$(basename "$f")
            if [ -z "$removed_names" ]; then
                removed_names***REMOVED***"$base"
            else
                removed_names***REMOVED***"$removed_names, $base"
            fi
        fi
    done

    if [ "$removed" -gt 0 ]; then
        log_cycle "$loop_count" "GUARD" "Removed accidental root zero-byte artifact(s): $removed_names"
    fi
}

backup_consensus() {
    if [ -f "$CONSENSUS_FILE" ]; then
        cp "$CONSENSUS_FILE" "$CONSENSUS_FILE.bak"
    fi
}

restore_consensus() {
    if [ -f "$CONSENSUS_FILE.bak" ]; then
        cp "$CONSENSUS_FILE.bak" "$CONSENSUS_FILE"
        log "Consensus restored from backup after failed cycle"
    fi
}

validate_consensus() {
    if [ ! -s "$CONSENSUS_FILE" ]; then
        return 1
    fi
    if ! grep -q "^# Auto Company Consensus" "$CONSENSUS_FILE"; then
        return 1
    fi
    if ! grep -q "^## Next Action" "$CONSENSUS_FILE"; then
        return 1
    fi
    if ! grep -q "^## Company State" "$CONSENSUS_FILE"; then
        return 1
    fi
    return 0
}

consensus_changed_since_backup() {
    if [ ! -f "$CONSENSUS_FILE" ]; then
        return 1
    fi

    if [ ! -f "$CONSENSUS_FILE.bak" ]; then
        return 0
    fi

    if cmp -s "$CONSENSUS_FILE" "$CONSENSUS_FILE.bak"; then
        return 1
    fi

    return 0
}

resolve_codex_bin() {
    if [ -n "$CODEX_BIN" ]; then
        if [ -x "$CODEX_BIN" ]; then
            echo "$CODEX_BIN"
            return 0
        fi
        if command -v "$CODEX_BIN" >/dev/null 2>&1; then
            command -v "$CODEX_BIN"
            return 0
        fi
    fi

    # Prefer WSL-local Codex installed via nvm.
    local nvm_candidate***REMOVED***""
    for candidate in "$HOME"/.nvm/versions/node/*/bin/codex; do
        if [ -x "$candidate" ]; then
            nvm_candidate***REMOVED***"$candidate"
        fi
    done
    if [ -n "$nvm_candidate" ]; then
        echo "$nvm_candidate"
        return 0
    fi

    # Fallback: ask an interactive bash shell (loads user profile).
    local interactive_candidate
    interactive_candidate***REMOVED***$(bash -ic 'command -v codex' 2>/dev/null | tail -n1 | tr -d '\r' || true)
    if [ -n "$interactive_candidate" ] && [ -x "$interactive_candidate" ]; then
        echo "$interactive_candidate"
        return 0
    fi

    # Last fallback: current shell PATH.
    if command -v codex >/dev/null 2>&1; then
        command -v codex
        return 0
    fi

    return 1
}

resolve_claude_bin() {
    if [ -n "$CLAUDE_BIN" ]; then
        if [ -x "$CLAUDE_BIN" ]; then
            echo "$CLAUDE_BIN"
            return 0
        fi
        if command -v "$CLAUDE_BIN" >/dev/null 2>&1; then
            command -v "$CLAUDE_BIN"
            return 0
        fi
    fi

    # Prefer WSL-local Claude CLI installed via nvm.
    local nvm_candidate***REMOVED***""
    for candidate in "$HOME"/.nvm/versions/node/*/bin/claude; do
        if [ -x "$candidate" ]; then
            nvm_candidate***REMOVED***"$candidate"
        fi
    done
    if [ -n "$nvm_candidate" ]; then
        echo "$nvm_candidate"
        return 0
    fi

    # Fallback: ask an interactive bash shell (loads user profile).
    local interactive_candidate
    interactive_candidate***REMOVED***$(bash -ic 'command -v claude' 2>/dev/null | tail -n1 | tr -d '\r' || true)
    if [ -n "$interactive_candidate" ] && [ -x "$interactive_candidate" ]; then
        echo "$interactive_candidate"
        return 0
    fi

    # Last fallback: current shell PATH.
    if command -v claude >/dev/null 2>&1; then
        command -v claude
        return 0
    fi

    return 1
}

resolve_engine_bin() {
    case "$ENGINE" in
        claude)
            resolve_claude_bin
            ;;
        codex)
            resolve_codex_bin
            ;;
        *)
            return 1
            ;;
    esac
}

run_codex_cycle() {
    local prompt***REMOVED***"$1"
    local output_file timeout_flag message_file

    output_file***REMOVED***$(mktemp)
    timeout_flag***REMOVED***$(mktemp)
    message_file***REMOVED***$(mktemp)

    set +e
    (
        cd "$PROJECT_DIR" || exit 1
        local codex_cmd***REMOVED***("$RESOLVED_ENGINE_BIN" "exec" "-c" "sandbox_mode***REMOVED***\"${CODEX_SANDBOX_MODE}\"" "-o" "$message_file")
        if [ -n "$MODEL" ]; then
            codex_cmd+***REMOVED***("-m" "$MODEL")
        fi
        codex_cmd+***REMOVED***("$prompt")
        "${codex_cmd[@]}"
    ) > "$output_file" 2>&1 &
    local codex_pid***REMOVED***$!

    (
        sleep "$CYCLE_TIMEOUT_SECONDS"
        if kill -0 "$codex_pid" 2>/dev/null; then
            echo "1" > "$timeout_flag"
            kill -TERM "$codex_pid" 2>/dev/null || true
            sleep 5
            kill -KILL "$codex_pid" 2>/dev/null || true
        fi
    ) &
    local watchdog_pid***REMOVED***$!

    wait "$codex_pid"
    EXIT_CODE***REMOVED***$?

    kill "$watchdog_pid" 2>/dev/null || true
    wait "$watchdog_pid" 2>/dev/null || true
    set -e

    OUTPUT***REMOVED***$(cat "$output_file")
    RESULT_MESSAGE***REMOVED***$(cat "$message_file" 2>/dev/null || true)
    rm -f "$output_file" "$message_file"

    if [ -s "$timeout_flag" ]; then
        CYCLE_TIMED_OUT***REMOVED***1
        EXIT_CODE***REMOVED***124
    else
        CYCLE_TIMED_OUT***REMOVED***0
    fi
    rm -f "$timeout_flag"
}

run_claude_cycle() {
    local prompt***REMOVED***"$1"
    local output_file timeout_flag

    output_file***REMOVED***$(mktemp)
    timeout_flag***REMOVED***$(mktemp)

    set +e
    (
        cd "$PROJECT_DIR" || exit 1
        local claude_cmd***REMOVED***("$RESOLVED_ENGINE_BIN" "-p" "$prompt" "--output-format" "json")
        if [ -n "$MODEL" ]; then
            claude_cmd+***REMOVED***("--model" "$MODEL")
        fi
        if [ -n "$CLAUDE_PERMISSION_MODE" ]; then
            claude_cmd+***REMOVED***("--permission-mode" "$CLAUDE_PERMISSION_MODE")
        fi
        "${claude_cmd[@]}"
    ) > "$output_file" 2>&1 &
    local claude_pid***REMOVED***$!

    (
        sleep "$CYCLE_TIMEOUT_SECONDS"
        if kill -0 "$claude_pid" 2>/dev/null; then
            echo "1" > "$timeout_flag"
            kill -TERM "$claude_pid" 2>/dev/null || true
            sleep 5
            kill -KILL "$claude_pid" 2>/dev/null || true
        fi
    ) &
    local watchdog_pid***REMOVED***$!

    wait "$claude_pid"
    EXIT_CODE***REMOVED***$?

    kill "$watchdog_pid" 2>/dev/null || true
    wait "$watchdog_pid" 2>/dev/null || true
    set -e

    OUTPUT***REMOVED***$(cat "$output_file")
    RESULT_MESSAGE***REMOVED***"$OUTPUT"
    rm -f "$output_file"

    if [ -s "$timeout_flag" ]; then
        CYCLE_TIMED_OUT***REMOVED***1
        EXIT_CODE***REMOVED***124
    else
        CYCLE_TIMED_OUT***REMOVED***0
    fi
    rm -f "$timeout_flag"
}

run_engine_cycle() {
    local prompt***REMOVED***"$1"
    case "$ENGINE" in
        claude)
            run_claude_cycle "$prompt"
            ;;
        codex)
            run_codex_cycle "$prompt"
            ;;
        *)
            echo "Error: Unsupported ENGINE '$ENGINE'" >&2
            return 1
            ;;
    esac
}

extract_cycle_metadata() {
    RESULT_TEXT***REMOVED***""
    CYCLE_COST***REMOVED***"N/A"
    CYCLE_SUBTYPE***REMOVED***"unknown"
    CYCLE_TYPE***REMOVED***"${ENGINE}_exec"

    if [ "$ENGINE" ***REMOVED*** "claude" ]; then
        if command -v jq >/dev/null 2>&1; then
            RESULT_TEXT***REMOVED***$(echo "$RESULT_MESSAGE" | jq -r '.result // .message // .output_text // empty' 2>/dev/null | head -c 2000 || true)
            if [ -z "$RESULT_TEXT" ]; then
                RESULT_TEXT***REMOVED***$(echo "$RESULT_MESSAGE" | jq -r '.. | .text? // empty' 2>/dev/null | head -c 2000 || true)
            fi

            parsed_cost***REMOVED***$(echo "$RESULT_MESSAGE" | jq -r '.total_cost_usd // .cost_usd // empty' 2>/dev/null || true)
            if [ -n "$parsed_cost" ]; then
                CYCLE_COST***REMOVED***"$parsed_cost"
            fi

            parsed_subtype***REMOVED***$(echo "$RESULT_MESSAGE" | jq -r '.subtype // empty' 2>/dev/null || true)
            if [ -n "$parsed_subtype" ]; then
                CYCLE_SUBTYPE***REMOVED***"$parsed_subtype"
            fi

            parsed_type***REMOVED***$(echo "$RESULT_MESSAGE" | jq -r '.type // empty' 2>/dev/null || true)
            if [ -n "$parsed_type" ]; then
                CYCLE_TYPE***REMOVED***"$parsed_type"
            fi
        fi

        if [ -z "$RESULT_TEXT" ]; then
            RESULT_TEXT***REMOVED***$(echo "$OUTPUT" | head -c 2000 || true)
        fi

        if [ "$CYCLE_SUBTYPE" ***REMOVED*** "unknown" ]; then
            if [ "$EXIT_CODE" -eq 0 ]; then
                CYCLE_SUBTYPE***REMOVED***"success"
            else
                CYCLE_SUBTYPE***REMOVED***"error"
            fi
        fi
        return
    fi

    RESULT_TEXT***REMOVED***$(echo "$RESULT_MESSAGE" | head -c 2000 || true)
    if [ -z "$RESULT_TEXT" ]; then
        RESULT_TEXT***REMOVED***$(echo "$OUTPUT" | head -c 2000 || true)
    fi

    if [ "$EXIT_CODE" -eq 0 ]; then
        CYCLE_SUBTYPE***REMOVED***"success"
    else
        CYCLE_SUBTYPE***REMOVED***"error"
    fi
}

# ***REMOVED******REMOVED******REMOVED*** Setup ***REMOVED******REMOVED******REMOVED***

mkdir -p "$LOG_DIR" "$PROJECT_DIR/memories"

# Clean up stale stop file from previous run
rm -f "$PROJECT_DIR/.auto-loop-stop"

# Check for existing instance
if [ -f "$PID_FILE" ]; then
    existing_pid***REMOVED***$(cat "$PID_FILE")
    if kill -0 "$existing_pid" 2>/dev/null; then
        echo "Auto loop already running (PID $existing_pid). Stop it first with ./stop-loop.sh"
        exit 1
    fi
fi

# Check dependencies
if ! RESOLVED_CODEX_BIN***REMOVED***"$(resolve_codex_bin)"; then
    echo "Error: Codex CLI not found. Install Codex in WSL and verify with 'codex --version'."
    exit 1
fi

if [ ! -f "$PROMPT_FILE" ]; then
    echo "Error: PROMPT.md not found at $PROMPT_FILE"
    exit 1
fi

# Write PID file
echo $$ > "$PID_FILE"

# Trap signals for graceful shutdown
trap cleanup SIGTERM SIGINT SIGHUP

# Initialize counters
loop_count***REMOVED***0
error_count***REMOVED***0

log "***REMOVED******REMOVED******REMOVED*** Auto Company Loop Started (PID $$) ***REMOVED******REMOVED******REMOVED***"
log "Project: $PROJECT_DIR"
log "Engine: codex | Model: $MODEL_LABEL | Sandbox: $CODEX_SANDBOX_MODE"
log "Codex bin: $RESOLVED_CODEX_BIN"
codex_version***REMOVED***$("$RESOLVED_CODEX_BIN" --version 2>/dev/null | head -n1 || true)
case "$RESOLVED_CODEX_BIN" in
    /mnt/c/*)
        log "Warning: Codex binary resolves to Windows-mounted path. Prefer WSL-local install for stability."
        ;;
esac
if [ -n "$codex_version" ]; then
    log "Codex version: $codex_version"
fi
log "Interval: ${LOOP_INTERVAL}s | Timeout: ${CYCLE_TIMEOUT_SECONDS}s | Breaker: ${MAX_CONSECUTIVE_ERRORS} errors"

# ***REMOVED******REMOVED******REMOVED*** Main Loop ***REMOVED******REMOVED******REMOVED***

while true; do
    # Check for stop request
    if check_stop_requested; then
        log "Stop requested. Shutting down gracefully."
        cleanup
    fi

    loop_count***REMOVED***$((loop_count + 1))
    cycle_log***REMOVED***"$LOG_DIR/cycle-$(printf '%04d' "$loop_count")-$(date '+%Y%m%d-%H%M%S').log"

    log_cycle "$loop_count" "START" "Beginning work cycle"
    save_state "running"

    # Log rotation
    rotate_logs

    # Backup consensus before cycle
    backup_consensus

    # Build prompt with consensus pre-injected
    PROMPT***REMOVED***$(cat "$PROMPT_FILE")
    CONSENSUS***REMOVED***$(cat "$CONSENSUS_FILE" 2>/dev/null || echo "No consensus file found. This is the very first cycle.")
    FULL_PROMPT***REMOVED***"$PROMPT

---

## Runtime Guardrails (must follow)

1. Early in the cycle, create or update \`memories/consensus.md\` with the required section skeleton.
2. If work scope is large, persist partial decisions to \`memories/consensus.md\` before deep dives.
3. Prefer shipping one completed milestone over broad parallel exploration.

---

## Current Consensus (pre-loaded, do NOT re-read this file)

$CONSENSUS

---

This is Cycle #$loop_count. Act decisively."

    # Run Codex in headless mode with per-cycle timeout
    run_codex_cycle "$FULL_PROMPT"

    # Save full output to cycle log
    echo "$OUTPUT" > "$cycle_log"

    # Extract result fields for status classification
    extract_cycle_metadata

    cycle_failed_reason***REMOVED***""
    cycle_soft_timeout***REMOVED***0
    if [ "$CYCLE_TIMED_OUT" -eq 1 ]; then
        if validate_consensus && consensus_changed_since_backup; then
            cycle_soft_timeout***REMOVED***1
        else
            cycle_failed_reason***REMOVED***"Timed out after ${CYCLE_TIMEOUT_SECONDS}s"
        fi
    elif [ "$EXIT_CODE" -ne 0 ]; then
        cycle_failed_reason***REMOVED***"Exit code $EXIT_CODE"
    elif ! validate_consensus; then
        cycle_failed_reason***REMOVED***"consensus.md validation failed after cycle"
    fi

    if [ "$cycle_soft_timeout" -eq 1 ]; then
        log_cycle "$loop_count" "OK" "Timed out after ${CYCLE_TIMEOUT_SECONDS}s but consensus was updated; keeping progress (cost: ${CYCLE_COST}, subtype: ${CYCLE_SUBTYPE})"
        if [ -n "$RESULT_TEXT" ]; then
            log_cycle "$loop_count" "SUMMARY" "$(echo "$RESULT_TEXT" | head -c 300)"
        fi
        error_count***REMOVED***0
    elif [ -z "$cycle_failed_reason" ]; then
        log_cycle "$loop_count" "OK" "Completed (cost: ${CYCLE_COST}, subtype: ${CYCLE_SUBTYPE})"
        if [ -n "$RESULT_TEXT" ]; then
            log_cycle "$loop_count" "SUMMARY" "$(echo "$RESULT_TEXT" | head -c 300)"
        fi
        error_count***REMOVED***0
    else
        error_count***REMOVED***$((error_count + 1))
        log_cycle "$loop_count" "FAIL" "$cycle_failed_reason (cost: ${CYCLE_COST}, subtype: ${CYCLE_SUBTYPE}, errors: $error_count/$MAX_CONSECUTIVE_ERRORS)"

        # Restore consensus on hard failure
        restore_consensus

        # Check for usage limit
        if check_usage_limit "$OUTPUT"; then
            log_cycle "$loop_count" "LIMIT" "API usage limit detected. Waiting ${LIMIT_WAIT_SECONDS}s..."
            save_state "waiting_limit"
            sleep "$LIMIT_WAIT_SECONDS"
            error_count***REMOVED***0
            continue
        fi

        # Circuit breaker
        if [ "$error_count" -ge "$MAX_CONSECUTIVE_ERRORS" ]; then
            log_cycle "$loop_count" "BREAKER" "Circuit breaker tripped! Cooling down ${COOLDOWN_SECONDS}s..."
            save_state "circuit_break"
            sleep "$COOLDOWN_SECONDS"
            error_count***REMOVED***0
            log "Circuit breaker reset. Resuming..."
        fi
    fi

    save_state "idle"
    log_cycle "$loop_count" "WAIT" "Sleeping ${LOOP_INTERVAL}s before next cycle..."
    sleep "$LOOP_INTERVAL"
done
