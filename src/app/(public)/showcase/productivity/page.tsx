import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, CANONICAL_URL } from '@/lib/site-config';
import ProductivityShowcaseClient from './client';

const PAGE_SLUG = 'showcase/productivity';
const PAGE_TITLE = `Productivity & Time Management Demo — ${SITE_NAME}`;
const PAGE_DESCRIPTION =
  'Explore the SRE Track productivity demo. Manage tasks, track focus sessions, plan your day, and earn XP for staying productive — all with gamified time management tools.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    'productivity tracker',
    'time management',
    'focus timer',
    'task manager',
    'day planner',
    'pomodoro tracker',
    'focus sessions',
    'gamified productivity',
    'SRE Track productivity',
    'daily planner',
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

export default function ProductivityShowcasePage() {
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
      featureList: 'Task management, focus sessions, day planning, time tracking',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductivityShowcaseClient />
    </>
  );
}
