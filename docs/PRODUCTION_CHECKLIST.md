# Production Readiness & Go-Live Checklist — SRE Platform

_Sign-off checklist before launching production releases._

---

## 1. Codebase & Quality Assurance
- [x] All automated tests pass (`npm test` reports 0 failures, 0 skipped).
- [x] TypeScript compiler succeeds with zero errors (`npm run typecheck` passes).
- [x] ESLint passes with zero errors and zero warnings (`npm run lint` passes).
- [x] Next.js production build succeeds with zero errors (`npm run build` passes).
- [x] `next.config.ts` has `typescript.ignoreBuildErrors: false`.
- [x] No sensitive credentials or API keys committed to Git.
- [x] Continuous Integration workflow (`.github/workflows/ci.yml`) active on repository.

---

## 2. Security & Access Control
- [x] `NEXTAUTH_SECRET` is strong (>= 32 chars) and configured in environment variables.
- [x] Hardcoded fallback secrets eliminated from source code.
- [x] `POST /api/xp/award` protected with strict admin check.
- [x] `POST /api/achievements/sync` protected with admin check.
- [x] `GET /api/cron/learning-inactivity` strictly requires non-empty matching `CRON_SECRET`.
- [x] `/api/admin/*` returns JSON 403 when called by non-admin callers.
- [x] SQL injection risk zero (all database interactions parameterized via Prisma).

---

## 3. Database Architecture & Integrity
- [x] Schema standardized on Neon PostgreSQL (55 models).
- [x] High-performance composite indexes added to frequently queried tables.
- [x] Pooled connection string (`POSTGRES_PRISMA_URL`) configured for web traffic.
- [x] Direct connection string (`DATABASE_URL`) configured for migrations.
- [x] Idempotent seed script (`scripts/seed-db.mjs`) verified.
- [x] Backup and restore scripts (`scripts/backup-db.sh`, `scripts/restore-db.sh`) documented and ready.

---

## 4. Multi-Platform Deployment Compatibility
- [x] Vercel frontend configuration (`vercel.json`, `next.config.ts`) tested and building.
- [x] Hostless backend configuration (`hostless.yaml`, `Dockerfile`) tested and ready.
- [x] Server binds dynamically to `$PORT` and `0.0.0.0`.
- [x] Structured health endpoint (`/api/health`) provides database connectivity and memory telemetry.
- [x] Environment variable documentation (`.env.example`, `.env.development.example`, `.env.production.example`) complete.

---

## 5. SEO, Search Crawlers & Google AdSense
- [x] AdSense publisher ID `ca-pub-7745236489664493` consistent across all components.
- [x] `ads.txt` and `app-ads.txt` accessible at domain root with `Content-Type: text/plain`.
- [x] `robots.txt` dynamic and static files synchronized with crawler allow/disallow rules.
- [x] XML sitemap (`/sitemap.xml`) dynamically indexes public pages, showcases, and blog posts.
- [x] Search Console verification file (`/google990ef60d3a371354.html`) returns HTTP 200.
- [x] Unhandled non-existent routes return HTTP 404 (`src/app/not-found.tsx`).
- [x] Ad banners feature clear "Ad" labels and respect consent settings.

