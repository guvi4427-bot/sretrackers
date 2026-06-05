import { NextResponse } from 'next/server';

// ══════════════════════════════════════════════════════════════════════════
// AI DEBUG ENDPOINT — Provider status
// ══════════════════════════════════════════════════════════════════════════
// GET /api/ai/debug — Returns provider status and env var status
// This is for debugging ONLY — no auth required so we can quickly check status.

export async function GET() {
  // Check which env vars are set
  const envStatus: Record<string, { set: boolean; prefix?: string }> = {
    OPENAI_API_KEY: { set: !!process.env.OPENAI_API_KEY, prefix: process.env.OPENAI_API_KEY?.slice(0, 10) },
    GEMINI_API_KEY: { set: !!process.env.GEMINI_API_KEY, prefix: process.env.GEMINI_API_KEY?.slice(0, 10) },
    GOOGLE_AI_API_KEY: { set: !!process.env.GOOGLE_AI_API_KEY, prefix: process.env.GOOGLE_AI_API_KEY?.slice(0, 10) },
    HF_API_KEY: { set: !!process.env.HF_API_KEY, prefix: process.env.HF_API_KEY?.slice(0, 8) },
  };

  return NextResponse.json({
    status: 'OK',
    mode: 'local-first (zero external dependency)',
    providers: [{ name: 'local-responses', tier: 1, tierLabel: 'Local AI (Instant)', available: true }],
    envVars: envStatus,
    timestamp: new Date().toISOString(),
  });
}
