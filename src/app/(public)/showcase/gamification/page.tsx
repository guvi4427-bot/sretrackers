import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, CANONICAL_URL } from '@/lib/site-config';
import GamificationShowcaseClient from './client';

const PAGE_SLUG = 'showcase/gamification';
const PAGE_TITLE = `Gamification System Demo — ${SITE_NAME}`;
const PAGE_DESCRIPTION =
  'Explore the SRE Track gamification demo. Earn XP, unlock achievements, build streaks, level up, and compete on leaderboards — turn your self-growth into an adventure.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    'gamification',
    'XP system',
    'achievements',
    'streaks',
    'leveling up',
    'leaderboard',
    'gamified habits',
    'self-growth gamification',
    'SRE Track gamification',
    'reward system',
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

export default function GamificationShowcasePage() {
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
      featureList: 'XP system, achievements, streaks, levels, leaderboards',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GamificationShowcaseClient />
    </>
  );
}
