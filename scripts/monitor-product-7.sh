#!/bin/bash
# Product #7 Monitoring: Smoke Test Landing Pages
# Tracks: GitHub stars, GitHub Pages traffic (via external API), form submissions
# Runs: Every 6 hours via cron

REPO***REMOVED***"eylulsenakumral/smoke-test-landing-pages"
LOG_DIR***REMOVED***"/home/tolgabrk/projects/Auto-Company/logs/monitoring"
LOG_FILE***REMOVED***"$LOG_DIR/product7-$(date +%Y%m%d).csv"
API_URL***REMOVED***"https://api.github.com/repos/$REPO"
PAGES_URL***REMOVED***"https://eylulsenakumral.github.io/smoke-test-landing-pages/"

# Create log directory
mkdir -p "$LOG_DIR"

# Initialize log file with headers if it doesn't exist
if [ ! -f "$LOG_FILE" ]; then
    echo "timestamp,stars,forks,open_issues,pageviews_check,forms_status" > "$LOG_FILE"
fi

# Fetch metrics from GitHub API
METRICS***REMOVED***$(curl -s "$API_URL")
STARS***REMOVED***$(echo "$METRICS" | jq -r '.stargazers_count')
FORKS***REMOVED***$(echo "$METRICS" | jq -r '.forks_count')
OPEN_ISSUES***REMOVED***$(echo "$METRICS" | jq -r '.open_issues_count')

# Check if landing pages are accessible (basic health check)
PAGE_STATUS***REMOVED***$(curl -s -o /dev/null -w "%{http_code}" "$PAGES_URL")

# Formspree check (placeholder - would need API integration)
FORMS_STATUS***REMOVED***"unknown"
# If Formspree API available, check submission count here

# Log all metrics
TIMESTAMP***REMOVED***$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "$TIMESTAMP,$STARS,$FORKS,$OPEN_ISSUES,$PAGE_STATUS,$FORMS_STATUS" >> "$LOG_FILE"

# Output summary
echo "***REMOVED******REMOVED******REMOVED*** Product #7 Monitoring ***REMOVED******REMOVED******REMOVED***"
echo "Timestamp: $TIMESTAMP"
echo "Stars: $STARS (+$(tail -n 2 "$LOG_FILE" | head -n 1 | cut -d',' -f2 | awk -v s***REMOVED***"$STARS" '{print s-$1}'))"
echo "Forks: $FORKS"
echo "Open Issues: $OPEN_ISSUES"
echo "Landing Pages Status: $PAGE_STATUS"
echo "Forms Status: $FORMS_STATUS"
echo "Logged to: $LOG_FILE"

# Alert if landing pages down
if [ "$PAGE_STATUS" !***REMOVED*** "200" ]; then
    echo "🚨 ALERT: Landing pages returning $PAGE_STATUS"
fi

# Alert if stars > 30 (lower threshold for landing page product)
if [ "$STARS" -gt 30 ]; then
    echo "🚨 TRACTION ALERT: $STARS stars!"
    echo "Consider doubling down on this product."
fi

# Alert if new issue filed (skip if first run)
if [ $(wc -l < "$LOG_FILE") -gt 1 ]; then
    LAST_ISSUES***REMOVED***$(tail -n 2 "$LOG_FILE" | head -n 1 | cut -d',' -f4)
    if [ -n "$LAST_ISSUES" ] && [ "$LAST_ISSUES" !***REMOVED*** "open_issues" ] && [ "$OPEN_ISSUES" -gt "$LAST_ISSUES" ]; then
        echo "📋 NEW ISSUE: User engagement detected!"
    fi
fi
