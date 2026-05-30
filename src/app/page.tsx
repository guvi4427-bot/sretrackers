import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { CANONICAL_URL, SITE_NAME } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `${SITE_NAME} — Start, Restart, Explore | Self-Growth Platform`,
  description:
    'Track your learning, fitness, content creation, and time — with AI assistants, achievements, and a social community. Free forever.',
  alternates: { canonical: CANONICAL_URL },
  openGraph: {
    title: `${SITE_NAME} — Self-Growth Platform`,
    description:
      'Track your learning, fitness, content creation, and time — with AI assistants, achievements, and a social community. Free forever.',
    url: CANONICAL_URL,
  },
};

export default async function RootPage() {
  const session = await getServerSession(authOptions);
  // Authenticated users get an immediate server redirect
  if (session) redirect('/home');

  // Guest users redirect to feed
  const cookieStore = await cookies();
  const isGuest = cookieStore.get('sre_guest')?.value === 'true';
  if (isGuest) redirect('/feed');

  // Unauthenticated users redirect to the landing page
  redirect('/landing');
}
