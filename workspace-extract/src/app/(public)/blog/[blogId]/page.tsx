import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
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
    const blogUrl = `${SITE_URL}/blog/${blog.slug || blog.id}`;

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

export default function BlogDetailPage({ params }: { params: Promise<{ blogId: string }> }) {
  return <BlogDetailClient />;
}
