import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site-config";

/**
 * Production-ready sitemap.xml — served via route handler.
 *
 * Using a route handler instead of Next.js MetadataRoute avoids
 * Vercel's automatic Content-Disposition header on static files
 * and gives full control over response headers.
 *
 * Public crawlable pages:
 *   / , /home, /feed, /discover, /about, /contact,
 *   /terms, /privacy, /community-guidelines
 */

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

function buildSitemap(): string {
  const now = new Date().toISOString().split("T")[0];

  const entries: SitemapEntry[] = [
    {
      loc: `${SITE_URL}/`,
      lastmod: now,
      changefreq: "daily",
      priority: "1.0",
    },
    {
      loc: `${SITE_URL}/home`,
      lastmod: now,
      changefreq: "daily",
      priority: "1.0",
    },
    {
      loc: `${SITE_URL}/feed`,
      lastmod: now,
      changefreq: "daily",
      priority: "0.9",
    },
    {
      loc: `${SITE_URL}/discover`,
      lastmod: now,
      changefreq: "daily",
      priority: "0.9",
    },
    {
      loc: `${SITE_URL}/about`,
      lastmod: now,
      changefreq: "monthly",
      priority: "0.8",
    },
    {
      loc: `${SITE_URL}/contact`,
      lastmod: now,
      changefreq: "monthly",
      priority: "0.7",
    },
    {
      loc: `${SITE_URL}/terms`,
      lastmod: now,
      changefreq: "monthly",
      priority: "0.6",
    },
    {
      loc: `${SITE_URL}/privacy`,
      lastmod: now,
      changefreq: "monthly",
      priority: "0.6",
    },
    {
      loc: `${SITE_URL}/community-guidelines`,
      lastmod: now,
      changefreq: "monthly",
      priority: "0.5",
    },
  ];

  const urlElements = entries
    .map(
      (e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

export async function GET() {
  const xml = buildSitemap();

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
