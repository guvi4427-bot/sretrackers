import { NextResponse } from "next/server";
import { SITE_URL, CANONICAL_URL } from "@/lib/site-config";
import { db } from "@/lib/db";

/**
 * Production-ready sitemap.xml — served via route handler.
 *
 * Using a route handler instead of Next.js MetadataRoute avoids
 * Vercel's automatic Content-Disposition header on static files
 * and gives full control over response headers.
 *
 * Includes both static pages and dynamically fetched blog posts.
 */

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

async function buildSitemap(): Promise<string> {
  const now = new Date().toISOString().split("T")[0];
  const siteBase = CANONICAL_URL || SITE_URL;

  const staticEntries: SitemapEntry[] = [
    { loc: `${siteBase}/`, lastmod: now, changefreq: "daily", priority: "1.0" },
    { loc: `${siteBase}/landing`, lastmod: now, changefreq: "monthly", priority: "1.0" },
    { loc: `${siteBase}/home`, lastmod: now, changefreq: "daily", priority: "0.9" },
    { loc: `${siteBase}/feed`, lastmod: now, changefreq: "daily", priority: "0.9" },
    { loc: `${siteBase}/discover`, lastmod: now, changefreq: "daily", priority: "0.9" },
    { loc: `${siteBase}/blog`, lastmod: now, changefreq: "daily", priority: "0.9" },
    { loc: `${siteBase}/about`, lastmod: now, changefreq: "monthly", priority: "0.8" },
    { loc: `${siteBase}/contact`, lastmod: now, changefreq: "monthly", priority: "0.7" },
    { loc: `${siteBase}/leaderboard`, lastmod: now, changefreq: "daily", priority: "0.7" },
    { loc: `${siteBase}/ai-hub`, lastmod: now, changefreq: "weekly", priority: "0.7" },
    { loc: `${siteBase}/fitness`, lastmod: now, changefreq: "daily", priority: "0.6" },
    { loc: `${siteBase}/learn`, lastmod: now, changefreq: "daily", priority: "0.6" },
    { loc: `${siteBase}/content`, lastmod: now, changefreq: "daily", priority: "0.6" },
    { loc: `${siteBase}/time`, lastmod: now, changefreq: "daily", priority: "0.6" },
    { loc: `${siteBase}/terms`, lastmod: now, changefreq: "monthly", priority: "0.5" },
    { loc: `${siteBase}/privacy`, lastmod: now, changefreq: "monthly", priority: "0.5" },
    { loc: `${siteBase}/community-guidelines`, lastmod: now, changefreq: "monthly", priority: "0.5" },
  ];

  // Dynamically fetch published blog posts
  let blogEntries: SitemapEntry[] = [];
  try {
    const blogs = await db.blog.findMany({
      where: { status: "published" },
      select: {
        id: true,
        slug: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 500, // Cap to keep sitemap manageable
    });

    blogEntries = blogs.map((blog) => ({
      loc: `${siteBase}/blog/${blog.slug || blog.id}`,
      lastmod: blog.updatedAt.toISOString().split("T")[0],
      changefreq: "weekly",
      priority: "0.8",
    }));
  } catch {
    // Database not available during build — skip blog entries
  }

  const allEntries = [...staticEntries, ...blogEntries];

  const urlElements = allEntries
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
  const xml = await buildSitemap();

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
