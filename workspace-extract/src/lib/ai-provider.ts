// ── AI Provider — Pollinations AI (Authenticated) ──
//
// Provider: Pollinations AI
//   Authentication: Bearer token via POLLINATIONS_API_KEY (sk_ key)
//   Endpoint: https://text.pollinations.ai/openai (OpenAI-compatible)
//   Fallback chain:
//     Tier 1: Authenticated chat endpoint (POST, best quality)
//     Tier 2: Lightweight prompt retry (trimmed, fewer tokens)
//     Tier 3: Text endpoint (GET, simplest, most reliable)
//     Tier 4: Local fallback message (extreme failure only)
//
// Features:
//   - maxTokens = 4500
//   - API key authentication via POLLINATIONS_API_KEY env var
//   - Server-side only
//   - Navigator bot: preloaded local responses (instant, no API call)
//   - Telemetry: provider, latency, tokens, retry count, errors

const POLLINATIONS_OPENAI = 'https://text.pollinations.ai/openai';
const POLLINATIONS_TEXT = 'https://text.pollinations.ai/';

const MAX_TOKENS = 4500;
const REQUEST_TIMEOUT_MS = 30000; // Slightly longer with auth

// ── API Key ──
function getApiKey(): string | null {
  return process.env.POLLINATIONS_API_KEY || null;
}

// ── Telemetry Types ──
export interface AITelemetry {
  provider: string;
  model: string;
  latencyMs: number;
  tokensIn?: number;
  tokensOut?: number;
  retryCount: number;
  fallbackUsed: boolean;
  success: boolean;
  errorType?: string;
  errorMessage?: string;
  timestamp: string;
}

const telemetryStore: AITelemetry[] = [];
const MAX_TELEMETRY = 100;

function recordTelemetry(t: AITelemetry) {
  telemetryStore.push(t);
  if (telemetryStore.length > MAX_TELEMETRY) telemetryStore.shift();
  console.log(`[AI] ${t.success ? 'OK' : 'FAIL'} provider=${t.provider}/${t.model} latency=${t.latencyMs}ms retries=${t.retryCount}${t.errorType ? ` error=${t.errorType}` : ''}`);
}

export function getTelemetry(): AITelemetry[] { return [...telemetryStore]; }

export function getTelemetryStats() {
  const total = telemetryStore.length || 1;
  const successes = telemetryStore.filter(t => t.success).length;
  const byProvider: Record<string, { count: number; successes: number; avgLatency: number }> = {};
  for (const t of telemetryStore) {
    const key = `${t.provider}/${t.model}`;
    if (!byProvider[key]) byProvider[key] = { count: 0, successes: 0, avgLatency: 0 };
    byProvider[key].count++;
    if (t.success) byProvider[key].successes++;
    byProvider[key].avgLatency += t.latencyMs;
  }
  for (const k of Object.keys(byProvider)) {
    byProvider[k].avgLatency = Math.round(byProvider[k].avgLatency / byProvider[k].count);
  }
  return {
    totalCalls: total,
    successRate: Math.round((successes / total) * 100),
    fallbackRate: Math.round((telemetryStore.filter(t => t.fallbackUsed).length / total) * 100),
    avgLatency: Math.round(telemetryStore.reduce((a, t) => a + t.latencyMs, 0) / total),
    byProvider,
  };
}

