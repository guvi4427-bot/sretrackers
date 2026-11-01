# SEO, Search Crawler & Google AdSense Audit

_Audit Date: 2026-11-01 · Target Domains: `sretrack.vercel.app` & `sretracker.vercel.app`_

---

## 1. Google AdSense Implementation Review

### Publisher Details:
- **Publisher ID:** `ca-pub-7745236489664493` (consistent across `layout.tsx`, `ads.txt`, `app-ads.txt`, and ad components).

### File Serving & Conflict Analysis:
- `public/ads.txt` exists:
  ```
  google.com, pub-7745236489664493, DIRECT, f08c47fec0942fa0
  google.com, pub-7745236489664493, RESELLER, f08c47fec0942fa0
  ```
- `src/app/ads.txt/route.ts` also exists and serves the exact same content with:
  - `Content-Type: text/plain; charset=utf-8`
  - `Cache-Control: public, max-age=86400, s-maxage=86400`
  - `X-Content-Type-Options: nosniff`
  - `Access-Control-Allow-Origin: *`
- **Assessment:** Next.js route handlers take precedence over public directory files. Serving via Route Handler is good practice because it prevents Vercel from applying default `Content-Disposition: attachment` headers. To avoid confusion, ensure both stay strictly in sync or rely on the route handler.

### Ad Unit Placement & Policy Compliance:
- **Component Implementations:**
  - `src/components/ad-banner.tsx`: Supports `horizontal`, `vertical`, `in-feed`, and `in-article`. Features an explicit "Ad" label (required for AdSense transparency policy). Includes `isProduction` check to prevent test impressions during development.
  - `src/components/AdUnit.tsx`: Basic responsive auto unit.
- **Placements Audited:**
  - `DiscoverClient.tsx:969` — `slot="discover_bottom"` (bottom of discover feed)
  - `FeedClient.tsx:1473` — `slot="feed_top"` (top of feed)
  - `FitnessClient.tsx:2639` — `slot="fitness_bottom"`
  - `HomeClient.tsx:196` — `slot="home_bottom"`
  - `LeaderboardClient.tsx:69` — `slot="leaderboard_bottom"`
  - `LearnClient.tsx:572` — `slot="learn_bottom"`
  - `UserProfileClient.tsx:723` — `slot="profile_bottom"`
  - `SharedTopicClient.tsx:281` — `slot="shared_topic_bottom"`
  - `blog/[blogId]/client.tsx:312` — horizontal ad at bottom of blog post
  - `blog/client.tsx:263, 349` — horizontal banner and in-article ad
- **AdSense Policy Risks:**
  1. **Placeholder Slots:** Slots such as `slot="discover_bottom"` are string placeholders rather than numeric AdSense slot IDs (`data-ad-slot="1234567890"`). In production, until real unit IDs are created in AdSense, auto ads should be used or slot IDs configured via environment variables.
  2. **Ads on App Screens:** Placing ads inside private dashboard pages (like `/home` or `/fitness`) can trigger AdSense "content behind login" warnings if crawlers cannot inspect the page. Google requires that ads be displayed on content that Google's Mediapartners crawler can crawl. Public blog pages (`/blog/*`) and public profiles are compliant; authenticated trackers should prioritize user experience and avoid aggressive ad units.

---

## 2. Search Crawler & Indexing Audit

### Robots.txt:
- **Files:** `public/robots.txt` and `src/app/robots.ts` both exist.
- `src/app/robots.ts` specifies dedicated crawl rules for `Googlebot`, `Bingbot`, `Mediapartners-Google`, `GPTBot`, `PerplexityBot`, `ClaudeBot`, etc., with `sitemap.xml` declaration.
- **Recommendation:** Keep `src/app/robots.ts` as the single dynamic source of truth.

### Sitemap (`src/app/sitemap.ts`):
- Dynamically includes:
  - 16 core marketing & legal pages
  - 12 feature showcase pages (`/features/*`)
  - 6 interactive showcase pages (`/showcase/*`)
  - All published blogs fetched dynamically from `db.blog` using slug/ID.
- Priority and change frequency properly assigned.

### Canonical URLs & OpenGraph:
- Configured centrally in `src/lib/site-config.ts` via `CANONICAL_URL` and `SITE_URL`.
- Cross-domain canonical support is supported via `NEXT_PUBLIC_CANONICAL_URL`.
- OpenGraph image generated via `src/app/opengraph-image.tsx` with fallback to `/og-image.png`.
- JSON-LD Schemas (`WebSite`, `WebApplication`, `Organization`) integrated in `src/app/layout.tsx`.

### Middleware Crawler Gating:
- `src/middleware.ts` detects Googlebot, Bingbot, and AI crawlers using User-Agent matching and permits them to access `/feed`, `/discover`, `/shared-topic/*`, `/blog/*`, and public SEO pages without authentication.
- **Soft 404 Issue:** As identified in BUG-007, unauthenticated requests to non-existent URLs are redirected to `/landing` with 307. This must be updated to return 404 so search engines drop stale URLs.

---

## 3. SEO & AdSense Implementation Requirements for Phase 4

1. Resolve the soft 404 redirect in `middleware.ts` so non-existent routes return HTTP 404.
2. Eliminate duplicate/conflicting static files (`public/robots.txt`) in favor of dynamic route handlers.
3. Keep ad banners subtle, policy-compliant, with clear "Advertisement" labels, and ensure ads are not rendered on empty or error states.
4. Ensure Google Search Console verification (`/google990ef60d3a371354.html`) continues to return HTTP 200 with `text/html`.
5. Document all SEO & AdSense settings in `docs/SEO_ADSENSE_IMPLEMENTATION.md`.

