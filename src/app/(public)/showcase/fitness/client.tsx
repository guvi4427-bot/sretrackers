'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Dumbbell, Utensils, Scale, Flame, TrendingUp, Clock,
  Heart, Zap, Target, ChevronRight, Activity, Apple,
  Trophy, Calendar, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';

const DEMO_WORKOUTS = [
  { id: 1, name: 'Morning Push Day', type: 'Strength', duration: 45, calories: 320, exercises: ['Bench Press', 'Shoulder Press', 'Tricep Dips', 'Cable Flyes'], date: 'Today', xp: 25 },
  { id: 2, name: 'HIIT Cardio Blast', type: 'Cardio', duration: 30, calories: 410, exercises: ['Burpees', 'Mountain Climbers', 'Jump Squats', 'High Knees'], date: 'Yesterday', xp: 20 },
  { id: 3, name: 'Leg Day Power', type: 'Strength', duration: 55, calories: 380, exercises: ['Squats', 'Deadlifts', 'Leg Press', 'Calf Raises'], date: '2 days ago', xp: 30 },
  { id: 4, name: 'Yoga Flow', type: 'Flexibility', duration: 40, calories: 150, exercises: ['Sun Salutations', 'Warrior Poses', 'Tree Pose', 'Savasana'], date: '3 days ago', xp: 15 },
];

const DEMO_MEALS = [
  { id: 1, name: 'Protein Oatmeal Bowl', meal: 'Breakfast', calories: 420, protein: 32, carbs: 54, fat: 12, time: '7:30 AM' },
  { id: 2, name: 'Grilled Chicken Salad', meal: 'Lunch', calories: 380, protein: 42, carbs: 18, fat: 14, time: '12:15 PM' },
  { id: 3, name: 'Whey Protein Shake', meal: 'Snack', calories: 180, protein: 30, carbs: 8, fat: 4, time: '3:00 PM' },
  { id: 4, name: 'Salmon with Brown Rice', meal: 'Dinner', calories: 520, protein: 38, carbs: 48, fat: 16, time: '7:00 PM' },
];

const DEMO_WEIGHT = [
  { date: 'Week 1', weight: 82.5 },
  { date: 'Week 2', weight: 82.1 },
  { date: 'Week 3', weight: 81.7 },
  { date: 'Week 4', weight: 81.3 },
  { date: 'Week 5', weight: 80.9 },
  { date: 'Week 6', weight: 80.4 },
  { date: 'Week 7', weight: 80.0 },
  { date: 'Week 8', weight: 79.6 },
];

