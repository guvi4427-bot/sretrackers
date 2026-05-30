import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, CANONICAL_URL } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Discover',
  description: `Discover people, topics, groups, and posts on ${SITE_NAME}. Find fitness enthusiasts, learners, and content creators in the self-growth community.`,
  alternates: { canonical: `${CANONICAL_URL}/discover` },
  openGraph: {
    title: `Discover — ${SITE_NAME}`,
    description: `Find people, topics, groups, and trending content on ${SITE_NAME}, the gamified self-growth platform.`,
    url: `${CANONICAL_URL}/discover`,
  },
};

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
