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
  // SEO public pages — fully crawlable without auth
  "/features", "/showcase", "/faq", "/help", "/docs",
  "/roadmap", "/mission", "/vision", "/changelog",
];

// Authenticated app paths that require a session (or guest mode where allowed)
const APP_PROTECTED_PREFIXES = [
  "/home", "/learn", "/fitness", "/content", "/time", "/analytics",
  "/leaderboard", "/achievements", "/ai-hub", "/bookmarks", "/my-blogs",
  "/messages", "/notifications", "/friends", "/follow-requests",
  "/settings", "/onboarding", "/feedback", "/phase",
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
  "/features",
  "/showcase",
  "/faq",
  "/help",
  "/docs",
  "/roadmap",
  "/mission",
  "/vision",
  "/changelog",
];

// API routes that guests can access (read-only public data)
const GUEST_ALLOWED_API_PATHS = [
  "/api/feed",
  "/api/feed/live-updates",
  "/api/discover",
  "/api/user/public",
  "/api/posts",           // GET only
  "/api/learning/topic",   // GET only
  "/api/blogs",           // GET only
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
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
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret && process.env.NODE_ENV === "production") {
      console.error("FATAL: NEXTAUTH_SECRET is not configured in production environment!");
    }

    const token = await getToken({
      req: request,
      secret: secret || "dev-only-secret-key-replace-in-production",
    });

    const isGuest = request.cookies.get("sre_guest")?.value === "true";

    // Admin route protection: Return JSON 403 on API, or redirect to /home on pages
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      if (!token?.isAdmin) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Forbidden — Admin privileges required" },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL("/home", request.url));
      }
      return NextResponse.next();
    }

    // Unauthenticated and not guest
    if (!token && !isGuest) {
      // Allow legitimate search crawlers to index guest-browseable pages
      if (isCrawler(request.headers.get("user-agent"))) {
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

      // API routes return 401 JSON instead of redirecting
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Unauthorized — Please sign in to access this resource" },
          { status: 401 }
        );
      }

      // If user is accessing a known protected app route, redirect to /landing
      const isKnownAppRoute =
        APP_PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
        pathname.startsWith("/admin");

      if (isKnownAppRoute) {
        return NextResponse.redirect(new URL("/landing", request.url));
      }

      // For unknown routes, let Next.js process normally so it returns 404 (prevents soft-404 redirects)
      return NextResponse.next();
    }

    // Guest user handling
    if (!token && isGuest) {
      const isGuestAllowedPath =
        GUEST_ALLOWED_PATHS.some((p) => pathname.startsWith(p)) ||
        pathname.startsWith("/profile/") ||
        pathname.startsWith("/shared-topic/");

      const isGuestAllowedApi =
        GUEST_ALLOWED_API_PATHS.some((p) => pathname.startsWith(p)) &&
        request.method === "GET";

      if (!isGuestAllowedPath && !isGuestAllowedApi) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Action requires account. Please create a free account to continue." },
            { status: 401 }
          );
        }
        return NextResponse.redirect(new URL("/landing", request.url));
      }

      const response = NextResponse.next();
      response.headers.set("x-guest", "true");
      return response;
    }

    // Authenticated user — clear any lingering guest cookie
    if (token && isGuest) {
      const response = NextResponse.next();
      response.cookies.set("sre_guest", "", { path: "/", maxAge: 0 });
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware evaluation error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|public|logo.svg|logo.png|manifest.webmanifest|site.webmanifest|apple-touch-icon|web-app-manifest).*)",
  ],
};