// ── Timeout Helper ──
function withTimeout<T>(promise: Promise<T>, ms = REQUEST_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

// ═══════════════════════════════════════════════════════
// Pollinations OpenAI-compatible chat endpoint (Authenticated)
// ═══════════════════════════════════════════════════════
async function pollinationsChat(
  messages: { role: string; content: string }[],
  maxTokens = MAX_TOKENS,
): Promise<{ content: string | null; tokensIn: number; tokensOut: number }> {
  const apiKey = getApiKey();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if API key is available
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const res = await fetch(POLLINATIONS_OPENAI, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'openai',
      messages,
      max_tokens: maxTokens,
      seed: 42,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Pollinations responded ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || null;
  const usage = data?.usage;
  return {
    content,
    tokensIn: usage?.prompt_tokens || 0,
    tokensOut: usage?.completion_tokens || 0,
  };
}

// ═══════════════════════════════════════════════════════
// Pollinations text endpoint (GET, with auth if available)
// ═══════════════════════════════════════════════════════
async function pollinationsText(prompt: string): Promise<string | null> {
  const apiKey = getApiKey();
  const encoded = encodeURIComponent(prompt.slice(0, 2000));

  const headers: Record<string, string> = {
    'Accept': 'text/plain',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const res = await fetch(`${POLLINATIONS_TEXT}${encoded}`, {
    method: 'GET',
    headers,
  });
  if (!res.ok) throw new Error(`Pollinations text responded ${res.status}`);
  const text = await res.text();
  return text?.trim() || null;
}

// ── Provider attempt with telemetry ──
async function attemptProvider(
  providerName: string,
  modelName: string,
  fn: () => Promise<string | null>,
  retryCount: number,
  fallbackUsed: boolean,
): Promise<{ result: string | null; telemetry: AITelemetry }> {
  const start = Date.now();
  try {
    const result = await withTimeout(fn(), REQUEST_TIMEOUT_MS);
    const latencyMs = Date.now() - start;
    const telemetry: AITelemetry = {
      provider: providerName, model: modelName, latencyMs, retryCount, fallbackUsed,
      success: !!result, timestamp: new Date().toISOString(),
    };
    recordTelemetry(telemetry);
    return { result, telemetry };
  } catch (e: any) {
    const latencyMs = Date.now() - start;
    const telemetry: AITelemetry = {
      provider: providerName, model: modelName, latencyMs, retryCount, fallbackUsed,
      success: false,
      errorType: e.message?.includes('Timeout') ? 'timeout' : 'provider_error',
      errorMessage: e.message?.slice(0, 200),
      timestamp: new Date().toISOString(),
    };
    recordTelemetry(telemetry);
    return { result: null, telemetry };
  }
}

// ── Local fallback error message ──
const AI_UNAVAILABLE = 'We are experiencing technical difficulties please try again later';

// ═══════════════════════════════════════════════════════
// Public: Chat completion with 4-tier Pollinations fallback
// ═══════════════════════════════════════════════════════
export async function aiChat(
  messages: { role: string; content: string }[],
  systemPrompt?: string,
  maxTokens = MAX_TOKENS,
): Promise<string> {
  const allMessages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    ...messages,
  ];

  const providers: Array<() => Promise<{ result: string | null; telemetry: AITelemetry }>> = [
    // Tier 1: Full Pollinations chat (authenticated, best quality)
    () => attemptProvider('pollinations', 'openai', async () => {
      const r = await pollinationsChat(allMessages, maxTokens);
      return r.content;
    }, 0, false),
    // Tier 2: Lightweight prompt retry (trimmed, fewer tokens)
    () => attemptProvider('pollinations', 'openai-lite', async () => {
      const lastMessage = messages[messages.length - 1]?.content || '';
      const liteMessages = systemPrompt
        ? [{ role: 'system' as const, content: systemPrompt.slice(0, 500) }, { role: 'user' as const, content: lastMessage }]
        : [{ role: 'user' as const, content: lastMessage }];
      const r = await pollinationsChat(liteMessages, Math.min(maxTokens, 2000));
      return r.content;
    }, 1, true),
    // Tier 3: Pollinations text endpoint (simplest, most reliable)
    () => attemptProvider('pollinations', 'text', async () => {
      const lastMessage = messages[messages.length - 1]?.content || '';
      const prompt = systemPrompt
        ? `${systemPrompt.slice(0, 300)}\n\nUser: ${lastMessage}`
        : lastMessage;
      return pollinationsText(prompt);
    }, 2, true),
  ];

  // Try each provider in sequence
  for (const providerFn of providers) {
    try {
      const { result } = await providerFn();
      if (result) return result;
    } catch {
      // Continue to next provider
    }
  }

  // All providers failed — local fallback
  console.error('[AI] All Pollinations tiers failed for aiChat');
  return AI_UNAVAILABLE;
}

// ═══════════════════════════════════════════════════════
// Public: Structured JSON chat
// ═══════════════════════════════════════════════════════
export async function aiStructuredChat<T>(
  messages: { role: string; content: string }[],
  systemPrompt?: string,
  maxTokens = 4500,
): Promise<T | null> {
  const allMessages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    ...messages,
  ];

  // Tier 1: Full chat — best at following JSON instructions
  try {
    const start = Date.now();
    const r = await withTimeout(pollinationsChat(allMessages, maxTokens));
    const latencyMs = Date.now() - start;
    if (r.content) {
      const match = r.content.match(/\{[\s\S]*\}/);
      if (match) {
        recordTelemetry({ provider: 'pollinations', model: 'openai-structured', latencyMs, tokensIn: r.tokensIn, tokensOut: r.tokensOut, retryCount: 0, fallbackUsed: false, success: true, timestamp: new Date().toISOString() });
        return JSON.parse(match[0]) as T;
      }
    }
    recordTelemetry({ provider: 'pollinations', model: 'openai-structured', latencyMs, tokensIn: r.tokensIn, tokensOut: r.tokensOut, retryCount: 0, fallbackUsed: false, success: false, errorType: 'malformed_response', timestamp: new Date().toISOString() });
  } catch (e: any) {
    recordTelemetry({ provider: 'pollinations', model: 'openai-structured', latencyMs: 0, retryCount: 0, fallbackUsed: false, success: false, errorType: e.message?.includes('Timeout') ? 'timeout' : 'provider_error', errorMessage: e.message?.slice(0, 200), timestamp: new Date().toISOString() });
  }

  // Tier 2: Lightweight retry
  try {
    const start = Date.now();
    const lastMessage = messages[messages.length - 1]?.content || '';
    const liteMessages = systemPrompt
      ? [{ role: 'system' as const, content: systemPrompt.slice(0, 300) }, { role: 'user' as const, content: lastMessage }]
      : [{ role: 'user' as const, content: lastMessage }];
    const r = await withTimeout(pollinationsChat(liteMessages, Math.min(maxTokens, 1000)));
    const latencyMs = Date.now() - start;
    if (r.content) {
      const match = r.content.match(/\{[\s\S]*\}/);
      if (match) {
        recordTelemetry({ provider: 'pollinations', model: 'openai-lite-structured', latencyMs, tokensIn: r.tokensIn, tokensOut: r.tokensOut, retryCount: 1, fallbackUsed: true, success: true, timestamp: new Date().toISOString() });
        return JSON.parse(match[0]) as T;
      }
    }
  } catch { /* fall through */ }

  return null;
}

// ═══════════════════════════════════════════════════════
// Public: Task classifier
// ═══════════════════════════════════════════════════════
export async function aiClassifyTask(
  title: string,
  description?: string
): Promise<{ category: string; productivity: string; suggestion?: string }> {
  const text = `${title} ${description || ''}`.toLowerCase();

  // Keyword baseline — instant, always runs first
  const CATS: Record<string, string[]> = {
    work:     ['meeting','email','report','presentation','deadline','project','client','review','code','deploy','git','standup','sprint','task','assign','deliver','proposal','invoice','contract'],
    personal: ['grocery','clean','laundry','cook','bill','pay','appointment','family','friend','home','repair','organize','shopping'],
    health:   ['gym','workout','exercise','run','walk','yoga','meditation','doctor','medicine','sleep','stretch','vitamin','water','diet','protein','meal prep'],
    learning: ['study','read','book','course','tutorial','learn','practice','research','homework','quiz','exam','note','revise','certificate'],
  };
  const UNPRODUCTIVE = ['scroll','binge','procrastinate','lazy','waste','distraction','social media','netflix','youtube browse','doom scroll','overthink','complain','idle','nothing','instagram reels','reels','tiktok scroll','shorts','scrolling','mindless browsing','youtube shorts','snapchat','facebook scroll','instagram','tiktok'];
  const SUGGESTIONS: Record<string, string> = {
    scroll: 'Try: Read an article for 15 minutes instead',
    binge: 'Try: Watch one educational video, then do a quick productive task',
    'social media': 'Try: Set a 10-min timer, then work on a priority task',
    netflix: 'Try: Watch one episode as a reward after completing 2 tasks',
    procrastinate: 'Try: Break the task into a tiny 2-minute first step',
    lazy: 'Try: Start with 5 minutes — momentum builds!',
    overthink: 'Try: Write your thoughts down, pick one small action',
    reels: 'Try: Close the app and spend 5 minutes on a productive task',
    tiktok: 'Try: Set a 5-min timer, then switch to a learning activity',
    scrolling: 'Try: Put your phone down and do a 5-minute stretch or walk',
  };

  let category = 'other', maxMatches = 0;
  for (const [cat, kws] of Object.entries(CATS)) {
    const m = kws.filter(kw => text.includes(kw)).length;
    if (m > maxMatches) { maxMatches = m; category = cat; }
  }
  const isUnproductive = UNPRODUCTIVE.some(kw => text.includes(kw));
  let productivity = isUnproductive ? 'unproductive' : 'productive';
  let suggestion: string | undefined;
  for (const [kw, sug] of Object.entries(SUGGESTIONS)) {
    if (text.includes(kw)) { suggestion = sug; break; }
  }
  if (!suggestion && isUnproductive) {
    suggestion = 'Try replacing this with a 15-minute learning or exercise activity';
  }

  // Enhance with real AI
  try {
    const result = await aiStructuredChat<{ category: string; productivity: string; suggestion?: string }>(
      [{ role: 'user', content: `Classify this task: "${title}". ${description || ''}` }],
      'You are a task classifier. Respond ONLY with valid JSON: {"category":"work|personal|health|learning|other","productivity":"productive|unproductive","suggestion":"short replacement tip if unproductive, omit if productive"}',
      120
    );
    if (result?.category) category = result.category;
    if (result?.productivity) productivity = result.productivity;
    if (result?.suggestion) suggestion = result.suggestion;
  } catch { /* keyword result already computed above */ }

  return { category, productivity, suggestion };
}

// ═══════════════════════════════════════════════════════
// Public: Title generation for conversations
// ═══════════════════════════════════════════════════════
export async function generateTitle(userMessage: string): Promise<string> {
  // First try a keyword-based approach (instant, no API call)
  const titleFromKeywords = extractTitle(userMessage);
  if (titleFromKeywords) return titleFromKeywords;

  // Fallback: use AI to generate a title (short, cheap call)
  try {
    const result = await aiStructuredChat<{ title: string }>(
      [{ role: 'user', content: `Generate a very short title (3-5 words max) for a conversation that starts with: "${userMessage.slice(0, 200)}"` }],
      'You generate conversation titles. Respond ONLY with valid JSON: {"title":"Short Title Here"}',
      60
    );
    if (result?.title) return result.title;
  } catch { /* fallback */ }

  // Final fallback: use first 50 chars of user message
  return userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '');
}

