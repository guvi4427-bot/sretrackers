import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import { BlogPageClient } from "./client";

export const metadata: Metadata = {
  title: "Blog",
  description: `Latest articles, tips, and insights on self-growth, fitness, learning, and content creation from ${SITE_NAME}. Read expert advice on building consistent habits and tracking your progress.`,
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: `Blog — ${SITE_NAME}`,
    description: `Latest articles, tips, and insights on self-growth, fitness, learning, and content creation from ${SITE_NAME}.`,
    url: `${SITE_URL}/blog`,
    type: "website",
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
