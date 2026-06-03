import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { Metadata } from 'next';
import { CANONICAL_URL, SITE_NAME } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `${SITE_NAME} — Start, Restart, Explore | Self-Growth Platform`,
  description: 'Track your learning, fitness, content creation, and time — with AI assistants, achievements, and a social community. Free forever.',
  alternates: { canonical: CANONICAL_URL },
  openGraph: {
    title: `${SITE_NAME} — Self-Growth Platform`,
    description: 'Track your learning, fitness, content creation, and time — with AI assistants, achievements, and a social community. Free forever.',
    url: CANONICAL_URL,
  },
};

export default async function RootPage() {
  const cookieStore = await cookies();
  const hasSessionCookie = cookieStore.get('next-auth.session-token') || cookieStore.get('__Secure-next-auth.session-token');
  if (!hasSessionCookie) {
    const isGuest = cookieStore.get('sre_guest')?.value === 'true';
    if (isGuest) redirect('/feed');
    redirect('/landing');
  }
  const session = await getServerSession(authOptions);
  if (session) redirect('/home');
  const isGuest = cookieStore.get('sre_guest')?.value === 'true';
  if (isGuest) redirect('/feed');
  redirect('/landing');
}
