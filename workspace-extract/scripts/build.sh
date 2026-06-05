#!/bin/bash
# Build script for Vercel deployment
# Handles Next.js 15 missing _client-reference-manifest.js files
# that cause Vercel's trace step to fail with ENOENT

set -e

# Install and generate
bun install
bunx prisma generate

# Run Next.js build
npx next build

# Fix missing _client-reference-manifest.js files for pure server components
# Vercel's trace step expects these files to exist even for pages with no client components
for f in $(find .next/server -name '*.js.nft.json' -not -path '*/node_modules/*'); do
  manifest="${f%.js.nft.json}_client-reference-manifest.js"
  if [ ! -f "$manifest" ]; then
    dir=$(dirname "$manifest")
    mkdir -p "$dir"
    echo '{}' > "$manifest"
  fi
done
