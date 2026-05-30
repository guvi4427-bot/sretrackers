'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Rocket, RotateCcw, Compass, Loader2, ArrowRight, ArrowLeft, Check, X, BookOpen, Dumbbell, PenTool, Clock } from 'lucide-react';
import { SelectPill } from '@/components/select-pill';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserStore } from '@/stores/user-store';
import { t } from '@/lib/i18n';

const PHASES = [
  { id: 'start', nameKey: 'phase.start', descKey: 'phase.start.desc', icon: Rocket, color: 'blue', borderClass: 'border-blue-500/40', bgClass: 'bg-blue-600/20', textClass: 'text-blue-400', gradientClass: 'gradient-blue' },
  { id: 'restart', nameKey: 'phase.restart', descKey: 'phase.restart.desc', icon: RotateCcw, color: 'amber', borderClass: 'border-amber-500/40', bgClass: 'bg-amber-600/20', textClass: 'text-amber-400', gradientClass: 'gradient-xp' },
  { id: 'explore', nameKey: 'phase.explore', descKey: 'phase.explore.desc', icon: Compass, color: 'purple', borderClass: 'border-purple-500/40', bgClass: 'bg-purple-600/20', textClass: 'text-purple-400', gradientClass: 'gradient-rank' },
];

const ACTIVITIES = [
  { id: 'learning', nameKey: 'onboarding.activity.learning', icon: BookOpen },
  { id: 'content', nameKey: 'onboarding.activity.content', icon: PenTool },
  { id: 'fitness', nameKey: 'onboarding.activity.fitness', icon: Dumbbell },
  { id: 'time', nameKey: 'onboarding.activity.time', icon: Clock },
];

const ACTIVITY_MULTIPLIERS: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
const GOAL_MULTIPLIERS: Record<string, number> = { lose: 0.8, maintain: 1.0, gain: 1.15 };

function calcTDEE(weight: number, height: number, age: number, gender: string, activityLevel: string, goal: string): number {
  const bmr = gender === 'male' ? 10 * weight + 6.25 * height - 5 * age + 5 : 10 * weight + 6.25 * height - 5 * age - 161;
  const activityMult = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  const goalMult = GOAL_MULTIPLIERS[goal] || 1.0;
  return Math.round(bmr * activityMult * goalMult);
}

function calcMacros(tdee: number, weight: number, goal: string) {
  const proteinG = Math.round(weight * (goal === 'gain' ? 2.2 : goal === 'lose' ? 1.8 : 1.6));
  const fatG = Math.round((tdee * 0.25) / 9);
  // Fiber: 14g per 1000 calories (FDA guideline), not per 100 cal
  const fiberG = Math.round((tdee / 1000) * 14);
  const proteinCal = proteinG * 4;
  const fatCal = fatG * 9;
  const carbCal = tdee - proteinCal - fatCal;
  const carbsG = Math.max(0, Math.round(carbCal / 4));
  return { proteinG, fatG, fiberG, carbsG };
}