function extractTitle(message: string): string | null {
  const lower = message.toLowerCase();
  const patterns: [RegExp, (...args: string[]) => string][] = [
    [/roadmap\s+(?:to\s+)?(?:learn\s+)?(.+)/i, (_: string, m: string) => capitalize(m.trim())],
    [/help\s+me\s+(?:learn|study|understand)\s+(.+)/i, (_: string, m: string) => capitalize(m.trim())],
    [/how\s+(?:to|do\s+I)\s+(.+)/i, (_: string, m: string) => capitalize(m.trim())],
    [/what\s+is\s+(.+)/i, (_: string, m: string) => capitalize(m.trim())],
    [/explain\s+(.+)/i, (_: string, m: string) => capitalize(m.trim())],
    [/create\s+(?:a\s+)?(.+)(?:\s+plan|schedule|routine)/i, (_: string, m: string) => capitalize(m.trim()) + ' Plan'],
    [/create\s+(?:a\s+)?(.+)/i, (_: string, m: string) => capitalize(m.trim())],
    [/build\s+(?:a\s+)?(.+)/i, (_: string, m: string) => capitalize(m.trim())],
    [/plan\s+(?:for\s+)?(.+)/i, (_: string, m: string) => capitalize(m.trim()) + ' Plan'],
    [/suggest\s+(.+)/i, (_: string, m: string) => capitalize(m.trim())],
    [/recommend\s+(.+)/i, (_: string, m: string) => capitalize(m.trim())],
  ];

  for (const [regex, formatter] of patterns) {
    const match = lower.match(regex);
    if (match) {
      const title = formatter(match[0], match[1]);
      if (title && title.length > 2 && title.length < 60) return title;
    }
  }
  return null;
}

