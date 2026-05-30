import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, CANONICAL_URL } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Feed',
  description: `Browse the latest posts, updates, and shared progress from the ${SITE_NAME} community. See fitness achievements, learning milestones, and content creation updates.`,
  alternates: { canonical: `${CANONICAL_URL}/feed` },
  openGraph: {
    title: `Feed — ${SITE_NAME}`,
    description: `Explore community posts, fitness progress, learning achievements, and content creation updates on ${SITE_NAME}.`,
    url: `${CANONICAL_URL}/feed`,
  },
};

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
