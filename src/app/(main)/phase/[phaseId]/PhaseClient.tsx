'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Flame, Star, ArrowLeft, BookOpen, Dumbbell, PenTool, Clock, Edit, RotateCcw, Check, Save, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SelectPill } from '@/components/select-pill';
import { useUserStore } from '@/stores/user-store';
import { toast } from 'sonner';

const phaseConfig: Record<string, { icon: any; color: string; bg: string; label: string; description: string }> = {
  start: { icon: Zap, color: 'text-blue-400', bg: 'bg-blue-600/20', label: 'Start', description: 'Beginning your journey — building foundations and new habits' },
  restart: { icon: Flame, color: 'text-amber-400', bg: 'bg-amber-600/20', label: 'Restart', description: 'Getting back on track — refresh your routine and recommit' },
  explore: { icon: Star, color: 'text-purple-400', bg: 'bg-purple-600/20', label: 'Explore', description: 'Discovering new paths — expand your horizons' },
};

const ACTIVITIES = [
  { id: 'learning', icon: BookOpen, label: 'Learning', href: '/learn', color: 'text-blue-400' },
  { id: 'fitness', icon: Dumbbell, label: 'Fitness', href: '/fitness', color: 'text-red-400' },
  { id: 'content', icon: PenTool, label: 'Content', href: '/content', color: 'text-amber-400' },
  { id: 'time', icon: Clock, label: 'Time', href: '/time', color: 'text-purple-400' },
];

const phaseColors: Record<string, string> = { start: 'blue', restart: 'amber', explore: 'purple' };

export default function PhaseClient({ params }: { params: Promise<{ phaseId: string }> }) {
  const { phaseId } = use(params);
  const router = useRouter();
  const { profile, fetchProfile } = useUserStore();
  const [remapping, setRemapping] = useState(false);
  const [saving, setSaving] = useState(false);

  const config = phaseConfig[phaseId];
  if (!config) return <div className="text-foreground text-center py-12">Phase not found</div>;

  const Icon = config.icon;
  const phaseData = profile?.phaseActivityMap?.[phaseId];
  const currentActivities = Array.isArray(phaseData?.activities) ? phaseData.activities : [];

  // For remapping: get all phases and build a mapping of activity -> assigned phase
  const allPhases = Array.isArray(profile?.activePhases) ? profile.activePhases : [];
  const [activityMap, setActivityMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    if (profile?.phaseActivityMap) {
      for (const [phase, data] of Object.entries(profile.phaseActivityMap)) {
        const activities = Array.isArray((data as any)?.activities) ? (data as any).activities : [];
        for (const act of activities) {
          map[act] = phase;
        }
      }
    }
    return map;
  });

  function assignActivity(activityId: string, phase: string) {
    setActivityMap(prev => {
      const next = { ...prev };
      if (next[activityId] === phase) {
        delete next[activityId];
      } else {
        next[activityId] = phase;
      }
      return next;
    });
  }

  async function saveRemapping() {
    setSaving(true);
    try {
      // Build the phaseActivityMap from current activity assignments
      const richMap: Record<string, { activities: string[]; metadata: Record<string, Record<string, string>> }> = {};
      for (const phase of allPhases) {
        richMap[phase] = { activities: [], metadata: {} };
      }
      for (const [activity, phase] of Object.entries(activityMap)) {
        if (richMap[phase]) {
          richMap[phase].activities.push(activity);
        }
      }

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activePhases: allPhases,
          phaseActivityMap: richMap,
        }),
      });
      if (res.ok) {
        await fetchProfile();
        setRemapping(false);
        toast.success('Activity mapping updated!');
      } else {
        const d = await res.json();
        toast.error(d.error || 'Failed to save');
      }
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  // Get activities for this phase
  const phaseActivities = remapping
    ? Object.entries(activityMap).filter(([, p]) => p === phaseId).map(([act]) => act)
    : currentActivities;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl ${config.bg} flex items-center justify-center`}><Icon className={`w-8 h-8 ${config.color}`} /></div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{config.label}</h1>
          <p className="text-muted-foreground">{config.description}</p>
          {phaseActivities.length > 0 && <span className="text-xs text-muted-foreground/50">{phaseActivities.length} activities mapped</span>}
        </div>
      </div>

      {/* Activity Mapping Controls */}
      <GlassCard className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Activity Mapping</p>
          <p className="text-xs text-muted-foreground">{remapping ? 'Assign activities to your phases' : 'Change your activity assignments for this phase'}</p>
        </div>
        <div className="flex gap-2">
          {remapping ? (
            <>
              <Button onClick={saveRemapping} disabled={saving} size="sm" className="gradient-blue">
                {saving ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Save size={14} className="mr-1" />}
                Save
              </Button>
              <Button onClick={() => setRemapping(false)} variant="ghost" size="sm" className="text-muted-foreground">Cancel</Button>
            </>
          ) : (
            <>
              <Button onClick={() => setRemapping(true)} size="sm" variant="outline">
                <Edit size={14} className="mr-1" /> Remap Activities
              </Button>
              <Button onClick={() => router.push('/onboarding')} size="sm" className="gradient-blue">
                <RotateCcw size={14} className="mr-1" /> Full Remap
              </Button>
            </>
          )}
        </div>
      </GlassCard>

      {/* Remapping UI */}
      {remapping && (
        <GlassCard className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground mb-2">Click a phase pill to assign an activity to that phase. Click again to unassign.</p>
          {ACTIVITIES.map((activity) => {
            const ActivityIcon = activity.icon;
            const assigned = activityMap[activity.id];
            return (
              <div key={activity.id} className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 min-w-[140px]">
                  <ActivityIcon size={18} className={activity.color} />
                  <span className="text-sm font-medium text-foreground">{activity.label}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {allPhases.map(phase => {
                    const phaseDef = phaseConfig[phase];
                    return (
                      <SelectPill
                        key={phase}
                        label={phaseDef?.label || phase}
                        selected={assigned === phase}
                        onClick={() => assignActivity(activity.id, phase)}
                        color={phaseColors[phase] || 'blue'}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </GlassCard>
      )}

      {/* Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {phaseActivities.length === 0 ? (
          <GlassCard className="p-8 text-center col-span-2">
            <p className="text-muted-foreground">No activities mapped for this phase yet</p>
            <Button onClick={() => setRemapping(true)} variant="ghost" className="text-blue-400 mt-2">Map Activities</Button>
          </GlassCard>
        ) : phaseActivities.map((act: string, i: number) => {
          const actConfig = ACTIVITIES.find(a => a.id === act.toLowerCase() || a.id === act);
          const ActIcon = actConfig?.icon || Zap;
          const actColor = actConfig?.color || 'text-muted-foreground/50';
          const actHref = actConfig?.href || '/home';
          const actLabel = actConfig?.label || act;
          return (
            <motion.div key={act} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <GlassCard className="p-6 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push(actHref)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <ActIcon size={20} className={actColor} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{actLabel}</p>
                    <p className="text-xs text-muted-foreground">Tap to open</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
