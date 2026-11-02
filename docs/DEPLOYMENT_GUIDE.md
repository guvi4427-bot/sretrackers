# Production Deployment Guide — Multi-Platform Architecture

_Deployment Blueprint: Vercel (Frontend) · Hostless (Backend) · Neon (PostgreSQL)_

---

## 1. Prerequisites Checklist

Before beginning deployment:
- [ ] Vercel account with access to your team/personal project.
- [ ] Hostless Cloud account with connected GitHub repository.
- [ ] Neon PostgreSQL account with a created database project.
- [ ] Production domain configured (e.g. `sretrack.vercel.app` or custom domain).
- [ ] Generated secrets:
  - `NEXTAUTH_SECRET`: Run `openssl rand -base64 32`
  - `CRON_SECRET`: Run `openssl rand -base64 24`

---

## 2. Step 1: Provision Neon PostgreSQL Database

1. Sign in to [Neon Console](https://console.neon.tech).
2. Create project: `sre-platform` (Region: `aws-us-east-1` or nearest region).
3. Under **Dashboard → Connection Details**, note:
   - **Direct Connection:** `DATABASE_URL` (format: `postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`)
   - **Pooled Connection:** `POSTGRES_PRISMA_URL` (format: `postgresql://user:password@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true`)
4. Apply the Prisma schema and seed initial data from your local terminal:
   ```bash
   export DATABASE_URL="postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

---

## 3. Step 2: Deploy Backend on Hostless

1. Sign in to [Hostless Cloud Dashboard](https://hostless.cloud).
2. Click **Create Resource** → Select **App**.
3. Connect your Git repository (`sretrackers`) and select branch `main`.
4. Hostless will auto-detect the root `hostless.yaml` and `Dockerfile`.
5. In **Environment Variables**, add:
   ```env
   NODE_ENV=production
   PORT=3000
   HOSTNAME=0.0.0.0
   DATABASE_URL=postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
   POSTGRES_PRISMA_URL=postgresql://user:password@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
   NEXTAUTH_SECRET=your-32-byte-secret-from-openssl
   NEXTAUTH_URL=https://sretrack.vercel.app
   CRON_SECRET=your-cron-secret-token
   SUPER_ADMIN_EMAIL=myselfgowtham140707@gmail.com
   ```
6. Click **Deploy**.
7. Hostless executes container build, starts `npm start`, and verifies `/api/health`.
8. Once healthy, copy your Hostless backend domain (e.g. `https://api.yourdomain.com`).

---

## 4. Step 3: Deploy Frontend on Vercel

1. Sign in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New** → **Project** → Import Git repository (`sretrackers`).
3. Framework Preset: **Next.js**.
4. In **Environment Variables**, set:
   ```env
   DATABASE_URL=postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
   POSTGRES_PRISMA_URL=postgresql://user:password@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
   NEXTAUTH_SECRET=your-32-byte-secret-from-openssl
   NEXTAUTH_URL=https://sretrack.vercel.app
   NEXT_PUBLIC_SITE_NAME=SRE Track
   NEXT_PUBLIC_SITE_URL=https://sretrack.vercel.app
   NEXT_PUBLIC_CANONICAL_URL=https://sretrack.vercel.app
   CRON_SECRET=your-cron-secret-token
   BACKEND_API_URL=https://api.yourdomain.com
   ```
5. Build Command: `npm run build`
6. Output Directory: `.next`
7. Click **Deploy**.
8. Vercel builds the bundle and deploys to the global edge network.

---

## 5. Post-Deployment Verification

Execute smoke tests against production endpoints:

```bash
# 1. Verify health check
curl -i https://sretrack.vercel.app/api/health
# Expected: HTTP 200, status: "ok", database: "connected"

# 2. Verify ads.txt
curl -i https://sretrack.vercel.app/ads.txt
# Expected: HTTP 200, Content-Type: text/plain

# 3. Verify robots.txt
curl -i https://sretrack.vercel.app/robots.txt
# Expected: HTTP 200, Content-Type: text/plain

# 4. Verify Google Search Console file
curl -i https://sretrack.vercel.app/google990ef60d3a371354.html
# Expected: HTTP 200, Content-Type: text/html

# 5. Verify non-existent route returns HTTP 404
curl -i https://sretrack.vercel.app/non-existent-test-path-123
# Expected: HTTP 404
```

