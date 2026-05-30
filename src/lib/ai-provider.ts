// ── AI Provider — Multi-Provider Graceful Degradation ──
//
// Fallback chain:
//   Tier 1: Gemini AI (Google generativelanguage API, gemini-2.0-flash)
//   Tier 2: ChatGPT (OpenAI API, gpt-4o-mini)
//   Tier 3: OpenRouter (openrouter.ai, gpt-4o-mini via openrouter)
//   Tier 4: Z.ai Production API (GLM-4-Plus, REST direct — NOT dev SDK)
//   Tier 5: Pollinations AI (OpenAI-compatible, authenticated with sk key)
//   Tier 6: Local fallback error message
//
// Each tier is tried in sequence. If a tier fails (timeout, error, empty response),
// the next tier is attempted automatically. This ensures AI features always work
// even if individual providers have outages.

const MAX_TOKENS = 4500;
const REQUEST_TIMEOUT_MS = 30000; // 30s per provider attempt
const FALLBACK_ERROR = 'We are experiencing technical difficulties please try again later';

// ── API Endpoints ──
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const ZAI_URL = 'https://internal-api.z.ai/v1/chat/completions';
const POLLINATIONS_URL = 'https://text.pollinations.ai/openai/chat/completions';

// ── API Keys (from env vars) ──
function getGeminiKey(): string | null { return process.env.GEMINI_API_KEY || null; }
function getOpenAIKey(): string | null { return process.env.OPENAI_API_KEY || null; }
function getOpenRouterKey(): string | null { return process.env.OPENROUTER_API_KEY || null; }
function getZAIKey(): string | null { return process.env.ZAI_API_KEY || null; }
function getPollinationsKey(): string | null { return process.env.POLLINATIONS_API_KEY || null; }

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
// Tier 1: Gemini AI (Google Generative Language API)
// ═══════════════════════════════════════════════════════
async function geminiChat(
  messages: { role: string; content: string }[],
  maxTokens = MAX_TOKENS,
): Promise<string | null> {
  const apiKey = getGeminiKey();
  if (!apiKey) return null;

  // Convert OpenAI-style messages to Gemini format
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  // Inject system prompt as first user message if present
  const systemMsg = messages.find(m => m.role === 'system');
  if (systemMsg && contents.length > 0) {
    contents[0].parts[0].text = `${systemMsg.content}\n\n${contents[0].parts[0].text}`;
  }

  const res = await withTimeout(
    fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.7,
        },
      }),
    }),
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Gemini ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

  if (content) {
    console.log(`[AI] OK provider=gemini len=${content.length}`);
  } else {
    console.error('[AI] Gemini empty:', JSON.stringify(data).slice(0, 200));
  }

  return content;
}

// ═══════════════════════════════════════════════════════
// Tier 2: ChatGPT (OpenAI API, gpt-4o-mini)
// ═══════════════════════════════════════════════════════
async function openaiChat(
  messages: { role: string; content: string }[],
  maxTokens = MAX_TOKENS,
): Promise<string | null> {
  const apiKey = getOpenAIKey();
  if (!apiKey) return null;

  const res = await withTimeout(
    fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    }),
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`OpenAI ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || null;

  if (content) {
    console.log(`[AI] OK provider=openai model=gpt-4o-mini in=${data?.usage?.prompt_tokens || '?'} out=${data?.usage?.completion_tokens || '?'}`);
  } else {
    console.error('[AI] OpenAI empty:', JSON.stringify(data).slice(0, 200));
  }

  return content;
}

// ═══════════════════════════════════════════════════════
// Tier 3: OpenRouter (openrouter.ai, gpt-4o-mini)
// ═══════════════════════════════════════════════════════
async function openrouterChat(
  messages: { role: string; content: string }[],
  maxTokens = MAX_TOKENS,
): Promise<string | null> {
  const apiKey = getOpenRouterKey();
  if (!apiKey) return null;

  const res = await withTimeout(
    fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://sre-growth-platform.vercel.app',
        'X-Title': 'SRE Growth Platform',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    }),
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`OpenRouter ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || null;

  if (content) {
    console.log(`[AI] OK provider=openrouter model=gpt-4o-mini in=${data?.usage?.prompt_tokens || '?'} out=${data?.usage?.completion_tokens || '?'}`);
  } else {
    console.error('[AI] OpenRouter empty:', JSON.stringify(data).slice(0, 200));
  }

  return content;
}

