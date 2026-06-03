import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, CANONICAL_URL } from '@/lib/site-config';
import VisionClient from './client';

const PAGE_SLUG = 'vision';
const PAGE_TITLE = `Our Vision — ${SITE_NAME}`;
const PAGE_DESCRIPTION =
  'Discover the long-term vision for SRE Track — a world where self-growth is accessible, gamified, and community-driven. Learn about our plans for MentoLance, StudiCate, and the future of gamified self-improvement.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    'SRE vision',
    'self-growth vision',
    'gamified future',
    'MentoLance vision',
    'StudiCate vision',
    'future of self-improvement',
    'gamified learning future',
    'community-driven growth',
    'SRE Track vision',
    'self-growth platform future',
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

export default function VisionPage() {
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
      <VisionClient />
    </>
  );
}
