import type { Metadata } from "next";
import { SITE_NAME, CANONICAL_URL } from "@/lib/site-config";
import FeatureClient from "./client";

export const metadata: Metadata = {
  title: "Progress Analytics — Charts, Insights & Weekly Summaries | SRE Track",
  description:
    "SRE Track's Progress Analytics provides visual charts, data insights, and weekly summaries across fitness, learning, content, and productivity. See your growth story in data. Free analytics for self-improvement.",
  keywords: [
    "progress analytics",
    "self-improvement analytics",
    "habit analytics",
    "fitness analytics",
    "learning analytics",
    "progress charts",
    "weekly summary",
    "growth insights",
    "data-driven self-improvement",
    "progress tracking",
    "SRE Track",
    "free analytics tool",
  ],
  alternates: {
    canonical: `${CANONICAL_URL}/features/analytics`,
  },
  openGraph: {
    title: "Progress Analytics — Charts, Insights & Weekly Summaries | SRE Track",
    description:
      "Visual charts, data insights, and weekly summaries across fitness, learning, content, and productivity. See your growth story in data.",
    url: `${CANONICAL_URL}/features/analytics`,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Progress Analytics — SRE Track",
    description:
      "Charts, insights, and weekly summaries that show your growth story. Free self-improvement analytics.",
  },
};

export default function AnalyticsFeaturePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${SITE_NAME} Progress Analytics`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    description:
      "Free progress analytics with visual charts, data insights, and weekly summaries across fitness, learning, content creation, and productivity tracking. See your self-improvement growth story in data.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Visual progress charts",
      "Weekly summary reports",
      "Cross-category insights",
      "Trend analysis",
      "Goal progress tracking",
      "Activity heatmaps",
      "Consistency scoring",
      "Comparison analytics",
      "AI-powered insights",
      "Exportable reports",
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
