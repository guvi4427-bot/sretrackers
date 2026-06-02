import type { Metadata } from "next";
import { SITE_NAME, CANONICAL_URL } from "@/lib/site-config";
import FeatureClient from "./client";

export const metadata: Metadata = {
  title: "Productivity Tracker — Focus Sessions, Tasks & Day Planning | SRE Track",
  description:
    "SRE Track's Productivity Tracker helps you manage time with focus sessions, track tasks, plan your day, and earn XP for every productive hour. Free gamified productivity tool.",
  keywords: [
    "productivity tracker",
    "focus timer",
    "pomodoro timer",
    "task tracker",
    "day planner",
    "time management",
    "focus sessions",
    "productivity gamification",
    "task management",
    "daily planner",
    "SRE Track",
    "free productivity tool",
  ],
  alternates: {
    canonical: `${CANONICAL_URL}/features/productivity`,
  },
  openGraph: {
    title: "Productivity Tracker — Focus Sessions, Tasks & Day Planning | SRE Track",
    description:
      "Manage time with focus sessions, track tasks, plan your day, and earn XP for every productive hour. Free gamified productivity tool.",
    url: `${CANONICAL_URL}/features/productivity`,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Productivity Tracker — SRE Track",
    description:
      "Focus sessions, task tracking, day planning, and XP rewards. Free gamified productivity tool.",
  },
};

export default function ProductivityFeaturePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${SITE_NAME} Productivity Tracker`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "A free gamified productivity tracker that helps you manage time with focus sessions, track tasks, plan your day, and earn XP for every productive hour.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Focus session timer",
      "Pomodoro technique support",
      "Task management",
      "Day planning",
      "Priority system",
      "XP rewards for productivity",
      "Streak tracking",
      "Focus analytics",
      "Daily summary",
      "Custom session lengths",
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
