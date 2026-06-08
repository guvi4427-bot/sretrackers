import type { Metadata } from 'next';
import { Suspense } from 'react';
import FeedbackClient from './FeedbackClient';
import { CANONICAL_URL } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Feedback — Help Improve SRE Track',
  description: 'Share your feedback and help us improve SRE Track for everyone.',
  alternates: { canonical: `${CANONICAL_URL}/feedback` },
};

export default function FeedbackPage() {
  return (
    <main>
      <h1 className="sr-only">Feedback</h1>
      <p className="sr-only">Share your feedback and help us improve SRE Track for everyone.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <FeedbackClient />
      </Suspense>
    </main>
  );
}