// ═══════════════════════════════════════════════════════
// Tier 4: Z.ai Production API (GLM-4-Plus, REST direct)
// Uses production SDK API key — NOT the dev SDK (z-ai-web-dev-sdk)
// ═══════════════════════════════════════════════════════
async function zaiChat(
  messages: { role: string; content: string }[],
  maxTokens = MAX_TOKENS,
): Promise<string | null> {
  const apiKey = getZAIKey();
  if (!apiKey) return null;

  const res = await withTimeout(
    fetch(ZAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4-plus',
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    }),
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Z.ai ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || null;

  if (content) {
    console.log(`[AI] OK provider=zai model=glm-4-plus in=${data?.usage?.prompt_tokens || '?'} out=${data?.usage?.completion_tokens || '?'}`);
  } else {
    console.error('[AI] Z.ai empty:', JSON.stringify(data).slice(0, 200));
  }

  return content;
}

// ═══════════════════════════════════════════════════════
// Tier 5: Pollinations AI (OpenAI-compatible, authenticated)
// ═══════════════════════════════════════════════════════
async function pollinationsChat(
  messages: { role: string; content: string }[],
  maxTokens = MAX_TOKENS,
): Promise<string | null> {
  const apiKey = getPollinationsKey();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const res = await withTimeout(
    fetch(POLLINATIONS_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'openai',
        messages,
        max_tokens: maxTokens,
        seed: 42,
      }),
    }),
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Pollinations ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || null;

  if (content) {
    console.log(`[AI] OK provider=pollinations in=${data?.usage?.prompt_tokens || '?'} out=${data?.usage?.completion_tokens || '?'}`);
  } else {
    console.error('[AI] Pollinations empty:', JSON.stringify(data).slice(0, 200));
  }

  return content;
}

// ═══════════════════════════════════════════════════════
// Core: Multi-provider chat with graceful degradation
// ═══════════════════════════════════════════════════════
type ProviderFn = (messages: { role: string; content: string }[], maxTokens: number) => Promise<string | null>;

interface ProviderTier {
  name: string;
  fn: ProviderFn;
}

function getProviderChain(): ProviderTier[] {
  return [
    { name: 'gemini', fn: geminiChat },
    { name: 'openai', fn: openaiChat },
    { name: 'openrouter', fn: openrouterChat },
    { name: 'zai', fn: zaiChat },
    { name: 'pollinations', fn: pollinationsChat },
  ];
}

async function multiProviderChat(
  messages: { role: string; content: string }[],
  maxTokens = MAX_TOKENS,
): Promise<string> {
  const providers = getProviderChain();
  const errors: string[] = [];

  for (const provider of providers) {
    try {
      const result = await provider.fn(messages, maxTokens);
      if (result) {
        return result;
      }
    } catch (e: any) {
      const errMsg = e.message?.slice(0, 150) || 'unknown error';
      errors.push(`${provider.name}: ${errMsg}`);
      console.error(`[AI] ${provider.name} failed: ${errMsg}`);
      // Continue to next provider
    }
  }

  // All providers failed
  console.error(`[AI] All providers failed. Errors: ${errors.join(' | ')}`);
  return FALLBACK_ERROR;
}

// ═══════════════════════════════════════════════════════
// Public: Chat completion with graceful degradation
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

  return multiProviderChat(allMessages, maxTokens);
}

