#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# SRE Platform — Database Backup Script (PostgreSQL / Neon)
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "❌ Error: DATABASE_URL environment variable is required."
  exit 1
fi

BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/sre_backup_${TIMESTAMP}.dump"

echo "📦 Backing up database to ${BACKUP_FILE}..."
pg_dump "$DATABASE_URL" --format=custom --file="$BACKUP_FILE"

echo "✅ Backup created successfully: ${BACKUP_FILE}"
ls -lh "$BACKUP_FILE"

