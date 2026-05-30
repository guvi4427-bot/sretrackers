#!/bin/bash
# S/R/E Platform - Production Server Runner
# This script starts the Next.js production server and keeps it alive

set -e

PROJECT_DIR="/home/z/my-project/workspace-extract"
cd "$PROJECT_DIR/.next/standalone"

export NODE_ENV=production
export PORT=3000
export HOSTNAME=0.0.0.0
export DATABASE_URL="${DATABASE_URL:-file:$PROJECT_DIR/db/custom.db}"
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-$(openssl rand -hex 32)}"
export NEXTAUTH_URL="${NEXTAUTH_URL:-http://localhost:3000}"

# Create log directory
mkdir -p "$PROJECT_DIR/logs"

echo "╔══════════════════════════════════════════════════╗"
echo "║   S/R/E Platform — Production Server            ║"
echo "║   Start / Restart / Explore                      ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "  Mode:      PRODUCTION (standalone)"
echo "  Port:      $PORT"
echo "  Database:  ${DATABASE_URL%%\?*}"
echo "  PID:       $$"
echo ""

# Auto-restart loop
MAX_RESTARTS=5
RESTART_COUNT=0
RESTART_DELAY=5

while [ $RESTART_COUNT -lt $MAX_RESTARTS ]; do
    echo "[$(date)] Starting server (attempt $((RESTART_COUNT + 1))/$MAX_RESTARTS)..."
    
    node server.js 2>&1 | tee -a "$PROJECT_DIR/logs/production.log"
    EXIT_CODE=$?
    
    echo "[$(date)] Server exited with code $EXIT_CODE"
    
    if [ $EXIT_CODE -eq 0 ]; then
        echo "[$(date)] Clean shutdown."
        break
    fi
    
    RESTART_COUNT=$((RESTART_COUNT + 1))
    
    if [ $RESTART_COUNT -lt $MAX_RESTARTS ]; then
        echo "[$(date)] Restarting in ${RESTART_DELAY}s..."
        sleep $RESTART_DELAY
    else
        echo "[$(date)] Max restarts reached. Exiting."
        exit 1
    fi
done
