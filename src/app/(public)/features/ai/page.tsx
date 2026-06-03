import type { Metadata } from "next";
import { SITE_NAME, CANONICAL_URL } from "@/lib/site-config";
import FeatureClient from "./client";

export const metadata: Metadata = {
  title: "AI Assistants — Smart Chatbot, Progress Checks & Macro Estimation | SRE Track",
  description:
    "SRE Track's AI Assistants help with progress checks, macro estimation, script review, and smart chatbot conversations. AI-powered self-growth companion that learns with you. Free AI tools for fitness, learning, and productivity.",
  keywords: [
    "AI assistant",
    "AI chatbot",
    "AI progress check",
    "AI macro estimation",
    "AI script review",
    "AI fitness coach",
    "AI study helper",
    "AI productivity tool",
    "smart tracker",
    "AI self-improvement",
    "gamified AI",
    "SRE Track",
    "free AI tool",
  ],
  alternates: {
    canonical: `${CANONICAL_URL}/features/ai`,
  },
  openGraph: {
    title: "AI Assistants — Smart Chatbot, Progress Checks & Macro Estimation | SRE Track",
    description:
      "AI-powered progress checks, macro estimation, script review, and smart chatbot. Free AI tools for fitness, learning, and productivity.",
    url: `${CANONICAL_URL}/features/ai`,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Assistants — SRE Track",
    description:
      "AI progress checks, macro estimation, script review, and smart chatbot. Free AI tools for self-growth.",
  },
};

export default function AIFeaturePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${SITE_NAME} AI Assistants`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    description:
      "Free AI-powered assistants that help with progress checks, macro estimation, script review, and smart chatbot conversations for fitness, learning, and productivity tracking.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "AI chatbot for self-growth guidance",
      "AI progress check for learning topics",
      "AI macro estimation for meals",
      "AI script review for content creators",
      "Personalized AI insights",
      "Context-aware AI suggestions",
      "AI-powered weekly summaries",
      "Natural language interactions",
      "AI goal setting assistance",
      "AI streak recovery advice",
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
