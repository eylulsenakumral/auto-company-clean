#!/bin/bash
# Auto Company - One-Command Deploy Script
# Run this after authenticating: npm login, vercel login, gh auth login

set -e

echo "🚀 Auto Company Deployment Script"
echo ""
echo ""

# Check authentication
echo "🔐 Checking authentication..."

if ! npm whoami &>/dev/null; then
    echo "❌ npm not authenticated. Run: npm login"
    exit 1
fi
echo "✅ npm authenticated as $(npm whoami)"

if ! vercel whoami &>/dev/null; then
    echo "❌ Vercel not authenticated. Run: vercel login"
    exit 1
fi
echo "✅ Vercel authenticated"

if ! gh auth status &>/dev/null; then
    echo "❌ GitHub not authenticated. Run: gh auth login"
    exit 1
fi
echo "✅ GitHub authenticated"

echo ""
echo "📦 Publishing products to npm..."
cd products
for pkg in *.tgz; do
    echo "Publishing $pkg..."
    npm publish "$pkg"
done
cd ..
echo "✅ Products published"

echo ""
echo "🌐 Deploying landing to Vercel..."
cd landing
vercel --prod
cd ..
echo "✅ Landing deployed"

echo ""
echo "🎉 Deployment complete!"
echo ""
echo ""
echo "Next steps:"
echo "1. Check Vercel dashboard for landing URL"
echo "2. Visit npm packages page"
echo "3. Execute launch plan on July 8, 2026"
