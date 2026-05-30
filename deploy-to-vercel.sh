#!/bin/bash
# Deploy S/R/E Platform to Vercel
# Usage: ./deploy-to-vercel.sh
#
# This script deploys the project to the Vercel project: prj_ytJPLpDBVDmTubKoDgyvfjjtQz70
# It also creates a deployment for the original project: prj_PDDM0QOdpWjnOldnImawBRkqOOFd
#
# You will need to authenticate with Vercel first by running: vercel login

set -e

PROJECT_DIR="/home/z/my-project/workspace-extract"
PROJECT_ID_NEW="prj_ytJPLpDBVDmTubKoDgyvfjjtQz70"
PROJECT_ID_OLD="prj_PDDM0QOdpWjnOldnImawBRkqOOFd"
ORG_ID="team_Ycem1Idgd2aQCnjayY4GPh39"

cd "$PROJECT_DIR"

echo "============================================"
echo "  S/R/E Platform - Vercel Deployment"
echo "============================================"
echo ""

# Check if Vercel CLI is authenticated
if ! vercel whoami &>/dev/null; then
  echo "❌ Not authenticated with Vercel."
  echo "   Please run: vercel login"
  echo "   Then re-run this script."
  exit 1
fi

echo "✅ Authenticated with Vercel"
echo ""

# Deploy to new project (prj_ytJPLpDBVDmTubKoDgyvfjjtQz70)
echo "🚀 Deploying to project: $PROJECT_ID_NEW"
echo ""

# Set the project ID
echo "{\"projectId\":\"$PROJECT_ID_NEW\",\"orgId\":\"$ORG_ID\"}" > .vercel/project.json

vercel deploy --prod --yes 2>&1
echo ""

echo "✅ Deployment to $PROJECT_ID_NEW complete!"
echo ""

# Optionally deploy to original project too
read -p "Also deploy to original project ($PROJECT_ID_OLD)? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🚀 Deploying to project: $PROJECT_ID_OLD"
  echo "{\"projectId\":\"$PROJECT_ID_OLD\",\"orgId\":\"$ORG_ID\"}" > .vercel/project.json
  vercel deploy --prod --yes 2>&1
  echo ""
  echo "✅ Deployment to $PROJECT_ID_OLD complete!"
fi

# Restore project ID
echo "{\"projectId\":\"$PROJECT_ID_NEW\",\"orgId\":\"$ORG_ID\"}" > .vercel/project.json

echo ""
echo "============================================"
echo "  All deployments complete!"
echo "============================================"
