'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Zap, Eye, EyeOff, Globe, Lock, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { t } from '@/lib/i18n';

export default function SignupClient() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '', confirmPassword: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Username availability check state
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Debounced username check
  const checkUsername = useCallback(async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameStatus('invalid');
      return;
    }
    // Only allow alphanumeric, underscores, and hyphens
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setUsernameStatus('invalid');
      return;
    }
    setUsernameStatus('checking');
    try {
      const r = await fetch(`/api/user/check-username?username=${encodeURIComponent(username)}`);
      if (r.ok) {
        const data = await r.json();
        setUsernameStatus(data.available ? 'available' : 'taken');
      } else {
        setUsernameStatus('idle');
      }
    } catch {
      setUsernameStatus('idle');
    }
  }, []);

  // Watch username changes and debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (!form.username) {
      setUsernameStatus('idle');
      return;
    }
    if (form.username.length < 3) {
      setUsernameStatus('invalid');
      return;
    }
    setUsernameStatus('checking');
    debounceRef.current = setTimeout(() => {
      checkUsername(form.username);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form.username, checkUsername]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.username || !form.password) {
      toast.error(t('auth.fillAllFields'));
      return;
    }
    if (form.password.length < 6) {
      toast.error(t('auth.passwordTooShort'));
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error(t('auth.invalidEmail'));
      return;
    }
    if (usernameStatus === 'taken' || usernameStatus === 'invalid' || usernameStatus === 'checking') {
      toast.error('Please choose a valid and available username');
      return;
    }
    if (!agreedToTerms) {
      toast.error('You must agree to the Terms & Conditions and Community Guidelines');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, username: form.username, password: form.password, isPublic, phone: form.phone || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t('auth.somethingWentWrong'));
        return;
      }
      const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      if (result?.error) {
        toast.success(t('auth.accountCreatedSignIn'));
        router.push('/login');
        return;
      }
      toast.success(t('auth.welcomeToSRE'));
      // Clear guest flags on successful signup to prevent stale guest state
      localStorage.removeItem('sre_guest');
      document.cookie = 'sre_guest=; path=/; max-age=0';
      router.push('/onboarding');
      router.refresh();
    } catch {
      toast.error(t('auth.networkError'));
    } finally {
      setLoading(false);
    }
  }

  const usernameIcon = () => {
    switch (usernameStatus) {
      case 'checking':
        return <Loader2 size={16} className="animate-spin text-muted-foreground" />;
      case 'available':
        return <Check size={16} className="text-green-400" />;
      case 'taken':
        return <X size={16} className="text-red-400" />;
      case 'invalid':
        return <X size={16} className="text-red-400" />;
      default:
        return null;
    }
  };

  const usernameHint = () => {
    switch (usernameStatus) {
      case 'checking':
        return <p className="text-xs text-muted-foreground mt-1">Checking availability...</p>;
      case 'available':
        return <p className="text-xs text-green-400 mt-1">Username is available!</p>;
      case 'taken':
        return <p className="text-xs text-red-400 mt-1">Username is already taken</p>;
      case 'invalid':
        return <p className="text-xs text-red-400 mt-1">Username must be at least 3 characters (letters, numbers, _ and - only)</p>;
      default:
        return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="w-full max-w-md px-4">
      <div className="glass-card p-8">
        <div className="flex flex-col items-center mb-8">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="mb-4">
            <Logo size={64} />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('auth.joinSRE')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('auth.startJourney')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">{t('auth.name')} <span className="text-red-400">*</span></Label>
            <Input type="text" placeholder="John Doe" value={form.name} onChange={(e) => updateField('name', e.target.value)} className="bg-white/5 border-border text-foreground placeholder:text-muted-foreground" autoComplete="name" required />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">{t('auth.email')} <span className="text-red-400">*</span></Label>
            <Input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="bg-white/5 border-border text-foreground placeholder:text-muted-foreground" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">{t('auth.phoneOptional')} <span className="text-muted-foreground/50 text-[10px]">({t('auth.phoneAdminOnly')})</span></Label>
            <Input type="tel" placeholder="+91 9876543210" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="bg-white/5 border-border text-foreground placeholder:text-muted-foreground" autoComplete="tel" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">{t('auth.username')} <span className="text-red-400">*</span></Label>
            <div className="relative">
              <Input type="text" placeholder="cooluser42" value={form.username} onChange={(e) => updateField('username', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))} className="bg-white/5 border-border text-foreground placeholder:text-muted-foreground pr-10" autoComplete="username" required />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameIcon()}
              </div>
            </div>
            {usernameHint()}
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">{t('auth.password')} <span className="text-red-400">*</span></Label>
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} placeholder={t('auth.passwordMin')} value={form.password} onChange={(e) => updateField('password', e.target.value)} className="bg-white/5 border-border text-foreground placeholder:text-muted-foreground pr-10" autoComplete="new-password" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">{t('auth.confirmPassword')} <span className="text-red-400">*</span></Label>
            <Input type="password" placeholder={t('auth.confirmPasswordPlaceholder')} value={form.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} className="bg-white/5 border-border text-foreground placeholder:text-muted-foreground" autoComplete="new-password" required />
          </div>
          {/* Profile Visibility */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-border">
            <div className="flex items-center gap-2">
              {isPublic ? <Globe size={16} className="text-green-400" /> : <Lock size={16} className="text-amber-400" />}
              <div>
                <p className="text-sm text-foreground">Public Profile</p>
                <p className="text-[10px] text-muted-foreground">{isPublic ? 'Anyone can follow you' : 'Follow requests need approval'}</p>
              </div>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
          {/* Terms & Guidelines Agreement */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border accent-blue-600"
              required
            />
            <label htmlFor="terms" className="text-xs text-muted-foreground">
              I agree to the <Link href="/terms" className="text-blue-400 hover:underline" target="_blank">Terms &amp; Conditions</Link> and <Link href="/community-guidelines" className="text-blue-400 hover:underline" target="_blank">Community Guidelines</Link>
            </label>
          </div>
          <Button type="submit" disabled={loading || !agreedToTerms} className="w-full gradient-blue text-white font-semibold h-11 rounded-lg hover:opacity-90 transition-opacity mt-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.signup')}
          </Button>
        </form>
        <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div></div>
        <p className="text-center text-sm text-muted-foreground">
          {t('auth.hasAccount')}{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">{t('auth.signInHere')}</Link>
        </p>
      </div>
    </motion.div>
  );
}
