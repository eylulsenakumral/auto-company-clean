#!/usr/bin/env bash
# Auto Company v1.1.1 Launch Script
# Run this after completing: gh auth login

set -e

echo "🚀 Auto Company v1.1.1 Launch"
echo "================================"
echo ""

# Check authentication
if ! gh auth status &>/dev/null; then
    echo "❌ GitHub not authenticated!"
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub authenticated"

# Verify tag exists
if git rev-parse v1.1.1 &>/dev/null; then
    echo "✅ Tag v1.1.1 exists"
else
    echo "❌ Tag v1.1.1 not found"
    exit 1
fi

# Create GitHub Release
echo ""
echo "📦 Creating GitHub Release..."
gh release create v1.1.1 \
    --title "Auto Company v1.1.1 — Git-First Release" \
    --notes-file docs/marketing/v1.1.1-release-notes.md \
    --latest

echo ""
echo "✅ Release v1.1.1 created!"
echo ""
echo "🔗 View at: https://github.com/tolgabrk/autocompany/releases/tag/v1.1.1"
