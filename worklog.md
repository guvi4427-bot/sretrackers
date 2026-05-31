---
Task ID: 1-9
Agent: Main Agent
Task: Complete SEO + Crawler Visibility Fix for SRE Track (7 changes + build + deploy)

Work Log:
- Verified Changes 1-2 (layout.tsx SSR fixes) were already applied from previous session
- Updated blog/page.tsx to match spec: fixed h1 text, added <p className="sr-only"> description paragraph, updated env var fallback order (NEXT_PUBLIC_SITE_URL first), removed x-internal header, added Array.isArray check, updated type annotations with nullable types
- Updated sitemap.ts to match spec: removed root URL, adjusted priorities exactly per spec, only 9 public URLs remain
- Verified Changes 4-6 (blog/[blogId], robots.ts) were already applied from previous session
- Set Vercel env vars: deleted old sensitive empty vars, created new plain-text vars for production:
  - NEXT_PUBLIC_SITE_NAME = "SRE Track"
  - NEXT_PUBLIC_SITE_URL = "https://sretrack.vercel.app"
  - NEXT_PUBLIC_CANONICAL_URL = already set correctly
- Build succeeded with zero errors
- Pushed to GitHub (commit 6bebe30)
- Verified live site SSR: all 7 public pages return real content to crawlers
- Verified robots.txt: Gemini-Web-Crawler, Google-Extended, CCBot all present
- Verified sitemap.xml: 9 public URLs, 0 auth-gated URLs
- Verified canonical URLs point to sretrack.vercel.app (env vars working)

Stage Summary:
- All 7 changes deployed and verified on live site
- SSR blocking is fixed — crawlers now receive full page HTML instead of blank spinners
- Sitemap contains only public URLs (no auth-gated pages)
- Robots.txt includes AI crawler rules
- Vercel env vars are set for production
- Post-deploy actions remaining: Google Search Console setup (manual, user action)

---
Task ID: AI-Macro-1
Agent: Main Agent
Task: Replace algorithm-based macro calculation with AI-based calculation (with fallback)

Work Log:
- Read src/app/api/fitness/profile/route.ts and src/lib/ai-provider.ts thoroughly
- Added import: `import { aiQuickCall } from '@/lib/ai-provider'`
- Kept calculateTDEE() completely untouched as the fallback
- Added new async function calculateMacrosWithAI() before GET handler
  - Computes algorithm fallback first (always available)
  - Calls aiQuickCall with structured nutrition prompt
  - Validates AI response: JSON extraction, field presence, type checking, range validation
  - Falls back gracefully on: null response, no JSON, missing fields, out-of-range values, any error
  - Logs source=ai or source=algorithm with reason for observability
- Updated POST handler: `calculateTDEE()` → `await calculateMacrosWithAI()`
- Updated PATCH handler: `calculateTDEE()` → `await calculateMacrosWithAI()`
- Did NOT touch: calculateTDEE, GET handler, DB logic, ACTIVITY/GOAL_MULTIPLIERS, ai-provider.ts, OnboardingClient.tsx
- Build succeeded with zero errors
- Pushed to GitHub (commit e252ae1), auto-deploy triggered

Stage Summary:
- AI-powered macro calculation is now live for fitness profile creation and updates
- Graceful degradation: if AI is unavailable, algorithm fallback ensures targets are always saved
- AI considers weight, height, age, gender, activity level, and goal for personalized targets
- All existing functionality preserved — no breakage
