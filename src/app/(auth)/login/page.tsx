'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Eye, Compass } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { t } from '@/lib/i18n';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t('auth.fillAllFields'));
      return;
    }
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          toast.error(t('auth.invalidCredentials'));
        } else {
          toast.error(t('auth.networkError'));
        }
        return;
      }
      toast.success(t('auth.welcomeBack'));
      // Clear guest flags on successful login to prevent stale guest state
      localStorage.removeItem('sre_guest');
      document.cookie = 'sre_guest=; path=/; max-age=0';
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      if (session?.user) {
        const isAdmin = (session.user as any).isAdmin;
        if (isAdmin) {
          router.push('/admin');
        } else {
          const profileRes = await fetch('/api/user/profile');
          if (profileRes.ok) {
            const profile = await profileRes.json();
            if (!profile.onboardingComplete) {
              router.push('/onboarding');
            } else {
              router.push('/home');
            }
          } else {
            router.push('/onboarding');
          }
        }
      }
      router.refresh();
    } catch {
      toast.error(t('auth.networkError'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGuest() {
    // Set guest cookie (expires in 24 hours)
    document.cookie = 'sre_guest=true; path=/; max-age=86400; SameSite=Lax';
    localStorage.setItem('sre_guest', 'true');
    router.push('/feed');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-md px-4"
    >
      <div className="glass-card p-8">
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-4"
          >
            <Logo size={64} />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('app.name')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('app.tagline')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground text-sm">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('auth.enterEmail')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border-border text-foreground placeholder:text-muted-foreground"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-muted-foreground text-sm">{t('auth.password')}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t('auth.enterPassword')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/5 border-border text-foreground placeholder:text-muted-foreground"
              autoComplete="current-password"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full gradient-blue text-white font-semibold h-11 rounded-lg hover:opacity-90 transition-opacity"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.login')}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <span className="relative bg-card px-3 text-xs text-muted-foreground mx-auto flex w-fit">or</span>
        </div>

        <Button
          onClick={handleGuest}
          variant="outline"
          className="w-full border-border text-foreground font-medium h-11 rounded-lg hover:bg-accent transition-colors"
        >
          <Eye size={18} className="mr-2 text-muted-foreground" /> Continue as Guest
        </Button>
        <p className="text-center text-[11px] text-muted-foreground/60 mt-2">
          Browse feed and discover. Sign in to interact.
        </p>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            {t('auth.createAccount')}
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
