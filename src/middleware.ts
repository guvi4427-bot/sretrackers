import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Paths that are always public (no auth required)
const PUBLIC_PATHS = [
  "/", "/login", "/signup", "/landing", "/terms", "/privacy", "/about", "/contact",
  "/community-guidelines", "/blog", "/api/auth", "/api/health", "/_next",
  "/favicon", "/favicon-96x96.png", "/favicon.ico", "/apple-touch-icon.png",
  "/web-app-manifest-192x192.png", "/web-app-manifest-512x512.png",
  "/manifest.webmanifest", "/site.webmanifest", "/public",
  "/logo.svg", "/logo.png", "/ads.txt", "/app-ads.txt", "/robots.txt", "/sitemap.xml",
  "/llms.txt", "/og-image.png",
  "/google990ef60d3a371354.html",
];

// Known search/AI crawler user-agent substrings (lowercase match)
const CRAWLER_USER_AGENTS = [
  'googlebot', 'bingbot', 'yandexbot', 'baiduspider', 'duckduckbot',
  'slurp', 'sogou', 'exabot', 'facebot', 'facebookexternalhit',
  'twitterbot', 'linkedinbot', 'applebot', 'pingdom', 'dotbot',
  'gptbot', 'chatgpt-user', 'claudebot', 'anthropic-ai', 'perplexitybot',
  'bytespider', 'semrushbot', 'ahrefsbot', 'mj12bot', 'seznambot',
  'bot/', 'crawler', 'spider', 'crawl',
];

function isCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return CRAWLER_USER_AGENTS.some(crawler => ua.includes(crawler));
}

// Paths that guests can browse (read-only, no interaction)
const GUEST_ALLOWED_PATHS = [
  "/feed",
  "/discover",
  "/shared-topic",
  "/blog",
];

// API routes that guests can access (read-only public data)
const GUEST_ALLOWED_API_PATHS = [
  "/api/feed",
  "/api/feed/live-updates",
  "/api/discover",
  "/api/user/public",
  "/api/posts",      // GET only — POST is blocked at the API level
  "/api/learning/topic",  // GET only — for shared topic viewing
  "/api/learning/topic/", // GET specific topic by ID
  "/api/blogs",      // GET only — POST/DELETE blocked at API level
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static files
  if (
    pathname.includes("_next/static") ||
    pathname.includes("_next/image") ||
    pathname.includes("favicon") ||
    pathname.includes("logo.svg") ||
    pathname.includes("logo.png") ||
    pathname.endsWith(".txt") ||
    pathname === "/ads.txt" ||
    pathname === "/app-ads.txt" ||
    pathname.endsWith(".xml") ||
    pathname === "/google990ef60d3a371354.html" ||
    pathname.endsWith(".webmanifest") ||
    pathname.endsWith(".ico")
  ) {
    return NextResponse.next();
  }

  try {
    const secret =
      process.env.NEXTAUTH_SECRET ||
      "sre-platform-insecure-secret-please-set-nextauth-secret-env";
    const token = await getToken({ req: request, secret });

    // Check for guest mode (via cookie)
    const isGuest = request.cookies.get("sre_guest")?.value === "true";

    if (!token && !isGuest) {
      // Allow known crawlers to access guest-allowed pages for SEO/indexing
      if (isCrawler(request.headers.get('user-agent'))) {
        const isCrawlerAllowedPath =
          GUEST_ALLOWED_PATHS.some((p) => pathname.startsWith(p)) ||
          pathname.startsWith("/profile/") ||
          pathname.startsWith("/shared-topic/") ||
          pathname.startsWith("/blog/");
        if (isCrawlerAllowedPath) {
          const response = NextResponse.next();
          response.headers.set("x-guest", "true");
          return response;
        }
      }
      // Not authenticated and not a guest — redirect to intro landing page
      const landingUrl = new URL("/", request.url);
      return NextResponse.redirect(landingUrl);
    }

    if (!token && isGuest) {
      // Guest user — allow only specific paths
      const isGuestAllowedPath =
        GUEST_ALLOWED_PATHS.some((p) => pathname.startsWith(p)) ||
        pathname.startsWith("/profile/");

      const isGuestAllowedApi =
        GUEST_ALLOWED_API_PATHS.some((p) => pathname.startsWith(p)) &&
        request.method === "GET";

      // Block guest access to restricted paths
      if (!isGuestAllowedPath && !isGuestAllowedApi) {
        const landingUrl = new URL("/", request.url);
        return NextResponse.redirect(landingUrl);
      }

      // Guest accessing allowed path — inject guest header for API-level checks
      const response = NextResponse.next();
      response.headers.set("x-guest", "true");
      return response;
    }

    // Authenticated user — clear any stale guest cookie if present
    if (token && isGuest) {
      const response = NextResponse.next();
      response.cookies.set("sre_guest", "", { path: "/", maxAge: 0 });
      return response;
    }

    // Admin route guard — only admins can access /admin and /api/admin
    if (
      (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) &&
      !token?.isAdmin
    ) {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Graceful handling — allow through rather than crash
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|public|logo.svg|logo.png|manifest.webmanifest|site.webmanifest|apple-touch-icon|web-app-manifest).*)",
  ],
};
