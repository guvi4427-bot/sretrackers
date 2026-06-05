import { NextResponse } from 'next/server';
import { requireAdmin, logAudit } from '@/lib/admin-auth';
import { db } from '@/lib/db';

/**
 * POST /api/admin/infra/setup
 *
 * One-time setup endpoint to create the infrastructure database tables.
 * Creates the new Prisma models using raw SQL since prisma db push can't run in serverless.
 */
export async function POST(req: Request) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) {
      return NextResponse.json({ error: adminCheck.error!.message }, { status: adminCheck.error!.status });
    }

    const results: string[] = [];

    const tables = [
      {
        name: 'OtpEntry',
        sql: `CREATE TABLE IF NOT EXISTS "OtpEntry" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
          "phone" TEXT NOT NULL,
          "otp" TEXT NOT NULL,
          "expiresAt" TIMESTAMP(3) NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "OtpEntry_pkey" PRIMARY KEY ("id")
        )`,
        indexes: [
          `CREATE INDEX IF NOT EXISTS "OtpEntry_phone_idx" ON "OtpEntry"("phone")`,
          `CREATE INDEX IF NOT EXISTS "OtpEntry_expiresAt_idx" ON "OtpEntry"("expiresAt")`,
        ],
      },
      {
        name: 'ServerMetrics',
        sql: `CREATE TABLE IF NOT EXISTS "ServerMetrics" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
          "instanceId" TEXT NOT NULL,
          "activeUsers" INTEGER NOT NULL DEFAULT 0,
          "requestCount" INTEGER NOT NULL DEFAULT 0,
          "avgResponseMs" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "memoryUsageMb" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "apiCalls" INTEGER NOT NULL DEFAULT 0,
          "concurrentConns" INTEGER NOT NULL DEFAULT 0,
          "errorCount" INTEGER NOT NULL DEFAULT 0,
          "periodStart" TIMESTAMP(3) NOT NULL,
          "periodEnd" TIMESTAMP(3) NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ServerMetrics_pkey" PRIMARY KEY ("id")
        )`,
        indexes: [
          `CREATE INDEX IF NOT EXISTS "ServerMetrics_instanceId_idx" ON "ServerMetrics"("instanceId")`,
          `CREATE INDEX IF NOT EXISTS "ServerMetrics_periodStart_idx" ON "ServerMetrics"("periodStart")`,
        ],
      },
      {
        name: 'RequestLog',
        sql: `CREATE TABLE IF NOT EXISTS "RequestLog" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
          "userId" TEXT,
          "instanceId" TEXT NOT NULL,
          "path" TEXT NOT NULL,
          "method" TEXT NOT NULL,
          "statusCode" INTEGER NOT NULL DEFAULT 200,
          "responseMs" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "ip" TEXT,
          "userAgent" TEXT,
          "isGuest" BOOLEAN NOT NULL DEFAULT false,
          "isCrawler" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "RequestLog_pkey" PRIMARY KEY ("id")
        )`,
        indexes: [
          `CREATE INDEX IF NOT EXISTS "RequestLog_userId_idx" ON "RequestLog"("userId")`,
          `CREATE INDEX IF NOT EXISTS "RequestLog_createdAt_idx" ON "RequestLog"("createdAt")`,
          `CREATE INDEX IF NOT EXISTS "RequestLog_instanceId_idx" ON "RequestLog"("instanceId")`,
        ],
      },
      {
        name: 'AbuseFlag',
        sql: `CREATE TABLE IF NOT EXISTS "AbuseFlag" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
          "userId" TEXT,
          "ip" TEXT,
          "severity" TEXT NOT NULL DEFAULT 'low',
          "reason" TEXT NOT NULL,
          "details" TEXT,
          "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "status" TEXT NOT NULL DEFAULT 'active',
          "reviewedBy" TEXT,
          "adminNote" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "AbuseFlag_pkey" PRIMARY KEY ("id")
        )`,
        indexes: [
          `CREATE INDEX IF NOT EXISTS "AbuseFlag_userId_idx" ON "AbuseFlag"("userId")`,
          `CREATE INDEX IF NOT EXISTS "AbuseFlag_ip_idx" ON "AbuseFlag"("ip")`,
          `CREATE INDEX IF NOT EXISTS "AbuseFlag_status_idx" ON "AbuseFlag"("status")`,
          `CREATE INDEX IF NOT EXISTS "AbuseFlag_createdAt_idx" ON "AbuseFlag"("createdAt")`,
        ],
      },
      {
        name: 'RateLimitEntry',
        sql: `CREATE TABLE IF NOT EXISTS "RateLimitEntry" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
          "key" TEXT NOT NULL,
          "count" INTEGER NOT NULL DEFAULT 1,
          "resetAt" TIMESTAMP(3) NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "RateLimitEntry_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "RateLimitEntry_key_key" UNIQUE ("key")
        )`,
        indexes: [
          `CREATE INDEX IF NOT EXISTS "RateLimitEntry_resetAt_idx" ON "RateLimitEntry"("resetAt")`,
        ],
      },
    ];

    for (const table of tables) {
      try {
        await db.$executeRawUnsafe(table.sql);
        for (const idx of table.indexes) {
          await db.$executeRawUnsafe(idx);
        }
        results.push(`${table.name}: created`);
      } catch (e: any) {
        results.push(`${table.name}: ${e.message?.slice(0, 100) || 'error'}`);
      }
    }

    await logAudit(adminCheck.data.session.user.id, 'infra_setup', undefined, { results });

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
