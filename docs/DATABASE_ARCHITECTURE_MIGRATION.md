# Database Architecture & Neon PostgreSQL Migration Guide

_Database Engine: Neon Serverless PostgreSQL · ORM: Prisma 6.x · Schema: 55 Models_

---

## 1. Current State & Migration Strategy

The SRE platform data layer is modeled in `prisma/schema.prisma` targeting `provider = "postgresql"`.
Historically, local development used a local SQLite file (`prisma/db/dev.db`), and some legacy deployment scripts experimented with Turso/libSQL.

The target production database engine is **Neon Serverless PostgreSQL**.

### Preserving Existing Records
The existing `dev.db` contains exactly one user:
- User ID: `cmplfmttm0000svsj88zm1hql`
- Email: `myselfgowtham140707@gmail.com`
- Username: `admin`
- Name: `Gowtham`
- Super Admin: `true`

Our idempotent seed scripts (`scripts/seed-db.mjs` and `src/lib/seed.ts`) preserve this account and all relational models.

---

## 2. Connection Strategy & Connection Pooling

Serverless and container environments (Vercel edge/serverless functions, Hostless auto-scaling workers) create ephemeral connections. Unpooled connections quickly exhaust PostgreSQL's `max_connections` limit.

### Recommended Configuration:
1. **Application Connection (Pooled):**
   ```env
   POSTGRES_PRISMA_URL="postgresql://[user]:[password]@[endpoint]-pooler.[region].aws.neon.tech/[dbname]?sslmode=require&pgbouncer=true"
   ```
   Uses Neon's built-in PgBouncer pooler to scale to thousands of concurrent requests with low latency.

2. **Migration & CLI Connection (Direct):**
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[endpoint].[region].aws.neon.tech/[dbname]?sslmode=require"
   ```
   Direct unpooled connection required by Prisma CLI for running schema modifications and migrations.

### Runtime Connection Handling (`src/lib/db.ts`):
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || ''
  const prismaUrl = process.env.POSTGRES_PRISMA_URL || databaseUrl

  return new PrismaClient({
    datasourceUrl: prismaUrl,
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

---

## 3. High-Performance Indexing Added

The following composite performance indexes have been added to `prisma/schema.prisma` to eliminate table scans on high-traffic queries:

| Table | Index | Query Optimized |
|---|---|---|
| `TimeTask` | `(userId, date)` | Dashboard & Time planner daily view |
| `TimeTask` | `(userId, status)` | Pending vs Completed task filtering |
| `FitnessFoodLog` | `(userId, date)` | Macro totals calculation for today |
| `FitnessWorkoutLog` | `(userId, date)` | Workout timeline and weekly aggregation |
| `FitnessWeightLog` | `(userId, date)` | Weight progression charts |
| `LearningEntry` | `(userId, date)` | Daily study streak and hours calculation |
| `LearningEntry` | `(topicId)` | Topic details entries list |
| `LearningProgressFlag` | `(userId, topicId)` | Needs-attention flag retrieval |
| `FocusSession` | `(userId, date)` | Productivity time block calculation |
| `DayPlan` | `(userId, date)` | Single-day plan fetch & upsert |
| `ContentEntry` | `(userId, status)` | Kanban pipeline column grouping |
| `ContentEntry` | `(seriesId)` | Series entries list |
| `Follow` | `(followingId)` | Follower lists & count queries |
| `DMMessage` | `(conversationId, createdAt)` | Message thread pagination |

---

## 4. Execution Commands

### A. Deploy Schema to Neon
```bash
# Set your direct Neon PostgreSQL connection string
export DATABASE_URL="postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Generate client and push schema
npx prisma generate
npx prisma db push
```

### B. Seed Production Data (Idempotent)
```bash
node scripts/seed-db.mjs
```
This populates:
- 100+ standard achievement definitions across Learning, Fitness, Time, Content, and Social.
- Default Admin / Super Admin user.
- If run multiple times, it updates existing records without duplication or errors.

---

## 5. Backup and Restoration

### Backup Neon Database:
```bash
# Using standard pg_dump
pg_dump "$DATABASE_URL" --format=custom --file=sre_backup_$(date +%Y%m%d_%H%M%S).dump
```

### Restore to Neon Database:
```bash
# Using pg_restore
pg_restore --clean --if-exists --no-owner --no-privileges -d "$DATABASE_URL" sre_backup_YYYYMMDD_HHMMSS.dump
```

