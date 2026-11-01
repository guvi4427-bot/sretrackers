# Feature Inventory — SRE Platform (Start · Restart · Explore)

_Generated: 2026-11-01 · Audit Baseline: commit `6782179` · Total Models: 55 · Total API Routes: 103 · Total Client Pages: 69_

This document inventories every user-facing and backend feature across the SRE Platform, capturing current implementation status, core dependencies, known bugs, genuine functionality assessment, and required modifications for multi-platform readiness.

---

## 1. Authentication & Account Management

| Feature | Route / Component | Dependencies | Status / Genuinely Functional? | Known Bugs / Flaws | Required Modifications |
|---|---|---|---|---|---|
| **Email/Password Login** | `/login`, `LoginClient.tsx`, `POST /api/auth/[...nextauth]` | NextAuth v4, `bcryptjs`, Prisma `User`, `Profile`, `AdminRole` | **YES** — Fully functional | Hardcoded fallback NextAuth secret in `auth.ts` and `middleware.ts`. | Centralize env validation; reject startup if `NEXTAUTH_SECRET` is unset. |
| **Email/Password Signup** | `/signup`, `SignupClient.tsx`, `POST /api/auth/signup` | Prisma `$transaction`, `bcryptjs`, `User`, `Profile` | **YES** — Fully functional | None critical; validates email regex, password length >= 6. | Maintain password security and constraints. |
| **Phone OTP Login** | `LoginClient.tsx`, `POST /api/auth/send-otp`, `POST /api/auth/verify-otp` | In-memory `otpStore` (`Map`), mock SMS (`console.log`) | **SIMULATED / MOCKED** — Works only on single-instance dev; logs OTP to server stdout. Non-functional on multi-instance / serverless. | In-memory OTP storage lost across serverless invocations or container restarts; plain text code output. | Document as simulated; transition to real SMS provider (Twilio/AWS SNS) or secure Redis/PostgreSQL OTP store with rate limiting. |
| **Guest Mode Browsing** | `GuestShell.tsx`, `guest-guard.tsx`, `middleware.ts` | Cookie `sre_guest=true`, localStorage | **YES** — Functional view-only browsing of feed, discover, blogs, public profiles | If unauthenticated user hits a 404 route, middleware redirects them to `/landing` or `/` instead of serving 404. | Update middleware to let legitimate 404s pass through. |
| **Onboarding Flow** | `/onboarding`, `OnboardingClient.tsx`, `POST /api/onboarding` | Prisma `Profile`, `User`, Zustand `user-store` | **YES** — Sets phases, categories, initial profile configuration | Unused expression lint warnings in `OnboardingClient.tsx:340`. | Fix lint warnings; ensure clean redirect to `/home`. |
| **User Profile Management** | `/profile`, `ProfileClient.tsx`, `GET/PATCH /api/user/profile` | Prisma `Profile`, `User` | **YES** — Fully functional | None. | Retain full profile fields and privacy toggles. |
| **Public Profiles** | `/profile/[userId]`, `UserProfileClient.tsx`, `GET /api/user/public/[userId]` | Prisma `Profile`, `User`, `Post`, `Follow` | **YES** — Fully functional | Shows follower/following counts, recent activity, and bio. | Retain responsive layouts and privacy filters. |

---

## 2. Core Self-Growth Trackers

### A. Learning Tracker
- **Routes / Components:** `/learn`, `LearnClient.tsx`, `_charts.tsx`, `/learn/entry/[entryId]`, `EntryClient.tsx`, `/shared-topic/[topicId]`, `SharedTopicClient.tsx`
- **APIs:** `GET/POST /api/learning/topic`, `GET/PATCH/DELETE /api/learning/topic/[topicId]`, `POST /api/learning/topic/bookmark`, `POST /api/learning/topic/share`, `GET/POST /api/learning/entries`, `GET/PATCH/DELETE /api/learning/entries/[entryId]`, `GET /api/learning/stats`
- **Prisma Models:** `LearningTopic`, `LearningEntry`, `LearningProgressFlag`, `TopicBookmark`
- **Status:** **GENUINELY FUNCTIONAL**
- **Details:** Full phase categorization (Start, Restart, Explore), study sessions logging, time duration tracking, progress flags, and shared community collections.
- **Modifications Required:** Add composite database indexes on `(userId, date)` for `LearningEntry` and `(userId, phase)` for `LearningTopic` to optimize query performance at scale.

### B. Fitness Tracker
- **Routes / Components:** `/fitness`, `FitnessClient.tsx`, `_charts.tsx`, `_workout-card.tsx`, `_workout-filters.tsx`, `_workout-timeline.tsx`, `_workout-tracker.tsx`
- **APIs:** `GET/PATCH /api/fitness/profile`, `GET/POST /api/fitness/food`, `GET/POST /api/fitness/workout`, `GET/POST /api/fitness/weight`, `POST /api/fitness/protein-recommendations`
- **Prisma Models:** `FitnessProfile`, `FitnessFoodLog`, `FitnessWorkoutLog`, `FitnessWeightLog`
- **Status:** **GENUINELY FUNCTIONAL**
- **Details:** Notion/Hevy-style workout logging, workout splits (Push/Pull/Legs, Upper/Lower, Full Body), macro breakdown (Protein, Carbs, Fat, Fiber, Sugar), weight progression chart, TDEE calculator, local Indian food & FSSAI milk DB.
- **Known Bugs:**
  - `_workout-timeline.tsx` has Framer Motion TypeScript ease variant errors (`error TS2322: Type string is not assignable to Easing`).
  - `FitnessFoodLog`, `FitnessWorkoutLog`, and `FitnessWeightLog` lack indexes on `(userId, date)`.
