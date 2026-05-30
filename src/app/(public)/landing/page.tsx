import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CANONICAL_URL } from '@/lib/site-config';
import LandingClient from './LandingClient';

export const metadata: Metadata = {
  title: 'Welcome to SRE Track — Your Self-Growth Journey Starts Here',
  description:
    'Join SRE Track free. Track habits, learn new skills, get fit, manage time, and grow with AI-powered tools and a supportive community.',
  alternates: { canonical: `${CANONICAL_URL}/landing` },
  openGraph: {
    title: 'Welcome to SRE Track',
    description:
      'Join SRE Track free. Track habits, learn new skills, get fit, manage time, and grow with AI-powered tools and a supportive community.',
    url: `${CANONICAL_URL}/landing`,
  },
};

export default function LandingPage() {
  return (
    <main>
      <h1 className="sr-only">SRE Track — Start, Restart, Explore | Self-Growth Platform</h1>
      <p className="sr-only">
        SRE Track is a free self-growth platform to track learning, fitness, content creation, and
        time management — with AI assistants, gamification, and a social feed. Join thousands
        building consistent habits and achieving personal growth goals.
      </p>
      <Suspense fallback={<div className="min-h-screen bg-[#0F172A]" />}>
        <LandingClient />
      </Suspense>
    </main>
  );
}