type Step = 1 | 2 | 3 | 4;

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, fetchProfile } = useUserStore();
  const [step, setStep] = useState<Step>(1);
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  type PhaseMap = Record<string, { activities: string[]; metadata: Record<string, Record<string, string>> }>;
  const [phaseActivityMap, setPhaseActivityMap] = useState<PhaseMap>({});
  const [activityAssignments, setActivityAssignments] = useState<Record<string, string>>({});
  const [learningTopics, setLearningTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState('');
  const [fitness, setFitness] = useState({ weight: '', height: '', age: '', gender: 'male', activityLevel: 'moderate', goal: 'maintain' });
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Sync from existing profile (remap mode) — run ONCE
  useEffect(() => {
    if (profile && !initialized) {
      setInitialized(true);
      const phases = Array.isArray(profile.activePhases) ? profile.activePhases : [];
      if (phases.length > 0) setSelectedPhases(phases);

      const pam = profile.phaseActivityMap;
      if (pam && typeof pam === 'object' && !Array.isArray(pam) && Object.keys(pam).length > 0) {
        setPhaseActivityMap(pam as PhaseMap);
        const assignments: Record<string, string> = {};
        for (const [phase, data] of Object.entries(pam)) {
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            const activities = Array.isArray((data as any)?.activities) ? (data as any).activities : [];
            for (const act of activities) {
              if (typeof act === 'string') assignments[act] = phase;
            }
          }
        }
        setActivityAssignments(assignments);
      }
    }
  }, [profile, initialized]);

  const tdee = fitness.weight && fitness.height && fitness.age
    ? calcTDEE(Number(fitness.weight), Number(fitness.height), Number(fitness.age), fitness.gender, fitness.activityLevel, fitness.goal)
    : 0;

  const macros = tdee > 0 ? calcMacros(tdee, Number(fitness.weight), fitness.goal) : null;

  const hasLearning = Object.values(activityAssignments).some(p => p === 'learning') || Object.values(phaseActivityMap).some(d => Array.isArray((d as any)?.activities) && (d as any).activities.includes('learning'));
  const hasFitness = Object.values(activityAssignments).some(p => p === 'fitness') || Object.values(phaseActivityMap).some(d => Array.isArray((d as any)?.activities) && (d as any).activities.includes('fitness'));

  function togglePhase(id: string) {
    setSelectedPhases(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    // Remove activity assignments for deselected phases
    if (selectedPhases.includes(id)) {
      setActivityAssignments(prev => {
        const next = { ...prev };
        for (const [act, phase] of Object.entries(next)) {
          if (phase === id) delete next[act];
        }
        return next;
      });
    }
  }

  function assignActivity(activityId: string, phase: string) {
    setActivityAssignments(prev => {
      const next = { ...prev };
      // If already assigned to this phase, unassign
      if (next[activityId] === phase) {
        delete next[activityId];
      } else {
        next[activityId] = phase;
      }
      return next;
    });
  }

  function addTopic() {
    const trimmed = topicInput.trim();
    if (!trimmed) return;
    const parts = trimmed.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (!learningTopics.includes(part)) {
        setLearningTopics(prev => [...prev, part]);
      }
    }
    setTopicInput('');
  }

  function removeTopic(topic: string) {
    setLearningTopics(prev => prev.filter(t => t !== topic));
  }

  function buildPhaseActivityMap(): PhaseMap {
    const richMap: PhaseMap = {};
    for (const phase of selectedPhases) {
      richMap[phase] = { activities: [], metadata: {} };
    }
    for (const [activity, phase] of Object.entries(activityAssignments)) {
      if (richMap[phase]) {
        richMap[phase].activities.push(activity);
      }
    }
    return richMap;
  }

  async function handleComplete() {
    setLoading(true);
    try {
      const richMap = buildPhaseActivityMap();

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activePhases: selectedPhases,
          phaseActivityMap: richMap,
          learningTopics: hasLearning ? learningTopics : undefined,
          fitnessProfile: hasFitness && tdee ? {
            weight: Number(fitness.weight),
            height: Number(fitness.height),
            age: Number(fitness.age),
            gender: fitness.gender,
            activityLevel: fitness.activityLevel,
            goal: fitness.goal,
            tdee,
          } : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t('common.error'));
        return;
      }
      await fetchProfile();
      toast.success(t('onboarding.completeSuccess'));
      router.push('/home');
      router.refresh();
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  function goToNextStep() {
    const richMap = buildPhaseActivityMap();
    setPhaseActivityMap(richMap);

    if (hasLearning) {
      setStep(3);
    } else if (hasFitness) {
      setStep(4);
    } else {
      handleComplete();
    }
  }

  const steps = [
    { num: 1, key: 'onboarding.phaseSelection' },
    { num: 2, key: 'onboarding.activityMapping' },
    ...(hasLearning ? [{ num: 3 as const, key: 'onboarding.learningTopics' }] : []),
    ...(hasFitness ? [{ num: 4 as const, key: 'onboarding.fitnessSetup' }] : []),
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('onboarding.title')}</h1>
        <p className="text-muted-foreground text-sm mb-6">{t('onboarding.subtitle')}</p>
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-2 ${i <= steps.findIndex(x => x.num === step) ? 'text-blue-400' : 'text-muted-foreground/60'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > s.num ? 'bg-blue-600 text-white' : step === s.num ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40' : 'bg-accent text-muted-foreground/60 border border-border'}`}>
                  {step > s.num ? <Check size={14} /> : s.num}
                </div>
                <span className="text-xs font-medium hidden sm:inline">{t(s.key)}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-px ${step > s.num ? 'bg-blue-600' : 'bg-border'}`} />}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Phase Selection */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
            <p className="text-muted-foreground text-sm mb-4">{t('onboarding.phaseSelectionDesc')}</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {PHASES.map((phase) => {
                const Icon = phase.icon;
                const selected = selectedPhases.includes(phase.id);
                return (
                  <motion.button key={phase.id} onClick={() => togglePhase(phase.id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className={`relative rounded-xl p-6 text-left transition-all duration-300 border ${selected ? `${phase.bgClass} ${phase.borderClass}` : 'bg-accent border-border hover:bg-accent/80'}`}>
                    {selected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center ${phase.gradientClass}`}><Check size={12} className="text-white" /></motion.div>}
                    <div className={`w-12 h-12 rounded-xl ${phase.gradientClass} flex items-center justify-center mb-4`}><Icon className="w-6 h-6 text-white" /></div>
                    <h3 className={`text-lg font-bold mb-1 ${phase.textClass}`}>{t(phase.nameKey)}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{t(phase.descKey)}</p>
                  </motion.button>
                );
              })}
            </div>
            <div className="flex justify-end mt-8">
              <Button onClick={() => setStep(2)} disabled={selectedPhases.length === 0} className="gradient-blue text-white font-semibold h-11 px-6 rounded-lg">
                {t('common.next')} <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Activity Mapping */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
            <p className="text-muted-foreground text-sm mb-4">{t('onboarding.activityMappingDesc')}</p>
            <div className="bg-accent backdrop-blur-xl border border-border rounded-2xl p-6 space-y-5">
              {ACTIVITIES.map((activity) => {
                const Icon = activity.icon;
                const assigned = activityAssignments[activity.id];
                return (
                  <div key={activity.id} className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 min-w-[160px]">
                      <Icon size={18} className="text-blue-400" />
                      <span className="text-sm font-medium text-foreground">{t(activity.nameKey)}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedPhases.map(phase => {
                        const phaseDef = PHASES.find(p => p.id === phase);
                        return (
                          <SelectPill
                            key={phase}
                            label={t(phaseDef?.nameKey || phase)}
                            selected={assigned === phase}
                            onClick={() => assignActivity(activity.id, phase)}
                            color={phaseDef?.color || 'blue'}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            {Object.keys(activityAssignments).length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-600/10 border border-emerald-500/20">
                <p className="text-sm text-emerald-300 font-medium mb-2">Activity Assignments:</p>
                <div className="space-y-1">
                  {Object.entries(activityAssignments).map(([act, phase]) => {
                    const phaseDef = PHASES.find(p => p.id === phase);
                    return (
                      <p key={act} className="text-xs text-muted-foreground">
                        <span className="text-foreground">{act}</span> → <span className={phaseDef?.textClass}>{t(phaseDef?.nameKey || phase)}</span>
                      </p>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex justify-between mt-8">
              <Button variant="ghost" onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground hover:bg-accent"><ArrowLeft size={18} className="mr-2" />{t('common.back')}</Button>
              <Button onClick={goToNextStep} disabled={Object.keys(activityAssignments).length === 0} className="gradient-blue text-white font-semibold h-11 px-6 rounded-lg">
                {t('common.next')} <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Learning Topics */}
        {step === 3 && hasLearning && (
          <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
            <p className="text-muted-foreground text-sm mb-4">{t('onboarding.learningTopicsDesc')}</p>
            <div className="bg-accent backdrop-blur-xl border border-border rounded-2xl p-6">
              <div className="flex gap-2 mb-4">
                <Input value={topicInput} onChange={e => setTopicInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTopic(); } }} placeholder={t('onboarding.addTopic')} className="bg-white/5 border-border text-foreground placeholder:text-muted-foreground/60" />
                <Button onClick={addTopic} className="gradient-blue shrink-0">{t('common.add')}</Button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {learningTopics.map(topic => (
                  <span key={topic} className="flex items-center gap-1 bg-blue-600/20 text-blue-300 px-3 py-1.5 rounded-full text-sm">
                    {topic}
                    <button onClick={() => removeTopic(topic)} className="text-muted-foreground/70 hover:text-foreground"><X size={14} /></button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/60">{t('onboarding.addTopicHint')}</p>
            </div>
            <div className="flex justify-between mt-8">
              <Button variant="ghost" onClick={() => setStep(2)} className="text-muted-foreground hover:text-foreground hover:bg-accent"><ArrowLeft size={18} className="mr-2" />{t('common.back')}</Button>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => { hasFitness ? setStep(4) : handleComplete(); }} className="text-muted-foreground hover:text-foreground">{t('common.skip')}</Button>
                <Button onClick={() => { hasFitness ? setStep(4) : handleComplete(); }} className="gradient-blue text-white font-semibold h-11 px-6 rounded-lg">
                  {hasFitness ? t('common.next') : t('onboarding.complete')} <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Fitness Setup */}
        {step === 4 && hasFitness && (
          <motion.div key="s4" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
            <p className="text-muted-foreground text-sm mb-4">{t('onboarding.fitnessSetupDesc')}</p>
            <div className="bg-accent backdrop-blur-xl border border-border rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-muted-foreground text-sm">{t('onboarding.weight')}</Label><Input type="number" value={fitness.weight} onChange={e => setFitness(p => ({ ...p, weight: e.target.value }))} placeholder="kg" className="bg-white/5 border-border text-foreground" /></div>
                <div className="space-y-2"><Label className="text-muted-foreground text-sm">{t('onboarding.height')}</Label><Input type="number" value={fitness.height} onChange={e => setFitness(p => ({ ...p, height: e.target.value }))} placeholder="cm" className="bg-white/5 border-border text-foreground" /></div>
                <div className="space-y-2"><Label className="text-muted-foreground text-sm">{t('onboarding.age')}</Label><Input type="number" value={fitness.age} onChange={e => setFitness(p => ({ ...p, age: e.target.value }))} className="bg-white/5 border-border text-foreground" /></div>
                <div className="space-y-2"><Label className="text-muted-foreground text-sm">{t('onboarding.gender')}</Label>
                  <select value={fitness.gender} onChange={e => setFitness(p => ({ ...p, gender: e.target.value }))} className="w-full bg-white/5 border border-border text-foreground rounded-md px-3 py-2 text-sm">
                    <option value="male" className="bg-background">{t('onboarding.gender.male')}</option>
                    <option value="female" className="bg-background">{t('onboarding.gender.female')}</option>
                    <option value="other" className="bg-background">{t('onboarding.gender.other')}</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2"><Label className="text-muted-foreground text-sm">{t('onboarding.activityLevel')}</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ACTIVITY_MULTIPLIERS).map(([key]) => (
                    <SelectPill key={key} label={t(`onboarding.activityLevel.${key}`)} selected={fitness.activityLevel === key} onClick={() => setFitness(p => ({ ...p, activityLevel: key }))} color="blue" />
                  ))}
                </div>
              </div>
              <div className="space-y-2"><Label className="text-muted-foreground text-sm">{t('onboarding.goal')}</Label>
                <div className="flex gap-2">
                  {Object.entries(GOAL_MULTIPLIERS).map(([key]) => (
                    <SelectPill key={key} label={t(`onboarding.goal.${key}`)} selected={fitness.goal === key} onClick={() => setFitness(p => ({ ...p, goal: key }))} color="blue" />
                  ))}
                </div>
              </div>
              {tdee > 0 && macros && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/20 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground text-center">{t('onboarding.tdeeEstimate')}</p>
                  <p className="text-3xl font-bold text-emerald-400 mt-1 text-center">{tdee.toLocaleString()} <span className="text-sm text-muted-foreground">cal/day</span></p>
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    <div className="text-center"><p className="text-sm font-bold text-blue-400">{macros.proteinG}g</p><p className="text-[10px] text-muted-foreground/70">Protein</p></div>
                    <div className="text-center"><p className="text-sm font-bold text-amber-400">{macros.carbsG}g</p><p className="text-[10px] text-muted-foreground/70">Carbs</p></div>
                    <div className="text-center"><p className="text-sm font-bold text-red-400">{macros.fatG}g</p><p className="text-[10px] text-muted-foreground/70">Fat</p></div>
                    <div className="text-center"><p className="text-sm font-bold text-green-400">{macros.fiberG}g</p><p className="text-[10px] text-muted-foreground/70">Fiber</p></div>
                  </div>
                </motion.div>
              )}
            </div>
            <div className="flex justify-between mt-8">
              <Button variant="ghost" onClick={() => setStep(hasLearning ? 3 : 2)} className="text-muted-foreground hover:text-foreground hover:bg-accent"><ArrowLeft size={18} className="mr-2" />{t('common.back')}</Button>
              <Button onClick={handleComplete} disabled={loading} className="gradient-blue text-white font-semibold h-11 px-6 rounded-lg">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{t('onboarding.complete')} <Check size={18} className="ml-2" /></>}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
