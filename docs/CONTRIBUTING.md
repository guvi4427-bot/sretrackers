# Contributing to the SRE Platform

Welcome to the **SRE — Start · Restart · Explore** engineering community. We appreciate your contributions to building an intelligent, sustainable self-growth ecosystem.

---

## 1. Development Prerequisites

- **Node.js**: v20+ LTS
- **Package Manager**: npm v10+
- **Database**: PostgreSQL (local instance or free [Neon](https://neon.tech/) connection)
- **Git**: For version control

---

## 2. Local Setup Guide

```bash
# 1. Clone the repository
git clone https://github.com/guvi4427-bot/sretrackers.git
cd sretrackers

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL DATABASE_URL and a 32-character NEXTAUTH_SECRET

# 4. Generate Prisma client & apply database schema
npx prisma generate
npx prisma db push

# 5. Seed initial data (Achievements & Super Admin)
npm run db:seed

# 6. Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 3. Code Standards & Pull Request Guidelines

Before submitting any Pull Request:
1. **Run Static Checks:**
   ```bash
   npm run lint
   npm run typecheck
   ```
   PRs with lint errors or TypeScript compilation failures will be blocked by CI.
2. **Run Tests:**
   ```bash
   npm test
   ```
   Add new regression tests under `tests/` for any new feature or bug fix.
3. **Verify Build:**
   ```bash
   npm run build
   ```
4. **Follow Design System Tokens:**
   - Avoid generic AI SaaS tropes (no gratuitous purple/blue glowing cards or excessive neon gradients).
   - Use semantic Tailwind classes and established design tokens.
5. **Preserve User Data:**
   - Database migrations must be backwards-compatible and never drop existing columns without a multi-phase migration strategy.

