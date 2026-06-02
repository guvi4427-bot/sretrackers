import type { Metadata } from "next";
import { SITE_NAME, CANONICAL_URL } from "@/lib/site-config";
import FeatureClient from "./client";

export const metadata: Metadata = {
  title: "Achievements — 100+ Milestones, 4 Categories & Claimable Rewards | SRE Track",
  description:
    "SRE Track's Achievement System features 100+ unlockable milestones across 4 categories with bronze, silver, gold, and platinum tiers. Claimable rewards and XP bonuses. Free gamified achievement tracker.",
  keywords: [
    "achievement system",
    "milestone tracker",
    "achievement badges",
    "gamified achievements",
    "self-improvement milestones",
    "fitness achievements",
    "learning achievements",
    "streak achievements",
    "claimable rewards",
    "achievement tiers",
    "SRE Track",
    "free achievement tracker",
  ],
  alternates: {
    canonical: `${CANONICAL_URL}/features/achievements`,
  },
  openGraph: {
    title: "Achievements — 100+ Milestones, 4 Categories & Claimable Rewards | SRE Track",
    description:
      "100+ unlockable milestones across 4 categories with bronze, silver, gold, and platinum tiers. Claimable rewards and XP bonuses.",
    url: `${CANONICAL_URL}/features/achievements`,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Achievements — SRE Track",
    description:
      "100+ milestones, 4 categories, 4 tiers, and claimable rewards. Gamified self-improvement achievements.",
  },
};

export default function AchievementsFeaturePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${SITE_NAME} Achievement System`,
    applicationCategory: "GameApplication",
    operatingSystem: "Web",
    description:
      "A free gamified achievement system with 100+ unlockable milestones across 4 categories (fitness, learning, content, productivity) with bronze, silver, gold, and platinum tiers and claimable XP rewards.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "100+ achievements",
      "4 achievement categories",
      "Bronze, silver, gold, platinum tiers",
      "Claimable XP rewards",
      "Profile badge display",
      "Achievement notifications",
      "Hidden achievements",
      "Community achievement sharing",
      "Achievement progress tracking",
      "Seasonal limited achievements",
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
