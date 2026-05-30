import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, CANONICAL_URL } from "@/lib/site-config";
import { db } from "@/lib/db";
import { safeJsonParse } from "@/lib/utils";
import BlogDetailClient from "./client";

// Generate metadata for SEO and rich cards
export async function generateMetadata({ params }: { params: Promise<{ blogId: string }> }): Promise<Metadata> {
  try {
    const { blogId } = await params;
    
    // Try by ID first, then by slug
    let blog = await db.blog.findUnique({
      where: { id: blogId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: { select: { name: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!blog) {
      blog = await db.blog.findUnique({
        where: { slug: blogId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profile: { select: { name: true, avatarUrl: true } },
            },
          },
        },
      });
    }

    if (!blog || blog.status !== 'published') {
      return {
        title: "Blog Not Found",
        description: "This blog article could not be found.",
      };
    }

    const authorName = blog.user.profile?.name || blog.user.username;
    const excerpt = blog.excerpt || blog.content?.slice(0, 200);
    const tags = safeJsonParse<string[]>(blog.tags, []);
    const blogUrl = `${CANONICAL_URL}/blog/${blog.slug || blog.id}`;

    return {
      title: blog.title,
      description: excerpt,
      keywords: [...tags, "blog", "article", "self-growth", SITE_NAME],
      authors: [{ name: authorName, url: `${SITE_URL}/profile/${blog.user.id}` }],
      alternates: { canonical: blogUrl },
      openGraph: {
        title: blog.title,
        description: excerpt,
        url: blogUrl,
        type: "article",
        publishedTime: blog.createdAt.toISOString(),
        modifiedTime: blog.updatedAt.toISOString(),
        authors: [authorName],
        tags: tags,
        images: blog.coverImage ? [{ url: blog.coverImage, width: 1200, height: 630, alt: blog.title }] : [{ url: "/og-image.png", width: 1200, height: 630 }],
        siteName: SITE_NAME,
      },
      twitter: {
        card: "summary_large_image",
        title: blog.title,
        description: excerpt,
        images: blog.coverImage ? [blog.coverImage] : ["/og-image.png"],
        creator: "@sreplatform",
      },
    };
  } catch (error) {
    return {
      title: "Blog",
      description: `Articles from ${SITE_NAME}`,
    };
  }
}

// BlogPosting JSON-LD structured data for Google rich results
async function getBlogPostingSchema({ params }: { params: Promise<{ blogId: string }> }) {
  try {
    const { blogId } = await params;
    
    let blog = await db.blog.findUnique({
      where: { id: blogId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: { select: { name: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!blog) {
      blog = await db.blog.findUnique({
        where: { slug: blogId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profile: { select: { name: true, avatarUrl: true } },
            },
          },
        },
      });
    }

    if (!blog || blog.status !== 'published') return null;

    const authorName = blog.user.profile?.name || blog.user.username;
    const blogUrl = `${CANONICAL_URL}/blog/${blog.slug || blog.id}`;
    const tags = safeJsonParse<string[]>(blog.tags, []);

    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blog.title,
      description: blog.excerpt || blog.content?.slice(0, 200),
      image: blog.coverImage || `${SITE_URL}/og-image.png`,
      url: blogUrl,
      datePublished: blog.createdAt.toISOString(),
      dateModified: blog.updatedAt.toISOString(),
      author: {
        "@type": "Person",
        name: authorName,
        url: `${SITE_URL}/profile/${blog.user.id}`,
      },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logo.png`,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": blogUrl,
      },
      keywords: tags.join(", "),
      wordCount: blog.content?.split(/\s+/).length || 0,
      articleSection: tags[0] || "Self-Growth",
    };
  } catch {
    return null;
  }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ blogId: string }> }) {
  const schema = await getBlogPostingSchema({ params });

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <BlogDetailClient />
    </>
  );
}
