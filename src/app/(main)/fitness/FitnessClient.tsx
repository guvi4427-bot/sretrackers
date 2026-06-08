'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Dumbbell, Plus, Trash2, Sparkles, Send, Bot, Loader2, Target, Flame, Utensils, Scale, Activity, Edit, Save, X, TrendingUp, ChevronLeft, ChevronDown, Video, Beef, AlertCircle, Zap } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { AIMessage } from '@/components/ai-message';
import { AdCard } from '@/components/ad-banner';
import { MacroBar } from '@/components/macro-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SelectPill } from '@/components/select-pill';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserStore } from '@/stores/user-store';
import { t } from '@/lib/i18n';
import { WorkoutChart, CalorieChart } from './_charts';

const TABS_LIST = ['overview', 'nutrition', 'workouts', 'progress', 'aiCoach'];
const ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
const GOALS = ['lose', 'maintain', 'gain'];
const WORKOUT_TYPES = ['Running', 'Walking', 'Cycling', 'Swimming', 'Weight Training', 'HIIT', 'Yoga', 'Pilates', 'Dance', 'Boxing', 'Jump Rope', 'Other'];
const SERVING_UNITS = ['g', 'ml', 'mg', 'serving', 'cup', 'tbsp', 'tsp', 'scoop', 'piece', 'slice', 'bowl', 'plate', 'glass', 'bar', 'capsule', 'tablet', 'softgel', 'gummy', 'sachet', 'oz', 'katori', 'handful', 'can'];

const WEIGHT_TYPES = ['Running', 'Walking', 'Cycling', 'Swimming', 'Weight Training',
  'HIIT', 'Yoga', 'Pilates', 'Dance', 'Boxing', 'Jump Rope', 'Other'] as const;

const MUSCLE_GROUPS = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'full_body'] as const;

const MUSCLE_GROUP_META: Record<string, { label: string; icon: string }> = {
  chest:     { label: 'Chest',      icon: '🫁' },
  back:      { label: 'Back',       icon: '🔙' },
  shoulders: { label: 'Shoulders',  icon: '🦴' },
  arms:      { label: 'Arms',       icon: '💪' },
  legs:      { label: 'Legs',       icon: '🦵' },
  core:      { label: 'Core',       icon: '⚡' },
  full_body: { label: 'Full Body',  icon: '🏋️' },
};

const WORKOUT_SPLITS = [
  { value: 'push_pull_legs', label: 'Push / Pull / Legs' },
  { value: 'upper_lower',    label: 'Upper / Lower' },
  { value: 'full_body',      label: 'Full Body' },
  { value: 'bro_split',      label: 'Bro Split' },
  { value: 'custom',         label: 'Custom' },
];

const MEAL_CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
type MealCategory = typeof MEAL_CATEGORIES[number];

const MEAL_CATEGORY_META: Record<MealCategory, { label: string; icon: string; color: string }> = {
  breakfast: { label: 'Breakfast', icon: '\u{1F305}', color: 'text-amber-400' },
  lunch:     { label: 'Lunch',     icon: '\u2600\uFE0F',  color: 'text-yellow-400' },
  dinner:    { label: 'Dinner',    icon: '\u{1F319}', color: 'text-indigo-400' },
  snack:     { label: 'Snack',     icon: '\u{1F34E}', color: 'text-green-400' },
};

const ACTIVITY_MULTIPLIERS: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
const GOAL_MULTIPLIERS: Record<string, number> = { lose: 0.8, maintain: 1.0, gain: 1.15 };

/** Get local date string YYYY-MM-DD using user's timezone (fixes UTC midnight bug) */
function getLocalDateStr(date?: Date): string {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Get the Sunday-to-Saturday calendar week dates for a given date */
function getCalendarWeekDates(forDate?: Date): string[] {
  const d = forDate || new Date();
  const dayOfWeek = d.getDay(); // 0=Sunday, 1=Monday, ... 6=Saturday
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - dayOfWeek); // go back to Sunday
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(sunday);
    dd.setDate(sunday.getDate() + i);
    dates.push(getLocalDateStr(dd));
  }
  return dates; // [Sunday, Monday, ..., Saturday]
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function calcTDEE(weight: number, height: number, age: number, gender: string, activityLevel: string): number {
  const bmr = gender === 'male' ? 10 * weight + 6.25 * height - 5 * age + 5 : 10 * weight + 6.25 * height - 5 * age - 161;
  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.2));
}

function calcRequiredCal(tdee: number, goal: string): number {
  return Math.round(tdee * (GOAL_MULTIPLIERS[goal] || 1.0));
}

function calcMacros(requiredCal: number, weight: number) {
  // Protein: 2g/kg body weight (male and female)
  const proteinG = Math.round(weight * 2);
  // Fat: (27.5% of required cal) / 9
  const fatG = Math.round((requiredCal * 0.275) / 9);
  // Carb: (55% of required cal) / 4
  const carbsG = Math.round((requiredCal * 0.55) / 4);
  // Fiber: 14g per 1000 cal intake
  const fiberG = Math.round((requiredCal / 1000) * 14);
  return { proteinG, fatG, fiberG, carbsG, calorieTarget: requiredCal };
}

