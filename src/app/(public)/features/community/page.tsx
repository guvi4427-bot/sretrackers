import type { Metadata } from "next";
import { SITE_NAME, CANONICAL_URL } from "@/lib/site-config";
import FeatureClient from "./client";

export const metadata: Metadata = {
  title: "Community — Social Feed, Following & Sharing | SRE Track",
  description:
    "SRE Track's Community features include a social feed, following, sharing progress, discovering others, comments, and likes. A progression-focused social platform for self-improvement. Free social growth community.",
  keywords: [
    "community platform",
    "social feed",
    "progress sharing",
    "self-improvement community",
    "fitness community",
    "learning community",
    "follow system",
    "social motivation",
    "accountability partner",
    "growth community",
    "SRE Track",
    "free social platform",
  ],
  alternates: {
    canonical: `${CANONICAL_URL}/features/community`,
  },
  openGraph: {
    title: "Community — Social Feed, Following & Sharing | SRE Track",
    description:
      "Social feed, following, sharing progress, discovering others, comments, and likes. A progression-focused social platform for self-improvement.",
    url: `${CANONICAL_URL}/features/community`,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Community — SRE Track",
    description:
      "A progression-focused social platform for self-improvement. Share progress, follow others, and grow together.",
  },
};

export default function CommunityFeaturePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${SITE_NAME} Community`,
    applicationCategory: "SocialNetworkingApplication",
    operatingSystem: "Web",
    description:
      "A free progression-focused social platform where users share self-improvement progress, follow each other, discover new journeys, and grow together through comments, likes, and community support.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Social activity feed",
      "Follow system",
      "Progress sharing",
      "Discover users and journeys",
      "Comments and likes",
      "Community challenges",
      "Accountability partnerships",
      "Profile customization",
      "Achievement showcasing",
      "Notification system",
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
