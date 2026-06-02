import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, CANONICAL_URL } from '@/lib/site-config';
import MissionClient from './client';

const PAGE_SLUG = 'mission';
const PAGE_TITLE = `Our Mission — ${SITE_NAME}`;
const PAGE_DESCRIPTION =
  'Learn about the SRE Track mission — making self-growth accessible, gamified, and community-driven for everyone. Discover our core values, founding principles, and commitment to helping people Start, Restart, and Explore their potential.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    'SRE mission',
    'self-growth mission',
    'gamified habits mission',
    'SRE values',
    'SRE principles',
    'Start Restart Explore',
    'self-improvement platform',
    'free growth tools',
    'community-driven growth',
    'SRE Track mission',
  ],
  alternates: { canonical: `${CANONICAL_URL}/${PAGE_SLUG}` },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/${PAGE_SLUG}`,
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

export default function MissionPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/${PAGE_SLUG}`,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    about: {
      '@type': 'Organization',
      name: SITE_NAME,
      description: 'A free gamified self-growth platform dedicated to making self-improvement accessible and engaging for everyone.',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MissionClient />
    </>
  );
}
