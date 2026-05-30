/**
 * Site configuration — reads from NEXT_PUBLIC_ env vars set per Vercel project.
 *
 * pid1 → "SRE Tracker"  (sretracker.vercel.app)
 * pid2 → "SRE Track"    (sretrack.vercel.app)
 *
 * Falls back to "SRE Tracker" for local development.
 */

export const SITE_NAME: string =
  process.env.NEXT_PUBLIC_SITE_NAME || "SRE Tracker";

export const SITE_URL: string =
  process.env.NEXT_PUBLIC_SITE_URL || "https://sretracker.vercel.app";

/**
 * Canonical URL — overrides the canonical pointer for SEO cross-domain
 * canonicals.  Set NEXT_PUBLIC_CANONICAL_URL on Vercel to point this
 * site's canonical to another domain (e.g. pid1 → pid2).
 * Falls back to SITE_URL when not set.
 */
export const CANONICAL_URL: string =
  process.env.NEXT_PUBLIC_CANONICAL_URL || SITE_URL;

/** Short brand — "SRE" for both projects */
export const SITE_SHORT_NAME = "SRE";

export const SITE_TAGLINE = "Start · Restart · Explore";

export const SITE_DESCRIPTION = `${SITE_NAME} — A free gamified self-growth platform for fitness tracking, learning progression, content creation tracking, consistency systems, and a progression-focused social community. Start, Restart, and Explore your self-improvement journey with XP, achievements, and a supportive community.`;

export const SITE_CREATOR = "Gowtham";

export const SITE_KEYWORDS = [
  "SRE",
  "self-growth",
  "gamification",
  "habit tracker",
  "learning",
  "fitness",
  "productivity",
  "study tracker",
  "exercise tracker",
  "routine builder",
  "personal development",
  "gamified habits",
  "XP system",
  "achievement tracker",
  "fitness tracking",
  "learning progression",
  "content creation tracking",
  "consistency system",
  "progression social platform",
];
