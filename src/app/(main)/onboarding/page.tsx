import type { Metadata } from 'next';
import { Suspense } from 'react';
import OnboardingClient from './OnboardingClient';

export const metadata: Metadata = {
  title: 'Onboarding — Set Up Your SRE Track Profile',
  description: 'Complete your profile setup and start your self-growth journey on SRE Track.',
  alternates: { canonical: 'https://sretrack.vercel.app/onboarding' },
};

export default function OnboardingPage() {
  return (
    <main>
      <h1 className="sr-only">Onboarding</h1>
      <p className="sr-only">Complete your profile setup and start your self-growth journey on SRE Track.</p>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}>
        <OnboardingClient />
      </Suspense>
    </main>
  );
}
