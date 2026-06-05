# 🚀 S/R/E Platform — Production Deployment Guide

## Quick Start (5 Minutes)

### Option 1: Deploy to Vercel (Recommended)

**Prerequisites**: Create free accounts at:
- [vercel.com](https://vercel.com/signup) — Hosting (free tier: 100GB bandwidth)
- [turso.tech](https://turso.tech/signup) — Cloud SQLite database (free tier: 9GB storage, 25M reads/month)

```bash
# 1. Install Turso CLI and create database
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login
turso db create sre-platform
turso db show sre-platform --url          # Copy the URL
turso db tokens create sre-platform       # Copy the token

# 2. Deploy to Vercel
npx vercel login
npx vercel link                           # Link this project
npx vercel env add DATABASE_URL           # Paste Turso URL (libsql://...)
npx vercel env add TURSO_AUTH_TOKEN       # Paste Turso token
npx vercel env add NEXTAUTH_SECRET        # Run: openssl rand -base64 32
npx vercel env add NEXTAUTH_URL           # Your Vercel URL (https://your-app.vercel.app)
npx vercel --prod                         # Deploy!

# 3. Push database schema to Turso
DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npx prisma db push

# 4. Seed the database (creates admin user + achievements)
bash scripts/seed-production.sh
```

### Option 2: One-Command Deploy

```bash
bash scripts/deploy-complete.sh
```

This automates: Turso setup → Vercel deploy → DB seed → Verification

---

## Detailed Step-by-Step

### Step 1: Set Up Turso Database

Turso provides a free cloud SQLite database compatible with the libSQL driver adapter.

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Authenticate (opens browser)
turso auth login

# Create database
turso db create sre-platform

# Get connection credentials
turso db show sre-platform --url
# Output: libsql://sre-platform-your-org.turso.io

turso db tokens create sre-platform
# Output: eyJhbGciOiJFZERTQSIs...
```

### Step 2: Push Database Schema

```bash
# Set environment variables (replace with your Turso credentials)
export DATABASE_URL="libsql://sre-platform-your-org.turso.io"
export TURSO_AUTH_TOKEN="your-token-here"

# Generate Prisma client
npx prisma generate

# Push schema to Turso
npx prisma db push
```

### Step 3: Deploy to Vercel

```bash
# Login to Vercel
npx vercel login

# Link project
npx vercel link

# Set environment variables in Vercel
npx vercel env add DATABASE_URL          # libsql://sre-platform-your-org.turso.io
npx vercel env add TURSO_AUTH_TOKEN      # Your Turso auth token
npx vercel env add NEXTAUTH_SECRET       # Generate: openssl rand -base64 32
npx vercel env add NEXTAUTH_URL          # https://your-app.vercel.app

# Deploy to production
npx vercel --prod
```

### Step 4: Seed Production Database

```bash
# Run the seed script (creates admin user + 100+ achievements)
DATABASE_URL="libsql://sre-platform-your-org.turso.io" \
TURSO_AUTH_TOKEN="your-token" \
bash scripts/seed-production.sh
```

Default admin credentials (change immediately after first login):
- **Email**: admin@sre-platform.com
- **Password**: Admin@2024!

### Step 5: Verify Deployment

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Login page
curl -s -o /dev/null -w "%{http_code}" https://your-app.vercel.app/login
# Should return 200
```

---

## Environment Variables Reference

### Required (Production)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Turso database URL | `libsql://sre-platform-your-org.turso.io` |
| `TURSO_AUTH_TOKEN` | Turso authentication token | `eyJhbGciOiJFZERTQSI...` |
| `NEXTAUTH_SECRET` | JWT signing secret | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Production URL | `https://your-app.vercel.app` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |

### Development (Local)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Local SQLite path | `file:./db/custom.db` |

---

## Alternative Deployment Targets

### Render (Free Tier)

1. Create a `render.yaml` blueprint file
2. Push to GitHub
3. Connect Render to your GitHub repo
4. Render auto-deploys on push

### Fly.io (Free Tier)

1. Install `flyctl`: `curl -L https://fly.io/install.sh | sh`
2. `fly launch` — Creates app and Dockerfile
3. `fly secrets set DATABASE_URL=... TURSO_AUTH_TOKEN=... NEXTAUTH_SECRET=... NEXTAUTH_URL=...`
4. `fly deploy`

### Railway (Free Starter)

1. Connect GitHub repo at railway.app
2. Add environment variables in dashboard
3. Auto-deploys on push

---

## Post-Deployment Checklist

- [ ] Change default admin password
- [ ] Set up custom domain (Vercel → Settings → Domains)
- [ ] Verify health endpoint responds
- [ ] Test login/signup flow
- [ ] Check Vercel analytics
- [ ] Set up monitoring (optional)
- [ ] Configure CI/CD (see `.github/workflows/deploy.yml`)

---

## Troubleshooting

### Build Errors

**"Export PrismaLibSQL doesn't exist"**
- Ensure `@prisma/adapter-libsql` is in dependencies
- Run `bun install` then `npx prisma generate`

**"Invalid URL" during build**
- Ensure `.env.production` has `DATABASE_URL="file:./db/custom.db"` for build time
- Vercel will override with Turso URL at runtime

### Database Issues

**"Connection refused"**
- Check Turso URL format: `libsql://...turso.io`
- Verify `TURSO_AUTH_TOKEN` is correct
- Run `turso db show sre-platform` to verify database exists

**"Schema not found"**
- Run `npx prisma db push` with Turso credentials
- Ensure schema was pushed before deploying

### Auth Issues

**"NEXTAUTH_SECRET not set"**
- Generate: `openssl rand -base64 32`
- Set in Vercel: `npx vercel env add NEXTAUTH_SECRET`

**Redirect loop on login**
- Check `NEXTAUTH_URL` matches your actual Vercel URL
- Must include `https://` prefix
