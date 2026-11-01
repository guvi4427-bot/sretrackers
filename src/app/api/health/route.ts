import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "unknown";
  let dbLatencyMs = 0;
  let overallStatus = "ok";

  try {
    const dbStart = Date.now();
    // Fast lightweight check against PostgreSQL
    await db.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = "connected";
  } catch (error) {
    dbStatus = "disconnected";
    overallStatus = "degraded";
    console.error("Health check DB connection error:", error);
  }

  const memory = process.memoryUsage();

  const responseBody = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    responseTimeMs: Date.now() - startTime,
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      provider: "postgresql",
    },
    system: {
      memoryUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
      memoryTotalMB: Math.round(memory.heapTotal / 1024 / 1024),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || "development",
    },
  };

  const httpStatus = overallStatus === "ok" ? 200 : 503;
  return NextResponse.json(responseBody, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
