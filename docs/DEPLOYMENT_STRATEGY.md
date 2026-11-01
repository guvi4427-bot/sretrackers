# Multi-Platform Deployment Strategy

_Architecture Blueprint: Frontend on Vercel · Backend on Hostless · Database on Neon PostgreSQL_

---

## 1. Overview & Architectural Separation

To satisfy multi-platform independence while preserving 100% of existing functionality, the SRE platform is structured into three cleanly decoupled operational components:

```
┌─────────────────────────────────────────────────────────────┐
│                    1. Frontend (Vercel)                     │
│  - Next.js 15 App Router (Static & Dynamic SSR/Client UI)    │
│  - Edge Middleware (Auth routing, Crawler allow-lists)       │
│  - CDN asset caching, custom domains, AdSense & SEO headers  │
│  - NextAuth client session handling                         │
│  - Centralized API config via NEXT_PUBLIC_API_URL / rewrites │
└──────────────────────────────┬──────────────────────────────┘
                               │
                HTTP / HTTPS API Requests
                               │
┌──────────────────────────────▼─────────────────────────────┐
│                    2. Backend (Hostless)                    │
│  - Standalone Node.js Container Service                      │
│  - Next.js API Route Handlers / REST Endpoints              │
│  - Dynamic PORT binding on 0.0.0.0                          │
│  - Structured JSON Logging, Request Correlation IDs          │
│  - Health Check Endpoint (/api/health)                       │
│  - 5-Tier AI Orchestrator with safe timeouts                 │
│  - Background Inactivity Cron Job via hostless.yaml         │
└──────────────────────────────┬─────────────────────────────┘
                               │
                Pooled PostgreSQL Connections
                               │
┌──────────────────────────────▼─────────────────────────────┐
│               3. Database (Neon PostgreSQL)                 │
│  - Serverless PostgreSQL with Connection Pooling            │
│  - Prisma ORM 6.x with PgBouncer connection string          │
│  - Complete 55-Model Relational Schema                      │
│  - Safe Declarative Migrations                              │
│  - Zero data loss, preserved user records and achievements  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Component A: Frontend — Vercel

### Responsibilities:
1. Serves all UI pages under `src/app/(auth)/*`, `src/app/(main)/*`, `src/app/(public)/*`, and `src/app/admin/*`.
2. Serves static SEO files (`ads.txt`, `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, OpenGraph images).
3. Connects to backend via either:
   - **Mode A (Unified Proxy / Zero Breaking Changes):** Vercel handles frontend and rewrites `/api/:path*` to the Hostless backend URL (`https://api.yourdomain.com/api/:path*`). This ensures all browser `fetch('/api/...')` calls remain completely identical and same-origin, avoiding cross-domain cookie issues with NextAuth!
   - **Mode B (Direct Cross-Origin):** Configurable `NEXT_PUBLIC_API_URL` with explicit CORS headers and credentials enabled.

### Configuration (`vercel.json`):
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "next build",
  "installCommand": "npm install",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

---

## 3. Component B: Backend — Hostless

### Runtime Requirements (Verified via Hostless Cloud Docs):
- **Host Binding:** Must bind to `0.0.0.0` and read port from `process.env.PORT`.
- **Start Command:** `npm start` or custom entrypoint `node server.js`.
- **Health Check:** HTTP GET endpoint at `/api/health` returning HTTP 200 with JSON status.
- **Background Cron:** Defined in `hostless.yaml` under `cron_jobs`.

### Hostless Infrastructure as Code (`hostless.yaml`):
```yaml
# hostless.yaml — Hostless Cloud Deployment Configuration
build:
  system: docker
  dockerfile_path: "./Dockerfile"
  start_command: "npm start"
  min_cpu: 1
  max_cpu: 2
  min_memory: 1024
  max_memory: 2048

scaling:
  min_replicas: 1
  max_replicas: 3
  min_cpu: 1
  max_cpu: 2
  min_memory: 1024
  max_memory: 2048

health_check:
  type: http
  path: "/api/health"
  interval_in_seconds: 15

cron_jobs:
  - name: learning-inactivity-check
    schedule: "0 9 * * *"
    command: "curl -s -H \"Authorization: Bearer $CRON_SECRET\" http://localhost:$PORT/api/cron/learning-inactivity"
```

### Production Dockerfile (`Dockerfile`):
```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 4. Component C: Database — Neon PostgreSQL

### Requirements & Strategy:
1. **Connection Pooling:** Use Neon's pooled endpoint (`-pooler` domain suffix) for application traffic to avoid running out of Postgres connections:
   - `DATABASE_URL`: Direct connection (used for Prisma migrations: `postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`)
   - `POSTGRES_PRISMA_URL`: Pooled connection (used by runtime client: `postgresql://user:pass@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true`)
2. **Schema Preservation:**
   - 55 tables mapped directly from `prisma/schema.prisma`.
   - All relations (`Cascade` / `SetNull`) preserved.
3. **Migration Command:**
   - Development / Staging: `npx prisma db push`
   - Production: `npx prisma migrate deploy`
4. **Seed Strategy:**
   - `npm run db:seed` executes `src/lib/seed.ts` idempotently (checks `findUnique` by email and key, upserting achievements and super admin).

---

## 5. Environment Configuration Guide

| Variable | Platform | Purpose | Required? |
|---|---|---|---|
| `DATABASE_URL` | Hostless, Vercel | Direct Neon connection string (migrations & fallback) | **Yes** |
| `POSTGRES_PRISMA_URL` | Hostless, Vercel | Pooled Neon connection string | **Recommended** |
| `NEXTAUTH_SECRET` | Hostless, Vercel | 32+ byte random string for JWT signing | **Yes** |
| `NEXTAUTH_URL` | Hostless, Vercel | Canonical web URL (e.g. `https://sretrack.vercel.app`) | **Yes** |
| `NEXT_PUBLIC_SITE_URL` | Vercel | Public frontend origin | **Yes** |
| `NEXT_PUBLIC_CANONICAL_URL` | Vercel | SEO Canonical origin | **Yes** |
| `CRON_SECRET` | Hostless, Vercel | Secret bearer token for background jobs | **Yes** |
| `GEMINI_API_KEY` | Hostless | Google Generative Language API Key | Optional |
| `OPENAI_API_KEY` | Hostless | OpenAI API Key | Optional |
| `OPENROUTER_API_KEY` | Hostless | OpenRouter Key | Optional |
| `POLLINATIONS_API_KEY` | Hostless | Pollinations API Key | Optional |

