import type { Metadata } from "next";
import { SITE_NAME, CANONICAL_URL } from "@/lib/site-config";
import FeatureClient from "./client";

export const metadata: Metadata = {
  title: "Fitness Tracker — Track Workouts, Meals & Weight | SRE Track",
  description:
    "SRE Track's Fitness Tracker helps you log workouts, track meals with AI macro estimation, monitor weight progress, and earn XP for every fitness milestone. Free gamified fitness tracking platform.",
  keywords: [
    "fitness tracker",
    "workout tracker",
    "meal logger",
    "macro tracker",
    "weight tracking",
    "AI macro estimation",
    "exercise tracker",
    "gym tracker",
    "calorie tracker",
    "fitness gamification",
    "gamified fitness",
    "SRE Track",
    "free fitness tool",
    "workout progress",
  ],
  alternates: {
    canonical: `${CANONICAL_URL}/features/fitness`,
  },
  openGraph: {
    title: "Fitness Tracker — Track Workouts, Meals & Weight | SRE Track",
    description:
      "Log workouts, track meals with AI macro estimation, monitor weight progress, and earn XP for every fitness milestone. Free gamified fitness tracker.",
    url: `${CANONICAL_URL}/features/fitness`,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fitness Tracker — SRE Track",
    description:
      "Log workouts, track meals with AI macro estimation, monitor weight, and earn XP. Free gamified fitness tracker.",
  },
};

export default function FitnessFeaturePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${SITE_NAME} Fitness Tracker`,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    description:
      "A free gamified fitness tracker that helps you log workouts, track meals with AI macro estimation, monitor weight progress, and earn XP for every fitness milestone.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Workout logging",
      "Meal tracking with AI macro estimation",
      "Weight progress monitoring",
      "Exercise library",
      "Calorie and macro tracking",
      "XP rewards for fitness activities",
      "Streak tracking for consistency",
      "Visual progress charts",
      "Custom workout routines",
      "Body measurement tracking",
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