function capitalize(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase()).replace(/\s+/g, ' ').trim();
}

// ═══════════════════════════════════════════════════════
// Public: Navigator Bot — Preloaded local responses (instant, no API)
// ═══════════════════════════════════════════════════════
export function getNavigatorResponse(userMessage: string): string | null {
  const msg = userMessage.toLowerCase().trim();

  const navPatterns: [RegExp, string][] = [
    [/workout|exercise|gym|fitness log/i, 'You can log workouts and track fitness in the **Fitness** section! Go to **/fitness** to:\n- Log workouts with duration and type\n- Track meals and nutrition\n- View progress charts\n- Get AI macro and calorie burn estimates'],
    [/learn|study|track.*learn|learning/i, 'Track your learning in the **Learn** section at **/learn**! You can:\n- Create learning topics\n- Log study entries with time spent\n- Track progress with charts\n- Share topics with others'],
    [/achievements?|badge|trophy/i, 'View your achievements at **/achievements**! The SRE platform has 100+ badges across learning, fitness, time, and content. Badges range from bronze to platinum based on your milestones.'],
    [/content|script|series|post|publish/i, 'Content creation tools are in the **Content** section at **/content**! You can:\n- Manage content series\n- Track pipeline stages (idea → drafting → editing → published)\n- Get AI script reviews\n- Find best posting times'],
    [/task|todo|productivity|focus|time manage/i, 'Manage tasks and focus in the **Time** section at **/time**! Features include:\n- Create tasks with priorities\n- Focus timer (Pomodoro-style)\n- Day planner with AI rating\n- Task classification (productive/unproductive)'],
    [/dashboard|home|overview|summary/i, 'Your personalized dashboard is at **/home** — it shows your activity summary, stats, quick actions, and recent progress across all areas.'],
    [/analytics|chart|stats|data|progress/i, 'Visual dashboards are at **/analytics**! View charts for learning progress, fitness trends, and focus data across different time periods.'],
    [/profile|account|settings|preferences/i, 'Access your profile at **/profile** and settings at **/settings**. Your profile shows stats, achievements, and activity. Settings has account preferences.'],
    [/social|feed|follow|discover|community/i, 'Social features include:\n- **/feed** — See posts from people you follow\n- **/discover** — Find new users and content\n- **/leaderboard** — Community XP rankings'],
    [/message|chat|dm|friend/i, 'Communication features:\n- **/messages** — Direct messages and group chats\n- **/friends** — Your friends list\n- **/notifications** — Activity notifications'],
    [/ai|assistant|hub|chat/i, 'The **AI Hub** at **/ai-hub** is your unified AI chat center! Choose from 6 specialized assistants:\n- Main Assistant (general)\n- Learning Tutor\n- Fitness Coach\n- Productivity Coach\n- Content Assistant\n- Platform Navigator'],
    [/phase|start|restart|explore|onboard/i, 'SRE uses a **Phase system**:\n- **Start** — Begin something new\n- **Restart** — Return to paused goals\n- **Explore** — Discover new interests\n\nVisit **/onboarding** to set up your phases and interests.'],
    [/xp|level|rank|point/i, 'The **XP System** rewards every activity! Earn XP for logging workouts, studying, creating content, and more. Level up with increasing thresholds. Check your rank at **/leaderboard**.'],
    [/streak|daily|consecutive|quest/i, 'Track **Streaks** for consecutive active days and complete **Daily Quests** for bonus XP! Both appear on your dashboard at **/home**.'],
    [/navigate|how.*find|where.*go|where.*is|how.*use|help.*use/i, 'I can help you navigate! The SRE platform has these main sections:\n\n- **/home** — Dashboard\n- **/learn** — Learning tracker\n- **/fitness** — Fitness & nutrition\n- **/content** — Content creation\n- **/time** — Tasks & focus\n- **/ai-hub** — AI assistants\n- **/analytics** — Data dashboards\n- **/achievements** — Badges\n\nWhat would you like to find?'],
    [/hello|hi|hey|greet/i, 'Hello! I\'m the SRE Navigator, your guide to the platform. Ask me anything about where to find features, how to use tools, or what each section does!'],
    [/thank|thanks/i, 'You\'re welcome! If you need any more help navigating the SRE platform, just ask. I\'m always here to help!'],
  ];

  for (const [pattern, response] of navPatterns) {
    if (pattern.test(msg)) return response;
  }

  // No match — return null to let the AI API handle it
  return null;
}

// ═══════════════════════════════════════════════════════
// Public: Quick AI call for estimate-macros and estimate-burn
// ═══════════════════════════════════════════════════════
export async function aiQuickCall(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 100,
): Promise<string | null> {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  // Try authenticated chat endpoint first
  try {
    const r = await withTimeout(pollinationsChat(messages, maxTokens), 10000);
    if (r.content) return r.content;
  } catch {}

  // Fallback to text endpoint
  try {
    const prompt = `${systemPrompt}\n\n${userPrompt}`;
    const result = await withTimeout(pollinationsText(prompt), 10000);
    if (result) return result;
  } catch {}

  return null;
}

// ═══════════════════════════════════════════════════════
// Public: Check if API key is configured
// ═══════════════════════════════════════════════════════
export function isApiKeyConfigured(): boolean {
  return !!getApiKey();
}