- **Modifications Required:** Fix Framer Motion animation easing types; add proper database indexing.

### C. Content Creation Tracker
- **Routes / Components:** `/content`, `ContentClient.tsx`, `_charts.tsx`
- **APIs:** `GET/POST /api/content/series`, `GET/POST /api/content/entries`
- **Prisma Models:** `ContentSeries`, `ContentEntry`
- **Status:** **GENUINELY FUNCTIONAL**
- **Details:** Pipeline status workflow (`idea` → `drafting` → `editing` → `published` → `archived`), granular live status (`not_started` → `written` → `shoot` → `edit` → `posted`), platform tagging, shooting/editing date scheduling.
- **Modifications Required:** Index `ContentEntry(userId, status)`.

### D. Time Management & Productivity
- **Routes / Components:** `/time`, `TimeClient.tsx`
- **APIs:** `GET/POST/PATCH/DELETE /api/time/tasks`, `GET/POST /api/time/day-plan`, `GET/POST/DELETE /api/time/focus`, `GET /api/time/insights`, `GET /api/time/review`
- **Prisma Models:** `TimeTask`, `FocusSession`, `DayPlan`
- **Status:** **GENUINELY FUNCTIONAL**
- **Details:** Task management with `@dnd-kit` drag-and-drop ordering, start/end time slots, Pomodoro focus session timer, Day Planner with 1-5 rating, execution-based XP.
- **Modifications Required:** Add `(userId, date)` index on `TimeTask` and `FocusSession`.

---

## 3. AI Assistance & Coaching Systems

- **Routes / Components:** `/ai-hub`, `AIHubClient.tsx`, `ai-chat-bubble.tsx`, `ai-message.tsx`, `proposal-card.tsx`
- **APIs:**
  - `POST /api/ai/chatbot`
  - `GET/POST /api/ai/conversations`, `GET/POST /api/ai/conversations/[id]`
  - `GET/POST/DELETE /api/ai/module-memory`
  - `GET/POST /api/ai/proposals`, `GET/POST /api/ai/proposals/[proposalId]`
  - `POST /api/ai/estimate-macros`
  - `POST /api/ai/estimate-burn`
  - `POST /api/ai/classify-task`
  - `POST /api/ai/rank-unproductive`
  - `POST /api/ai/rate-day`
  - `POST /api/ai/script-review`
  - `POST /api/ai/progress-check`
  - `POST /api/ai/posting-time`
- **External Providers:** 5-tier fallback chain (`Gemini` → `OpenAI` → `OpenRouter` → `Z.ai` → `Pollinations`) in `src/lib/ai-provider.ts`
- **Prisma Models:** `Conversation`, `ChatMessage`, `ModuleMemory`, `AiActionProposal`, `ChatHistory`
- **Status:** **GENUINELY FUNCTIONAL**
- **Details:**
  - Persistent module memory (preferences, frequent foods/exercises, goals, notes) per module.
  - Safe Action Proposals: AI generates structured recommendations (create, edit, delete, reorder, merge) in `pending` state; changes are only applied when the user explicitly clicks approve in UI.
  - Zero-latency local food & supplement database lookup with 3-second AI fallback.
- **Known Bugs / Flaws:**
  - `ai-provider.ts` has 30s timeout per tier; worst-case chain can reach ~150s, which will timeout on standard Vercel serverless functions (10s–60s limit).
- **Modifications Required:** Optimize tier timeouts to fail faster (e.g. 5–8s per tier) or configure long-running background tasks appropriately.

---

## 4. Gamification & Progression

- **Routes / Components:** `/achievements`, `AchievementsClient.tsx`, `/leaderboard`, `LeaderboardClient.tsx`, `achievement-badge.tsx`, `xp-bar.tsx`, `streak-badge.tsx`
- **APIs:** `GET/POST /api/achievements`, `POST /api/achievements/sync`, `POST /api/achievements/check-eligible`, `POST /api/xp/award`, `POST /api/xp/reverse`, `GET/POST /api/xp/quests`, `GET /api/leaderboard`
- **Prisma Models:** `Achievement`, `UserAchievement`, `XPGain`, `UserQuest`
- **Status:** **GENUINELY FUNCTIONAL**
- **Known Bugs / Flaws:**
  - `src/app/api/achievements/route.ts:249`: `unlockedMap.get(a.id)?.toISOString()` type error when date object is typed as `{}`.
  - `POST /api/xp/award`: Does not strictly require admin privileges; checks `const isAdmin = !('error' in adminCheck)` but proceeds to award XP even if not admin if session exists!
  - `POST /api/achievements/sync`: Unprotected public endpoint allowing any caller to re-sync/overwrite achievement definitions.
