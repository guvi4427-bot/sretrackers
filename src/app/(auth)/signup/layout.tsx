import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, CANONICAL_URL, SITE_SHORT_NAME } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Sign Up — ${SITE_SHORT_NAME} | Self-Growth Platform`,
  description: `Create a free account on ${SITE_SHORT_NAME} and start your self-improvement journey. Track learning, fitness, and content creation with XP, streaks, and achievements.`,
  alternates: { canonical: `${CANONICAL_URL}/signup` },
  openGraph: {
    title: `Sign Up — ${SITE_SHORT_NAME}`,
    description: `Create a free account and start your self-improvement journey.`,
    url: `${CANONICAL_URL}/signup`,
  },
  robots: { index: true, follow: true },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
