#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# SRE Platform — Neon PostgreSQL Migration Script
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "❌ Error: DATABASE_URL environment variable is required."
  echo "Usage: DATABASE_URL=\"postgresql://...\" ./scripts/migrate-neon.sh"
  exit 1
fi

echo "🚀 Starting database migration on Neon PostgreSQL..."
npx prisma generate
npx prisma db push --skip-generate

echo "🌱 Running idempotent seed (Achievements & Super Admin)..."
node scripts/seed-db.mjs

echo "✅ Neon migration completed successfully!"

