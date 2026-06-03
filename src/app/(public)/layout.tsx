import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import PublicLayoutClient from './PublicLayoutClient';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  let isAuthenticated = false;
  try {
    const session = await getServerSession(authOptions);
    isAuthenticated = !!session;
  } catch {}
  return <PublicLayoutClient isAuthenticated={isAuthenticated}>{children}</PublicLayoutClient>;
}
