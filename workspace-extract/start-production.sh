#!/bin/bash
set -e

# S/R/E Platform - Production Server Startup
export NODE_ENV=production
export PORT=3000
export HOSTNAME=0.0.0.0

# Database
export DATABASE_URL="${DATABASE_URL:-file:/home/z/my-project/workspace-extract/db/custom.db}"
export TURSO_AUTH_TOKEN="${TURSO_AUTH_TOKEN:-}"

# Auth
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-sre-platform-prod-secret-change-me}"
export NEXTAUTH_URL="${NEXTAUTH_URL:-http://localhost:3000}"

echo "▲ S/R/E Platform — Production Server"
echo "  NODE_ENV: $NODE_ENV"
echo "  PORT: $PORT"
echo "  DATABASE: $([ "$DATABASE_URL" = libsql://* ] && echo 'Turso (cloud)' || echo 'SQLite (local)')"
echo ""

cd "$(dirname "$0")/.next/standalone"
exec node server.js