export default function FitnessClient() {
  const { profile, fetchProfile: fetchUserProfile } = useUserStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [fitnessProfile, setFitnessProfile] = useState<any>(null);
  const [foodLogs, setFoodLogs] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [allWorkouts, setAllWorkouts] = useState<any[]>([]); // All workouts for chart (no date filter)
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [mealName, setMealName] = useState('');
  const [mealQuantity, setMealQuantity] = useState('1');
  const [mealUnit, setMealUnit] = useState('g');
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [weightValue, setWeightValue] = useState('');
  const [aiEstimating, setAiEstimating] = useState(false);
  const [aiBurnEstimating, setAiBurnEstimating] = useState(false);
  const [estimatedMacros, setEstimatedMacros] = useState<any>(null);
  const [estimatedBurn, setEstimatedBurn] = useState<any>(null);
  const [mealSource, setMealSource] = useState<string|null>(null);
  const [chatMessages, setChatMessages] = useState<{role:string;content:string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string|null>(null);
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ weight: '', height: '', age: '', gender: 'male', activityLevel: 'moderate', goal: 'maintain', unitSystem: 'metric' as 'metric' | 'imperial' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileReady, setProfileReady] = useState(false); // Prevents form flash before first load
  const [initialLoadDone, setInitialLoadDone] = useState(false); // True only after first fetchProfile resolves
  const [dataLoaded, setDataLoaded] = useState(false); // True after ALL initial data is fetched

  // Unit conversion helpers
  const isImperial = profileForm.unitSystem === 'imperial';
  const kgToLbs = (kg: number) => Math.round(kg * 2.20462 * 10) / 10;
  const lbsToKg = (lbs: number) => Math.round(lbs / 2.20462 * 10) / 10;
  const cmToIn = (cm: number) => Math.round(cm / 2.54 * 10) / 10;
  const inToCm = (inches: number) => Math.round(inches * 2.54 * 10) / 10;
  const displayWeight = (kg: number) => isImperial ? kgToLbs(kg) : kg;
  const displayHeight = (cm: number) => isImperial ? cmToIn(cm) : cm;
  const weightUnit = isImperial ? 'lbs' : 'kg';
  const heightUnit = isImperial ? 'in' : 'cm';
  const today = getLocalDateStr();
  const [mealCategory, setMealCategory] = useState<MealCategory>('breakfast');
  const [selectedNutritionDate, setSelectedNutritionDate] = useState(today);
  const [nutritionHistory, setNutritionHistory] = useState<Record<string, any[]>>({});
  const [expandedNutritionDays, setExpandedNutritionDays] = useState<Record<string, boolean>>({});
  const [weeklyMacroExpanded, setWeeklyMacroExpanded] = useState(false);

  // Protein Recommendations state
  const [proteinData, setProteinData] = useState<any>(null);
  const [proteinLoading, setProteinLoading] = useState(false);
  const [proteinMealExpanded, setProteinMealExpanded] = useState<Record<string, boolean>>({ breakfast: true, lunch: true, dinner: false, snack: false });
  const [proteinSafetyExpanded, setProteinSafetyExpanded] = useState(false);
  const [proteinWinsExpanded, setProteinWinsExpanded] = useState(true);
  const [proteinAffordableExpanded, setProteinAffordableExpanded] = useState(false);

  // Weight training & workout daily log state
  const [selectedWorkoutDate, setSelectedWorkoutDate] = useState(today);
  const [workoutHistory, setWorkoutHistory] = useState<Record<string, any[]>>({});
  const [expandedWorkoutDays, setExpandedWorkoutDays] = useState<Record<string, boolean>>({});
  const [workoutStep, setWorkoutStep] = useState<'type' | 'log'>('type');
  const [selectedWorkoutType, setSelectedWorkoutType] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('chest');
  const [workoutSets, setWorkoutSets] = useState('');
  const [workoutReps, setWorkoutReps] = useState('');
  const [workoutLoad, setWorkoutLoad] = useState('');
  const [workoutProgressExpanded, setWorkoutProgressExpanded] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const r = await fetch('/api/fitness/profile');
      if (r.ok) {
        const d = await r.json();
        const fp = d.profile || d;
        if (fp && fp !== null && (fp.weight || fp.height || fp.age || fp.gender || fp.tdee)) {
          setFitnessProfile(fp);
          const fpUnitSystem = (fp.unitSystem as 'metric' | 'imperial') || 'metric';
          const fpIsImperial = fpUnitSystem === 'imperial';
          setProfileForm({
            weight: fp.weight != null ? (fpIsImperial ? kgToLbs(fp.weight).toString() : fp.weight.toString()) : '',
            height: fp.height != null ? (fpIsImperial ? cmToIn(fp.height).toString() : fp.height.toString()) : '',
            age: fp.age?.toString() || '',
            gender: fp.gender || 'male',
            activityLevel: fp.activityLevel || 'moderate',
            goal: fp.goal || 'maintain',
            unitSystem: fpUnitSystem,
          });
        } else {
          setFitnessProfile(null);
        }
      }
    } catch {} finally {
      setProfileLoading(false);
      setProfileReady(true);
      setInitialLoadDone(true);
    }
  }, []);

  const fetchFoodLogs = useCallback(async () => {
    try {
      const r = await fetch(`/api/fitness/food?date=${today}`);
      if (r.ok) { const d = await r.json(); setFoodLogs(Array.isArray(d) ? d : d.foodLogs || []); }
    } catch {}
  }, []);

  const fetchWorkouts = useCallback(async () => {
    try {
      const r = await fetch(`/api/fitness/workout?date=${today}`);
      if (r.ok) { const d = await r.json(); setWorkouts(Array.isArray(d) ? d : d.workouts || []); }
    } catch {}
  }, []);

  // Fetch all workouts for chart data (no date filter)
  const fetchAllWorkouts = useCallback(async () => {
    try {
      const r = await fetch('/api/fitness/workout');
      if (r.ok) { const d = await r.json(); setAllWorkouts(Array.isArray(d) ? d : d.workouts || []); }
    } catch {}
  }, []);

  const fetchWeights = useCallback(async () => {
    try {
      const r = await fetch('/api/fitness/weight');
      if (r.ok) { const d = await r.json(); setWeightLogs(Array.isArray(d) ? d : d.weightLogs || []); }
    } catch {}
  }, []);

  const fetchProteinRecommendations = useCallback(async () => {
    setProteinLoading(true);
    try {
      const r = await fetch('/api/fitness/protein-recommendations');
      if (r.ok) { const d = await r.json(); setProteinData(d); }
    } catch {} finally { setProteinLoading(false); }
  }, []);

  const isDayEndedNutrition = (dateStr: string) => dateStr < today;

  const fetchNutritionForDate = useCallback(async (dateStr: string) => {
    try {
      const r = await fetch(`/api/fitness/food?date=${dateStr}`);
      if (r.ok) {
        const d = await r.json();
        const logs = Array.isArray(d) ? d : d.foodLogs || [];
        setNutritionHistory(prev => ({ ...prev, [dateStr]: logs }));
      }
    } catch {}
  }, []);

  const fetchWorkoutForDate = useCallback(async (dateStr: string) => {
    try {
      const r = await fetch(`/api/fitness/workout?date=${dateStr}`);
      if (r.ok) {
        const d = await r.json();
        const logs = Array.isArray(d) ? d : d.workouts || [];
        setWorkoutHistory(prev => ({ ...prev, [dateStr]: logs }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    // Fetch primary data first (profile, today's food/workouts/weights)
    async function loadInitialData() {
      await Promise.all([fetchProfile(), fetchFoodLogs(), fetchWorkouts(), fetchAllWorkouts(), fetchWeights(), fetchProteinRecommendations()]);
      setDataLoaded(true);
    }
    loadInitialData();
    // Load calendar week + past 7 days of nutrition/workout history in background
    const timer = setTimeout(() => {
      // Calendar week days (for weekly avg)
      const calWeek = getCalendarWeekDates().filter(d => d < today);
      // Rolling past 7 days (for "Past 7 Days" tabs — may extend beyond calendar week)
      const rolling7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (i + 1));
        return getLocalDateStr(d);
      });
      // Deduplicate all dates to fetch
      const allDates = Array.from(new Set([...calWeek, ...rolling7]));
      // Fetch all dates in parallel
      Promise.all(allDates.map(async (dateStr) => {
        try {
          const [foodRes, workoutRes] = await Promise.all([
            fetch(`/api/fitness/food?date=${dateStr}`),
            fetch(`/api/fitness/workout?date=${dateStr}`),
          ]);
          if (foodRes.ok) {
            const d = await foodRes.json();
            const fLogs = Array.isArray(d) ? d : d.foodLogs || [];
            setNutritionHistory(prev => ({ ...prev, [dateStr]: fLogs }));
          }
          if (workoutRes.ok) {
            const d = await workoutRes.json();
            const wLogs = Array.isArray(d) ? d : d.workouts || [];
            setWorkoutHistory(prev => ({ ...prev, [dateStr]: wLogs }));
          }
        } catch {}
      }));
    }, 300);
    return () => { clearTimeout(timer); };
  }, [fetchProfile, fetchFoodLogs, fetchWorkouts, fetchWeights]);

  const totalMacros = foodLogs.reduce((acc: any, f: any) => ({
    calories: acc.calories + (f.calories || 0),
    proteinG: acc.proteinG + (f.proteinG || 0),
    carbsG: acc.carbsG + (f.carbsG || 0),
    fatG: acc.fatG + (f.fatG || 0),
    fiberG: acc.fiberG + (f.fiberG || 0),
  }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 });
  const totalBurned = workouts.reduce((a: number, w: any) => a + (w.estimatedCalories || 0), 0);

  // Calendar week: Sunday → Saturday (fixed boundary, not rolling window)
  const weekDates = getCalendarWeekDates();

  const weeklyData = weekDates.map(dateStr => {
    const logs = dateStr === today ? foodLogs : (nutritionHistory[dateStr] || []);
    const totals = logs.reduce((acc: any, f: any) => ({
      calories: acc.calories + (f.calories || 0),
      proteinG: acc.proteinG + (f.proteinG || 0),
      carbsG:   acc.carbsG   + (f.carbsG   || 0),
      fatG:     acc.fatG     + (f.fatG     || 0),
      fiberG:   acc.fiberG   + (f.fiberG   || 0),
      sugarG:   acc.sugarG   + (f.sugarG   || 0),
    }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0, sugarG: 0 });
    return { dateStr, ...totals, hasData: logs.length > 0 };
  });

  // Only count days that have passed or have data (skip future days in the week)
  const daysWithData = weeklyData.filter(d => d.hasData);
  const weeklyAvg = daysWithData.length > 0 ? {
    calories: daysWithData.reduce((a, d) => a + d.calories, 0) / daysWithData.length,
    proteinG: daysWithData.reduce((a, d) => a + d.proteinG, 0) / daysWithData.length,
    carbsG:   daysWithData.reduce((a, d) => a + d.carbsG,   0) / daysWithData.length,
    fatG:     daysWithData.reduce((a, d) => a + d.fatG,     0) / daysWithData.length,
    fiberG:   daysWithData.reduce((a, d) => a + d.fiberG,   0) / daysWithData.length,
    sugarG:   daysWithData.reduce((a, d) => a + d.sugarG,   0) / daysWithData.length,
  } : null;

  // Computed values from profile form (always convert to metric for TDEE calculation)
  const metricWeight = isImperial ? lbsToKg(Number(profileForm.weight)) : Number(profileForm.weight);
  const metricHeight = isImperial ? inToCm(Number(profileForm.height)) : Number(profileForm.height);
  const computedTDEE = profileForm.weight && profileForm.height && profileForm.age
    ? calcTDEE(metricWeight, metricHeight, Number(profileForm.age), profileForm.gender, profileForm.activityLevel)
    : 0;
  const computedRequiredCal = computedTDEE > 0 ? calcRequiredCal(computedTDEE, profileForm.goal) : 0;
  const computedMacros = computedRequiredCal > 0 ? calcMacros(computedRequiredCal, metricWeight) : null;

  // Get current targets from fitness profile or computed
  // Prefer computed values (from profileForm) when they're available, as they reflect
  // the latest weight input (e.g., after addWeight). Fall back to fitnessProfile for initial load.
  const currentTDEE = computedTDEE > 0 ? computedTDEE : (fitnessProfile?.tdee || 0);
  const currentRequiredCal = computedRequiredCal > 0 ? computedRequiredCal : (fitnessProfile?.calorieTarget || 0);
  // Use latest weight from profileForm (just updated by addWeight) or fitnessProfile
  const currentWeight = metricWeight > 0 ? metricWeight : (fitnessProfile?.weight || 70);
  const currentMacros = currentRequiredCal > 0 ? calcMacros(currentRequiredCal, currentWeight) : null;

  async function saveFitnessProfile() {
    setProfileSaving(true);
    try {
      // Convert display values to metric for storage
      const weightKg = isImperial ? lbsToKg(Number(profileForm.weight)) : Number(profileForm.weight);
      const heightCm = isImperial ? inToCm(Number(profileForm.height)) : Number(profileForm.height);
      const tdee = calcTDEE(weightKg, heightCm, Number(profileForm.age), profileForm.gender, profileForm.activityLevel);
      const requiredCal = calcRequiredCal(tdee, profileForm.goal);
      const body: any = {
        weight: weightKg,
        height: heightCm,
        age: Number(profileForm.age),
        gender: profileForm.gender,
        activityLevel: profileForm.activityLevel,
        goal: profileForm.goal,
        unitSystem: profileForm.unitSystem,
      };
      if (tdee > 0) body.tdee = tdee;
      if (requiredCal > 0) body.calorieTarget = requiredCal;

      const existing = fitnessProfile;
      const method = existing ? 'PATCH' : 'POST';
      const r = await fetch('/api/fitness/profile', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (r.ok) {
        setEditProfile(false);
        await fetchProfile();
        toast.success('Fitness profile saved!');
      } else {
        const d = await r.json();
        toast.error(d.error || 'Failed to save');
      }
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setProfileSaving(false);
    }
  }

  async function estimateMacros() {
    if (!mealName.trim()) return;
    setAiEstimating(true); setMealSource(null);
    try {
      const r = await fetch('/api/ai/estimate-macros', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mealName, quantity: parseFloat(mealQuantity) || 1, quantityUnit: mealUnit }) });
      if (r.ok) { const d = await r.json(); setEstimatedMacros(d); setMealSource(d.source || 'ai'); }
    } catch {} finally { setAiEstimating(false); }
  }

  async function addFood() {
    const macros = estimatedMacros || { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 };
    try {
      const r = await fetch('/api/fitness/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealName,
          quantity: parseFloat(mealQuantity) || 1,
          quantityUnit: mealUnit,
          date: selectedNutritionDate,
          mealCategory,
          ...macros,
        }),
      });
      if (r.ok) {
        const d = await r.json();
        const newLog = d.foodLog;
        if (newLog) {
          setFoodLogs(prev => [newLog, ...prev]);
        }
        toast.success(`+5 ${t('xp.earned')}`);
        setMealName(''); setMealQuantity('1'); setMealUnit('g'); setEstimatedMacros(null); setMealSource(null);
        await fetchFoodLogs(); // ensure list is synced
        fetchProteinRecommendations(); // refresh protein recommendations
        if (selectedNutritionDate !== today) fetchNutritionForDate(selectedNutritionDate);
        fetchUserProfile();
        window.dispatchEvent(new CustomEvent('xp-updated')); window.dispatchEvent(new CustomEvent('notification-updated'));
      }
    } catch {}
  }

  async function estimateBurn() {
    if (!selectedWorkoutType || !workoutDuration) return;
    setAiBurnEstimating(true);
    try {
      const r = await fetch('/api/ai/estimate-burn', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workoutType: selectedWorkoutType, duration: parseInt(workoutDuration) }) });
      if (r.ok) { const d = await r.json(); setEstimatedBurn(d); }
    } catch {} finally { setAiBurnEstimating(false); }
  }

  async function addWorkout() {
    try {
      const r = await fetch('/api/fitness/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutType: selectedWorkoutType,
          duration: parseInt(workoutDuration),
          estimatedCalories: estimatedBurn?.estimatedCalories || 0,
          date: selectedWorkoutDate,
          muscleGroup: selectedWorkoutType === 'Weight Training' ? muscleGroup : undefined,
          sets: selectedWorkoutType === 'Weight Training' ? parseInt(workoutSets) || undefined : undefined,
          reps: selectedWorkoutType === 'Weight Training' ? parseInt(workoutReps) || undefined : undefined,
          loadKg: selectedWorkoutType === 'Weight Training' ? (isImperial ? lbsToKg(parseFloat(workoutLoad)) : parseFloat(workoutLoad)) || undefined : undefined,
          workoutSplit: fitnessProfile?.workoutSplit || undefined,
        }),
      });
      if (r.ok) {
        const d = await r.json();
        const newWorkout = d.workout;
        if (newWorkout) {
          setWorkouts(prev => [newWorkout, ...prev]);
        }
        toast.success(`+15 ${t('xp.earned')}`);
        setWorkoutStep('type');
        setSelectedWorkoutType('');
        setMuscleGroup('chest');
        setWorkoutSets(''); setWorkoutReps(''); setWorkoutLoad('');
        setWorkoutDuration(''); setEstimatedBurn(null);
        if (selectedWorkoutDate !== today) fetchWorkoutForDate(selectedWorkoutDate);
        await fetchWorkouts();
        fetchAllWorkouts(); // Refresh chart data
        fetchUserProfile();
        window.dispatchEvent(new CustomEvent('xp-updated')); window.dispatchEvent(new CustomEvent('notification-updated'));
      }
    } catch {}
  }

  async function addWeight() {
    if (!weightValue) return;
    try {
      const weightKg = isImperial ? lbsToKg(parseFloat(weightValue)) : parseFloat(weightValue);
      const r = await fetch('/api/fitness/weight', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ weight: weightKg, date: today }) });
      if (r.ok) {
        const d = await r.json();
        const newWeight = d.weightLog;
        if (newWeight) {
          setWeightLogs(prev => [...prev, newWeight]);
        }
        setWeightValue('');
        // Update profileForm weight so computed macros update immediately
        setProfileForm(p => ({ ...p, weight: isImperial ? kgToLbs(weightKg).toString() : weightKg.toString() }));
        fetchWeights(); // background sync
        // Await profile refresh so macros/TDEE update immediately
        await fetchProfile();
        toast.success('Weight logged & targets updated!');
        window.dispatchEvent(new CustomEvent('xp-updated'));
        window.dispatchEvent(new CustomEvent('notification-updated'));
      }
    } catch {}
  }

  async function deleteFood(id: string) {
    try {
      setFoodLogs(prev => prev.filter(f => f.id !== id));
      await fetch(`/api/fitness/food?id=${id}`, { method: 'DELETE' });
      fetchFoodLogs(); // background sync
      fetchProteinRecommendations();
      fetchUserProfile();
      window.dispatchEvent(new CustomEvent('xp-updated')); window.dispatchEvent(new CustomEvent('notification-updated'));
    } catch {}
  }

  async function deleteWorkout(id: string) {
    try {
      setWorkouts(prev => prev.filter(w => w.id !== id));
      await fetch(`/api/fitness/workout?id=${id}`, { method: 'DELETE' });
      fetchWorkouts(); // background sync
      fetchAllWorkouts(); // refresh chart data
      fetchUserProfile();
      window.dispatchEvent(new CustomEvent('xp-updated')); window.dispatchEvent(new CustomEvent('notification-updated'));
    } catch {}
  }

  async function deleteWeight(id: string) {
    try {
      setWeightLogs(prev => prev.filter(w => w.id !== id));
      await fetch(`/api/fitness/weight?id=${id}`, { method: 'DELETE' });
      fetchWeights(); // background sync
      fetchProfile();
    } catch {}
  }

  async function sendChat() {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim(); setChatMessages(p => [...p, { role: 'user', content: msg }]); setChatInput(''); setChatLoading(true);
    try { const r = await fetch('/api/ai/chatbot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg, botType: 'fitness', conversationId }) }); if (r.ok) { const d = await r.json(); setChatMessages(p => [...p, { role: 'assistant', content: d.reply || d.response }]); if (d.conversationId) setConversationId(d.conversationId); } } catch {} finally { setChatLoading(false); }
  }

  function startNewChat() {
    setChatMessages([]);
    setConversationId(null);
  }

  // Workout chart data (for progress tab) — uses allWorkouts for full history
  // Deduplicate by ID (in case of overlap with workoutHistory)
  const allWorkoutsDeduped = useMemo(() => {
    const map = new Map<string, any>();
    [...allWorkouts, ...Object.values(workoutHistory).flat()].forEach((w: any) => {
      if (w?.id) map.set(w.id, w);
    });
    return Array.from(map.values());
  }, [allWorkouts, workoutHistory]);

  const workoutChartData = allWorkoutsDeduped
    .reduce((acc: Record<string, number>, w: any) => {
      const d = w.date?.slice(5) || w.date;
      acc[d] = (acc[d] || 0) + (w.estimatedCalories || 0);
      return acc;
    }, {});
  const workoutChartArr = Object.entries(workoutChartData)
    .map(([date, calories]) => ({ date, calories }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14);

  // Show loading screen until all initial data is fetched
  if (!dataLoaded) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading fitness data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-accent border border-border w-full flex overflow-x-auto">
          {TABS_LIST.map(tab => <TabsTrigger key={tab} value={tab} className="text-muted-foreground data-[state=active]:text-blue-400 data-[state=active]:bg-blue-600/20 text-xs flex-1">{t(`fitness.${tab}`)}</TabsTrigger>)}
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Fitness Profile Setup / Edit */}
          <GlassCard variant="deep" className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><Scale size={16} className="text-blue-400" />Fitness Profile</h3>
              {fitnessProfile && !editProfile && (
                <Button onClick={() => setEditProfile(true)} size="sm" variant="ghost" className="text-muted-foreground"><Edit size={14} /></Button>
              )}
            </div>

            {(!profileReady || !initialLoadDone) ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              </div>
            ) : (!fitnessProfile || editProfile) ? (
              <div className="space-y-4">
                {/* Unit System Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Units:</span>
                  <div className="flex gap-1">
                    <SelectPill label="Metric (kg/cm)" selected={profileForm.unitSystem === 'metric'} onClick={() => {
                      const currentWeight = Number(profileForm.weight) || 0;
                      const currentHeight = Number(profileForm.height) || 0;
                      if (profileForm.unitSystem === 'imperial') {
                        setProfileForm(p => ({
                          ...p,
                          unitSystem: 'metric',
                          weight: currentWeight ? lbsToKg(currentWeight).toString() : '',
                          height: currentHeight ? inToCm(currentHeight).toString() : '',
                        }));
                      } else {
                        setProfileForm(p => ({ ...p, unitSystem: 'metric' }));
                      }
                    }} color="blue" />
                    <SelectPill label="Imperial (lbs/in)" selected={profileForm.unitSystem === 'imperial'} onClick={() => {
                      const currentWeight = Number(profileForm.weight) || 0;
                      const currentHeight = Number(profileForm.height) || 0;
                      if (profileForm.unitSystem === 'metric') {
                        setProfileForm(p => ({
                          ...p,
                          unitSystem: 'imperial',
                          weight: currentWeight ? kgToLbs(currentWeight).toString() : '',
                          height: currentHeight ? cmToIn(currentHeight).toString() : '',
                        }));
                      } else {
                        setProfileForm(p => ({ ...p, unitSystem: 'imperial' }));
                      }
                    }} color="blue" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1"><Label className="text-muted-foreground text-xs">Body Weight ({weightUnit})</Label><Input type="number" value={profileForm.weight} onChange={e => setProfileForm(p => ({ ...p, weight: e.target.value }))} placeholder={isImperial ? '154' : '70'} className="bg-white/5 border-border text-foreground h-9" /></div>
                  <div className="space-y-1"><Label className="text-muted-foreground text-xs">Height ({heightUnit})</Label><Input type="number" value={profileForm.height} onChange={e => setProfileForm(p => ({ ...p, height: e.target.value }))} placeholder={isImperial ? '67' : '170'} className="bg-white/5 border-border text-foreground h-9" /></div>
                  <div className="space-y-1"><Label className="text-muted-foreground text-xs">Age</Label><Input type="number" value={profileForm.age} onChange={e => setProfileForm(p => ({ ...p, age: e.target.value }))} placeholder="25" className="bg-white/5 border-border text-foreground h-9" /></div>
                  <div className="space-y-1"><Label className="text-muted-foreground text-xs">Gender</Label>
                    <select value={profileForm.gender} onChange={e => setProfileForm(p => ({ ...p, gender: e.target.value }))} className="w-full bg-white/5 border border-border text-foreground rounded-md px-3 py-2 text-sm h-9">
                      <option value="male" className="bg-background">Male</option>
                      <option value="female" className="bg-background">Female</option>
                      <option value="other" className="bg-background">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1 col-span-2"><Label className="text-muted-foreground text-xs">Activity Level</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {ACTIVITY_LEVELS.map(level => (
                        <SelectPill key={level} label={t(`onboarding.activityLevel.${level}`)} selected={profileForm.activityLevel === level} onClick={() => setProfileForm(p => ({ ...p, activityLevel: level }))} color="blue" />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1"><Label className="text-muted-foreground text-xs">Fitness Goal</Label>
                    <div className="flex gap-1.5">
                      {GOALS.map(goal => (
                        <SelectPill key={goal} label={t(`onboarding.goal.${goal}`)} selected={profileForm.goal === goal} onClick={() => setProfileForm(p => ({ ...p, goal }))} color="blue" />
                      ))}
                    </div>
                  </div>
                </div>

                {computedRequiredCal > 0 && computedMacros && (
                  <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground text-center">Required Daily Calories for Your Goal</p>
                    <p className="text-2xl font-bold text-blue-400 mt-1 text-center">{computedRequiredCal.toLocaleString()} <span className="text-sm text-muted-foreground">cal/day</span></p>
                    <p className="text-[10px] text-muted-foreground/50 text-center mt-1">TDEE: {computedTDEE.toLocaleString()} cal · Goal adjustment: {profileForm.goal === 'lose' ? '-20%' : profileForm.goal === 'gain' ? '+15%' : '0%'}</p>
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      <div className="text-center"><p className="text-sm font-bold text-blue-400">{computedMacros.proteinG}g</p><p className="text-[10px] text-muted-foreground/70">Protein (2g/kg)</p></div>
                      <div className="text-center"><p className="text-sm font-bold text-amber-400">{computedMacros.carbsG}g</p><p className="text-[10px] text-muted-foreground/70">Carbs (55%)</p></div>
                      <div className="text-center"><p className="text-sm font-bold text-red-400">{computedMacros.fatG}g</p><p className="text-[10px] text-muted-foreground/70">Fat (27.5%)</p></div>
                      <div className="text-center"><p className="text-sm font-bold text-green-400">{computedMacros.fiberG}g</p><p className="text-[10px] text-muted-foreground/70">Fiber (14g/1k)</p></div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={saveFitnessProfile} disabled={profileSaving || !profileForm.weight} className="gradient-blue flex-1">
                    {profileSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
                    Save Profile
                  </Button>
                  {editProfile && (
                    <Button onClick={() => setEditProfile(false)} variant="ghost" className="text-muted-foreground"><X size={14} /></Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center"><p className="text-lg font-bold text-foreground">{fitnessProfile.weight ? displayWeight(fitnessProfile.weight) : '—'}</p><p className="text-[10px] text-muted-foreground/70">Weight ({weightUnit})</p></div>
                <div className="text-center"><p className="text-lg font-bold text-foreground">{fitnessProfile.height ? displayHeight(fitnessProfile.height) : '—'}</p><p className="text-[10px] text-muted-foreground/70">Height ({heightUnit})</p></div>
                <div className="text-center"><p className="text-lg font-bold text-foreground capitalize">{fitnessProfile.activityLevel || '—'}</p><p className="text-[10px] text-muted-foreground/70">Activity</p></div>
                <div className="text-center"><p className="text-lg font-bold text-foreground capitalize">{fitnessProfile.goal || '—'}</p><p className="text-[10px] text-muted-foreground/70">Goal</p></div>
              </div>
            )}
          </GlassCard>

          {/* Stats Overview - shows Required Cal not TDEE */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <GlassCard variant="liquid" className="p-3 text-center"><p className="text-lg font-bold text-blue-400">{currentRequiredCal || '—'}</p><p className="text-[10px] text-muted-foreground/70">Required Cal</p></GlassCard>
            <GlassCard variant="liquid" className="p-3 text-center"><p className="text-lg font-bold text-amber-400">{totalMacros.calories.toFixed(0)}</p><p className="text-[10px] text-muted-foreground/70">{t('fitness.consumed')}</p></GlassCard>
            <GlassCard variant="liquid" className="p-3 text-center"><p className="text-lg font-bold text-red-400">{totalBurned.toFixed(0)}</p><p className="text-[10px] text-muted-foreground/70">{t('fitness.burned')}</p></GlassCard>
            <GlassCard variant="liquid" className="p-3 text-center"><p className="text-lg font-bold text-emerald-400">{((currentRequiredCal || 0) - totalMacros.calories + totalBurned).toFixed(0)}</p><p className="text-[10px] text-muted-foreground/70">{t('fitness.remaining')}</p></GlassCard>
          </div>
          {totalMacros.calories > 0 && currentMacros && <MacroBar protein={Math.round(totalMacros.proteinG * 100) / 100} carbs={Math.round(totalMacros.carbsG * 100) / 100} fat={Math.round(totalMacros.fatG * 100) / 100} fiber={Math.round(totalMacros.fiberG * 100) / 100} proteinGoal={currentMacros.proteinG} carbsGoal={currentMacros.carbsG} fatGoal={currentMacros.fatG} fiberGoal={currentMacros.fiberG} />}
          {currentMacros && (
            <GlassCard className="p-3">
              <p className="text-xs text-muted-foreground mb-2">Daily Macro Targets</p>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center"><p className="text-xs font-bold text-blue-400">{currentMacros.proteinG}g</p><p className="text-[10px] text-muted-foreground/70">Protein</p></div>
                <div className="text-center"><p className="text-xs font-bold text-amber-400">{currentMacros.carbsG}g</p><p className="text-[10px] text-muted-foreground/70">Carbs</p></div>
                <div className="text-center"><p className="text-xs font-bold text-red-400">{currentMacros.fatG}g</p><p className="text-[10px] text-muted-foreground/70">Fat</p></div>
                <div className="text-center"><p className="text-xs font-bold text-green-400">{currentMacros.fiberG}g</p><p className="text-[10px] text-muted-foreground/70">Fiber</p></div>
              </div>
            </GlassCard>
          )}

          {weeklyAvg && (
            <GlassCard className="overflow-hidden">
              <div
                className="p-3 flex items-center justify-between cursor-pointer"
                style={{ minHeight: 56 }}
                onClick={() => setWeeklyMacroExpanded(p => !p)}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp size={15} className="text-blue-400" />
                  <span className="text-sm font-medium text-foreground">Weekly Macro Avg</span>
                  <span className="text-[10px] text-muted-foreground/50">({daysWithData.length} days logged)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-amber-400 font-medium">{weeklyAvg.calories.toFixed(0)} cal/day</span>
                  <span className="text-[10px] text-muted-foreground">P:{weeklyAvg.proteinG.toFixed(0)}g C:{weeklyAvg.carbsG.toFixed(0)}g F:{weeklyAvg.fatG.toFixed(0)}g</span>
                  <motion.div animate={{ rotate: weeklyMacroExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={15} className="text-muted-foreground/50" />
                  </motion.div>
                </div>
              </div>
              <AnimatePresence>
                {weeklyMacroExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 border-t border-border/30 pt-2 space-y-1.5">
                      {weeklyData.map((day, idx) => {
                        const isFuture = day.dateStr > today;
                        const dayLabel = DAY_NAMES[idx];
                        const dateLabel = day.dateStr === today
                          ? 'Today'
                          : new Date(day.dateStr + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                        return (
                          <div key={day.dateStr} className={`rounded-lg ${isFuture ? 'opacity-40' : ''} ${day.hasData ? 'bg-accent/30' : 'bg-accent/10'}`}>
                            {/* Day header row */}
                            <div className="flex items-center justify-between py-2 px-2.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-foreground">{dayLabel}</span>
                                <span className="text-[10px] text-muted-foreground/60">{dateLabel}</span>
                              </div>
                              {day.hasData ? (
                                <span className="text-xs font-medium text-amber-400">{day.calories.toFixed(0)} cal</span>
                              ) : isFuture ? (
                                <span className="text-[10px] text-muted-foreground/30 italic">Upcoming</span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground/40 italic">No meals logged</span>
                              )}
                            </div>
                            {/* Macro details row (only if has data) */}
                            {day.hasData && (
                              <div className="flex flex-wrap gap-x-4 gap-y-0.5 px-2.5 pb-2">
                                <span className="text-[10px] text-blue-400">Protein: {day.proteinG.toFixed(1)}g</span>
                                <span className="text-[10px] text-amber-400">Carbs: {day.carbsG.toFixed(1)}g</span>
                                <span className="text-[10px] text-red-400">Fat: {day.fatG.toFixed(1)}g</span>
                                <span className="text-[10px] text-green-400">Fiber: {day.fiberG.toFixed(1)}g</span>
                                {day.sugarG > 0 && <span className="text-[10px] text-pink-400">Sugar: {day.sugarG.toFixed(1)}g</span>}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Week Summary */}
                      <div className="mt-2 pt-2 border-t border-border/40 rounded-lg bg-gradient-to-r from-blue-600/10 to-indigo-600/10 px-2.5 py-2.5">
                        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1.5">Week Summary</p>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-3 gap-y-1">
                          <div>
                            <p className="text-xs font-bold text-blue-400">{weeklyAvg.proteinG.toFixed(0)}g</p>
                            <p className="text-[9px] text-muted-foreground/50">Protein Avg</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-amber-400">{weeklyAvg.carbsG.toFixed(0)}g</p>
                            <p className="text-[9px] text-muted-foreground/50">Carbs Avg</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-red-400">{weeklyAvg.fatG.toFixed(0)}g</p>
                            <p className="text-[9px] text-muted-foreground/50">Fat Avg</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-green-400">{weeklyAvg.fiberG.toFixed(0)}g</p>
                            <p className="text-[9px] text-muted-foreground/50">Fiber Avg</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-pink-400">{weeklyAvg.sugarG.toFixed(0)}g</p>
                            <p className="text-[9px] text-muted-foreground/50">Sugar Avg</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-amber-300">{weeklyAvg.calories.toFixed(0)}</p>
                            <p className="text-[9px] text-muted-foreground/50">Calories Avg</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          )}

          {/* Workout Progress Card */}
          {(() => {
            const nowDate = new Date();
            const weekWorkouts = allWorkoutsDeduped.filter((w: any) => {
              const d = new Date(w.date + 'T00:00:00');
              const diffDays = (nowDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
              return diffDays <= 7;
            });
            const monthWorkouts = allWorkoutsDeduped.filter((w: any) => {
              const d = new Date(w.date + 'T00:00:00');
              return d.getMonth() === nowDate.getMonth() && d.getFullYear() === nowDate.getFullYear();
            });
            const weekW = weekWorkouts;
            const monthW = monthWorkouts;
            const weekCalBurned = weekW.reduce((a: number, w: any) => a + (w.estimatedCalories || 0), 0);
            const monthCalBurned = monthW.reduce((a: number, w: any) => a + (w.estimatedCalories || 0), 0);
            const weekMinTrained = weekW.reduce((a: number, w: any) => a + (w.duration || 0), 0);
            const monthMinTrained = monthW.reduce((a: number, w: any) => a + (w.duration || 0), 0);

            if (weekW.length === 0 && monthW.length === 0) return null;

            return (
              <GlassCard className="overflow-hidden">
                <div
                  className="p-3 flex items-center justify-between cursor-pointer"
                  style={{ minHeight: 56 }}
                  onClick={() => setWorkoutProgressExpanded(p => !p)}
                >
                  <div className="flex items-center gap-2">
                    <Activity size={15} className="text-blue-400" />
                    <span className="text-sm font-medium text-foreground">Workout Progress</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-amber-400 font-medium">{weekW.length} this week</span>
                    <span className="text-[10px] text-muted-foreground">{weekCalBurned.toFixed(0)} cal</span>
                    <motion.div animate={{ rotate: workoutProgressExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={15} className="text-muted-foreground/50" />
                    </motion.div>
                  </div>
                </div>
                <AnimatePresence>
                  {workoutProgressExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="px-3 pb-4 border-t border-border/30 pt-3 space-y-4">

                        {/* Weekly */}
                        <div>
                          <p className="text-xs text-muted-foreground/60 mb-2">This Week</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center bg-accent/30 rounded-lg p-2">
                              <p className="text-sm font-bold text-blue-400">{weekW.length}</p>
                              <p className="text-[10px] text-muted-foreground/60">Sessions</p>
                            </div>
                            <div className="text-center bg-accent/30 rounded-lg p-2">
                              <p className="text-sm font-bold text-amber-400">{weekCalBurned.toFixed(0)}</p>
                              <p className="text-[10px] text-muted-foreground/60">Cal burned</p>
                            </div>
                            <div className="text-center bg-accent/30 rounded-lg p-2">
                              <p className="text-sm font-bold text-green-400">{weekMinTrained}</p>
                              <p className="text-[10px] text-muted-foreground/60">Minutes</p>
                            </div>
                          </div>
                        </div>

                        {/* Monthly */}
                        <div>
                          <p className="text-xs text-muted-foreground/60 mb-2">This Month</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center bg-accent/30 rounded-lg p-2">
                              <p className="text-sm font-bold text-blue-400">{monthW.length}</p>
                              <p className="text-[10px] text-muted-foreground/60">Sessions</p>
                            </div>
                            <div className="text-center bg-accent/30 rounded-lg p-2">
                              <p className="text-sm font-bold text-amber-400">{monthCalBurned.toFixed(0)}</p>
                              <p className="text-[10px] text-muted-foreground/60">Cal burned</p>
                            </div>
                            <div className="text-center bg-accent/30 rounded-lg p-2">
                              <p className="text-sm font-bold text-green-400">{monthMinTrained}</p>
                              <p className="text-[10px] text-muted-foreground/60">Minutes</p>
                            </div>
                          </div>
                        </div>

                        {/* Weight training breakdown if any */}
                        {weekW.some((w: any) => w.workoutType === 'Weight Training') && (
                          <div>
                            <p className="text-xs text-muted-foreground/60 mb-2">Weight Training This Week</p>
                            <div className="space-y-1">
                              {weekW.filter((w: any) => w.workoutType === 'Weight Training').map((w: any) => (
                                <div key={w.id} className="flex items-center justify-between py-1 px-2 rounded-lg bg-accent/20">
                                  <span className="text-xs text-foreground">{w.muscleGroup ? MUSCLE_GROUP_META[w.muscleGroup]?.label : 'Weight Training'}</span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {w.sets && `${w.sets}×${w.reps}`}{w.loadKg && ` @ ${w.loadKg}kg`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            );
          })()}
        </TabsContent>

        {/* Nutrition */}
        <TabsContent value="nutrition" className="space-y-4 mt-4">

          {/* Meal Logger */}
          <GlassCard variant="glassmorphism" className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('fitness.logMeal')}</h3>

            {/* Date selector */}
            <div className="flex items-center gap-2 mb-3">
              <input
                type="date"
                value={selectedNutritionDate}
                max={today}
                onChange={e => {
                  setSelectedNutritionDate(e.target.value);
                  if (e.target.value !== today && !nutritionHistory[e.target.value]) {
                    fetchNutritionForDate(e.target.value);
                  }
                }}
                className="bg-accent border border-border text-foreground rounded-md px-3 py-1.5 text-sm"
              />
              {selectedNutritionDate !== today && (
                <button
                  onClick={() => setSelectedNutritionDate(today)}
                  className="text-xs text-blue-400 hover:underline"
                >
                  Back to today
                </button>
              )}
            </div>

            {/* Meal category pills */}
            <div className="flex gap-1.5 mb-3 flex-wrap">
              {MEAL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setMealCategory(cat)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    mealCategory === cat
                      ? 'bg-blue-600/30 border-blue-500/50 text-blue-300'
                      : 'bg-accent border-border text-muted-foreground hover:border-blue-500/30'
                  }`}
                >
                  {MEAL_CATEGORY_META[cat].icon} {MEAL_CATEGORY_META[cat].label}
                </button>
              ))}
            </div>

            {/* Meal name + quantity + unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              <Input value={mealName} onChange={e => setMealName(e.target.value)} placeholder="Meal name (e.g. Whey Protein shake)" className="bg-accent border-border text-foreground placeholder:text-muted-foreground/50" />
              <div className="flex gap-2">
                <Input type="number" value={mealQuantity} onChange={e => setMealQuantity(e.target.value)} placeholder="Qty" className="bg-accent border-border text-foreground placeholder:text-muted-foreground/50 w-20" />
                <select value={mealUnit} onChange={e => setMealUnit(e.target.value)} className="bg-accent border border-border text-foreground rounded-md px-2 py-2 text-sm flex-1">
                  {SERVING_UNITS.map(u => <option key={u} value={u} className="bg-background">{u}</option>)}
                </select>
              </div>
            </div>

            {/* AI estimate + macros preview + Add button */}
            <Button onClick={estimateMacros} disabled={aiEstimating} variant="ghost" className="text-purple-400 border border-purple-500/20 w-full mb-2">
              {aiEstimating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}{t('fitness.aiEstimateMacros')}
            </Button>
            {mealSource && <span className={`text-xs px-2 py-0.5 rounded-full ${['database+ai','supplement_db+ai','brand_db+ai','food_database+ai'].includes(mealSource) ? 'bg-blue-600/20 text-blue-400' : ['database','supplement_database','brand_database','food_database'].includes(mealSource) ? 'bg-green-600/20 text-green-400' : mealSource === 'local' ? 'bg-red-600/20 text-red-400' : 'bg-amber-600/20 text-amber-400'}`}>{mealSource === 'database+ai' ? 'DB + AI Verified' : mealSource === 'supplement_db+ai' ? 'Supplement DB + AI' : mealSource === 'brand_db+ai' ? 'Brand DB + AI' : mealSource === 'food_database+ai' ? 'Food DB + AI' : mealSource === 'brand_database' ? 'Brand Database' : mealSource === 'supplement_database' ? 'Supplement DB' : mealSource === 'database' ? t('fitness.fromDatabase') : mealSource === 'local' ? 'Estimated' : t('fitness.aiEstimated')}</span>}
            {estimatedMacros && (
              <div className="grid grid-cols-5 gap-2 mt-2">
                <div className="text-center"><p className="text-sm font-bold text-foreground">{estimatedMacros.calories?.toFixed(0)}</p><p className="text-[10px] text-muted-foreground/70">cal</p></div>
                <div className="text-center"><p className="text-sm font-bold text-blue-400">{estimatedMacros.proteinG?.toFixed(1)}</p><p className="text-[10px] text-muted-foreground/70">Pro</p></div>
                <div className="text-center"><p className="text-sm font-bold text-amber-400">{estimatedMacros.carbsG?.toFixed(1)}</p><p className="text-[10px] text-muted-foreground/70">Carb</p></div>
                <div className="text-center"><p className="text-sm font-bold text-red-400">{estimatedMacros.fatG?.toFixed(1)}</p><p className="text-[10px] text-muted-foreground/70">Fat</p></div>
                <div className="text-center"><p className="text-sm font-bold text-green-400">{estimatedMacros.fiberG?.toFixed(1)}</p><p className="text-[10px] text-muted-foreground/70">Fiber</p></div>
              </div>
            )}
            <Button onClick={addFood} className="gradient-blue mt-2 w-full">{t('common.add')}</Button>
          </GlassCard>

          {/* ── Protein Recommendations ── */}
          {proteinLoading && !proteinData ? (
            <GlassCard className="p-4 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading protein recommendations...</span>
            </GlassCard>
          ) : proteinData && (
            <div className="space-y-3">
              {/* Protein Target Card */}
              <GlassCard variant="deep" className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Beef size={16} className="text-blue-400" />
                  <h3 className="text-sm font-medium text-foreground">Protein Recommendations</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400">{proteinData.proteinTarget.rangeLabel}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-400 capitalize">{proteinData.profile.dietType.replace('_', '-')}</span>
                </div>

                {/* Protein Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Daily Protein Target</span>
                    <span className="text-xs font-medium text-foreground">{proteinData.proteinTarget.currentG}g / {proteinData.proteinTarget.targetG}g</span>
                  </div>
                  <div className="w-full bg-accent rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (proteinData.proteinTarget.currentG / proteinData.proteinTarget.targetG) * 100)}%`,
                        backgroundColor: proteinData.proteinTarget.currentG >= proteinData.proteinTarget.targetG ? '#22c55e' :
                          proteinData.proteinTarget.currentG >= proteinData.proteinTarget.targetG * 0.7 ? '#3b82f6' : '#f59e0b',
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground/50">{proteinData.proteinTarget.gPerKg} · {proteinData.proteinTarget.minG}–{proteinData.proteinTarget.maxG}g range</span>
                    <span className={`text-[10px] font-medium ${proteinData.proteinTarget.remainingG > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                      {proteinData.proteinTarget.remainingG > 0 ? `${proteinData.proteinTarget.remainingG}g remaining` : 'Target reached!'}
                    </span>
                  </div>
                </div>

                {/* Meal Distribution */}
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(proteinData.mealDistribution).map(([meal, grams]: [string, any]) => {
                    const mealMeta: Record<string, { icon: string; color: string }> = {
                      breakfast: { icon: '\u{1F305}', color: 'text-amber-400' },
                      lunch: { icon: '\u2600\uFE0F', color: 'text-yellow-400' },
                      dinner: { icon: '\u{1F319}', color: 'text-indigo-400' },
                      snack: { icon: '\u{1F34E}', color: 'text-green-400' },
                    };
                    return (
                      <div key={meal} className="text-center p-2 bg-accent/50 rounded-lg">
                        <span className="text-sm">{mealMeta[meal]?.icon}</span>
                        <p className="text-sm font-bold text-blue-400 mt-1">{grams}g</p>
                        <p className="text-[10px] text-muted-foreground/70 capitalize">{meal}</p>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Easy Protein Wins */}
              {proteinData.easyWins && proteinData.easyWins.length > 0 && (
                <GlassCard className="p-3 border-green-500/20">
                  <button
                    onClick={() => setProteinWinsExpanded(!proteinWinsExpanded)}
                    className="flex items-center gap-2 w-full text-left mb-2"
                  >
                    <Zap size={14} className="text-green-400" />
                    <span className="text-xs font-medium text-green-400">Easy Protein Wins</span>
                    <motion.div animate={{ rotate: proteinWinsExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={12} className="text-muted-foreground/50 ml-auto" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {proteinWinsExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1.5">
                          {proteinData.easyWins.map((win: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 py-1 px-2 rounded-lg bg-green-600/5">
                              <span className="text-green-400 text-xs mt-0.5">+</span>
                              <p className="text-xs text-muted-foreground">{win}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              )}

              {/* Meal-wise Recommendations */}
              <GlassCard className="p-3">
                <h3 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Target size={14} className="text-blue-400" />
                  Protein Sources by Meal
                </h3>
                <div className="space-y-2">
                  {Object.entries(proteinData.mealRecommendations).map(([meal, foods]: [string, any]) => {
                    if (!foods || foods.length === 0) return null;
                    const isExpanded = proteinMealExpanded[meal] ?? false;
                    const mealMeta: Record<string, { icon: string; color: string }> = {
                      breakfast: { icon: '\u{1F305}', color: 'text-amber-400' },
                      lunch: { icon: '\u2600\uFE0F', color: 'text-yellow-400' },
                      dinner: { icon: '\u{1F319}', color: 'text-indigo-400' },
                      snack: { icon: '\u{1F34E}', color: 'text-green-400' },
                    };
                    return (
                      <div key={meal}>
                        <button
                          onClick={() => setProteinMealExpanded(p => ({ ...p, [meal]: !isExpanded }))}
                          className="flex items-center gap-2 w-full text-left py-1"
                        >
                          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown size={12} className={mealMeta[meal]?.color} />
                          </motion.div>
                          <span className={`text-xs font-medium capitalize ${mealMeta[meal]?.color}`}>{mealMeta[meal]?.icon} {meal}</span>
                          <span className="text-[10px] text-muted-foreground/50">{proteinData.mealDistribution[meal]}g target</span>
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-1.5 pl-4 pt-1">
                                {foods.map((food: any, fi: number) => (
                                  <div key={fi} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-accent/30">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-foreground font-medium">{food.name}</p>
                                      <p className="text-[10px] text-muted-foreground/60">{food.serving} · {food.frequency}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 ml-2">
                                      <div className="text-right">
                                        <p className="text-xs font-bold text-blue-400">{food.proteinG}g</p>
                                        <p className="text-[10px] text-muted-foreground/50">{food.calories} cal</p>
                                      </div>
                                      <div className="flex gap-0.5">
                                        {Array.from({ length: 5 }, (_, i) => (
                                          <div key={i} className={`w-1 h-3 rounded-full ${i < (6 - food.affordability) ? 'bg-green-400' : 'bg-accent/30'}`} />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Affordable Daily Sources */}
              <GlassCard className="p-3">
                <button
                  onClick={() => setProteinAffordableExpanded(!proteinAffordableExpanded)}
                  className="flex items-center gap-2 w-full text-left mb-2"
                >
                  <Flame size={14} className="text-amber-400" />
                  <span className="text-xs font-medium text-amber-400">Affordable Daily Sources</span>
                  <span className="text-[10px] text-muted-foreground/50">{proteinData.affordableSources.length} foods</span>
                  <motion.div animate={{ rotate: proteinAffordableExpanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="ml-auto">
                    <ChevronDown size={12} className="text-muted-foreground/50" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {proteinAffordableExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {proteinData.affordableSources.map((food: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-accent/20">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-foreground">{food.name}</p>
                              <p className="text-[10px] text-muted-foreground/50">{food.serving}</p>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <p className="text-xs font-bold text-blue-400">{food.proteinG}g</p>
                              <p className="text-[10px] text-muted-foreground/50">{food.calories} cal</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>

              {/* Safety Notes */}
              {proteinData.safetyNotes && proteinData.safetyNotes.length > 0 && (
                <GlassCard className="p-3 border-amber-500/20">
                  <button
                    onClick={() => setProteinSafetyExpanded(!proteinSafetyExpanded)}
                    className="flex items-center gap-2 w-full text-left mb-2"
                  >
                    <AlertCircle size={14} className="text-amber-400" />
                    <span className="text-xs font-medium text-amber-400">Serving Limits & Safety</span>
                    <motion.div animate={{ rotate: proteinSafetyExpanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="ml-auto">
                      <ChevronDown size={12} className="text-muted-foreground/50" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {proteinSafetyExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1.5">
                          {proteinData.safetyNotes.map((note: any, i: number) => (
                            <div key={i} className="flex items-start gap-2 py-1.5 px-2 rounded-lg bg-amber-600/5">
                              <AlertCircle size={11} className="text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs text-foreground font-medium">{note.food}</p>
                                <p className="text-[10px] text-amber-400/80">{note.note}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              )}
            </div>
          )}

          {/* Daily Log Card (grouped by category, collapsible) */}
          {(() => {
            const logsForDay = selectedNutritionDate === today ? foodLogs : (nutritionHistory[selectedNutritionDate] || []);
            const ended = isDayEndedNutrition(selectedNutritionDate);
            const isExpanded = expandedNutritionDays[selectedNutritionDate] ?? !ended;
            const dayLabel = selectedNutritionDate === today
              ? 'Today'
              : new Date(selectedNutritionDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            const dayTotals = logsForDay.reduce((acc: any, f: any) => ({
              calories: acc.calories + (f.calories || 0),
              proteinG: acc.proteinG + (f.proteinG || 0),
              carbsG:   acc.carbsG   + (f.carbsG   || 0),
              fatG:     acc.fatG     + (f.fatG     || 0),
            }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });

            return (
              <GlassCard className="overflow-hidden">
                <div
                  className="p-3 flex items-center justify-between cursor-pointer"
                  style={{ minHeight: 56 }}
                  onClick={() => setExpandedNutritionDays(prev => ({ ...prev, [selectedNutritionDate]: !isExpanded }))}
                >
                  <div className="flex items-center gap-2">
                    <Utensils size={14} className="text-amber-400" />
                    <span className="text-sm font-medium text-foreground">{dayLabel}</span>
                    <span className="text-xs text-muted-foreground">{logsForDay.length} items</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-amber-400 font-medium">{dayTotals.calories.toFixed(0)} cal</span>
                    <span className="text-[10px] text-muted-foreground">P:{dayTotals.proteinG.toFixed(0)}g C:{dayTotals.carbsG.toFixed(0)}g F:{dayTotals.fatG.toFixed(0)}g</span>
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={16} className="text-muted-foreground/50" />
                    </motion.div>
                  </div>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 border-t border-border/30 space-y-3">
                        {MEAL_CATEGORIES.map(cat => {
                          const catLogs = logsForDay.filter((f: any) => (f.mealCategory || 'snack') === cat);
                          if (catLogs.length === 0) return null;
                          const catCals = catLogs.reduce((a: number, f: any) => a + (f.calories || 0), 0);
                          return (
                            <div key={cat}>
                              <div className="flex items-center gap-2 mt-3 mb-1.5">
                                <span className="text-xs">{MEAL_CATEGORY_META[cat].icon}</span>
                                <span className={`text-xs font-medium ${MEAL_CATEGORY_META[cat].color}`}>{MEAL_CATEGORY_META[cat].label}</span>
                                <span className="text-[10px] text-muted-foreground/50">{catCals.toFixed(0)} cal</span>
                              </div>
                              <div className="space-y-1">
                                {catLogs.map((f: any) => (
                                  <div key={f.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-accent/30">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-foreground truncate">{f.mealName}</p>
                                      <p className="text-[10px] text-muted-foreground/60">{f.calories?.toFixed(0)} cal · P:{f.proteinG?.toFixed(0)}g C:{f.carbsG?.toFixed(0)}g F:{f.fatG?.toFixed(0)}g · {f.quantity}{f.quantityUnit}</p>
                                    </div>
                                    {selectedNutritionDate === today && (
                                      <button onClick={() => deleteFood(f.id)} className="text-muted-foreground/50 hover:text-red-400 ml-2 shrink-0">
                                        <Trash2 size={13} />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                        {logsForDay.length === 0 && (
                          <p className="text-xs text-muted-foreground/50 italic text-center py-4">No meals logged for this day</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            );
          })()}

          {/* Past 7 Days history */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground/50 px-1">Past 7 Days</p>
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date(); d.setDate(d.getDate() - (i + 1));
              return getLocalDateStr(d);
            }).map(dateStr => {
              const logs = nutritionHistory[dateStr] || [];
              const isExp = expandedNutritionDays[dateStr] ?? false;
              const totals = logs.reduce((acc: any, f: any) => ({
                calories: acc.calories + (f.calories || 0),
                proteinG: acc.proteinG + (f.proteinG || 0),
                carbsG:   acc.carbsG   + (f.carbsG   || 0),
                fatG:     acc.fatG     + (f.fatG     || 0),
              }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
              const label = new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

              return (
                <GlassCard key={dateStr} className="overflow-hidden">
                  <div
                    className="p-3 flex items-center justify-between cursor-pointer"
                    style={{ minHeight: 52 }}
                    onClick={() => setExpandedNutritionDays(prev => ({ ...prev, [dateStr]: !isExp }))}
                  >
                    <div className="flex items-center gap-2">
                      <Utensils size={13} className="text-muted-foreground/50" />
                      <span className="text-sm text-foreground">{label}</span>
                      {logs.length === 0 && <span className="text-xs text-muted-foreground/40 italic">No meals logged</span>}
                    </div>
                    {logs.length > 0 && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-amber-400 font-medium">{totals.calories.toFixed(0)} cal</span>
                        <span className="text-[10px] text-muted-foreground">P:{totals.proteinG.toFixed(0)}g C:{totals.carbsG.toFixed(0)}g F:{totals.fatG.toFixed(0)}g</span>
                        <motion.div animate={{ rotate: isExp ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown size={15} className="text-muted-foreground/50" />
                        </motion.div>
                      </div>
                    )}
                  </div>
                  <AnimatePresence>
                    {isExp && logs.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 border-t border-border/30 space-y-3">
                          {MEAL_CATEGORIES.map(cat => {
                            const catLogs = logs.filter((f: any) => (f.mealCategory || 'snack') === cat);
                            if (catLogs.length === 0) return null;
                            return (
                              <div key={cat}>
                                <div className="flex items-center gap-2 mt-3 mb-1.5">
                                  <span className="text-xs">{MEAL_CATEGORY_META[cat].icon}</span>
                                  <span className={`text-xs font-medium ${MEAL_CATEGORY_META[cat].color}`}>{MEAL_CATEGORY_META[cat].label}</span>
                                </div>
                                <div className="space-y-1">
                                  {catLogs.map((f: any) => (
                                    <div key={f.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-accent/30">
                                      <div>
                                        <p className="text-xs text-foreground">{f.mealName}</p>
                                        <p className="text-[10px] text-muted-foreground/60">{f.calories?.toFixed(0)} cal · P:{f.proteinG?.toFixed(0)}g C:{f.carbsG?.toFixed(0)}g F:{f.fatG?.toFixed(0)}g</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              );
            })}
          </div>

        </TabsContent>

        {/* Workouts */}
        <TabsContent value="workouts" className="space-y-4 mt-4">

          {/* Step 1: Select workout type */}
          {workoutStep === 'type' && (
            <GlassCard variant="glassmorphism" className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Select Workout Type</h3>

              {/* Date selector */}
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="date"
                  value={selectedWorkoutDate}
                  max={today}
                  onChange={e => {
                    setSelectedWorkoutDate(e.target.value);
                    if (e.target.value !== today && !workoutHistory[e.target.value]) {
                      fetchWorkoutForDate(e.target.value);
                    }
                  }}
                  className="bg-accent border border-border text-foreground rounded-md px-3 py-1.5 text-sm"
                />
                {selectedWorkoutDate !== today && (
                  <button onClick={() => setSelectedWorkoutDate(today)} className="text-xs text-blue-400 hover:underline">Back to today</button>
                )}
              </div>

              {/* Workout type grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {WEIGHT_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => { setSelectedWorkoutType(type); setWorkoutStep('log'); setEstimatedBurn(null); }}
                    className="p-3 rounded-xl bg-accent border border-border hover:border-blue-500/40 hover:bg-blue-600/10 transition-all text-left"
                  >
                    <p className="text-sm font-medium text-foreground">{type}</p>
                    {type === 'Weight Training' && (
                      <p className="text-[10px] text-blue-400 mt-0.5">Sets · Reps · Load</p>
                    )}
                  </button>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Step 2: Log the workout (dynamic based on type) */}
          {workoutStep === 'log' && (
            <GlassCard variant="glassmorphism" className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setWorkoutStep('type')} className="text-muted-foreground hover:text-foreground">
                  <ChevronLeft size={18} />
                </button>
                <h3 className="text-sm font-medium text-foreground">{selectedWorkoutType}</h3>
                <span className="text-xs text-muted-foreground ml-auto">{selectedWorkoutDate === today ? 'Today' : selectedWorkoutDate}</span>
              </div>

              {/* Weight Training: muscle group + sets/reps/load */}
              {selectedWorkoutType === 'Weight Training' && (
                <div className="space-y-3 mb-3">
                  <div>
                    <Label className="text-muted-foreground text-xs mb-1.5 block">Muscle Group</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {MUSCLE_GROUPS.map(mg => (
                        <button
                          key={mg}
                          onClick={() => setMuscleGroup(mg)}
                          className={`text-xs px-3 py-1 rounded-full border transition-all ${
                            muscleGroup === mg
                              ? 'bg-blue-600/30 border-blue-500/50 text-blue-300'
                              : 'bg-accent border-border text-muted-foreground hover:border-blue-500/30'
                          }`}
                        >
                          {MUSCLE_GROUP_META[mg].icon} {MUSCLE_GROUP_META[mg].label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-muted-foreground text-xs mb-1 block">Sets</Label>
                      <Input type="number" value={workoutSets} onChange={e => setWorkoutSets(e.target.value)} placeholder="e.g. 4" className="bg-accent border-border text-foreground" />
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs mb-1 block">Reps</Label>
                      <Input type="number" value={workoutReps} onChange={e => setWorkoutReps(e.target.value)} placeholder="e.g. 10" className="bg-accent border-border text-foreground" />
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs mb-1 block">Load ({weightUnit})</Label>
                      <Input type="number" value={workoutLoad} onChange={e => setWorkoutLoad(e.target.value)} placeholder="e.g. 80" className="bg-accent border-border text-foreground" />
                    </div>
                  </div>
                </div>
              )}

              {/* Duration (all types) */}
              <div className="mb-3">
                <Label className="text-muted-foreground text-xs mb-1 block">Duration (min)</Label>
                <Input type="number" value={workoutDuration} onChange={e => setWorkoutDuration(e.target.value)} placeholder="e.g. 45" className="bg-accent border-border text-foreground" />
              </div>

              {/* AI burn estimate (all types) */}
              <Button onClick={estimateBurn} disabled={aiBurnEstimating} variant="ghost" className="text-purple-400 border border-purple-500/20 w-full mb-2">
                {aiBurnEstimating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
                AI Estimate Calories Burned
              </Button>
              {estimatedBurn && (
                <p className="text-sm text-amber-300 mb-2">~{estimatedBurn.estimatedCalories?.toFixed(0)} cal burned</p>
              )}

              <Button onClick={addWorkout} className="gradient-blue w-full">Log Workout</Button>
            </GlassCard>
          )}

          {/* Daily workout log card (same collapsible pattern as nutrition) */}
          {(() => {
            const logsForDay = selectedWorkoutDate === today ? workouts : (workoutHistory[selectedWorkoutDate] || []);
            const ended = selectedWorkoutDate < today;
            const isExpanded = expandedWorkoutDays[selectedWorkoutDate] ?? !ended;
            const dayLabel = selectedWorkoutDate === today ? 'Today' : new Date(selectedWorkoutDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            const totalCal = logsForDay.reduce((a: number, w: any) => a + (w.estimatedCalories || 0), 0);
            const totalMin = logsForDay.reduce((a: number, w: any) => a + (w.duration || 0), 0);

            return (
              <GlassCard className="overflow-hidden">
                <div
                  className="p-3 flex items-center justify-between cursor-pointer"
                  style={{ minHeight: 56 }}
                  onClick={() => setExpandedWorkoutDays(prev => ({ ...prev, [selectedWorkoutDate]: !isExpanded }))}
                >
                  <div className="flex items-center gap-2">
                    <Dumbbell size={14} className="text-blue-400" />
                    <span className="text-sm font-medium text-foreground">{dayLabel}</span>
                    <span className="text-xs text-muted-foreground">{logsForDay.length} workouts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-amber-400 font-medium">{totalCal.toFixed(0)} cal</span>
                    <span className="text-[10px] text-muted-foreground">{totalMin}min</span>
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={16} className="text-muted-foreground/50" />
                    </motion.div>
                  </div>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 border-t border-border/30 space-y-2 pt-2">
                        {logsForDay.length === 0 && (
                          <p className="text-xs text-muted-foreground/50 italic text-center py-3">No workouts logged</p>
                        )}
                        {logsForDay.map((w: any) => (
                          <div key={w.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-accent/30">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground">{w.workoutType}</p>
                              <p className="text-[10px] text-muted-foreground/60">
                                {w.duration}min · {w.estimatedCalories?.toFixed(0)} cal
                                {w.workoutType === 'Weight Training' && w.sets && ` · ${w.sets}×${w.reps} @ ${w.loadKg}kg`}
                                {w.workoutType === 'Weight Training' && w.muscleGroup && ` · ${MUSCLE_GROUP_META[w.muscleGroup]?.label || w.muscleGroup}`}
                              </p>
                            </div>
                            {selectedWorkoutDate === today && (
                              <button onClick={() => deleteWorkout(w.id)} className="text-muted-foreground/50 hover:text-red-400 ml-2 shrink-0">
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            );
          })()}

          {/* Past 7 days workout history */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground/50 px-1">Past 7 Days</p>
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date(); d.setDate(d.getDate() - (i + 1));
              return getLocalDateStr(d);
            }).map(dateStr => {
              const logs = workoutHistory[dateStr] || [];
              const isExp = expandedWorkoutDays[dateStr] ?? false;
              const totalC = logs.reduce((a: number, w: any) => a + (w.estimatedCalories || 0), 0);
              const totalM = logs.reduce((a: number, w: any) => a + (w.duration || 0), 0);
              const label = new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

              return (
                <GlassCard key={dateStr} className="overflow-hidden">
                  <div
                    className="p-3 flex items-center justify-between cursor-pointer"
                    style={{ minHeight: 52 }}
                    onClick={() => setExpandedWorkoutDays(prev => ({ ...prev, [dateStr]: !isExp }))}
                  >
                    <div className="flex items-center gap-2">
                      <Dumbbell size={13} className="text-muted-foreground/50" />
                      <span className="text-sm text-foreground">{label}</span>
                      {logs.length === 0 && <span className="text-xs text-muted-foreground/40 italic">No workouts</span>}
                    </div>
                    {logs.length > 0 && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-amber-400 font-medium">{totalC.toFixed(0)} cal</span>
                        <span className="text-[10px] text-muted-foreground">{totalM}min · {logs.length} sessions</span>
                        <motion.div animate={{ rotate: isExp ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown size={15} className="text-muted-foreground/50" />
                        </motion.div>
                      </div>
                    )}
                  </div>
                  <AnimatePresence>
                    {isExp && logs.length > 0 && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="px-3 pb-3 border-t border-border/30 space-y-1 pt-2">
                          {logs.map((w: any) => (
                            <div key={w.id} className="py-1.5 px-2 rounded-lg bg-accent/30">
                              <p className="text-xs font-medium text-foreground">{w.workoutType}</p>
                              <p className="text-[10px] text-muted-foreground/60">
                                {w.duration}min · {w.estimatedCalories?.toFixed(0)} cal
                                {w.workoutType === 'Weight Training' && w.sets && ` · ${w.sets}×${w.reps} @ ${w.loadKg}kg`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              );
            })}
          </div>

        </TabsContent>

        {/* Progress */}
        <TabsContent value="progress" className="space-y-4 mt-4">
          <GlassCard className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('fitness.logWeight')}</h3>
            <div className="flex gap-2">
              <Input type="number" value={weightValue} onChange={e => setWeightValue(e.target.value)} placeholder={`Weight (${weightUnit})`} className="bg-accent border-border text-foreground" />
              <Button onClick={addWeight} className="gradient-blue">{t('common.add')}</Button>
            </div>
            <p className="text-[10px] text-muted-foreground/50 mt-1">Targets auto-recalculate when weight changes</p>
          </GlassCard>

          {/* Workout Calories Trend Chart */}
          {workoutChartArr.length >= 1 && (
            <GlassCard variant="glowing" className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={16} className="text-red-400" />
                <h3 className="text-sm font-medium text-muted-foreground">Workout Calories Trend</h3>
              </div>
              <WorkoutChart data={workoutChartArr} />
            </GlassCard>
          )}

          {/* Calorie Balance Chart */}
          {(() => {
            // Only show if user has a fitness profile with calorie targets
            if (!fitnessProfile && !currentRequiredCal) return null;
            const calorieChartData = weekDates.slice().reverse().map(dateStr => {
              const logs = dateStr === today ? foodLogs : (nutritionHistory[dateStr] || []);
              const dayWorkouts = allWorkoutsDeduped.filter((w: any) => {
                if (!w.date) return false;
                const wDate = typeof w.date === 'string' ? w.date.split('T')[0] : getLocalDateStr(new Date(w.date));
                return wDate === dateStr;
              });
              const consumed = logs.reduce((a: number, f: any) => a + (f.calories || 0), 0);
              const burned = dayWorkouts.reduce((a: number, w: any) => a + (w.estimatedCalories || 0), 0);
              const balance = (currentRequiredCal || 0) - consumed + burned;
              return { date: dateStr.slice(5), consumed, burned, balance };
            });
            const hasAnyData = calorieChartData.some(d => d.consumed > 0 || d.burned > 0);
            const todayData = calorieChartData.find(d => d.date === today.slice(5));
            const todayBalance = todayData ? todayData.balance : (currentRequiredCal || 0);
            if (!hasAnyData) {
              return (
                <GlassCard variant="glowing" className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame size={16} className="text-amber-400" />
                    <h3 className="text-sm font-medium text-muted-foreground">Calorie Balance (7 Days)</h3>
                  </div>
                  {/* Today's Balance Summary */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 rounded-lg bg-accent/30">
                      <p className="text-xs text-muted-foreground/70">Required</p>
                      <p className="text-sm font-bold text-blue-400">{currentRequiredCal || 0}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-accent/30">
                      <p className="text-xs text-muted-foreground/70">Consumed</p>
                      <p className="text-sm font-bold text-amber-400">{todayData?.consumed || 0}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-accent/30">
                      <p className="text-xs text-muted-foreground/70">Remaining</p>
                      <p className={`text-sm font-bold ${todayBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{todayBalance}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground/50 text-center py-2">Log food or workouts to see your calorie balance trend</p>
                </GlassCard>
              );
            }
            return (
              <GlassCard variant="glowing" className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Flame size={16} className="text-amber-400" />
                  <h3 className="text-sm font-medium text-muted-foreground">Calorie Balance (7 Days)</h3>
                </div>
                {/* Today's Balance Summary */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 rounded-lg bg-accent/30">
                    <p className="text-xs text-muted-foreground/70">Required</p>
                    <p className="text-sm font-bold text-blue-400">{currentRequiredCal || 0}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-accent/30">
                    <p className="text-xs text-muted-foreground/70">Consumed</p>
                    <p className="text-sm font-bold text-amber-400">{todayData?.consumed || 0}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-accent/30">
                    <p className="text-xs text-muted-foreground/70">Remaining</p>
                    <p className={`text-sm font-bold ${todayBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{todayBalance}</p>
                  </div>
                </div>
                <CalorieChart data={calorieChartData} />
              </GlassCard>
            );
          })()}

          {/* Weight Log List with Delete */}
          <div className="space-y-2">{weightLogs.slice().reverse().slice(0, 20).map((w: any) => <GlassCard key={w.id} className="p-3 flex items-center justify-between"><div><p className="text-sm text-foreground">{w.weight} kg</p><p className="text-[10px] text-muted-foreground/70">{w.date}</p></div><button onClick={() => deleteWeight(w.id)} className="text-muted-foreground/50 hover:text-red-400"><Trash2 size={14} /></button></GlassCard>)}</div>
        </TabsContent>

        {/* AI Coach */}
        <TabsContent value="aiCoach" className="space-y-4 mt-4">
          <GlassCard variant="glowing" className="p-4 h-[500px] flex flex-col">
            <div className="flex items-center gap-2 mb-3"><Bot size={18} className="text-purple-400" /><span className="text-sm font-medium text-foreground">{t('fitness.aiCoach')}</span><button onClick={startNewChat} className="ml-auto text-xs text-muted-foreground hover:text-blue-400 flex items-center gap-1"><Plus size={12} />New Chat</button></div>
            <div className="flex-1 overflow-y-auto space-y-3 mb-3">
              {chatMessages.map((msg, i) => <div key={i} className={`flex items-end ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>{msg.role === 'assistant' && <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mr-1.5 shadow-md shadow-violet-500/20"><Bot size={11} className="text-white" /></div>}<div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-md' : 'bg-gradient-to-br from-violet-600/20 to-indigo-600/10 dark:from-violet-500/25 dark:to-indigo-500/15 text-foreground rounded-bl-md border border-violet-400/20 dark:border-violet-400/30'}`}>{msg.role === 'assistant' ? <AIMessage content={msg.content} /> : msg.content}</div></div>)}
              {chatLoading && <div className="flex justify-start items-end"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mr-1.5 shadow-md shadow-violet-500/20"><Bot size={11} className="text-white" /></div><div className="bg-gradient-to-br from-violet-600/20 to-indigo-600/10 dark:from-violet-500/25 dark:to-indigo-500/15 rounded-2xl px-4 py-2 text-sm text-muted-foreground border border-violet-400/20 dark:border-violet-400/30">{t('ai.thinking')}</div></div>}
            </div>
            <div className="flex gap-2"><Input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder={t('ai.askAnything')} className="bg-accent border-border text-foreground" /><Button onClick={sendChat} className="gradient-blue shrink-0" disabled={chatLoading}><Send size={16} /></Button></div>
          </GlassCard>
        </TabsContent>

        {/* Ad — at the very bottom of all tab content */}
        <div className="pt-4">
          <AdCard format="in-feed" slot="fitness_bottom" />
        </div>
      </Tabs>
    </div>
  );
}
