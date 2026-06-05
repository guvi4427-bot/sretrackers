'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MacroBarProps {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar?: number; // kept for backward compatibility but not rendered
  proteinGoal?: number;
  carbsGoal?: number;
  fatGoal?: number;
  fiberGoal?: number;
  sugarGoal?: number; // kept for backward compatibility but not rendered
}

interface SingleMacroProps {
  label: string;
  value: number;
  goal: number;
  color: string;
  unit?: string;
}

function SingleMacro({ label, value, goal, color, unit = 'g' }: SingleMacroProps) {
  const progress = goal > 0 ? Math.min(value / goal, 1) : 0;
  const displayValue = Math.round(value * 100) / 100;
  const displayGoal = Math.round(goal * 100) / 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/60">{label}</span>
        <span className="tabular-nums text-white/80">
          {displayValue}
          {unit}
          <span className="text-white/30"> / {displayGoal}{unit}</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export function MacroBar({
  protein,
  carbs,
  fat,
  fiber,
  proteinGoal = 150,
  carbsGoal = 300,
  fatGoal = 65,
  fiberGoal = 30,
}: MacroBarProps) {
  return (
    <div className="space-y-3">
      <SingleMacro label="Protein" value={protein} goal={proteinGoal} color="#2563EB" />
      <SingleMacro label="Carbs" value={carbs} goal={carbsGoal} color="#F59E0B" />
      <SingleMacro label="Fat" value={fat} goal={fatGoal} color="#EF4444" />
      <SingleMacro label="Fiber" value={fiber} goal={fiberGoal} color="#10B981" />
    </div>
  );
}
