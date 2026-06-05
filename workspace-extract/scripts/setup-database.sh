#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
#  S/R/E Platform — Database Setup (Neon PostgreSQL)
#  Creates a Neon database and configures Vercel environment variables
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

echo "═══════════════════════════════════════════════════════════"
echo "   S/R/E Platform — Database Setup (Neon PostgreSQL)"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "This script creates a free Neon PostgreSQL database and"
echo "configures the Vercel environment variables for your app."
echo ""

# ── Option 1: Neon API Key ──
echo "┌─────────────────────────────────────────────────────────┐"
echo "│  HOW TO GET YOUR NEON API KEY:                          │"
echo "│  1. Go to https://console.neon.tech/app/keys            │"
echo "│  2. Sign in or create a free account                    │"
echo "│  3. Click 'Generate new API key'                        │"
echo "│  4. Copy the API key                                   │"
echo "└─────────────────────────────────────────────────────────┘"
echo ""

read -p "Enter your Neon API key: " NEON_API_KEY

if [[ -z "$NEON_API_KEY" ]]; then
  echo "ERROR: Neon API key is required."
  exit 1
fi

# ── Create Neon Project ──
echo ""
echo "Creating Neon PostgreSQL project..."

RESPONSE=$(curl -s -X POST "https://console.neon.tech/api/v2/projects" \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "sre-platform",
    "regionId": "aws-us-east-1",
    "defaultEndpointSettings": {
      "autoscalingLimitMinCu": 0.25,
      "autoscalingLimitMaxCu": 0.5
    }
  }')

# Parse the response
PROJECT_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('project',{}).get('id',''))" 2>/dev/null || echo "")

if [[ -z "$PROJECT_ID" ]]; then
  echo "ERROR: Failed to create Neon project."
  echo "Response: $RESPONSE"
  exit 1
fi

echo "Neon project created: $PROJECT_ID"

# ── Get Connection String ──
echo "Getting connection string..."

CONN_RESPONSE=$(curl -s "https://console.neon.tech/api/v2/projects/$PROJECT_ID/connection_string?role_name=neondb&database_name=neondb" \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Accept: application/json")

DATABASE_URL=$(echo "$CONN_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('connection_string',''))" 2>/dev/null || echo "")

if [[ -z "$DATABASE_URL" ]]; then
  echo "ERROR: Failed to get connection string."
  echo "Response: $CONN_RESPONSE"
  exit 1
fi

echo "Database URL obtained: ${DATABASE_URL:0:30}..."

# ── Push Prisma Schema ──
echo ""
echo "Pushing Prisma schema to Neon database..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

DATABASE_URL="$DATABASE_URL" npx prisma db push 2>&1

if [[ $? -ne 0 ]]; then
  echo "ERROR: Prisma db push failed."
  exit 1
fi

echo "Schema pushed successfully."

# ── Seed Database ──
echo ""
echo "Seeding database with admin user and achievements..."

DATABASE_URL="$DATABASE_URL" \
ADMIN_EMAIL="myselfgowtham140707@gmail.com" \
ADMIN_USERNAME="admin" \
ADMIN_PASSWORD="Gowtham@123" \
ADMIN_PHONE="+918148796055" \
node "$PROJECT_DIR/scripts/seed-db.mjs"

# ── Set Vercel Environment Variables ──
echo ""
echo "Setting Vercel environment variables..."

VERCEL_TOKEN="VERCEL_TOKEN_PLACEHOLDER"
VERCEL_PROJECT_ID="prj_PDDM0QOdpWjnOldnImawBRkqOOFd"
VERCEL_TEAM_ID="team_Ycem1Idgd2aQCnjayY4GPh39"

# Set DATABASE_URL
for ENV in "production" "preview" "development"; do
  curl -s -X POST "https://api.vercel.com/v9/projects/$VERCEL_PROJECT_ID/env?teamId=$VERCEL_TEAM_ID" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"key\":\"DATABASE_URL\",\"value\":\"$DATABASE_URL\",\"type\":\"encrypted\",\"target\":[\"$ENV\"]}" > /dev/null 2>&1
  echo "  Set DATABASE_URL for $ENV"
done

# ── Redeploy ──
echo ""
echo "Redeploying to Vercel..."

npx vercel --prod --token "$VERCEL_TOKEN" --yes 2>&1 | tail -5

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "   Database Setup Complete!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Your app should now be accessible at:"
echo "  https://workspace-extract-pi.vercel.app"
echo ""
echo "Admin credentials:"
echo "  Email:    myselfgowtham140707@gmail.com"
echo "  Username: admin"
echo "  Password: Gowtham@123"
echo ""
