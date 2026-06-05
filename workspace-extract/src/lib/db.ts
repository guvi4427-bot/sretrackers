import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || ''

  // If DATABASE_URL starts with libsql:// or http(s)://, use the Turso/libsql adapter
  if (databaseUrl.startsWith('libsql://') || databaseUrl.startsWith('http://') || databaseUrl.startsWith('https://')) {
    try {
      const { PrismaLibSql } = require('@prisma/adapter-libsql')
      const adapter = new PrismaLibSql({
        url: databaseUrl,
        authToken: process.env.TURSO_AUTH_TOKEN,
      })
      return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
      })
    } catch (e) {
      console.error('Failed to initialize Turso adapter, falling back to standard PrismaClient:', e)
    }
  }

  // For Neon PostgreSQL: use POSTGRES_PRISMA_URL (pooled) if available,
  // otherwise fall back to DATABASE_URL. Pooled connections are required
  // for serverless environments like Vercel to avoid connection limits.
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
