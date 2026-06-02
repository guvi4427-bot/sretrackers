import type { Metadata } from "next";
import { SITE_NAME, CANONICAL_URL } from "@/lib/site-config";
import FeatureClient from "./client";

export const metadata: Metadata = {
  title: "Gamification — XP System, Levels, Streaks & Daily Quests | SRE Track",
  description:
    "SRE Track's gamification system features XP, levels, streaks, daily quests, and a full achievement system. Turn self-improvement into an addictive game you want to play every day. Free gamified self-growth platform.",
  keywords: [
    "gamification",
    "XP system",
    "leveling system",
    "streak tracker",
    "daily quests",
    "achievement system",
    "gamified habits",
    "gamified self-improvement",
    "habit gamification",
    "consistency system",
    "progress rewards",
    "SRE Track",
    "free gamification tool",
  ],
  alternates: {
    canonical: `${CANONICAL_URL}/features/gamification`,
  },
  openGraph: {
    title: "Gamification — XP System, Levels, Streaks & Daily Quests | SRE Track",
    description:
      "XP, levels, streaks, daily quests, and achievements. Turn self-improvement into a game. Free gamified self-growth platform.",
    url: `${CANONICAL_URL}/features/gamification`,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gamification — SRE Track",
    description:
      "XP, levels, streaks, daily quests, and achievements. Gamified self-improvement, free.",
  },
};

export default function GamificationFeaturePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${SITE_NAME} Gamification System`,
    applicationCategory: "GameApplication",
    operatingSystem: "Web",
    description:
      "A free gamification system that turns self-improvement into an addictive game with XP, levels, streaks, daily quests, and a full achievement system for fitness, learning, productivity, and content creation.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "XP earning system",
      "Level progression",
      "Streak tracking and bonuses",
      "Daily quests and challenges",
      "Achievement unlocking",
      "Milestone celebrations",
      "XP multipliers for consistency",
      "Weekly bonus rewards",
      "Leaderboard rankings",
      "Social XP sharing",
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
