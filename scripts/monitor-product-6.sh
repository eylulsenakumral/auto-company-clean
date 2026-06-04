#!/usr/bin/env bash
# Product #6 (changelog-generator) GitHub Metrics Monitor
# Tracks: stars, forks, issues, watchers, activity
# Outputs: JSON history + ASCII charts + color-coded status

set -euo pipefail

REPO***REMOVED***"eylulsenakumral/changelog-generator"
SCRIPT_DIR***REMOVED***"$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
METRICS_FILE***REMOVED***"${SCRIPT_DIR}/metrics-product-6.jsonl"
TIMESTAMP***REMOVED***$(date -u +"%Y-%m-%dT%H:%M:%SZ")
API_BASE***REMOVED***"https://api.github.com"

# Color codes
RED***REMOVED***'\033[0;31m'
YELLOW***REMOVED***'\033[0;33m'
GREEN***REMOVED***'\033[0;32m'
NC***REMOVED***'\033[0m' # No Color

# Check if gh CLI is authenticated
if gh auth status &>/dev/null; then
    USE_GH_CLI***REMOVED***true
else
    USE_GH_CLI***REMOVED***false
    if [ -z "${GH_TOKEN:-}" ]; then
        echo "WARNING: gh CLI not authenticated and GH_TOKEN not set. Using unauthenticated API (rate limited)." >&2
    fi
fi

# Fetch metrics using gh CLI or fallback to curl
fetch_metrics() {
    local repo***REMOVED***$1

    if [ "$USE_GH_CLI" ***REMOVED*** true ]; then
        # Use gh CLI for authenticated requests
        local repo_data***REMOVED***$(gh repo view "$repo" --json stargazerCount,forkCount,watcherCount,openIssues:totalCount,updatedAt,createdAt --jq -c .)

        # Get recent commits count (last 7 days)
        local since_date***REMOVED***$(date -d '7 days ago' -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -v-7d -u +"%Y-%m-%dT%H:%M:%SZ")
        local recent_commits***REMOVED***$(gh api "repos/$repo/commits?since***REMOVED***$since_date&per_page***REMOVED***100" --jq '. | length' 2>/dev/null || echo "0")

        # Get open PRs count
        local open_prs***REMOVED***$(gh api "repos/$repo/pulls?state***REMOVED***open&per_page***REMOVED***100" --jq '. | length' 2>/dev/null || echo "0")

        # Get latest release
        local latest_release***REMOVED***$(gh api "repos/$repo/releases/latest" --jq -r '.tag_name // "none"' 2>/dev/null || echo "none")
    else
        # Fallback to curl with or without token
        local auth_header***REMOVED***""
        if [ -n "${GH_TOKEN:-}" ]; then
            auth_header***REMOVED***"-H \"Authorization: token $GH_TOKEN\""
        fi

        # Fetch repo data via curl - compact JSON
        local repo_data***REMOVED***$(curl -s ${auth_header} "$API_BASE/repos/$repo" | jq -c '{
            stargazerCount: .stargazers_count,
            forkCount: .forks_count,
            watcherCount: .subscribers_count,
            openIssues: .open_issues_count,
            updatedAt: .updated_at,
            createdAt: .created_at
        }')

        # Get recent commits
        local since_date***REMOVED***$(date -d '7 days ago' -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -v-7d -u +"%Y-%m-%dT%H:%M:%SZ")
        local recent_commits***REMOVED***$(curl -s ${auth_header} "$API_BASE/repos/$repo/commits?since***REMOVED***$since_date&per_page***REMOVED***100" | jq '. | length' 2>/dev/null || echo "0")

        # Get open PRs
        local open_prs***REMOVED***$(curl -s ${auth_header} "$API_BASE/repos/$repo/pulls?state***REMOVED***open&per_page***REMOVED***100" | jq '. | length' 2>/dev/null || echo "0")

        # Get latest release
        local latest_release***REMOVED***$(curl -s ${auth_header} "$API_BASE/repos/$repo/releases/latest" | jq -r '.tag_name // "none"' 2>/dev/null || echo "none")
    fi

    # Estimate closed issues
    local open_issues***REMOVED***$(echo "$repo_data" | jq -r '.openIssues // 0')
    local closed_issues***REMOVED***0  # Simplified - total issues tracking would need additional API calls

    # Combine all metrics - output as compact JSON
    jq -c -n \
        --arg timestamp "$TIMESTAMP" \
        --argjson repo_data "$repo_data" \
        --argjson recent_commits "$recent_commits" \
        --argjson open_prs "$open_prs" \
        --argjson closed_issues "$closed_issues" \
        --arg latest_release "$latest_release" \
        '$repo_data + {
            timestamp: $timestamp,
            recent_commits_7d: $recent_commits,
            open_prs: $open_prs,
            closed_issues: $closed_issues,
            latest_release: $latest_release
        }'
}

