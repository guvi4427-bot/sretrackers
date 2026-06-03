import type { Metadata } from "next";
import { SITE_NAME, CANONICAL_URL } from "@/lib/site-config";
import FeatureClient from "./client";

export const metadata: Metadata = {
  title: "Leaderboards — Global & Friend Rankings | SRE Track",
  description:
    "SRE Track's Leaderboards feature global and friend ranking systems across XP, streaks, fitness, learning, content, and productivity. Compete and climb the ranks. Free gamified ranking system.",
  keywords: [
    "leaderboard",
    "ranking system",
    "global leaderboard",
    "friend leaderboard",
    "XP ranking",
    "streak ranking",
    "fitness leaderboard",
    "learning leaderboard",
    "competitive self-improvement",
    "gamified ranking",
    "SRE Track",
    "free leaderboard",
  ],
  alternates: {
    canonical: `${CANONICAL_URL}/features/leaderboards`,
  },
  openGraph: {
    title: "Leaderboards — Global & Friend Rankings | SRE Track",
    description:
      "Global and friend ranking systems across XP, streaks, fitness, learning, and more. Compete and climb the ranks.",
    url: `${CANONICAL_URL}/features/leaderboards`,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leaderboards — SRE Track",
    description:
      "Global and friend rankings across XP, streaks, and categories. Compete and climb.",
  },
};

export default function LeaderboardsFeaturePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${SITE_NAME} Leaderboards`,
    applicationCategory: "GameApplication",
    operatingSystem: "Web",
    description:
      "Free gamified ranking system with global and friend leaderboards across XP, streaks, fitness, learning, content creation, and productivity tracking. Compete and climb the ranks on SRE Track.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Global XP leaderboard",
      "Friend leaderboard",
      "Category-specific rankings",
      "Weekly and monthly leaderboards",
      "Streak rankings",
      "Fitness rankings",
      "Learning rankings",
      "Content creator rankings",
      "Productivity rankings",
      "Rank badges and icons",
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