// ═══════════════════════════════════════════════════════
// Public: Structured JSON chat with graceful degradation
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

  const providers = getProviderChain();

  for (const provider of providers) {
    try {
      const content = await provider.fn(allMessages, maxTokens);
      if (content) {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          return JSON.parse(match[0]) as T;
        }
      }
    } catch (e: any) {
      console.error(`[AI] aiStructuredChat ${provider.name} failed:`, e.message?.slice(0, 100));
      // Continue to next provider
    }
  }

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
      120,
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

  // Use AI to generate a title (short, cheap call)
  try {
    const result = await aiStructuredChat<{ title: string }>(
      [{ role: 'user', content: `Generate a very short title (3-5 words max) for a conversation that starts with: "${userMessage.slice(0, 200)}"` }],
      'You generate conversation titles. Respond ONLY with valid JSON: {"title":"Short Title Here"}',
      60,
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
    [/content|script|series|post|publish/i, 'Content creation tools are in the **Content** section at **/content**! You can:\n- Manage content series\n- Track pipeline stages (idea \u2192 drafting \u2192 editing \u2192 published)\n- Get AI script reviews\n- Find best posting times'],
    [/task|todo|productivity|focus|time manage/i, 'Manage tasks and focus in the **Time** section at **/time**! Features include:\n- Create tasks with priorities\n- Focus timer (Pomodoro-style)\n- Day planner with AI rating\n- Task classification (productive/unproductive)'],
    [/dashboard|home|overview|summary/i, 'Your personalized dashboard is at **/home** \u2014 it shows your activity summary, stats, quick actions, and recent progress across all areas.'],
    [/analytics|chart|stats|data|progress/i, 'Visual dashboards are at **/analytics**! View charts for learning progress, fitness trends, and focus data across different time periods.'],
    [/profile|account|settings|preferences/i, 'Access your profile at **/profile** and settings at **/settings**. Your profile shows stats, achievements, and activity. Settings has account preferences.'],
    [/social|feed|follow|discover|community/i, 'Social features include:\n- **/feed** \u2014 See posts from people you follow\n- **/discover** \u2014 Find new users and content\n- **/leaderboard** \u2014 Community XP rankings'],
    [/message|chat|dm|friend/i, 'Communication features:\n- **/messages** \u2014 Direct messages and group chats\n- **/friends** \u2014 Your friends list\n- **/notifications** \u2014 Activity notifications'],
    [/ai|assistant|hub|chat/i, 'The **AI Hub** at **/ai-hub** is your unified AI chat center! Choose from 6 specialized assistants:\n- Main Assistant (general)\n- Learning Tutor\n- Fitness Coach\n- Productivity Coach\n- Content Assistant\n- Platform Navigator'],
    [/phase|start|restart|explore|onboard/i, 'SRE uses a **Phase system**:\n- **Start** \u2014 Begin something new\n- **Restart** \u2014 Return to paused goals\n- **Explore** \u2014 Discover new interests\n\nVisit **/onboarding** to set up your phases and interests.'],
    [/xp|level|rank|point/i, 'The **XP System** rewards every activity! Earn XP for logging workouts, studying, creating content, and more. Level up with increasing thresholds. Check your rank at **/leaderboard**.'],
    [/streak|daily|consecutive|quest/i, 'Track **Streaks** for consecutive active days and complete **Daily Quests** for bonus XP! Both appear on your dashboard at **/home**.'],
    [/navigate|how.*find|where.*go|where.*is|how.*use|help.*use/i, 'I can help you navigate! The SRE platform has these main sections:\n\n- **/home** \u2014 Dashboard\n- **/learn** \u2014 Learning tracker\n- **/fitness** \u2014 Fitness & nutrition\n- **/content** \u2014 Content creation\n- **/time** \u2014 Tasks & focus\n- **/ai-hub** \u2014 AI assistants\n- **/analytics** \u2014 Data dashboards\n- **/achievements** \u2014 Badges\n\nWhat would you like to find?'],
    [/hello|hi|hey|greet/i, 'Hello! I\'m the SRE Navigator, your guide to the platform. Ask me anything about where to find features, how to use tools, or what each section does!'],
    [/thank|thanks/i, 'You\'re welcome! If you need any more help navigating the SRE platform, just ask. I\'m always here to help!'],
  ];

  for (const [pattern, response] of navPatterns) {
    if (pattern.test(msg)) return response;
  }

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

  const providers = getProviderChain();

  for (const provider of providers) {
    try {
      const result = await provider.fn(messages, maxTokens);
      if (result) return result;
    } catch (e: any) {
      console.error(`[AI] aiQuickCall ${provider.name} failed:`, e.message?.slice(0, 100));
    }
  }

  return null;
}

// ═══════════════════════════════════════════════════════
// Public: Check if any API key is configured
// ═══════════════════════════════════════════════════════
export function isApiKeyConfigured(): boolean {
  return !!(getGeminiKey() || getOpenAIKey() || getOpenRouterKey() || getZAIKey() || getPollinationsKey());
}