const DEMO_STATS = {
  totalWorkouts: 47,
  weeklyStreak: 4,
  totalCaloriesBurned: 14280,
  avgWorkoutDuration: 42,
  currentWeight: 79.6,
  goalWeight: 75,
  weeklyXP: 145,
  totalXP: 2840,
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function FitnessShowcaseClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/80 to-slate-100 dark:from-[#0A0F1E] dark:to-[#0F1A2E] relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div {...fadeIn} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
            <Dumbbell size={14} /> Demo Preview
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Fitness Tracker
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Track workouts, log meals, monitor your weight, and earn XP for staying healthy. The {SITE_NAME} fitness dashboard turns your health journey into a gamified experience — every rep counts, every meal matters, and consistency is rewarded.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Workouts', value: DEMO_STATS.totalWorkouts, icon: Dumbbell, color: 'text-emerald-400', bg: 'bg-emerald-600/10' },
            { label: 'Week Streak', value: DEMO_STATS.weeklyStreak, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-600/10' },
            { label: 'Calories Burned', value: `${(DEMO_STATS.totalCaloriesBurned / 1000).toFixed(1)}k`, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-600/10' },
            { label: 'Fitness XP', value: DEMO_STATS.totalXP, icon: Trophy, color: 'text-blue-400', bg: 'bg-blue-600/10' },
          ].map((stat) => (
            <GlassCard key={stat.label} variant="default" className="p-4 text-center">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </GlassCard>
          ))}
        </motion.div>

        {/* Weight Progress */}
        <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="mb-8">
          <GlassCard variant="glassmorphism" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Scale size={18} className="text-emerald-400" />
                <h2 className="text-lg font-semibold text-foreground">Weight Progress</h2>
              </div>
              <span className="text-xs text-muted-foreground">Goal: {DEMO_STATS.goalWeight} kg</span>
            </div>
            <div className="flex items-end gap-2 h-32 mb-2">
              {DEMO_WEIGHT.map((entry, i) => {
                const minW = 79;
                const maxW = 83;
                const pct = ((entry.weight - minW) / (maxW - minW)) * 100;
                return (
                  <div key={entry.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{entry.weight}</span>
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all"
                      style={{ height: `${Math.max(10, 100 - pct)}%` }}
                    />
                    <span className="text-[9px] text-muted-foreground/60">W{i + 1}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">-2.9 kg in 8 weeks</span>
              <span className="text-xs text-muted-foreground ml-2">On track to goal!</span>
            </div>
          </GlassCard>
        </motion.div>

        {/* Workouts Section */}
        <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Activity size={18} className="text-emerald-400" /> Recent Workouts
            </h2>
            <span className="text-xs text-muted-foreground">Demo data</span>
          </div>
          <div className="space-y-3">
            {DEMO_WORKOUTS.map((workout) => (
              <GlassCard key={workout.id} variant="default" hoverGlow="xp" className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        workout.type === 'Strength' ? 'bg-blue-600/15 text-blue-400' :
                        workout.type === 'Cardio' ? 'bg-rose-600/15 text-rose-400' :
                        'bg-purple-600/15 text-purple-400'
                      }`}>{workout.type}</span>
                      <span className="text-[10px] text-muted-foreground/50">{workout.date}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">{workout.name}</h3>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {workout.exercises.map((ex) => (
                        <span key={ex} className="text-[10px] px-2 py-0.5 rounded bg-accent/50 text-muted-foreground">{ex}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Clock size={12} /> {workout.duration} min
                    </div>
                    <div className="flex items-center gap-1 text-xs text-orange-400">
                      <Flame size={12} /> {workout.calories} cal
                    </div>
                    <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                      <Zap size={12} /> +{workout.xp} XP
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Meals Section */}
        <motion.div {...fadeIn} transition={{ delay: 0.25 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Apple size={18} className="text-green-400" /> Today&apos;s Meals
            </h2>
            <span className="text-xs text-muted-foreground">1,500 / 2,100 cal</span>
          </div>
          <GlassCard variant="default" className="p-4 mb-3">
            <div className="w-full h-3 rounded-full bg-accent/30 overflow-hidden mb-3">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: '71%' }} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-sm font-bold text-blue-400">142g</p>
                <p className="text-[10px] text-muted-foreground">Protein</p>
              </div>
              <div>
                <p className="text-sm font-bold text-amber-400">128g</p>
                <p className="text-[10px] text-muted-foreground">Carbs</p>
              </div>
              <div>
                <p className="text-sm font-bold text-rose-400">46g</p>
                <p className="text-[10px] text-muted-foreground">Fat</p>
              </div>
            </div>
          </GlassCard>
          <div className="space-y-2">
            {DEMO_MEALS.map((meal) => (
              <GlassCard key={meal.id} variant="sm" className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/10 flex items-center justify-center">
                      <Utensils size={14} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{meal.name}</p>
                      <p className="text-[10px] text-muted-foreground">{meal.meal} · {meal.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-foreground">{meal.calories} cal</p>
                    <p className="text-[10px] text-muted-foreground">P:{meal.protein}g C:{meal.carbs}g F:{meal.fat}g</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Features Highlight */}
        <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="mb-8">
          <GlassCard variant="liquid" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Target size={18} className="text-emerald-400" /> What You Get
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Dumbbell, title: 'Workout Logging', desc: 'Track exercises, sets, reps, and duration for every session.' },
                { icon: Utensils, title: 'Meal Tracking', desc: 'Log meals with macros — protein, carbs, and fat breakdowns.' },
                { icon: Scale, title: 'Weight Progress', desc: 'Visualize weight trends over weeks with goal tracking.' },
                { icon: Zap, title: 'XP Rewards', desc: 'Earn XP for workouts and healthy meals to level up your fitness.' },
                { icon: Heart, title: 'Health Insights', desc: 'AI-powered calorie burn estimates and daily ratings.' },
                { icon: Calendar, title: 'Consistency Streaks', desc: 'Build workout streaks and maintain weekly consistency.' },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3 p-3 rounded-xl bg-accent/20">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/10 flex items-center justify-center shrink-0">
                    <f.icon size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{f.title}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeIn} transition={{ delay: 0.35 }}>
          <GlassCard variant="glowing" className="p-6 text-center">
            <CheckCircle2 size={28} className="mx-auto mb-3 text-emerald-400" />
            <h2 className="text-xl font-bold text-foreground mb-2">Start Tracking Your Fitness</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Join {SITE_NAME} for free and turn your fitness journey into an adventure. Log workouts, track meals, earn XP, and watch your progress soar.
            </p>
            <Button onClick={() => router.push('/signup')} className="gradient-blue">
              Get Started Free <ArrowRight size={14} className="ml-1" />
            </Button>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <button onClick={() => router.push('/features/learning')} className="hover:text-foreground transition-colors flex items-center gap-1">
                Learning Tracker <ChevronRight size={12} />
              </button>
              <button onClick={() => router.push('/showcase/gamification')} className="hover:text-foreground transition-colors flex items-center gap-1">
                Gamification Demo <ChevronRight size={12} />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
