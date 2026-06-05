import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_URL, SITE_SHORT_NAME } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Gamified Self-Growth Platform`,
    short_name: SITE_NAME,
    description: `${SITE_NAME} — A free gamified self-growth platform for fitness tracking, learning progression, content creation tracking, consistency systems, and a progression-focused social community.`,
    start_url: SITE_URL,
    scope: SITE_URL,
    display: "standalone",
    theme_color: "#0f172a",
    background_color: "#0f172a",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["lifestyle", "health", "education", "productivity"],
    lang: "en",
  };
}
