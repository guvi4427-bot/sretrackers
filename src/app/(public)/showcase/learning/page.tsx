import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, CANONICAL_URL } from '@/lib/site-config';
import LearningClient from './client';

const PAGE_SLUG = 'showcase/learning';
const PAGE_TITLE = `Learning Tracker Demo — ${SITE_NAME}`;
const PAGE_DESCRIPTION =
  'Explore the SRE Track learning tracker. Track study topics, log entries, build streaks, and watch your knowledge grow — all with gamified XP and achievements.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    'learning tracker',
    'study tracker',
    'knowledge tracker',
    'study streaks',
    'learning progress',
    'gamified learning',
    'SRE Track learning',
    'self-growth',
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

export default function LearningShowcasePage() {
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
      featureList: 'Learning tracker, study streaks, topic management',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LearningClient />
    </>
  );
}
