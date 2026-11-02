# SEO, Search Crawler & Google AdSense Implementation Guide

_Technical Implementation Documentation · Publisher ID: `ca-pub-7745236489664493`_

---

## 1. Google AdSense Architecture

### A. Publisher Verification & Script Loading
- **Publisher Account ID:** `ca-pub-7745236489664493`
- **Head Meta Verification:**
  ```html
  <meta name="google-adsense-account" content="ca-pub-7745236489664493" />
  ```
- **Single Script Inclusion (`src/app/layout.tsx`):**
  The official AdSense client library is included exactly once in the root `<head>` with `async` and `crossOrigin="anonymous"`:
  ```html
  <script
    async
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7745236489664493"
    crossOrigin="anonymous"
  />
  ```
- **Preconnect Directives:**
  DNS and TLS preconnects are placed in `layout.tsx` for optimal ad delivery latency:
  - `https://pagead2.googlesyndication.com`
  - `https://googleads.g.doubleclick.net`
  - `https://td.doubleclick.net`
  - `https://tpc.googlesyndication.com`

### B. `ads.txt` and `app-ads.txt` Availability
- **Content:**
  ```text
  google.com, pub-7745236489664493, DIRECT, f08c47fec0942fa0
  google.com, pub-7745236489664493, RESELLER, f08c47fec0942fa0
  ```
- **Serving Mechanism:**
  Served via dedicated Next.js Route Handlers (`src/app/ads.txt/route.ts` and `src/app/app-ads.txt/route.ts`) as well as synced statically in `public/ads.txt`.
- **Response Headers:**
  - `Content-Type: text/plain; charset=utf-8`
  - `Cache-Control: public, max-age=86400, s-maxage=86400`
  - `X-Content-Type-Options: nosniff`
  - `Access-Control-Allow-Origin: *`

### C. Cookie Consent & GDPR / ePrivacy Compliance
- **Component:** `src/components/cookie-consent.tsx`
- **Behavior:**
  - On first visit, sets `(window.adsbygoogle).requestNonPersonalizedAds = 1` until explicit user consent is granted.
  - When accepted, stores consent in `localStorage` under `sre_cookie_consent` and unlocks personalized ad requests.
  - Avoids artificial impressions or auto-clicking in development by suppressing ad calls on non-production hosts.

---

## 2. Search Crawler & Indexing Implementation

### A. Dynamic & Static `robots.txt`
Both `src/app/robots.ts` and `public/robots.txt` are synchronized with granular allow/disallow directives:
- **Search Crawlers Allowed:** Googlebot, Googlebot-Image, Googlebot-News, Googlebot-Video, Mediapartners-Google, Bingbot, Applebot, YandexBot, Twitterbot, facebookexternalhit, LinkedInBot, Slackbot, Discordbot.
- **AI Crawlers Allowed:** GPTBot, ChatGPT-User, PerplexityBot, anthropic-ai, ClaudeBot, Gemini-Web-Crawler, Google-Extended, Bytespider, CCBot.
- **Protected Paths Disallowed:** `/api/`, `/private/`, `/admin`, `/api/admin`, `/api/auth`, `/settings`, `/onboarding`, `/api/seed`, `/api/cron`, `/api/ai`.
- **Sitemap Reference:** Declared at `https://sretrack.vercel.app/sitemap.xml`.

### B. XML Sitemap (`src/app/sitemap.ts`)
Generates comprehensive dynamic XML sitemaps covering:
1. Core public landing and informational pages (`/`, `/about`, `/contact`, `/terms`, `/privacy`, `/community-guidelines`, `/changelog`, `/roadmap`, `/mission`, `/vision`, `/faq`, `/help`, `/docs`).
2. 12 detailed feature pages (`/features/learning`, `/features/fitness`, `/features/content`, `/features/productivity`, `/features/ai`, `/features/gamification`, etc.).
3. 6 interactive showcase pages (`/showcase/*`).
4. All published blog articles dynamically fetched from Neon PostgreSQL (`/blog/:slug` or `/blog/:id`).

### C. Search Console Site Verification
- **Verification URL:** `/google990ef60d3a371354.html`
- **Route Handler:** `src/app/google990ef60d3a371354.html/route.ts`
- **Output:** `google-site-verification: google990ef60d3a371354.html` with `Content-Type: text/html; charset=utf-8` and HTTP 200.

### D. Structured Data (JSON-LD)
`src/app/layout.tsx` renders three schema.org structured data blocks:
1. `WebSite`: Name, alternate name, description, search action endpoint (`/discover?q={search_term_string}`).
2. `WebApplication`: Name, application category (`LifestyleApplication`), price (`0 USD`), feature list.
3. `Organization`: Name, logo, contact points.

---

## 3. Crawler Gating in Middleware
- `src/middleware.ts` detects crawlers via User-Agent headers and grants them read-only indexing access to public pages, discover feeds, shared learning topics, and blogs without requiring a session or redirecting them.
- Non-existent routes return HTTP 404 via `src/app/not-found.tsx`, eliminating soft-404 redirects.

