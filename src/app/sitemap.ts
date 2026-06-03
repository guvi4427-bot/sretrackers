import { MetadataRoute } from "next";
import { CANONICAL_URL } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = CANONICAL_URL;
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "monthly", priority: 1.0 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/feed`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/discover`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/docs`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/help`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/changelog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/roadmap`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/mission`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/vision`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/community-guidelines`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const featureSlugs = ['learning', 'fitness', 'content', 'productivity', 'ai', 'gamification', 'community', 'analytics', 'leaderboards', 'achievements', 'mentolance-future', 'studicate-future'];
  const featurePages: MetadataRoute.Sitemap = featureSlugs.map(slug => ({ url: `${baseUrl}/features/${slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 }));

  const showcaseSlugs = ['learning', 'fitness', 'content', 'productivity', 'analytics', 'gamification'];
  const showcasePages: MetadataRoute.Sitemap = showcaseSlugs.map(slug => ({ url: `${baseUrl}/showcase/${slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 }));

  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const { db } = await import("@/lib/db");
    const blogs = await db.blog.findMany({ where: { status: 'published' }, select: { slug: true, id: true, updatedAt: true }, orderBy: { createdAt: 'desc' } });
    blogPages = blogs.map(blog => ({ url: `${baseUrl}/blog/${blog.slug || blog.id}`, lastModified: blog.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 }));
  } catch {}

  return [...staticPages, ...featurePages, ...showcasePages, ...blogPages];
}
