# Bug Tracker & Defect Log — SRE Platform

_Audit Baseline: 2026-11-01 · Discovered through compiler execution, static analysis, and code inspection._

---

## Severity Summary

| Severity | Count | Status |
|---|---|---|
| **P0 — Critical (Security / Data Integrity / Build Blocker)** | 5 | Documented, fixes planned in Phase 3 |
| **P1 — High (Functional Defect / Type Error / API Error)** | 6 | Documented, fixes planned in Phase 3 |
| **P2 — Medium (UX Flaw / Lint Warning / Missing Index)** | 8 | Documented, fixes planned in Phase 3 & 6 |
| **P3 — Low (Code Hygiene / Minor Polish)** | 4 | Documented |

---

## Detailed Bug Reports

### BUG-001 (P0): Insecure Fallback Secret in NextAuth and Middleware
- **Files:** `src/lib/auth.ts:59`, `src/middleware.ts:95`
- **Root Cause:** Both files fallback to string `'sre-platform-insecure-secret-please-set-nextauth-secret-env'` when `process.env.NEXTAUTH_SECRET` is not set.
- **Impact:** Any attacker who knows this public fallback string can sign and forge valid JWT session tokens with arbitrary user IDs, gaining unauthorized account access.
- **Fix:** In `auth.ts` and `middleware.ts`, enforce strict validation. If `NEXTAUTH_SECRET` is missing in production, throw an initialization error immediately rather than falling back to an insecure hardcoded secret.

### BUG-002 (P0): Insecure Cron Secret Bypass in Inactivity Notification Route
- **Files:** `src/app/api/cron/learning-inactivity/route.ts:20`
- **Root Cause:** `const isCronCall = !!providedSecret && (!cronSecret || providedSecret === cronSecret);`
  If `CRON_SECRET` is not configured in the host environment (`!cronSecret` is true), ANY caller passing `?secret=foo` triggers the cron job for ALL users in the database, potentially spamming thousands of notifications.
- **Impact:** Denial of Service, unauthorized execution of mass notification queries.
- **Fix:** Require `cronSecret` to be defined: `const isCronCall = Boolean(cronSecret && providedSecret === cronSecret);`.

### BUG-003 (P0): Unauthorized XP Award Vulnerability
- **Files:** `src/app/api/xp/award/route.ts:16`
- **Root Cause:** The endpoint checks `const adminCheck = await requireAdmin(); const isAdmin = !('error' in adminCheck);` but does NOT return an error if `!isAdmin`! It proceeds straight to awarding XP to the target user if `session.user.id` is valid!
- **Impact:** Any authenticated user can issue `POST /api/xp/award` and award themselves arbitrary XP and levels.
- **Fix:** Enforce `if ('error' in adminCheck) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });` or restrict it strictly to verified admin sessions.

### BUG-004 (P0): Unprotected Achievement Sync Endpoint
- **Files:** `src/app/api/achievements/sync/route.ts`
- **Root Cause:** `POST /api/achievements/sync` has no authentication check (`getUserId()` or `requireAdmin()` are omitted).
- **Impact:** Any unauthenticated caller can hammer this endpoint to trigger repeated database upserts of 100+ achievements.
- **Fix:** Guard with `requireAdmin()` or internal API secret.

### BUG-005 (P0): Next.js Build-Time Type Errors Hidden by `ignoreBuildErrors: true`
- **Files:**
  - `src/app/(main)/fitness/_workout-timeline.tsx:190, 204`
  - `src/app/(public)/landing/LandingClient.tsx:187, 228`
  - `src/app/api/achievements/route.ts:249`
  - `src/app/api/feed/live-updates/route.ts:295-298`
- **Root Cause:**
  1. In `_workout-timeline.tsx` and `LandingClient.tsx`, Framer Motion transition properties use `ease: "easeOut"` or `ease: "easeInOut"` as untyped `string` which fails `Variants` type assignment in modern Framer Motion / Motion.
  2. In `achievements/route.ts`, map lookup value is typed as `{}` instead of `Date | null`.
  3. In `live-updates/route.ts`, `c._count` is accessed on an untyped object.
- **Impact:** Prevents clean CI builds without `typescript.ignoreBuildErrors: true`.
- **Fix:** Correct the Framer Motion ease definitions (e.g. `ease: [0.16, 1, 0.3, 1]` or cast as `any`/`Easing`), properly type the achievement date map, and cast `c._count`.

### BUG-006 (P1): Middleware Redirects Non-Admin API Calls to HTML Page
- **Files:** `src/middleware.ts:150-155`
- **Root Cause:** When an unauthenticated user or non-admin calls `/api/admin/*`, the middleware executes:
  `return NextResponse.redirect(new URL("/home", request.url));`
- **Impact:** Returns HTTP 307 Redirect with HTML to API callers expecting JSON (`401 Unauthorized` or `403 Forbidden`).
- **Fix:** Check `if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });` before performing page redirects.

### BUG-007 (P1): Non-Existent Routes Redirected to `/landing` Instead of HTTP 404
- **Files:** `src/middleware.ts:117, 133`
- **Root Cause:** Any route not in `PUBLIC_PATHS` or `GUEST_ALLOWED_PATHS` redirects unauthenticated requests to `/landing`. If Googlebot or a user visits `/this-url-does-not-exist`, they receive a 307 redirect to `/landing` rather than an HTTP 404 Not Found.
- **Impact:** Violates SEO best practices (Soft 404 / 307 redirect loops on dead URLs).
- **Fix:** Allow unhandled public requests to fall through to Next.js's native `notFound()` handler.

### BUG-008 (P1): In-Memory OTP Store Lost Across Serverless Invocations
- **Files:** `src/lib/otp-store.ts`, `src/app/api/auth/send-otp/route.ts`, `src/app/api/auth/verify-otp/route.ts`
- **Root Cause:** OTP codes are stored in `const otpStore = new Map<string, { otp: string; expires: number }>()` in Node.js process memory.
- **Impact:** In multi-instance containers or serverless runtimes (Vercel/Hostless), the `verify-otp` request frequently hits a different instance than `send-otp`, resulting in "No OTP sent to this number".
- **Fix:** Document as simulated for development; implement DB/Redis-backed storage if phone login is enabled for production.

### BUG-009 (P2): Missing Database Indexes on High-Frequency Query Tables
- **Files:** `prisma/schema.prisma`
- **Root Cause:**
  - `TimeTask`: queried by `(userId, date)` heavily, but has no index.
  - `FitnessFoodLog`, `FitnessWorkoutLog`, `FitnessWeightLog`: queried by `(userId, date)` heavily, but have no composite indexes.
  - `LearningEntry`: queried by `(userId, date)` and `(topicId)`, but lacks index.
  - `DMMessage`: queried by `(conversationId, createdAt)`, missing composite index.
- **Impact:** Query latency increases linearly with user activity.
- **Fix:** Add `@@index([userId, date])`, `@@index([topicId])`, and `@@index([conversationId, createdAt])` in `prisma/schema.prisma`.

### BUG-010 (P2): Redundant Index on `Blog.slug`
- **Files:** `prisma/schema.prisma:897, 915`
- **Root Cause:** `slug String @unique` already creates an underlying unique index. `@@index([slug])` creates an unnecessary duplicate index.
- **Fix:** Remove `@@index([slug])`.

### BUG-011 (P2): Lint Rule Suppressions Hiding React Hook Errors
- **Files:** `eslint.config.mjs`
- **Root Cause:** Critical rules like `react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`, and `no-unused-vars` are turned off globally.
- **Fix:** Clean up suppressions to restore proper lint checks.
