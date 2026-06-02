import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, CANONICAL_URL } from '@/lib/site-config';
import AnalyticsShowcaseClient from './client';

const PAGE_SLUG = 'showcase/analytics';
const PAGE_TITLE = `Analytics Dashboard Demo — ${SITE_NAME}`;
const PAGE_DESCRIPTION =
  'Explore the SRE Track analytics dashboard demo. Visualize your progress with charts, weekly summaries, XP trends, and comprehensive self-growth metrics — all in one place.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    'analytics dashboard',
    'progress tracker',
    'weekly summary',
    'XP analytics',
    'habit analytics',
    'self-growth metrics',
    'progress charts',
    'gamified analytics',
    'SRE Track analytics',
    'growth dashboard',
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

export default function AnalyticsShowcasePage() {
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
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      applicationCategory: 'LifestyleApplication',
      featureList: 'Analytics dashboard, progress charts, weekly summaries, growth metrics',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AnalyticsShowcaseClient />
    </>
  );
}
