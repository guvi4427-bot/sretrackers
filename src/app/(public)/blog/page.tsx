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

export default function BlogPage() {
  return <BlogPageClient />;
}
