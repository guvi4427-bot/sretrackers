import type { Metadata } from "next";
import { SITE_NAME, CANONICAL_URL } from "@/lib/site-config";
import FeatureClient from "./client";

export const metadata: Metadata = {
  title: "MentoLance — Upcoming Mentorship Marketplace | SRE Track",
  description:
    "MentoLance is an upcoming feature on SRE Track — a mentorship marketplace where experienced users can guide newcomers on their self-improvement journey. Connect with mentors for fitness, learning, productivity, and more.",
  keywords: [
    "mentorship marketplace",
    "online mentorship",
    "find a mentor",
    "fitness mentor",
    "productivity coach",
    "learning mentor",
    "self-improvement mentor",
    "mentorship platform",
    "MentoLance",
    "upcoming feature",
    "SRE Track",
    "free mentorship",
  ],
  alternates: {
    canonical: `${CANONICAL_URL}/features/mentolance-future`,
  },
  openGraph: {
    title: "MentoLance — Upcoming Mentorship Marketplace | SRE Track",
    description:
      "An upcoming mentorship marketplace where experienced users guide newcomers on their self-improvement journey. Connect with mentors for fitness, learning, productivity, and more.",
    url: `${CANONICAL_URL}/features/mentolance-future`,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MentoLance — Coming Soon to SRE Track",
    description:
      "A mentorship marketplace connecting experienced self-improvers with newcomers. Coming soon.",
  },
};

export default function MentolanceFutureFeaturePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${SITE_NAME} MentoLance`,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description:
      "An upcoming mentorship marketplace on SRE Track where experienced users can guide newcomers on their self-improvement journey through fitness, learning, productivity, and content creation mentorship.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Mentor discovery",
      "Mentorship matching",
      "One-on-one guidance",
      "Group mentorship",
      "Verified mentor badges",
      "Mentorship ratings",
      "Session scheduling",
      "Progress reviews with mentor",
      "Mentor XP rewards",
      "Specialized mentorship tracks",
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
