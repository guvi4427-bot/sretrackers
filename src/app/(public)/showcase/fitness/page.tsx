import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, CANONICAL_URL } from '@/lib/site-config';
import FitnessShowcaseClient from './client';

const PAGE_SLUG = 'showcase/fitness';
const PAGE_TITLE = `Fitness Tracker Demo — ${SITE_NAME}`;
const PAGE_DESCRIPTION =
  'Explore the SRE Track fitness tracker demo. Log workouts, track meals, monitor weight progress, and earn XP for every healthy habit — all in one gamified dashboard.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    'fitness tracker',
    'workout tracker',
    'meal tracker',
    'weight tracker',
    'exercise log',
    'nutrition tracker',
    'gamified fitness',
    'SRE Track fitness',
    'fitness dashboard',
    'health tracker',
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

export default function FitnessShowcasePage() {
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
      applicationCategory: 'HealthApplication',
      featureList: 'Fitness tracker, workout logging, meal tracking, weight progress',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FitnessShowcaseClient />
    </>
  );
}
