#!/usr/bin/env bash
# Auto Company Distribution Script
# Publishes 31 production-ready products to npm
# Run AFTER npm login is complete

set -e

# Colors
RED'\033[0;31m'
GREEN'\033[0;32m'
YELLOW'\033[1;33m'
BLUE'\033[0;34m'
NC'\033[0m' # No Color

# 31 Production-Ready Products
PRODUCTS(
    "pool-leak-detector"
    "explain-analyzer"
    "query-pattern-analyzer"
    "migration-validator"
    "k8s-config-auditor"
    "dockerfile-linter"
    "serverless-security-scanner"
    "api-security-scanner"
    "dep-breakage-detector"
    "secret-rotation-detector"
    "npm-vuln-autofixer"
    "npm-run-info"
    "port-available"
    "command-vault"
    "scriptforge"
    "metasync"
    "depsearch"
    "env-safe"
    "secret-leak-scanner"
    "unused-deps-scanner"
    "test-coverage-diff"
    "env-diff"
    "branch-cleanup-cli"
    "pr-title-generator"
    "dependency-graph-cli"
    "lockfile-analyzer"
    "release-cli"
    "ci-config-validator"
    "bundle-size-analyzer"
    "perf-budget-cli"
    "lighthouse-ci-wrapper"
)

# Base directory
BASE_DIR"/home/tolgabrk/projects/Auto-Company"
PROJECTS_DIR"$BASE_DIR/projects"

echo -e "${BLUE}${NC}"
echo -e "${BLUE}Auto Company Distribution Pipeline${NC}"
echo -e "${BLUE}${NC}"
echo ""

# Check npm auth
echo -e "${YELLOW}[1/3] Checking npm authentication...${NC}"
if npm whoami &>/dev/null; then
    NPM_USER$(npm whoami)
    echo -e "${GREEN}✓ Authenticated as: $NPM_USER${NC}"
else
    echo -e "${RED}✗ NOT AUTHENTICATED${NC}"
    echo -e "${YELLOW}Run: npm login${NC}"
    exit 1
fi
echo ""

# Check gh auth
echo -e "${YELLOW}[2/3] Checking GitHub authentication...${NC}"
if gh auth status &>/dev/null; then
    echo -e "${GREEN}✓ GitHub authenticated${NC}"
    GH_AUTHtrue
else
    echo -e "${YELLOW}⚠ GitHub NOT authenticated (repos will be skipped)${NC}"
    GH_AUTHfalse
fi
echo ""

# Publish products
echo -e "${YELLOW}[3/3] Publishing ${#PRODUCTS[@]} products to npm...${NC}"
echo ""

SUCCESS_COUNT0
SKIP_COUNT0
FAIL_COUNT0

for product in "${PRODUCTS[@]}"; do
    PRODUCT_DIR"$PROJECTS_DIR/$product"

    echo -e "${BLUE}[$((SUCCESS_COUNT + SKIP_COUNT + FAIL_COUNT + 1))/${#PRODUCTS[@]}] $product${NC}"

    # Check if product exists
    if [ ! -d "$PRODUCT_DIR" ]; then
        echo -e "  ${RED}✗ Directory not found: $PRODUCT_DIR${NC}"
        ((FAIL_COUNT++))
        continue
    fi

    # Check if package.json exists
    if [ ! -f "$PRODUCT_DIR/package.json" ]; then
        echo -e "  ${RED}✗ package.json not found${NC}"
        ((FAIL_COUNT++))
        continue
    fi

    cd "$PRODUCT_DIR"

    # Check if already published
    PACKAGE_NAME$(node -e "console.log(require('./package.json').name)" 2>/dev/null || echo "unknown")
    if npm view "$PACKAGE_NAME" version &>/dev/null; then
        echo -e "  ${YELLOW}⚠ Already published: $PACKAGE_NAME${NC}"
        ((SKIP_COUNT++))
        continue
    fi

    # Publish to npm
    if npm publish --access public 2>&1 | tee /tmp/npm-publish-$product.log; then
        echo -e "  ${GREEN}✓ Published: https://www.npmjs.com/package/$PACKAGE_NAME${NC}"
        ((SUCCESS_COUNT++))

        # Create GitHub repo if authenticated
        if [ "$GH_AUTH"  true ]; then
            REPO_NAME"$product"
            if gh repo create "$REPO_NAME" --public --source. --remoteorigin --push &>/dev/null; then
                echo -e "  ${GREEN}✓ GitHub repo: https://github.com/tolgabrk/$REPO_NAME${NC}"
            else
                echo -e "  ${YELLOW}⚠ GitHub repo creation skipped (may already exist)${NC}"
            fi
        fi
    else
        echo -e "  ${RED}✗ Publish failed${NC}"
        ((FAIL_COUNT++))
    fi

    cd "$BASE_DIR"
    echo ""
done

# Summary
echo -e "${BLUE}${NC}"
echo -e "${BLUE}Distribution Summary${NC}"
echo -e "${BLUE}${NC}"
echo -e "${GREEN}✓ Published: $SUCCESS_COUNT${NC}"
echo -e "${YELLOW}⚠ Skipped: $SKIP_COUNT${NC}"
echo -e "${RED}✗ Failed: $FAIL_COUNT${NC}"
echo ""

if [ $SUCCESS_COUNT -gt 0 ]; then
    echo -e "${GREEN}Next steps:${NC}"
    echo "  1. Verify packages: https://www.npmjs.com/~tolgabrk"
    echo "  2. Post to r/node: Show HN for featured products"
    echo "  3. Update consensus.md with shipped status"
fi

exit $FAIL_COUNT