- **Modifications Required:** Fix TypeScript date error; lock down `POST /api/xp/award` and `POST /api/achievements/sync` to superadmin / authenticated internal logic.

---

## 5. Social & Community Layer

- **Routes / Components:** `/feed`, `FeedClient.tsx`, `/discover`, `DiscoverClient.tsx`, `/messages`, `MessagesClient.tsx`, `/friends`, `FriendsClient.tsx`, `/follow-requests`, `FollowRequestsClient.tsx`, `/bookmarks`, `BookmarksClient.tsx`
- **APIs:**
  - `GET/POST /api/posts`, `GET/POST /api/posts/[postId]`, `POST /api/posts/[postId]/like`, `POST /api/posts/[postId]/bookmark`, `POST /api/posts/[postId]/repost`, `GET/POST /api/posts/[postId]/comments`
  - `GET /api/feed/live-updates`, `POST /api/live-updates/[updateId]/like`, `POST /api/live-updates/[updateId]/bookmark`, `POST /api/live-updates/[updateId]/repost`, `GET/POST /api/live-updates/[updateId]/comments`
  - `POST /api/follow`, `POST /api/block`
  - `GET/POST /api/messages`, `GET/POST /api/messages/[conversationId]`
  - `GET/POST /api/groups`, `GET/PATCH/DELETE /api/groups/[groupId]`, `POST /api/groups/[groupId]/join`, `POST /api/groups/[groupId]/leave`, `GET/POST /api/groups/[groupId]/messages`
- **Prisma Models:** `Post`, `PostLike`, `PostBookmark`, `Repost`, `Comment`, `CommentLike`, `Follow`, `Block`, `Message`, `GroupChat`, `GroupChatMember`, `GroupChatMessage`, `DMConversation`, `DMMessage`, `LiveUpdateLike`, `LiveUpdateRepost`, `LiveUpdateBookmark`, `LiveUpdateComment`
- **Status:** **GENUINELY FUNCTIONAL**
- **Known Bugs / Flaws:**
  - `src/app/api/feed/live-updates/route.ts:295-298`: TypeScript error with `c._count` on type `{}`.
  - Polling intervals in `MessagesClient.tsx` (10s setInterval) without WebSocket or SSE causes periodic background traffic.
- **Modifications Required:** Fix TypeScript typing on live updates count aggregations; ensure graceful message polling.

---

## 6. Blog & Publishing System

- **Routes / Components:** `/blog`, `/blog/[blogId]`, `/my-blogs`, `MyBlogsClient.tsx`, `/admin/blogs`
- **APIs:** `GET/POST /api/blogs`, `GET/PATCH/DELETE /api/blogs/[blogId]`, `POST /api/blogs/[blogId]/like`, `POST /api/blogs/[blogId]/comment`, `POST /api/blogs/[blogId]/bookmark`, `GET /api/blogs/bookmarked`
- **Prisma Models:** `Blog`, `BlogLike`, `BlogComment`, `BlogBookmark`
- **Status:** **GENUINELY FUNCTIONAL**
- **Details:** Markdown content creation, slug & ID routing, author links, social shares, reading time calculations, and SEO meta card generation.
- **Modifications Required:** Preserve all blog slugs, relations, and comments.

---

## 7. Admin & Moderation Console

- **Routes / Components:** `/admin`, `/admin/users`, `/admin/reports`, `/admin/feedback`, `/admin/admins`, `/admin/audit-log`, `/admin/dm-monitor`
- **APIs:** `POST /api/admin/verify`, `GET/PATCH/DELETE /api/admin/users`, `GET /api/admin/dashboard`, `GET /api/admin/reports`, `GET /api/admin/feedback`, `GET/POST/DELETE /api/admin/admins`, `GET /api/admin/audit-log`, `GET /api/admin/dm`
- **Prisma Models:** `AdminRole`, `Report`, `PostReport`, `CommentReport`, `AuditLog`, `AdminNote`, `Feedback`
- **Status:** **GENUINELY FUNCTIONAL**
- **Known Bugs / Flaws:**
  - Super admin role is hardcoded to email `myselfgowtham140707@gmail.com` in `admin-auth.ts:5`.
  - Middleware redirects unauthenticated/non-admin API requests to `/api/admin/*` to `/home` with HTTP 307 instead of returning HTTP 401/403 JSON.
- **Modifications Required:** Fix middleware API response for `/api/admin/*`; allow dynamic configuration of super admin email via environment variable.

---

## 8. Inactivity Background Job

- **Route:** `GET /api/cron/learning-inactivity`
- **Trigger:** Configured in `vercel.json` (daily at `09:00 UTC`).
- **Dependencies:** `db.learningTopic`, `db.notification`
- **Status:** **GENUINELY FUNCTIONAL with Security Flaw**
- **Flaw:** If `CRON_SECRET` is not set in environment variables, `isCronCall` evaluates to true for any request providing `?secret=anything`!
- **Modifications Required:** Enforce that `CRON_SECRET` must be set and match exactly; support Hostless cron job execution.

