import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, CANONICAL_URL } from "@/lib/site-config";
import { BlogPageClient } from "./client";

export const metadata: Metadata = {
  title: "Blog",
  description: `Latest articles, tips, and insights on self-growth, fitness, learning, and content creation from ${SITE_NAME}. Read expert advice on building consistent habits and tracking your progress.`,
  alternates: { canonical: `${CANONICAL_URL}/blog` },
  openGraph: {
    title: `Blog — ${SITE_NAME}`,
    description: `Latest articles, tips, and insights on self-growth, fitness, learning, and content creation from ${SITE_NAME}.`,
    url: `${CANONICAL_URL}/blog`,
    type: "website",
    siteName: SITE_NAME,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${SITE_NAME} Blog` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Blog — ${SITE_NAME}`,
    description: `Latest articles, tips, and insights on self-growth from ${SITE_NAME}.`,
  },
};

export default async function BlogPage() {
  // Fetch recent blogs server-side so crawlers see real content
  let recentBlogs: { id: string; slug?: string | null; title: string; excerpt?: string | null }[] = [];
  try {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXTAUTH_URL ||
      'https://sretrack.vercel.app';
    const res = await fetch(`${siteUrl}/api/blogs?limit=20&status=published`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      recentBlogs = Array.isArray(data.blogs) ? data.blogs : [];
    }
  } catch {
    // Fail silently — BlogPageClient will load content normally
  }

  return (
    <main>
      <h1 className="sr-only">
        SRE Track Blog — Articles on Self-Growth, Fitness, Learning, and Productivity
      </h1>
      <p className="sr-only">
        Read the latest articles and guides on building consistent habits, improving fitness,
        advancing your learning, and creating great content — from the SRE Track community.
      </p>
      {recentBlogs.length > 0 && (
        <nav aria-label="Recent blog posts" className="sr-only">
          <ul>
            {recentBlogs.map((blog) => (
              <li key={blog.id}>
                <a href={`/blog/${blog.slug || blog.id}`}>{blog.title}</a>
                {blog.excerpt && <p>{blog.excerpt}</p>}
              </li>
            ))}
          </ul>
        </nav>
      )}
      <BlogPageClient />
    </main>
  );
}
