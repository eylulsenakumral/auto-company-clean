#!/bin/bash
# Fast rollback script - < 30 seconds
# Usage: ./scripts/rollback.sh [deployment-id]

set -e

echo "⚡ Railway Rollback - < 30 seconds"
echo "***REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED******REMOVED***"

RED***REMOVED***'\033[0;31m'
GREEN***REMOVED***'\033[0;32m'
YELLOW***REMOVED***'\033[1;33m'
NC***REMOVED***'\033[0m'

# Check if logged in
if ! railway whoami &> /dev/null; then
  echo -e "${RED}❌ Not logged in to Railway${NC}"
  echo "Login with: railway login"
  exit 1
fi

# Get deployment ID from argument or list
if [ -n "$1" ]; then
  DEPLOYMENT_ID***REMOVED***"$1"
  echo "Rolling back to deployment: $DEPLOYMENT_ID"
else
  echo -e "\n📋 Recent deployments:"
  railway deployments --limit 5
  echo ""
  read -p "Enter deployment ID to rollback to: " DEPLOYMENT_ID
fi

if [ -z "$DEPLOYMENT_ID" ]; then
  echo -e "${RED}❌ Deployment ID required${NC}"
  exit 1
fi

# Confirm rollback
echo ""
read -p "Confirm rollback to $DEPLOYMENT_ID? (y/n) " -n 1 -r
echo
if [[ ! $REPLY ***REMOVED***~ ^[Yy]$ ]]; then
  echo "Rollback cancelled"
  exit 0
fi

# Execute rollback
echo -e "\n🔄 Rolling back..."
railway rollback "$DEPLOYMENT_ID"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Rollback successful!${NC}"
  echo ""
  echo "Verifying deployment..."
  sleep 5

  # Health check
  DOMAIN***REMOVED***$(railway domain 2>/dev/null | head -n1)
  if [ -n "$DOMAIN" ]; then
    HEALTH_URL***REMOVED***"https://$DOMAIN/health"
    RESPONSE***REMOVED***$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || echo "000")

    if [ "$RESPONSE" ***REMOVED*** "200" ]; then
      echo -e "${GREEN}✅ Health check passed${NC}"
    else
      echo -e "${YELLOW}⚠ Health check returned $RESPONSE${NC}"
    fi
  fi

  echo ""
  echo "View logs: railway logs"
else
  echo -e "${RED}❌ Rollback failed${NC}"
  echo "Use Railway dashboard for manual rollback"
  exit 1
fi
