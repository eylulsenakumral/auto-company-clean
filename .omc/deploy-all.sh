#!/usr/bin/env bash
#
# Auto Company — Master Deploy Script (Path B)
# Orchestrates complete deployment: npm packages + GitHub repos + Landing page
#
# PREREQUISITES:
#   1. npm login (must output your username when running `npm whoami`)
#   2. vercel login (must complete successfully)
#   3. gh auth login (must show "Logged in as" in `gh auth status`)
#
# TIMELINE: 15-30 minutes total
#
# Usage:
#   chmod +x .omc/deploy-all.sh
#   ./.omc/deploy-all.sh
#

set -euo pipefail

# 
# COLORS & CONFIG
# 

readonly GREEN'\033[0;32m'
readonly RED'\033[0;31m'
readonly YELLOW'\033[1;33m'
readonly BLUE'\033[0;34m'
readonly CYAN'\033[0;36m'
readonly BOLD'\033[1m'
readonly NC'\033[0m'

readonly BASE_DIR"/home/tolgabrk/projects/Auto-Company"
readonly LOG_FILE"${BASE_DIR}/.omc/deploy-all-$(date +%Y%m%d-%H%M%S).log"

START_TIME$(date +%s)

# 
# LOGGING FUNCTIONS
# 

log() {
    echo -e "${GRAY}[$(date '+%H:%M:%S')]${NC} $*" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓${NC} $*" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}✗${NC} $*" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $*" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${CYAN}ℹ${NC} $*" | tee -a "$LOG_FILE"
}

header() {
    echo -e "\n${BOLD}${BLUE}$1${NC}" | tee -a "$LOG_FILE"
}

divider() {
    echo -e "${BLUE}${NC}" | tee -a "$LOG_FILE"
}

# 
# PRE-FLIGHT CHECKS
# 

check_prereqs() {
    header "═══════════════════════════════════════════════════════════════"
    header "   Auto Company — Master Deploy Script"
    header "═══════════════════════════════════════════════════════════════"

    mkdir -p "$(dirname "$LOG_FILE")"
    echo "Deploy Log - $(date)" > "$LOG_FILE"

    local all_oktrue

    # Check npm
    echo ""
    info "Checking npm auth..."
    if npm whoami &>/dev/null; then
        NPM_USER$(npm whoami)
        success "npm authenticated as: ${BOLD}${NPM_USER}${NC}"
    else
        error "npm NOT authenticated"
        echo -e "  Run: ${YELLOW}npm login${NC}"
        all_okfalse
    fi

    # Check Vercel
    echo ""
    info "Checking Vercel CLI..."
    if command -v vercel &>/dev/null; then
        if vercel whoami &>/dev/null; then
            VERCEL_USER$(vercel whoami 2>/dev/null || echo "unknown")
            success "Vercel authenticated: ${BOLD}${VERCEL_USER}${NC}"
        else
            warn "Vercel CLI installed but not logged in"
            echo -e "  Run: ${YELLOW}vercel login${NC}"
            all_okfalse
        fi
    else
        error "Vercel CLI not installed"
        echo -e "  Run: ${YELLOW}npm install -g vercel${NC}"
        all_okfalse
    fi

    # Check GitHub
    echo ""
    info "Checking GitHub auth..."
    if command -v gh &>/dev/null; then
        if gh auth status &>/dev/null; then
            GH_USER$(gh auth status --hostname github.com 2>/dev/null | grep "Logged in as" | sed 's/.*Logged in as //;s/\.//')
            success "GitHub authenticated as: ${BOLD}${GH_USER}${NC}"
        else
            warn "GitHub CLI installed but not logged in"
            echo -e "  Run: ${YELLOW}gh auth login${NC}"
            all_okfalse
        fi
    else
        error "GitHub CLI not installed"
        echo -e "  Run: ${YELLOW}brew install gh${NC} or ${YELLOW}sudo apt install gh${NC}"
        all_okfalse
    fi

    echo ""

    if [ "$all_ok"  false ]; then
        error "Prerequisites not met. Please complete authentication and retry."
        exit 1
    fi

    success "All prerequisites met!"
    echo ""
}

# 
# PHASE 1: npm Distribution
# 

