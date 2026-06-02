import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, CANONICAL_URL } from '@/lib/site-config';
import ContentShowcaseClient from './client';

const PAGE_SLUG = 'showcase/content';
const PAGE_TITLE = `Content Creation Tracker Demo — ${SITE_NAME}`;
const PAGE_DESCRIPTION =
  'Explore the SRE Track content creation tracker demo. Manage blog posts, videos, and social media content in one pipeline — track drafts, published work, and earn XP for creating consistently.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    'content tracker',
    'content creation',
    'blog tracker',
    'video tracker',
    'content pipeline',
    'social media tracker',
    'content calendar',
    'gamified content',
    'SRE Track content',
    'creator dashboard',
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

export default function ContentShowcasePage() {
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
      featureList: 'Content tracker, blog management, video tracking, content pipeline',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContentShowcaseClient />
    </>
  );
}
