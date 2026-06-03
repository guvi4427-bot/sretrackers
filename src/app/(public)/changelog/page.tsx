import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, CANONICAL_URL } from '@/lib/site-config';
import ChangelogClient from './client';

const PAGE_SLUG = 'changelog';
const PAGE_TITLE = `Changelog — ${SITE_NAME}`;
const PAGE_DESCRIPTION =
  'Follow the SRE Track changelog — every update, new feature, improvement, and bug fix. Track the evolution of the gamified self-growth platform from launch to the latest release.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    'SRE changelog',
    'release notes',
    'version history',
    'updates',
    'new features',
    'bug fixes',
    'product updates',
    'SRE Track changelog',
    'self-growth platform updates',
    'gamification updates',
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

export default function ChangelogPage() {
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
      <ChangelogClient />
    </>
  );
}