# Calculate day-over-day growth
calculate_growth() {
    local current***REMOVED***$1
    local previous***REMOVED***$2

    if [ -z "$previous" ] || [ "$previous" ***REMOVED*** "null" ] || [ "$previous" -eq 0 ] 2>/dev/null; then
        if [ "$current" -gt 0 ] 2>/dev/null; then
            echo "100.0"
        else
            echo "0.0"
        fi
    else
        awk "BEGIN {printf \"%.1f\", (($current - $previous) / $previous) * 100}"
    fi
}

# Get color based on threshold
get_color() {
    local value***REMOVED***$1
    local green_min***REMOVED***$2
    local yellow_min***REMOVED***$3

    if [ "$value" -ge "$green_min" ] 2>/dev/null; then
        echo -n "$GREEN"
    elif [ "$value" -ge "$yellow_min" ] 2>/dev/null; then
        echo -n "$YELLOW"
    else
        echo -n "$RED"
    fi
}

# Generate ASCII chart for stars
generate_chart() {
    local data_json***REMOVED***$1
    local width***REMOVED***${2:-40}
    local height***REMOVED***${3:-10}

    # Parse JSON array to get values
    local max***REMOVED***0
    local count***REMOVED***0
    local values***REMOVED***()

    while IFS***REMOVED*** read -r val; do
        if [ -n "$val" ] && [ "$val" !***REMOVED*** "null" ] && [ "$val" -eq "$val" ] 2>/dev/null; then
            values+***REMOVED***("$val")
            if [ "$val" -gt "$max" ] 2>/dev/null; then
                max***REMOVED***$val
            fi
            ((count++))
        fi
    done < <(echo "$data_json" | jq -r '.[]')

    if [ "$max" -le 0 ] 2>/dev/null || [ ${#values[@]} -eq 0 ]; then
        echo "No data available for chart"
        return
    fi

    echo "Stars Growth (last $count measurements):"
    echo "┌$(printf '─%.0s' $(seq 1 $width))┐"

    for ((i***REMOVED***height; i>***REMOVED***0; i--)); do
        printf "│"
        for val in "${values[@]}"; do
            local bar_height***REMOVED***$((val * height / max))
            if [ "$bar_height" -ge "$i" ]; then
                if [ "$i" -eq $((height)) ]; then
                    printf "█"
                elif [ "$i" -gt $((height * 2 / 3)) ]; then
                    printf "▓"
                elif [ "$i" -gt $((height / 3)) ]; then
                    printf "▒"
                else
                    printf "░"
                fi
            else
                printf " "
            fi
        done
        printf "│"
        if [ $i -eq 0 ]; then
            printf " %d" "$max"
        elif [ $i -eq "$height" ]; then
            printf " %d" 0
        fi
        printf "\n"
    done

    echo "└$(printf '─%.0s' $(seq 1 $width))┘"
}

# Read last measurement from history
get_last_metrics() {
    if [ -f "$METRICS_FILE" ] && [ -s "$METRICS_FILE" ]; then
        # Get last valid JSON line
        tail -10 "$METRICS_FILE" | while IFS***REMOVED*** read -r line; do
            if echo "$line" | jq -e '.' >/dev/null 2>&1; then
                echo "$line"
                return
            fi
        done
    fi
    echo ""
}

# Main execution
main() {
    # Fetch current metrics
    local current_metrics***REMOVED***$(fetch_metrics "$REPO")

    # Validate we got valid JSON
    if ! echo "$current_metrics" | jq -e '.' >/dev/null 2>&1; then
        echo "ERROR: Failed to fetch valid metrics from GitHub API" >&2
        echo "Got: $current_metrics" >&2
        exit 1
    fi

    # Get last metrics for comparison
    local last_metrics***REMOVED***$(get_last_metrics)

    # Calculate growth if we have previous data
    local stars_growth***REMOVED***"0.0"
    local forks_growth***REMOVED***"0.0"
    local watchers_growth***REMOVED***"0.0"

    if [ -n "$last_metrics" ]; then
        local prev_stars***REMOVED***$(echo "$last_metrics" | jq -r '.stargazerCount // 0')
        local curr_stars***REMOVED***$(echo "$current_metrics" | jq -r '.stargazerCount // 0')
        stars_growth***REMOVED***$(calculate_growth "$curr_stars" "$prev_stars")

        local prev_forks***REMOVED***$(echo "$last_metrics" | jq -r '.forkCount // 0')
        local curr_forks***REMOVED***$(echo "$current_metrics" | jq -r '.forkCount // 0')
        forks_growth***REMOVED***$(calculate_growth "$curr_forks" "$prev_forks")

        local prev_watchers***REMOVED***$(echo "$last_metrics" | jq -r '.watcherCount // 0')
        local curr_watchers***REMOVED***$(echo "$current_metrics" | jq -r '.watcherCount // 0')
        watchers_growth***REMOVED***$(calculate_growth "$curr_watchers" "$prev_watchers")
    fi

    # Append to history
    mkdir -p "$(dirname "$METRICS_FILE")"
    echo "$current_metrics" >> "$METRICS_FILE"

    # Extract values for display with null safety
    local stars***REMOVED***$(echo "$current_metrics" | jq -r '.stargazerCount // 0')
    local forks***REMOVED***$(echo "$current_metrics" | jq -r '.forkCount // 0')
    local watchers***REMOVED***$(echo "$current_metrics" | jq -r '.watcherCount // 0')
    local open_issues***REMOVED***$(echo "$current_metrics" | jq -r '.openIssues // 0')
    local recent_commits***REMOVED***$(echo "$current_metrics" | jq -r '.recent_commits_7d // 0')
    local open_prs***REMOVED***$(echo "$current_metrics" | jq -r '.open_prs // 0')
    local latest_release***REMOVED***$(echo "$current_metrics" | jq -r '.latest_release // "none"')
    local updated***REMOVED***$(echo "$current_metrics" | jq -r '.updatedAt // "unknown"')

    # Calculate engagement score (commits + issues + PRs activity)
    local engagement***REMOVED***$((recent_commits + open_issues + open_prs))

    # Print header
    echo -e "\n${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Product #6: changelog-generator - GitHub Metrics${NC}"
    echo -e "${GREEN}  Repository: $REPO${NC}"
    echo -e "${GREEN}  Updated: $updated${NC}"
    echo -e "${GREEN}  Using: $([ "$USE_GH_CLI" ***REMOVED*** true ] && echo "gh CLI" || echo "GitHub API (curl)")${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}\n"

    # Print metrics with colors
    local stars_color***REMOVED***$(get_color "$stars" 10 5)
    local engagement_color***REMOVED***$(get_color "$engagement" 5 2)

    echo -e "⭐ Stars:       ${stars_color}$stars${NC} ($stars_growth% vs last)"
    echo -e "🍴 Forks:       $forks ($forks_growth% vs last)"
    echo -e "👀 Watchers:    $watchers ($watchers_growth% vs last)"
    echo -e "📋 Open Issues: $open_issues"
    echo -e "🔧 Open PRs:    $open_prs"
    echo -e "📝 Commits (7d):$recent_commits"
    echo -e "🏷️  Latest:     $latest_release"

    echo -e "\n${GREEN}───────────────────────────────────────────────────────────────${NC}"

    # Status indicators
    local stars_status***REMOVED***"RED"
    [ "$stars" -ge 10 ] 2>/dev/null && stars_status***REMOVED***"GREEN"
    [ "$stars" -ge 5 ] 2>/dev/null && [ "$stars" -lt 10 ] 2>/dev/null && stars_status***REMOVED***"YELLOW"

    echo -e "Stars Status:    ${stars_color}[${stars_status}]${NC}"
    echo -e "Engagement:     ${engagement_color}[$engagement actions${NC}"
    echo -e "${GREEN}───────────────────────────────────────────────────────────────${NC}\n"

    # Generate ASCII chart from last 10 measurements
    local measurements***REMOVED***$(tail -10 "$METRICS_FILE" | while IFS***REMOVED*** read -r line; do
        if echo "$line" | jq -e '.stargazerCount' >/dev/null 2>&1; then
            echo "$line" | jq -r '.stargazerCount'
        fi
    done | jq -s '.')

    if [ "$measurements" !***REMOVED*** "[]" ] && [ "$measurements" !***REMOVED*** "null" ] && [ -n "$measurements" ]; then
        generate_chart "$measurements"
    fi

    echo -e "\n📁 History saved to: $METRICS_FILE"
    echo "📊 Total measurements: $(wc -l < "$METRICS_FILE" 2>/dev/null || echo "0")"
}

# Run main function
main "$@"
