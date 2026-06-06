#!/bin/bash
# ReviewFlow CLI Daily Metrics Check
# Run: ./scripts/check-reviewflow-metrics.sh

set -e

REPO***REMOVED***"eylulsenakumral/reviewflow-cli"
DATE***REMOVED***$(date +%Y-%m-%d)
TIME***REMOVED***$(date +%H:%M)
LOG_FILE***REMOVED***"/home/tolgabrk/projects/Auto-Company/docs/operations/reviewflow-week1-log.md"

echo "***REMOVED******REMOVED******REMOVED*** ReviewFlow CLI Metrics [$DATE $TIME] ***REMOVED******REMOVED******REMOVED***"
echo ""

# Stars
STARS***REMOVED***$(gh repo view $REPO --json stargazerCount -q '.stargazerCount' 2>/dev/null || echo "0")
echo "Stars: $STARS"

# Watchers
WATCHERS***REMOVED***$(gh repo view $REPO --json watchers -q '.watchers.totalCount' 2>/dev/null || echo "0")
echo "Watchers: $WATCHERS"

# Forks
FORKS***REMOVED***$(gh repo view $REPO --json forkCount -q '.forkCount' 2>/dev/null || echo "0")
echo "Forks: $FORKS"

# Issues
ISSUES***REMOVED***$(gh api repos/$REPO -q '.open_issues_count' 2>/dev/null || echo "0")
echo "Open Issues: $ISSUES"

# Open PRs
PR_COUNT***REMOVED***$(gh pr list --repo $REPO --json number -q 'length' 2>/dev/null || echo "0")
echo "Open PRs: $PR_COUNT"

# Discussions (if enabled - check if enabled first)
DISCUSSIONS_ENABLED***REMOVED***$(gh repo view $REPO --json hasDiscussionsEnabled -q '.hasDiscussionsEnabled' 2>/dev/null)
if [ "$DISCUSSIONS_ENABLED" ***REMOVED*** "true" ]; then
    DISCUSSIONS***REMOVED***$(gh api repos/$REPO/discussions 2>/dev/null | jq 'length' 2>/dev/null || echo "0")
else
    DISCUSSIONS***REMOVED***"N/A"
fi
echo "Discussions: $DISCUSSIONS"

# Latest release info
RELEASE_TAG***REMOVED***$(gh repo view $REPO --json latestRelease -q '.latestRelease.tagName' 2>/dev/null)
if [ -n "$RELEASE_TAG" ] && [ "$RELEASE_TAG" !***REMOVED*** "null" ]; then
    echo "Latest Release: $RELEASE_TAG"
    RELEASE_DATE***REMOVED***$(gh repo view $REPO --json latestRelease -q '.latestRelease.publishedAt' 2>/dev/null)
    echo "Published: $RELEASE_DATE"
fi

echo ""
echo "***REMOVED******REMOVED******REMOVED*** Summary ***REMOVED******REMOVED******REMOVED***"
if [ "$DISCUSSIONS" ***REMOVED*** "N/A" ]; then
    TOTAL***REMOVED***$((STARS + FORKS + WATCHERS + ISSUES + PR_COUNT))
else
    TOTAL***REMOVED***$((STARS + FORKS + WATCHERS + ISSUES + PR_COUNT + DISCUSSIONS))
fi
echo "Total Engagement Signals: $TOTAL"

# Append to log file
mkdir -p "$(dirname "$LOG_FILE")"
echo -e "\n## $DATE $TIME\n" >> "$LOG_FILE"
echo -e "| Metric | Value |\n|--------|-------|\n" >> "$LOG_FILE"
echo -e "| Stars | $STARS |\n| Watchers | $WATCHERS |\n| Forks | $FORKS |\n| Issues | $ISSUES |\n| PRs | $PR_COUNT |\n| Discussions | $DISCUSSIONS |\n" >> "$LOG_FILE"

echo "Logged to: $LOG_FILE"
