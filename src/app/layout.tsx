import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth-provider";
import { CookieConsent } from "@/components/cookie-consent";
import {
  SITE_NAME,
  SITE_URL,
  CANONICAL_URL,
  SITE_SHORT_NAME,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
  SITE_CREATOR,
  SITE_KEYWORDS,
} from "@/lib/site-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_URL),
  title: {
    default: `${SITE_NAME} — Start, Restart, Explore | Self-Growth Platform`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "SRE Track is a free self-growth platform to track learning, fitness, content creation, and time management — with AI assistants, gamification, and a social feed.",
  keywords: [
    'self growth', 'habit tracker', 'learning tracker', 'fitness tracker',
    'productivity', 'AI assistant', 'personal development', 'goal tracking',
  ],
  authors: [{ name: SITE_CREATOR, url: SITE_URL }],
  creator: SITE_CREATOR,
  publisher: SITE_NAME,
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: CANONICAL_URL,
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Start, Restart, Explore | Self-Growth Platform`,
    description:
      'Track learning, fitness, content, and time — with AI assistants, gamification, and a social community. 100% free forever.',
    url: CANONICAL_URL,
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${SITE_SHORT_NAME} — Self-Growth Platform`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@sretrack',
    title: `${SITE_NAME} — Start, Restart, Explore`,
    description:
      'Free self-growth platform: learning, fitness, content & time tracking with AI assistants and gamification.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  category: "self-improvement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD structured data schemas
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "Start Restart Explore",
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/discover?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Learning tracker with AI tutor",
      "Fitness tracker with macro estimation",
      "Content creation pipeline tracker",
      "Time management and focus timer",
      "Social feed and community",
      "100+ achievements and XP gamification",
      "5 specialized AI assistants",
      "Blog on self-growth topics",
    ],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon-96x96.png`,
    description: "SRE stands for Start, Restart, Explore — a self-growth platform helping users build consistent habits across learning, fitness, content, and productivity.",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${SITE_URL}/contact`,
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-7745236489664493" />
        {/* Preconnect to AdSense domains for faster ad loading */}
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://googleads.g.doubleclick.net" />
        <link rel="preconnect" href="https://td.doubleclick.net" />
        <link rel="preconnect" href="https://tpc.googlesyndication.com" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
        <meta name="application-name" content={SITE_NAME} />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7745236489664493"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>{children}</AuthProvider>
        <CookieConsent />
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
