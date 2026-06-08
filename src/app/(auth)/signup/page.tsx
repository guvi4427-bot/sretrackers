import type { Metadata } from 'next';
import { Suspense } from 'react';
import SignupClient from './SignupClient';
import { CANONICAL_URL } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Sign Up — SRE Track',
  description: 'Create a free SRE Track account and start your self-growth journey today.',
  alternates: { canonical: `${CANONICAL_URL}/signup` },
};

export default function SignupPage() {
  return (
    <main>
      <h1 className="sr-only">Sign Up</h1>
      <p className="sr-only">Create a free SRE Track account and start your self-growth journey today.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <SignupClient />
      </Suspense>
    </main>
  );
}
