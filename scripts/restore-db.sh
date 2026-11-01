#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# SRE Platform — Database Restore Script (PostgreSQL / Neon)
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "❌ Error: DATABASE_URL environment variable is required."
  exit 1
fi

if [[ -z "${1:-}" ]]; then
  echo "❌ Error: Backup file path required."
  echo "Usage: ./scripts/restore-db.sh backups/sre_backup_20260101_120000.dump"
  exit 1
fi

BACKUP_FILE="$1"

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "❌ Error: File not found: $BACKUP_FILE"
  exit 1
fi

echo "⚠️  WARNING: Restoring will overwrite existing data in the target database!"
read -p "Are you sure you want to proceed? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

echo "🔄 Restoring database from ${BACKUP_FILE}..."
pg_restore --clean --if-exists --no-owner --no-privileges -d "$DATABASE_URL" "$BACKUP_FILE"

echo "✅ Database restored successfully!"

