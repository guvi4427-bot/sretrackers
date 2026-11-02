# Architectural Decision Records (ADRs) — SRE Platform

_Documenting key architectural decisions, rationale, context, and consequences._

---

## ADR-001: Decoupled Multi-Platform Deployment (Vercel Frontend, Hostless Backend, Neon DB)
- **Status:** Accepted
- **Context:** The application was previously a coupled Next.js monolith deployed directly to Vercel with a database migration executed on every build command. The project required independent deployment capabilities across platforms.
- **Decision:**
  1. **Frontend:** Deployed to Vercel for edge CDN performance, SSG/SSR optimization, and custom domain management.
  2. **Backend:** Configured for Hostless Cloud via `hostless.yaml` and `Dockerfile`, listening on `0.0.0.0:$PORT` with structured logging, health checks, and scheduled cron jobs.
  3. **Database:** Standardized on Neon Serverless PostgreSQL with dual connection URLs: direct for migrations and pooled (`-pooler` endpoint with PgBouncer) for runtime traffic.
  4. **API Proxying:** Maintained same-origin relative URLs (`/api/...`) via Next.js rewrites when communicating with an independent backend origin, preventing third-party cookie restrictions in NextAuth.
- **Consequences:** Eliminates vendor lock-in; enables horizontal scaling of the backend independent of Vercel serverless execution limits.

---

## ADR-002: Zero-Dependency Automated Testing Suite via `node:test`
- **Status:** Accepted
- **Context:** The repository lacked any automated unit or regression test suite, making deployments prone to runtime regressions.
- **Decision:** Adopted Node.js 20+ built-in `node:test` and `node:assert/strict`.
- **Rationale:** Requires zero third-party devDependencies, has zero compatibility issues with Next.js or React 19, executes in under 200ms, and runs consistently across Windows, Linux, and CI environments.
- **Consequences:** Immediate test execution without package management overhead.

---

## ADR-003: Safe AI Action Proposals Architecture
- **Status:** Accepted
- **Context:** The AI Assistant provides optimizations across workouts, tasks, learning topics, and content schedules. Direct AI mutation of user data introduces risk of accidental data corruption or hallucinated changes.
- **Decision:** Implemented the `AiActionProposal` entity (`status: pending | approved | rejected | applied`). The AI generates structured proposals detailing before/after state, reason, and confidence. The backend and client UI require explicit human confirmation before the proposal executor applies mutations.
- **Consequences:** Safeguards user data while delivering intelligent AI automation.

---

## ADR-004: Strict Admin Gating & Removal of Hardcoded Fallback Secrets
- **Status:** Accepted
- **Context:** NextAuth and middleware previously used an insecure fallback secret `'sre-platform-insecure-secret-please-set-nextauth-secret-env'` when `process.env.NEXTAUTH_SECRET` was undefined. Additionally, `POST /api/xp/award` omitted admin check enforcement.
- **Decision:**
  1. Enforce strict `NEXTAUTH_SECRET` configuration in production; fail fast if missing.
  2. Require verified admin roles via `requireAdmin()` on both `POST /api/xp/award` and `POST /api/achievements/sync`.
  3. Return JSON 403 on `/api/admin/*` instead of page redirects.
- **Consequences:** Eliminates token forgery and privilege escalation risks.

---

## ADR-005: 5-Tier Fallback Strategy for AI Chat and Estimations
- **Status:** Accepted
- **Context:** AI features relied on a single provider, resulting in frequent UI hangs during upstream outages.
- **Decision:** Created a 5-tier fallback cascade in `src/lib/ai-provider.ts`:
  1. Tier 1: Google Gemini 2.0 Flash (high speed, generous context)
  2. Tier 2: OpenAI GPT-4o-mini
  3. Tier 3: OpenRouter
  4. Tier 4: Z.ai Direct API
  5. Tier 5: Pollinations AI
  Coupled with zero-latency local lookup databases for Indian nutrition and exercise calorie burn calculations.
- **Consequences:** High availability and sub-millisecond response times for common queries.

