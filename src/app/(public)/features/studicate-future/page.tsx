import type { Metadata } from "next";
import { SITE_NAME, CANONICAL_URL } from "@/lib/site-config";
import FeatureClient from "./client";

export const metadata: Metadata = {
  title: "StudiCate — Upcoming Study Group Collaboration | SRE Track",
  description:
    "StudiCate is an upcoming feature on SRE Track — collaborative study groups where users learn together, share resources, hold each other accountable, and earn group XP. Form or join study groups for any topic.",
  keywords: [
    "study groups",
    "collaborative learning",
    "study together",
    "group study",
    "online study group",
    "study accountability",
    "learning community",
    "group learning",
    "StudiCate",
    "upcoming feature",
    "SRE Track",
    "free study groups",
  ],
  alternates: {
    canonical: `${CANONICAL_URL}/features/studicate-future`,
  },
  openGraph: {
    title: "StudiCate — Upcoming Study Group Collaboration | SRE Track",
    description:
      "Collaborative study groups where users learn together, share resources, and hold each other accountable. Coming soon to SRE Track.",
    url: `${CANONICAL_URL}/features/studicate-future`,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudiCate — Coming Soon to SRE Track",
    description:
      "Collaborative study groups for learning together. Coming soon to SRE Track.",
  },
};

export default function StudicateFutureFeaturePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${SITE_NAME} StudiCate`,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description:
      "An upcoming collaborative study group feature on SRE Track where users can form or join study groups, learn together, share resources, hold each other accountable, and earn group XP for any topic.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Study group creation",
      "Group discovery and joining",
      "Shared study sessions",
      "Resource sharing",
      "Group accountability",
      "Group XP and achievements",
      "Study schedules",
      "Topic-based groups",
      "Group chat and discussion",
      "Group progress tracking",
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