phase_npm() {
    header "───────────────────────────────────────────────────────────────"
    header "   PHASE 1: npm Distribution (31 packages)"
    header "───────────────────────────────────────────────────────────────"
    echo ""

    if [ -f "${BASE_DIR}/.omc/distribute-products.sh" ]; then
        bash "${BASE_DIR}/.omc/distribute-products.sh" 2>&1 | tee -a "$LOG_FILE"
        NPM_EXIT${PIPESTATUS[0]}
        echo ""

        if [ $NPM_EXIT -eq 0 ]; then
            success "npm distribution completed"
        else
            warn "npm distribution had some failures (check log)"
        fi
    else
        error "distribute-products.sh not found"
        return 1
    fi

    echo ""
}

# 
# PHASE 2: GitHub Repos
# 

phase_github() {
    header "───────────────────────────────────────────────────────────────"
    header "   PHASE 2: GitHub Repos (75 repos)"
    header "───────────────────────────────────────────────────────────────"
    echo ""

    if [ -f "${BASE_DIR}/.omc/create-github-repos.sh" ]; then
        bash "${BASE_DIR}/.omc/create-github-repos.sh" 2>&1 | tee -a "$LOG_FILE"
        GH_EXIT${PIPESTATUS[0]}
        echo ""

        if [ $GH_EXIT -eq 0 ]; then
            success "GitHub repo creation completed"
        else
            warn "GitHub repo creation had some failures (check log)"
        fi
    else
        error "create-github-repos.sh not found"
        return 1
    fi

    echo ""
}

# 
# PHASE 3: Landing Page Deploy
# 

phase_vercel() {
    header "───────────────────────────────────────────────────────────────"
    header "   PHASE 3: Landing Page Deploy"
    header "───────────────────────────────────────────────────────────────"
    echo ""

    cd "$BASE_DIR"

    info "Building and deploying to Vercel..."

    if vercel deploy --prod 2>&1 | tee -a "$LOG_FILE"; then
        success "Landing page deployed!"
        echo ""
        info "URL: ${CYAN}https://auto-company.vercel.app${NC}"
    else
        error "Vercel deploy failed"
        echo ""
        info "Try: vercel deploy --prod"
        return 1
    fi

    echo ""
}

# 
# VERIFICATION
# 

verify() {
    header "───────────────────────────────────────────────────────────────"
    header "   VERIFICATION"
    header "───────────────────────────────────────────────────────────────"
    echo ""

    # npm verification
    info "npm packages published:"
    NPM_COUNT$(npm search @auto-company 2>/dev/null | grep -c "@auto-company/" || echo "0")
    echo "  Found: ${BOLD}${NPM_COUNT}${NC} packages"

    # GitHub verification
    if [ -f "${BASE_DIR}/.omc/created-repos.txt" ]; then
        GH_COUNT$(wc -l < "${BASE_DIR}/.omc/created-repos.txt" 2>/dev/null || echo "0")
        echo "  Created: ${BOLD}${GH_COUNT}${NC} repos"
    fi

    # Vercel verification
    info "Checking landing page..."
    if curl -s -o /dev/null -w "%{http_code}" https://auto-company.vercel.app 2>/dev/null | grep -q "200"; then
        success "Landing page is live: https://auto-company.vercel.app"
    else
        warn "Landing page may not be accessible yet"
    fi

    echo ""
}

# 
# SUMMARY
# 

summary() {
    END_TIME$(date +%s)
    DURATION$((END_TIME - START_TIME))
    MINUTES$((DURATION / 60))
    SECONDS$((DURATION % 60))

    header "═══════════════════════════════════════════════════════════════"
    header "   DEPLOY COMPLETE"
    header "═══════════════════════════════════════════════════════════════"

    echo ""
    echo -e "  Total time: ${BOLD}${MINUTES}m ${SECONDS}s${NC}"
    echo -e "  Log file: ${CYAN}${LOG_FILE}${NC}"
    echo ""

    success "Next steps:"
    echo "  1. Verify packages: https://www.npmjs.com/~tolgabrk"
    echo "  2. Check repos: cat .omc/created-repos.txt"
    echo "  3. Visit landing page: https://auto-company.vercel.app"
    echo "  4. Update memories/consensus.md with shipped status"
    echo ""
}

# 
# MAIN
# 

main() {
    check_prereqs
    phase_npm
    phase_github
    phase_vercel
    verify
    summary
}

# Run
main "$@"
