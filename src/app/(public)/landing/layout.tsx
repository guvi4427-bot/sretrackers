import type { Metadata } from 'next';
import {
  SITE_NAME,
  SITE_URL,
  CANONICAL_URL,
  SITE_SHORT_NAME,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
} from '@/lib/site-config';

export const metadata: Metadata = {
  title: `${SITE_NAME} — Free Gamified Self-Growth Platform | Track Learning, Fitness & Content`,
  description: `Start your self-improvement journey with ${SITE_SHORT_NAME} (${SITE_TAGLINE}). Track learning, fitness, and content creation with AI assistants, XP, achievements, streaks, and a supportive community. 100% free forever.`,
  keywords: [
    ...SITE_KEYWORDS,
    'free self-growth platform',
    'AI self-improvement',
    'habit tracker with XP',
    'gamified learning',
    'fitness streak tracker',
    'content creator tracker',
    'productivity gamification',
  ],
  alternates: { canonical: `${CANONICAL_URL}/landing` },
  openGraph: {
    title: `${SITE_NAME} — Free Gamified Self-Growth Platform`,
    description: `Track learning, fitness, and content creation with AI assistants, XP, achievements, and a supportive community on ${SITE_SHORT_NAME}.`,
    url: `${CANONICAL_URL}/landing`,
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${SITE_SHORT_NAME} — Start, Restart, Explore Your Self-Growth`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Free Gamified Self-Growth Platform`,
    description: `Track learning, fitness, and content creation with AI, XP, achievements & community. Free forever.`,
    images: ['/og-image.png'],
    creator: '@sreplatform',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
