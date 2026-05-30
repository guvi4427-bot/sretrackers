'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Star, Send, PartyPopper, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { StarRating } from '@/components/star-rating';
import { SelectPill } from '@/components/select-pill';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { t } from '@/lib/i18n';

const STEPS = ['experience', 'module', 'specific', 'freetext'];
const MODULES = ['Learning', 'Fitness', 'Content', 'Time Management', 'Feed', 'Discover'];

export default function FeedbackPage() {
  const [step, setStep] = useState(0);
  const [rating, setRating] = useState(0);
  const [modules, setModules] = useState<string[]>([]);
  const [improvement, setImprovement] = useState('');
  const [nps, setNps] = useState(5);
  const [features, setFeatures] = useState('');
  const [bugs, setBugs] = useState('');
  const [freeText, setFreeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const r = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ overallRating: rating, modulesUsed: JSON.stringify(modules), improvementArea: improvement, recommendation: nps, desiredFeatures: features, bugs, freeText }) });
      if (r.ok) { toast.success(`+25 ${t('xp.earned')}`); setDone(true); window.dispatchEvent(new CustomEvent('xp-updated')); window.dispatchEvent(new CustomEvent('notification-updated')); }
    } catch {} finally { setLoading(false); }
  }

  if (done) return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md mx-auto text-center py-16">
      <PartyPopper size={48} className="text-amber-400 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-foreground">{t('feedback.thankYou')}</h2>
    </motion.div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-bold text-foreground">{t('feedback.title')}</h2>
      <div className="h-1 bg-accent rounded-full overflow-hidden mb-4"><motion.div className="h-full bg-blue-500 rounded-full" animate={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <AnimatePresence mode="wait">
        {step === 0 && <motion.div key="s0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}><GlassCard className="p-6"><h3 className="text-sm font-medium text-muted-foreground mb-4">{t('feedback.overallExperience')}</h3><StarRating value={rating} onChange={setRating} /><div className="mt-4"><p className="text-xs text-muted-foreground/70 mb-2">Modules used:</p><div className="flex flex-wrap gap-2">{MODULES.map(m => <SelectPill key={m} label={m} selected={modules.includes(m)} onClick={() => setModules(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m])} color="blue" />)}</div></div></GlassCard></motion.div>}
        {step === 1 && <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}><GlassCard className="p-6"><h3 className="text-sm font-medium text-muted-foreground mb-4">{t('feedback.moduleFeedback')}</h3><Textarea value={improvement} onChange={e => setImprovement(e.target.value)} placeholder="What could be improved?" className="bg-accent border-border text-foreground mb-4" /><div><p className="text-xs text-muted-foreground/70 mb-2">How likely are you to recommend S/R/E? (1-10)</p><div className="flex gap-1">{Array.from({length:10}, (_, i) => <button key={i} onClick={() => setNps(i+1)} className={`w-8 h-8 rounded text-xs font-bold ${nps === i+1 ? 'bg-blue-600 text-white' : 'bg-accent text-muted-foreground/70'}`}>{i+1}</button>)}</div></div></GlassCard></motion.div>}
        {step === 2 && <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}><GlassCard className="p-6"><h3 className="text-sm font-medium text-muted-foreground mb-4">{t('feedback.specific')}</h3><Textarea value={features} onChange={e => setFeatures(e.target.value)} placeholder="Desired features..." className="bg-accent border-border text-foreground mb-3" /><Textarea value={bugs} onChange={e => setBugs(e.target.value)} placeholder="Bugs encountered..." className="bg-accent border-border text-foreground" /></GlassCard></motion.div>}
        {step === 3 && <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}><GlassCard className="p-6"><h3 className="text-sm font-medium text-muted-foreground mb-4">{t('feedback.freeText')}</h3><Textarea value={freeText} onChange={e => setFreeText(e.target.value)} placeholder="Anything else..." className="bg-accent border-border text-foreground min-h-[150px]" /></GlassCard></motion.div>}
      </AnimatePresence>
      <div className="flex justify-between">
        <Button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} variant="ghost" className="text-muted-foreground">{t('common.back')}</Button>
        {step < 3 ? <Button onClick={() => setStep(s => s + 1)} className="gradient-blue">{t('common.next')}</Button> :
        <Button onClick={submit} disabled={loading} className="gradient-blue">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.submit')}</Button>}
      </div>
    </div>
  );
}
