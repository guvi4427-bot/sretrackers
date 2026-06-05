'use client';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Camera, Tv, Mail } from 'lucide-react';
import { t } from '@/lib/i18n';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h2 className="text-lg font-bold text-white">{t('contact.title')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-6 bg-gradient-to-br from-pink-600/10 to-purple-600/10 border-pink-500/20">
          <Camera size={32} className="text-pink-400 mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">{t('contact.instagram')}</h3>
          <p className="text-xs text-white/40 mb-4">@sre_platform</p>
          <Button className="bg-gradient-to-r from-pink-600 to-purple-600 text-white w-full">{t('contact.follow')}</Button>
        </GlassCard>
        <GlassCard className="p-6 bg-gradient-to-br from-red-600/10 to-red-800/10 border-red-500/20">
          <Tv size={32} className="text-red-400 mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">{t('contact.youtube')}</h3>
          <p className="text-xs text-white/40 mb-4">S/R/E Channel</p>
          <Button className="bg-red-600 text-white w-full">{t('contact.subscribe')}</Button>
        </GlassCard>
        <GlassCard className="p-6 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border-blue-500/20">
          <Mail size={32} className="text-blue-400 mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">{t('contact.email')}</h3>
          <p className="text-xs text-white/40 mb-4">support@sre.app</p>
          <Button className="bg-blue-600 text-white w-full">{t('contact.send')}</Button>
        </GlassCard>
      </div>
      <div className="text-center mt-4"><p className="text-sm text-white/40">{t('contact.haveFeedback')} <Link href="/feedback" className="text-blue-400 hover:text-blue-300">{t('feedback.title')}</Link></p></div>
    </div>
  );
}
