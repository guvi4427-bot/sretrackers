import { NextResponse } from 'next/server';
import { aiChat } from '@/lib/ai-provider';

// ══════════════════════════════════════════════════════════════════════════
// AI TEST ENDPOINT — No auth required, for debugging provider failures
// ══════════════════════════════════════════════════════════════════════════

export async function GET() {
  const results: Record<string, { status: string; detail: string; ms: number }> = {};
  const testPrompt = 'Say hello in 5 words.';
  const testSystem = 'You are a helpful assistant. Answer directly.';

  // Test all free providers IN PARALLEL (like the actual racing logic)
  const tests: [string, Promise<{ status: string; detail: string; ms: number } | null>][] = [];

  // 1. Pollinations OpenAI model
  tests.push(['pollinations-openai', (async () => {
    try {
      const start = Date.now();
      const res = await fetch('https://text.pollinations.ai/openai/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai',
          messages: [{ role: 'system', content: testSystem }, { role: 'user', content: testPrompt }],
          max_tokens: 50,
          seed: Math.floor(Math.random() * 10000),
        }),
      });
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      return { status: res.ok && text ? 'OK' : 'EMPTY', detail: text?.slice(0, 100) || `HTTP_${res.status}`, ms: Date.now() - start };
    } catch (e: any) { return { status: 'ERROR', detail: e?.message?.slice(0, 100) || 'unknown', ms: 0 }; }
  })()]);

  // 2. Pollinations Mistral model
  tests.push(['pollinations-mistral', (async () => {
    try {
      const start = Date.now();
      const res = await fetch('https://text.pollinations.ai/openai/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mistral',
          messages: [{ role: 'system', content: testSystem }, { role: 'user', content: testPrompt }],
          max_tokens: 50,
          seed: Math.floor(Math.random() * 10000),
        }),
      });
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      return { status: res.ok && text ? 'OK' : 'EMPTY', detail: text?.slice(0, 100) || `HTTP_${res.status}`, ms: Date.now() - start };
    } catch (e: any) { return { status: 'ERROR', detail: e?.message?.slice(0, 100) || 'unknown', ms: 0 }; }
  })()]);

  // 3. Pollinations Text endpoint
  tests.push(['pollinations-text', (async () => {
    try {
      const start = Date.now();
      const encoded = encodeURIComponent(`${testSystem}\n\nUser: ${testPrompt}`);
      const res = await fetch(`https://text.pollinations.ai/${encoded}?model=openai`, {
        method: 'GET',
        headers: { 'Accept': 'text/plain' },
      });
      const text = await res.text();
      return { status: res.ok && text.trim() ? 'OK' : 'EMPTY', detail: text?.slice(0, 100) || `HTTP_${res.status}`, ms: Date.now() - start };
    } catch (e: any) { return { status: 'ERROR', detail: e?.message?.slice(0, 100) || 'unknown', ms: 0 }; }
  })()]);

  // 4. z.ai REST (if token available)
  const zaiToken = process.env.ZAI_TOKEN || process.env.ZAI_API_KEY;
  tests.push(['z.ai-rest', (async () => {
    if (!zaiToken) return { status: 'SKIPPED', detail: 'ZAI_TOKEN not set', ms: 0 };
    try {
      const start = Date.now();
      const res = await fetch('https://internal-api.z.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${zaiToken}` },
        body: JSON.stringify({ model: 'glm-4-flash', messages: [{ role: 'user', content: testPrompt }], max_tokens: 50 }),
      });
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      return { status: res.ok && text ? 'OK' : 'EMPTY', detail: text?.slice(0, 100) || `HTTP_${res.status}`, ms: Date.now() - start };
    } catch (e: any) { return { status: 'ERROR', detail: e?.message?.slice(0, 100) || 'unknown', ms: 0 }; }
  })()]);

  // 5. Gemini (if key available)
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  tests.push(['gemini', (async () => {
    if (!geminiKey) return { status: 'SKIPPED', detail: 'GEMINI_API_KEY not set', ms: 0 };
    try {
      const start = Date.now();
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: testPrompt }] }], generationConfig: { maxOutputTokens: 50 } }),
      });
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return { status: res.ok && text ? 'OK' : 'EMPTY', detail: text?.slice(0, 100) || data?.error?.message?.slice(0, 100) || `HTTP_${res.status}`, ms: Date.now() - start };
    } catch (e: any) { return { status: 'ERROR', detail: e?.message?.slice(0, 100) || 'unknown', ms: 0 }; }
  })()]);

  // 6. OpenAI (if key available)
  const openaiKey = process.env.OPENAI_API_KEY;
  tests.push(['openai', (async () => {
    if (!openaiKey) return { status: 'SKIPPED', detail: 'OPENAI_API_KEY not set', ms: 0 };
    try {
      const start = Date.now();
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: testPrompt }], max_tokens: 50 }),
      });
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      return { status: res.ok && text ? 'OK' : 'EMPTY', detail: text?.slice(0, 100) || `HTTP_${res.status}`, ms: Date.now() - start };
    } catch (e: any) { return { status: 'ERROR', detail: e?.message?.slice(0, 100) || 'unknown', ms: 0 }; }
  })()]);

  // Wait for all tests in parallel
  const settled = await Promise.allSettled(tests.map(t => t[1]));
  for (let i = 0; i < tests.length; i++) {
    const result = settled[i];
    results[tests[i][0]] = result.status === 'fulfilled' && result.value
      ? result.value
      : { status: 'ERROR', detail: 'Test failed', ms: 0 };
  }

  const okCount = Object.values(results).filter(r => r.status === 'OK').length;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    architecture: 'parallel-racing',
    workingProviders: okCount,
    envCheck: {
      OPENAI_API_KEY: !!openaiKey,
      GEMINI_API_KEY: !!geminiKey,
      ZAI_TOKEN: !!zaiToken,
      ZAI_API_KEY: !!process.env.ZAI_API_KEY,
    },
    results,
  });
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const userMessage = message || 'What is Linux?';

    const start = Date.now();
    const reply = await aiChat(
      [{ role: 'user', content: userMessage }],
      'You are a smart, direct AI assistant. Answer the question directly and completely.',
      500,
    );
    const totalMs = Date.now() - start;

    return NextResponse.json({
      input: userMessage,
      reply: reply.slice(0, 500),
      totalMs,
      replyLength: reply.length,
      provider: 'local',
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error?.message || 'Unknown error',
    }, { status: 500 });
  }
}
