#!/bin/bash
# gh-lint-cli metrics tracking script
# Run daily to monitor promotion performance
# Decision Rule: 7 days, >***REMOVED***20 stars ***REMOVED*** continue, <20 ***REMOVED*** deprecate

set -euo pipefail

REPO***REMOVED***"eylulsenakumral/gh-lint-cli"
LOG_DIR***REMOVED***"/home/tolgabrk/projects/Auto-Company/docs/marketing"
LOG_FILE***REMOVED***"$LOG_DIR/ghlint-metrics.log"
START_DATE***REMOVED***"2026-06-06"  # Launch date

# Create log dir if missing
mkdir -p "$LOG_DIR"

# Fetch metrics via gh CLI
REPO_DATA***REMOVED***$(gh repo view "$REPO" --json stargazerCount,forkCount 2>/dev/null || echo '{"stargazerCount":0,"forkCount":0}')
STARS***REMOVED***$(echo "$REPO_DATA" | jq -r '.stargazerCount // 0')
FORKS***REMOVED***$(echo "$REPO_DATA" | jq -r '.forkCount // 0')

# Timestamp
TIMESTAMP***REMOVED***$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Calculate days since launch
DAYS_SINCE***REMOVED***$(( ($(date +%s) - $(date -d "$START_DATE" +%s 2>/dev/null || echo "0")) / 86400 ))
[ "$DAYS_SINCE" -lt 0 ] && DAYS_SINCE***REMOVED***0

# Write log entry
echo "[$TIMESTAMP] repo***REMOVED***$REPO stars***REMOVED***$STARS forks***REMOVED***$FORKS days_since_launch***REMOVED***$DAYS_SINCE" >> "$LOG_FILE"

# Print to stdout
echo "***REMOVED******REMOVED******REMOVED*** gh-lint-cli Metrics ***REMOVED******REMOVED******REMOVED***"
echo "Timestamp: $TIMESTAMP"
echo "Stars: $STARS"
echo "Forks: $FORKS"
echo "Days since launch: $DAYS_SINCE"
echo ""

# Decision check at day 7
if [ "$DAYS_SINCE" -ge 7 ]; then
    if [ "$STARS" -ge 20 ]; then
        echo "DECISION: PASS (>***REMOVED***20 stars in 7 days) - Continue project"
        echo "[$TIMESTAMP] DECISION***REMOVED***PASS stars***REMOVED***$STARS >***REMOVED***20" >> "$LOG_FILE"
    else
        echo "DECISION: FAIL (<20 stars in 7 days) - Deprecate project"
        echo "[$TIMESTAMP] DECISION***REMOVED***FAIL stars***REMOVED***$STARS <20" >> "$LOG_FILE"
    fi
else
    REMAINING***REMOVED***$((7 - DAYS_SINCE))
    echo "Status: Tracking... ($REMAINING days until decision)"
    echo "[$TIMESTAMP] STATUS***REMOVED***TRACKING days_remaining***REMOVED***$REMAINING" >> "$LOG_FILE"
fi

echo "Log: $LOG_FILE"
