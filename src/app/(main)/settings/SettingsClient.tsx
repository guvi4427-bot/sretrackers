'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Bell, Globe, Moon, Sun, LogOut, Shield, BadgeCheck, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { SelectPill } from '@/components/select-pill';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useUserStore } from '@/stores/user-store';
import { t, setLanguage, getLanguage } from '@/lib/i18n';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

export default function SettingsClient() {
  const router = useRouter();
  const { profile, fetchProfile } = useUserStore();
  const { theme, setTheme } = useTheme();
  const [lang, setLang] = useState(getLanguage());
  const [notifications, setNotifications] = useState({ streak: true, xp: true, reminders: true, leaderboard: false });
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  const [applying, setApplying] = useState(false);

  async function changeLanguage(newLang: string) {
    setLang(newLang);
    setLanguage(newLang);
    await fetch('/api/user/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language: newLang }) });
    toast.success(t('common.success'));
    window.location.reload();
  }

  async function checkEligibility() {
    setCheckingEligibility(true);
    try {
      const r = await fetch('/api/admin/verify?action=check-eligibility');
      if (r.ok) {
        const d = await r.json();
        setEligibilityResult(d);
        if (d.eligible) {
          toast.success(t('verification.eligible'));
        } else {
          toast.error(t('verification.notEligible'));
        }
      }
    } catch {}
    setCheckingEligibility(false);
  }

  async function applyForVerification() {
    setApplying(true);
    try {
      const r = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply' }),
      });
      if (r.ok) {
        const d = await r.json();
        if (d.temporaryBadge) {
          toast.success(t('verification.temporaryBadge'));
        } else {
          toast.success(t('verification.applied'));
        }
        fetchProfile();
      } else {
        const d = await r.json();
        toast.error(d.error || 'Failed to apply');
      }
    } catch {}
    setApplying(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-bold text-foreground">{t('nav.settings')}</h2>

      {/* Notifications */}
      <GlassCard className="p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2"><Bell size={16} />{t('settings.notifications')}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{t('settings.streakReminders')}</span><Switch checked={notifications.streak} onCheckedChange={v => setNotifications(p => ({ ...p, streak: v }))} /></div>
          <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{t('settings.xpNotifications')}</span><Switch checked={notifications.xp} onCheckedChange={v => setNotifications(p => ({ ...p, xp: v }))} /></div>
          <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{t('settings.leaderboardUpdates')}</span><Switch checked={notifications.leaderboard} onCheckedChange={v => setNotifications(p => ({ ...p, leaderboard: v }))} /></div>
        </div>
      </GlassCard>

      {/* Verification */}
      <GlassCard className="p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
          <BadgeCheck size={16} className="text-amber-400" />
          {t('verification.title')}
        </h3>
        <div className="space-y-3">
          {/* Current verification status */}
          <div className="flex items-center gap-2">
            {profile?.verified ? (
              <div className="flex items-center gap-2 text-blue-400">
                <BadgeCheck size={20} />
                <span className="text-sm font-medium">Verified Account</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <BadgeCheck size={20} className="opacity-30" />
                <span className="text-sm">Not verified</span>
              </div>
            )}
          </div>

          {/* Criteria list */}
          <div className="bg-accent/50 rounded-lg p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">{t('verification.criteria')}</p>
            <div className="flex items-center gap-2 text-xs">
              {(profile?.level ?? 0) >= 5 ? <CheckCircle size={14} className="text-green-400" /> : <XCircle size={14} className="text-red-400/50" />}
              <span className={(profile?.level ?? 0) >= 5 ? 'text-green-400' : 'text-muted-foreground'}>{t('verification.criteria.level')} (Current: Lv.{profile?.level || 1})</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {(profile?.followerCount || 0) >= 1500 ? <CheckCircle size={14} className="text-green-400" /> : <XCircle size={14} className="text-red-400/50" />}
              <span className={(profile?.followerCount || 0) >= 1500 ? 'text-green-400' : 'text-muted-foreground'}>{t('verification.criteria.followers')} (Current: {profile?.followerCount || 0})</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {(profile?.currentStreak || 0) >= 7 ? <CheckCircle size={14} className="text-green-400" /> : <XCircle size={14} className="text-red-400/50" />}
              <span className={(profile?.currentStreak || 0) >= 7 ? 'text-green-400' : 'text-muted-foreground'}>{t('verification.criteria.streak')} (Current: {profile?.currentStreak || 0})</span>
            </div>
          </div>

          {/* Check Eligibility Button */}
          {!profile?.verified && (
            <div className="flex gap-2">
              <Button onClick={checkEligibility} disabled={checkingEligibility} variant="outline" className="flex-1">
                {checkingEligibility ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield size={14} className="mr-2" />}
                {t('verification.checkEligibility')}
              </Button>
              {eligibilityResult?.eligible && (
                <Button onClick={applyForVerification} disabled={applying} className="gradient-gold text-gray-900 flex-1">
                  {applying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BadgeCheck size={14} className="mr-2" />}
                  {t('verification.apply')}
                </Button>
              )}
            </div>
          )}

          {eligibilityResult && !eligibilityResult.eligible && (
            <p className="text-xs text-amber-400">{t('verification.notEligible')} - Meet all criteria above to apply</p>
          )}
        </div>
      </GlassCard>

      {/* Language */}
      <GlassCard className="p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2"><Globe size={16} />{t('settings.language')}</h3>
        <div className="flex gap-3">
          <SelectPill label={t('settings.english')} selected={lang === 'en'} onClick={() => changeLanguage('en')} color="blue" />
          <SelectPill label={t('settings.tamil')} selected={lang === 'ta'} onClick={() => changeLanguage('ta')} color="blue" />
        </div>
      </GlassCard>

      {/* Theme */}
      <GlassCard className="p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">{theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}{t('settings.theme')}</h3>
        <div className="flex gap-3">
          <SelectPill label={t('settings.dark')} selected={theme === 'dark'} onClick={() => setTheme('dark')} color="blue" />
          <SelectPill label={t('settings.light')} selected={theme === 'light'} onClick={() => setTheme('light')} color="blue" />
        </div>
      </GlassCard>

      {/* Account */}
      <GlassCard className="p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2"><Shield size={16} />{t('settings.account')}</h3>
        <div className="space-y-2">
          <Button onClick={() => router.push('/follow-requests')} variant="ghost" className="text-blue-400 hover:bg-blue-600/10 w-full justify-start">
            <BadgeCheck size={16} className="mr-2" />Follow Requests
          </Button>
          <Button onClick={() => signOut({ redirect: false }).then(() => router.push('/login'))} variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-600/10 w-full justify-start">
            <LogOut size={16} className="mr-2" />{t('nav.signOut')}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
