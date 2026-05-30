import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, CANONICAL_URL, SITE_SHORT_NAME } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Log In — ${SITE_SHORT_NAME} | Self-Growth Platform`,
  description: `Sign in to ${SITE_SHORT_NAME} to track your learning, fitness, and content creation progress. Earn XP, build streaks, and join a supportive self-improvement community.`,
  alternates: { canonical: `${CANONICAL_URL}/login` },
  openGraph: {
    title: `Log In — ${SITE_SHORT_NAME}`,
    description: `Sign in to track your learning, fitness, and content creation progress.`,
    url: `${CANONICAL_URL}/login`,
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
