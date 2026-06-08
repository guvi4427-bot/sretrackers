import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginClient from './LoginClient';
import { CANONICAL_URL } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Sign In — SRE Track',
  description: 'Sign in to your SRE Track account to continue your self-growth journey.',
  alternates: { canonical: `${CANONICAL_URL}/login` },
};

export default function LoginPage() {
  return (
    <main>
      <h1 className="sr-only">Sign In</h1>
      <p className="sr-only">Sign in to your SRE Track account to continue your self-growth journey.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <LoginClient />
      </Suspense>
    </main>
  );
}
