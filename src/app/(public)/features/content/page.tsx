import type { Metadata } from "next";
import { SITE_NAME, CANONICAL_URL } from "@/lib/site-config";
import FeatureClient from "./client";

export const metadata: Metadata = {
  title: "Content Creation Tracker — Track Blogs, Videos & Posts | SRE Track",
  description:
    "SRE Track's Content Creation Tracker helps you manage your content pipeline, track blog posts, videos, and social media from idea to published. Live status progression and XP rewards for creators.",
  keywords: [
    "content creation tracker",
    "blog tracker",
    "video tracker",
    "content pipeline",
    "content calendar",
    "creator tools",
    "content management",
    "post tracker",
    "content progress",
    "gamified content creation",
    "creator gamification",
    "SRE Track",
    "free creator tool",
  ],
  alternates: {
    canonical: `${CANONICAL_URL}/features/content`,
  },
  openGraph: {
    title: "Content Creation Tracker — Track Blogs, Videos & Posts | SRE Track",
    description:
      "Manage your content pipeline, track blogs, videos, and social posts from idea to published. Free gamified tracker for creators.",
    url: `${CANONICAL_URL}/features/content`,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Content Creation Tracker — SRE Track",
    description:
      "Track your content pipeline from idea to published. Free gamified tracker for creators.",
  },
};

export default function ContentFeaturePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${SITE_NAME} Content Creation Tracker`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "A free gamified content creation tracker that helps you manage your content pipeline, track blogs, videos, and social media posts from idea to published with live status progression and XP rewards.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Content pipeline management",
      "Blog post tracking",
      "Video production tracking",
      "Social media post tracking",
      "Live status progression",
      "Idea to published workflow",
      "XP rewards for publishing",
      "Content calendar view",
      "Creator analytics",
      "Collaboration tools",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <FeatureClient />
    </>
  );
}
