import type { Metadata } from "next";
import { SITE_NAME, CANONICAL_URL, SITE_TAGLINE } from "@/lib/site-config";
import FeatureClient from "./client";

export const metadata: Metadata = {
  title: "Learning Tracker — Track Your Learning Journey | SRE Track",
  description:
    "SRE Track's Learning Tracker helps you organize topics, log study sessions, track progress with visual insights, and earn XP for every study milestone. Free gamified learning progress tracker.",
  keywords: [
    "learning tracker",
    "study tracker",
    "learning progress",
    "study planner",
    "gamified learning",
    "knowledge tracker",
    "topic tracker",
    "study session logger",
    "learning analytics",
    "self-improvement tracker",
    "SRE Track",
    "free learning tool",
  ],
  alternates: {
    canonical: `${CANONICAL_URL}/features/learning`,
  },
  openGraph: {
    title: "Learning Tracker — Track Your Learning Journey | SRE Track",
    description:
      "Organize topics, log study sessions, track progress visually, and earn XP for every milestone. The free gamified learning tracker.",
    url: `${CANONICAL_URL}/features/learning`,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Learning Tracker — SRE Track",
    description:
      "Organize topics, log study sessions, track progress visually, and earn XP for every milestone. Free gamified learning tracker.",
  },
};

export default function LearningFeaturePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${SITE_NAME} Learning Tracker`,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description:
      "A free gamified learning tracker that helps you organize study topics, log sessions, visualize progress, and earn XP for every milestone.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Topic organization",
      "Study session logging",
      "Progress visualization",
      "XP rewards for learning",
      "Bookmark topics",
      "Share learning progress",
      "Streak tracking",
      "AI-powered progress checks",
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
