import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, CANONICAL_URL } from '@/lib/site-config';
import RoadmapClient from './client';

const PAGE_SLUG = 'roadmap';
const PAGE_TITLE = `Product Roadmap — ${SITE_NAME}`;
const PAGE_DESCRIPTION =
  'Explore the SRE Track product roadmap — upcoming features including MentoLance mentorship, StudiCate student tools, mobile app, advanced analytics, and more. See what is next for the gamified self-growth platform.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    'SRE roadmap',
    'product roadmap',
    'upcoming features',
    'MentoLance',
    'StudiCate',
    'SRE mobile app',
    'feature requests',
    'self-growth platform roadmap',
    'gamification roadmap',
    'SRE Track future',
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

export default function RoadmapPage() {
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
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RoadmapClient />
    </>
  );
}
