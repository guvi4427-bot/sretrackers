// XP rewards by activity type
export const XP_REWARDS = {
  learning: 10,
  workout: 15,
  meal: 5,
  focus: 20,
  content: 10,
  social: 5,
  quest: 15,
  daily_log: 10,
  task: 20,
} as const;

// Level thresholds: level -> XP needed to reach that level
export function getXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    if (i <= 4) total += 300;
    else if (i <= 9) total += 600;
    else if (i <= 19) total += 1000;
    else total += 2000;
  }
  return total;
}

export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel <= 4) return 300;
  if (currentLevel <= 9) return 600;
  if (currentLevel <= 19) return 1000;
  return 2000;
}

export function calculateLevel(totalXP: number): number {
  let level = 1;
  let remaining = totalXP;
  while (remaining > 0) {
    const needed = getXPForNextLevel(level);
    if (remaining < needed) break;
    remaining -= needed;
    level++;
  }
  return level;
}

export function getLevelProgress(totalXP: number): { level: number; currentXP: number; xpNeeded: number; progress: number } {
  const level = calculateLevel(totalXP);
  const currentLevelXP = getXPForLevel(level);
  const currentXP = totalXP - currentLevelXP;
  const xpNeeded = getXPForNextLevel(level);
  const progress = xpNeeded > 0 ? currentXP / xpNeeded : 0;
  return { level, currentXP, xpNeeded, progress };
}

// Phase definitions
export const PHASES = {
  start: { name: "Start", color: "#2563EB", icon: "Rocket", description: "Beginning your journey" },
  restart: { name: "Restart", color: "#F59E0B", icon: "RotateCcw", description: "Getting back on track" },
  explore: { name: "Explore", color: "#8B5CF6", icon: "Compass", description: "Discovering new paths" },
} as const;

// Phase-activity mapping
export const PHASE_ACTIVITY_MAP: Record<string, string[]> = {
  start: ["study_basics", "build_habits", "first_workout", "track_progress"],
  restart: ["review_progress", "set_new_goals", "refresh_routine", "recommit"],
  explore: ["new_skill", "creative_project", "community_engage", "teach_others"],
};

// Criteria type for programmatic eligibility checking
export interface AchievementCriteria {
  type: string;   // e.g. "learning_entries", "fitness_workouts"
  value: number;  // threshold
}

export interface AchievementDef {
  key: string;
  name: string;
  description: string;
  iconEmoji: string;
  xpReward: number;
  tier: string;
  category: string;
  criteria: AchievementCriteria;
}

// ~90 Achievements across 4 categories: learning, fitness, time, content
// Duplicate streak/level/xp achievements have been consolidated (kept one set per type)
// Plus content live status achievements
export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  // ═══════════════════════════════════════════════
  // LEARNING ACHIEVEMENTS (25)
  // ═══════════════════════════════════════════════
  { key: "learn_first_entry", name: "First Step", description: "Log your first learning entry", iconEmoji: "📝", xpReward: 15, tier: "bronze", category: "learning", criteria: { type: "learning_entries", value: 1 } },
  { key: "learn_five_entries", name: "Curious Mind", description: "Log 5 learning entries", iconEmoji: "📖", xpReward: 25, tier: "bronze", category: "learning", criteria: { type: "learning_entries", value: 5 } },
  { key: "learn_ten_entries", name: "Knowledge Seeker", description: "Log 10 learning entries", iconEmoji: "📚", xpReward: 50, tier: "silver", category: "learning", criteria: { type: "learning_entries", value: 10 } },
  { key: "learn_twenty_entries", name: "Bookworm", description: "Log 20 learning entries", iconEmoji: "📗", xpReward: 75, tier: "silver", category: "learning", criteria: { type: "learning_entries", value: 20 } },
  { key: "learn_fifty_entries", name: "Scholar", description: "Log 50 learning entries", iconEmoji: "🎓", xpReward: 100, tier: "gold", category: "learning", criteria: { type: "learning_entries", value: 50 } },
  { key: "learn_hundred_entries", name: "Encyclopedia", description: "Log 100 learning entries", iconEmoji: "🏛️", xpReward: 200, tier: "platinum", category: "learning", criteria: { type: "learning_entries", value: 100 } },
  { key: "learn_first_topic", name: "Topic Starter", description: "Create your first topic", iconEmoji: "💡", xpReward: 10, tier: "bronze", category: "learning", criteria: { type: "learning_topics", value: 1 } },
  { key: "learn_five_topics", name: "Topic Explorer", description: "Create 5 topics", iconEmoji: "🔍", xpReward: 25, tier: "bronze", category: "learning", criteria: { type: "learning_topics", value: 5 } },
  { key: "learn_ten_topics", name: "Subject Master", description: "Create 10 topics", iconEmoji: "🧠", xpReward: 50, tier: "silver", category: "learning", criteria: { type: "learning_topics", value: 10 } },
  { key: "learn_twenty_topics", name: "Polymath", description: "Create 20 topics", iconEmoji: "🌐", xpReward: 100, tier: "gold", category: "learning", criteria: { type: "learning_topics", value: 20 } },
  { key: "learn_notes_five", name: "Note Taker", description: "Write notes in 5 entries", iconEmoji: "✏️", xpReward: 20, tier: "bronze", category: "learning", criteria: { type: "learning_notes", value: 5 } },
  { key: "learn_notes_twenty", name: "Detailed Scholar", description: "Write notes in 20 entries", iconEmoji: "📋", xpReward: 50, tier: "silver", category: "learning", criteria: { type: "learning_notes", value: 20 } },
  { key: "learn_notes_fifty", name: "Chronicler", description: "Write notes in 50 entries", iconEmoji: "📜", xpReward: 100, tier: "gold", category: "learning", criteria: { type: "learning_notes", value: 50 } },
  { key: "learn_hour", name: "Hour Learner", description: "Log 60+ minutes total study time", iconEmoji: "⏱️", xpReward: 20, tier: "bronze", category: "learning", criteria: { type: "learning_duration", value: 60 } },
  { key: "learn_five_hours", name: "Dedicated Student", description: "Log 5+ hours total study time", iconEmoji: "⏳", xpReward: 50, tier: "silver", category: "learning", criteria: { type: "learning_duration", value: 300 } },
  { key: "learn_day", name: "Full Day Scholar", description: "Log 24+ hours total study time", iconEmoji: "📅", xpReward: 100, tier: "gold", category: "learning", criteria: { type: "learning_duration", value: 1440 } },
  { key: "learn_week", name: "Week Scholar", description: "Log 168+ hours total study time", iconEmoji: "🗓️", xpReward: 200, tier: "platinum", category: "learning", criteria: { type: "learning_duration", value: 10080 } },
  { key: "learn_shared_topic", name: "Sharing Knowledge", description: "Share 1 topic publicly", iconEmoji: "🌍", xpReward: 20, tier: "bronze", category: "learning", criteria: { type: "learning_shared", value: 1 } },
  { key: "learn_five_shared", name: "Knowledge Sharer", description: "Share 5 topics publicly", iconEmoji: "🤝", xpReward: 50, tier: "silver", category: "learning", criteria: { type: "learning_shared", value: 5 } },
  { key: "learn_streak_3", name: "Consistent Learner", description: "Maintain 3-day learning streak", iconEmoji: "🔥", xpReward: 25, tier: "bronze", category: "learning", criteria: { type: "streak", value: 3 } },
  { key: "learn_streak_7", name: "Weekly Scholar", description: "Maintain 7-day learning streak", iconEmoji: "🔥", xpReward: 50, tier: "silver", category: "learning", criteria: { type: "streak", value: 7 } },
  { key: "learn_streak_30", name: "Monthly Master", description: "Maintain 30-day learning streak", iconEmoji: "🔥", xpReward: 200, tier: "gold", category: "learning", criteria: { type: "streak", value: 30 } },
  { key: "learn_deep_dive", name: "Deep Diver", description: "Log 10 entries in a single topic", iconEmoji: "🤿", xpReward: 75, tier: "silver", category: "learning", criteria: { type: "learning_deep_topic", value: 10 } },
  { key: "learn_level_5", name: "Rising Mind", description: "Reach Level 5", iconEmoji: "⭐", xpReward: 50, tier: "silver", category: "learning", criteria: { type: "level", value: 5 } },
  { key: "learn_level_10", name: "Enlightened", description: "Reach Level 10", iconEmoji: "🏆", xpReward: 100, tier: "gold", category: "learning", criteria: { type: "level", value: 10 } },

  // ═══════════════════════════════════════════════
  // FITNESS ACHIEVEMENTS (25)
  // ═══════════════════════════════════════════════
  { key: "fit_first_workout", name: "Gym Starter", description: "Log your first workout", iconEmoji: "💪", xpReward: 15, tier: "bronze", category: "fitness", criteria: { type: "fitness_workouts", value: 1 } },
  { key: "fit_five_workouts", name: "Regular", description: "Log 5 workouts", iconEmoji: "🏃", xpReward: 25, tier: "bronze", category: "fitness", criteria: { type: "fitness_workouts", value: 5 } },
  { key: "fit_ten_workouts", name: "Fitness Buff", description: "Log 10 workouts", iconEmoji: "🏋️", xpReward: 50, tier: "silver", category: "fitness", criteria: { type: "fitness_workouts", value: 10 } },
  { key: "fit_twenty_workouts", name: "Gym Rat", description: "Log 20 workouts", iconEmoji: "💯", xpReward: 75, tier: "silver", category: "fitness", criteria: { type: "fitness_workouts", value: 20 } },
  { key: "fit_fifty_workouts", name: "Iron Will", description: "Log 50 workouts", iconEmoji: "🦾", xpReward: 150, tier: "gold", category: "fitness", criteria: { type: "fitness_workouts", value: 50 } },
  { key: "fit_hundred_workouts", name: "Unstoppable", description: "Log 100 workouts", iconEmoji: "🏆", xpReward: 300, tier: "platinum", category: "fitness", criteria: { type: "fitness_workouts", value: 100 } },
  { key: "fit_first_meal", name: "Nutrition Starter", description: "Log your first meal", iconEmoji: "🥗", xpReward: 10, tier: "bronze", category: "fitness", criteria: { type: "fitness_meals", value: 1 } },
  { key: "fit_ten_meals", name: "Food Tracker", description: "Log 10 meals", iconEmoji: "🥦", xpReward: 25, tier: "bronze", category: "fitness", criteria: { type: "fitness_meals", value: 10 } },
  { key: "fit_fifty_meals", name: "Nutrition Pro", description: "Log 50 meals", iconEmoji: "🍎", xpReward: 50, tier: "silver", category: "fitness", criteria: { type: "fitness_meals", value: 50 } },
  { key: "fit_hundred_meals", name: "Diet Master", description: "Log 100 meals", iconEmoji: "🥇", xpReward: 100, tier: "gold", category: "fitness", criteria: { type: "fitness_meals", value: 100 } },
  { key: "fit_five_hundred_meals", name: "Nutrition Legend", description: "Log 500 meals", iconEmoji: "👑", xpReward: 200, tier: "platinum", category: "fitness", criteria: { type: "fitness_meals", value: 500 } },
  { key: "fit_first_weight", name: "Scale Starter", description: "Log your first weight entry", iconEmoji: "⚖️", xpReward: 10, tier: "bronze", category: "fitness", criteria: { type: "fitness_weights", value: 1 } },
  { key: "fit_five_weights", name: "Tracking Progress", description: "Log 5 weight entries", iconEmoji: "📊", xpReward: 20, tier: "bronze", category: "fitness", criteria: { type: "fitness_weights", value: 5 } },
  { key: "fit_ten_weights", name: "Body Tracker", description: "Log 10 weight entries", iconEmoji: "📈", xpReward: 50, tier: "silver", category: "fitness", criteria: { type: "fitness_weights", value: 10 } },
  { key: "fit_thirty_weights", name: "Data Driven", description: "Log 30 weight entries", iconEmoji: "📉", xpReward: 75, tier: "silver", category: "fitness", criteria: { type: "fitness_weights", value: 30 } },
  { key: "fit_workout_hour", name: "Sweat Hour", description: "Log 60+ minutes of workouts", iconEmoji: "💦", xpReward: 25, tier: "bronze", category: "fitness", criteria: { type: "fitness_workout_duration", value: 60 } },
  { key: "fit_workout_five_hours", name: "Endurance", description: "Log 5+ hours of workouts", iconEmoji: "🫀", xpReward: 50, tier: "silver", category: "fitness", criteria: { type: "fitness_workout_duration", value: 300 } },
  { key: "fit_workout_day", name: "Full Day Grind", description: "Log 24+ hours of workouts", iconEmoji: "💪", xpReward: 150, tier: "gold", category: "fitness", criteria: { type: "fitness_workout_duration", value: 1440 } },

  // Weight training progression achievements
  { key: "fit_wt_first_session", name: "Iron Initiate", description: "Complete your first weight training session", iconEmoji: "🏋️", xpReward: 20, tier: "bronze", category: "fitness", criteria: { type: "weight_training_sessions", value: 1 } },
  { key: "fit_wt_ten_sessions", name: "Plate Chaser", description: "Complete 10 weight training sessions", iconEmoji: "💪", xpReward: 50, tier: "bronze", category: "fitness", criteria: { type: "weight_training_sessions", value: 10 } },
  { key: "fit_wt_fifty_sessions", name: "Iron Veteran", description: "Complete 50 weight training sessions", iconEmoji: "🦾", xpReward: 150, tier: "silver", category: "fitness", criteria: { type: "weight_training_sessions", value: 50 } },
  { key: "fit_wt_load_increase", name: "Progressive Overload", description: "Increase your training load for the first time", iconEmoji: "📈", xpReward: 30, tier: "bronze", category: "fitness", criteria: { type: "weight_training_load_increase", value: 1 } },
  { key: "fit_wt_rep_increase", name: "Rep Climber", description: "Log more reps than your previous best", iconEmoji: "🔁", xpReward: 30, tier: "bronze", category: "fitness", criteria: { type: "weight_training_rep_increase", value: 1 } },
  { key: "fit_wt_set_increase", name: "Volume Builder", description: "Log more sets than your previous session", iconEmoji: "📊", xpReward: 30, tier: "bronze", category: "fitness", criteria: { type: "weight_training_set_increase", value: 1 } },
  { key: "fit_wt_intermediate", name: "Strength Forged", description: "Log 5 weight training sessions with progressive load increases", iconEmoji: "⚙️", xpReward: 100, tier: "silver", category: "fitness", criteria: { type: "weight_training_intermediate", value: 5 } },
  { key: "fit_wt_advanced", name: "Iron Sovereign", description: "Log 100 weight training sessions", iconEmoji: "👑", xpReward: 300, tier: "gold", category: "fitness", criteria: { type: "weight_training_sessions", value: 100 } },
  { key: "fit_wt_legendary", name: "Barbarian", description: "Log 200 weight training sessions", iconEmoji: "🔱", xpReward: 500, tier: "platinum", category: "fitness", criteria: { type: "weight_training_sessions", value: 200 } },

  // ═══════════════════════════════════════════════
  // TIME ACHIEVEMENTS (39)
  // ═══════════════════════════════════════════════
  { key: "time_first_focus", name: "Focus Starter", description: "Complete your first focus session", iconEmoji: "🎯", xpReward: 15, tier: "bronze", category: "time", criteria: { type: "time_focus", value: 1 } },
  { key: "time_five_focus", name: "Focus Builder", description: "Complete 5 focus sessions", iconEmoji: "🧘", xpReward: 25, tier: "bronze", category: "time", criteria: { type: "time_focus", value: 5 } },
  { key: "time_ten_focus", name: "Focus Adept", description: "Complete 10 focus sessions", iconEmoji: "⚡", xpReward: 50, tier: "silver", category: "time", criteria: { type: "time_focus", value: 10 } },
  { key: "time_twenty_focus", name: "Focus Master", description: "Complete 20 focus sessions", iconEmoji: "🧠", xpReward: 75, tier: "silver", category: "time", criteria: { type: "time_focus", value: 20 } },
  { key: "time_fifty_focus", name: "Zen Master", description: "Complete 50 focus sessions", iconEmoji: "🏔️", xpReward: 150, tier: "gold", category: "time", criteria: { type: "time_focus", value: 50 } },
  { key: "time_hundred_focus", name: "Transcendent", description: "Complete 100 focus sessions", iconEmoji: "☯️", xpReward: 300, tier: "platinum", category: "time", criteria: { type: "time_focus", value: 100 } },
  { key: "time_first_task", name: "Task Starter", description: "Complete your first task", iconEmoji: "✅", xpReward: 10, tier: "bronze", category: "time", criteria: { type: "time_tasks", value: 1 } },
  { key: "time_ten_tasks", name: "Task Manager", description: "Complete 10 tasks", iconEmoji: "📋", xpReward: 30, tier: "bronze", category: "time", criteria: { type: "time_tasks", value: 10 } },
  { key: "time_twenty_tasks", name: "Task Master", description: "Complete 20 tasks", iconEmoji: "📝", xpReward: 50, tier: "silver", category: "time", criteria: { type: "time_tasks", value: 20 } },
  { key: "time_fifty_tasks", name: "Productive Pro", description: "Complete 50 tasks", iconEmoji: "🗂️", xpReward: 75, tier: "silver", category: "time", criteria: { type: "time_tasks", value: 50 } },
  { key: "time_hundred_tasks", name: "Task Legend", description: "Complete 100 tasks", iconEmoji: "🏅", xpReward: 150, tier: "gold", category: "time", criteria: { type: "time_tasks", value: 100 } },
  { key: "time_two_hundred_tasks", name: "Productivity God", description: "Complete 200 tasks", iconEmoji: "👑", xpReward: 300, tier: "platinum", category: "time", criteria: { type: "time_tasks", value: 200 } },
  { key: "time_focus_hour", name: "Deep Worker", description: "Complete 60+ minutes total focus time", iconEmoji: "⏰", xpReward: 20, tier: "bronze", category: "time", criteria: { type: "time_focus_duration", value: 60 } },
  { key: "time_focus_five_hours", name: "Marathon Mind", description: "Complete 5+ hours total focus time", iconEmoji: "🏃‍♂️", xpReward: 50, tier: "silver", category: "time", criteria: { type: "time_focus_duration", value: 300 } },
  { key: "time_focus_day", name: "Deep Flow", description: "Complete 24+ hours total focus time", iconEmoji: "🌊", xpReward: 150, tier: "gold", category: "time", criteria: { type: "time_focus_duration", value: 1440 } },
  { key: "time_focus_week", name: "Flow State", description: "Complete 168+ hours total focus time", iconEmoji: "🌀", xpReward: 300, tier: "platinum", category: "time", criteria: { type: "time_focus_duration", value: 10080 } },
  { key: "time_level_5", name: "Time Manager", description: "Reach Level 5", iconEmoji: "⭐", xpReward: 50, tier: "silver", category: "time", criteria: { type: "level", value: 5 } },
  { key: "time_level_10", name: "Time Master", description: "Reach Level 10", iconEmoji: "🏆", xpReward: 100, tier: "gold", category: "time", criteria: { type: "level", value: 10 } },
  { key: "time_level_20", name: "Time Lord", description: "Reach Level 20", iconEmoji: "👑", xpReward: 200, tier: "platinum", category: "time", criteria: { type: "level", value: 20 } },
  { key: "time_xp_500", name: "XP Earner", description: "Earn 500 total XP", iconEmoji: "✨", xpReward: 25, tier: "bronze", category: "time", criteria: { type: "xp", value: 500 } },
  { key: "time_xp_5000", name: "XP Master", description: "Earn 5000 total XP", iconEmoji: "💫", xpReward: 100, tier: "gold", category: "time", criteria: { type: "xp", value: 5000 } },
  { key: "time_xp_50000", name: "XP Demigod", description: "Earn 50000 total XP", iconEmoji: "🌟", xpReward: 300, tier: "platinum", category: "time", criteria: { type: "xp", value: 50000 } },

  // ── Reflection & Self-Awareness Achievements ──
  { key: "time_first_reflection", name: "Honest Mirror", description: "Write your first reflection on a missed or partial task", iconEmoji: "🪞", xpReward: 15, tier: "bronze", category: "time", criteria: { type: "time_reflections", value: 1 } },
  { key: "time_five_reflections", name: "Self-Aware", description: "Write 5 reflections on missed or partial tasks", iconEmoji: "🔍", xpReward: 30, tier: "bronze", category: "time", criteria: { type: "time_reflections", value: 5 } },
  { key: "time_ten_reflections", name: "Reflective Mind", description: "Write 10 reflections on missed or partial tasks", iconEmoji: "💭", xpReward: 50, tier: "silver", category: "time", criteria: { type: "time_reflections", value: 10 } },
  { key: "time_twenty_reflections", name: "Growth Mindset", description: "Write 20 reflections — you learn from every setback", iconEmoji: "🌱", xpReward: 100, tier: "gold", category: "time", criteria: { type: "time_reflections", value: 20 } },

  // ── Tomorrow Planning Achievements ──
  { key: "time_first_tomorrow", name: "Future Planner", description: "Plan your first task for tomorrow", iconEmoji: "🌙", xpReward: 15, tier: "bronze", category: "time", criteria: { type: "time_tomorrow_tasks", value: 1 } },
  { key: "time_five_tomorrow", name: "Ahead of the Curve", description: "Plan 5 tasks for tomorrow across different days", iconEmoji: "📅", xpReward: 30, tier: "bronze", category: "time", criteria: { type: "time_tomorrow_tasks", value: 5 } },
  { key: "time_ten_tomorrow", name: "Strategic Planner", description: "Plan 10 tomorrow tasks — always one step ahead", iconEmoji: "🗓️", xpReward: 50, tier: "silver", category: "time", criteria: { type: "time_tomorrow_tasks", value: 10 } },
  { key: "time_thirty_tomorrow", name: "Visionary", description: "Plan 30 tomorrow tasks — your future self thanks you", iconEmoji: "🔭", xpReward: 100, tier: "gold", category: "time", criteria: { type: "time_tomorrow_tasks", value: 30 } },

  // ── Partial Completion Achievements ──
  { key: "time_first_partial", name: "Half Battle Won", description: "Mark your first task as partially completed", iconEmoji: "⚡", xpReward: 10, tier: "bronze", category: "time", criteria: { type: "time_partial_tasks", value: 1 } },
  { key: "time_ten_partial", name: "Progress Over Perfection", description: "Mark 10 tasks as partially completed — showing up matters", iconEmoji: "🔥", xpReward: 40, tier: "silver", category: "time", criteria: { type: "time_partial_tasks", value: 10 } },

  // ── Missed But Reflected Achievements ──
  { key: "time_missed_reflected_3", name: "Accountability Starts", description: "Reflect on 3 missed tasks — owning it is the first step", iconEmoji: "🎯", xpReward: 25, tier: "bronze", category: "time", criteria: { type: "time_missed_reflected", value: 3 } },
  { key: "time_missed_reflected_10", name: "Accountability Master", description: "Reflect on 10 missed tasks — turning failures into lessons", iconEmoji: "🏆", xpReward: 75, tier: "silver", category: "time", criteria: { type: "time_missed_reflected", value: 10 } },
  { key: "time_missed_reflected_25", name: "Phoenix Rising", description: "Reflect on 25 missed tasks — you never give up on growth", iconEmoji: "🔥", xpReward: 150, tier: "gold", category: "time", criteria: { type: "time_missed_reflected", value: 25 } },

  // ═══════════════════════════════════════════════
  // CONTENT ACHIEVEMENTS (25)
  // ═══════════════════════════════════════════════
  { key: "content_first_post", name: "Social Butterfly", description: "Make your first post", iconEmoji: "🦋", xpReward: 10, tier: "bronze", category: "content", criteria: { type: "content_posts", value: 1 } },
  { key: "content_five_posts", name: "Rising Voice", description: "Make 5 posts", iconEmoji: "📢", xpReward: 20, tier: "bronze", category: "content", criteria: { type: "content_posts", value: 5 } },
  { key: "content_ten_posts", name: "Content Creator", description: "Make 10 posts", iconEmoji: "🎬", xpReward: 50, tier: "silver", category: "content", criteria: { type: "content_posts", value: 10 } },
  { key: "content_twenty_posts", name: "Broadcaster", description: "Make 20 posts", iconEmoji: "📡", xpReward: 75, tier: "silver", category: "content", criteria: { type: "content_posts", value: 20 } },
  { key: "content_fifty_posts", name: "Influencer", description: "Make 50 posts", iconEmoji: "⭐", xpReward: 150, tier: "gold", category: "content", criteria: { type: "content_posts", value: 50 } },
  { key: "content_hundred_posts", name: "Media Mogul", description: "Make 100 posts", iconEmoji: "🏆", xpReward: 300, tier: "platinum", category: "content", criteria: { type: "content_posts", value: 100 } },
  { key: "content_first_script", name: "Script Writer", description: "Write your first script", iconEmoji: "✍️", xpReward: 15, tier: "bronze", category: "content", criteria: { type: "content_scripts", value: 1 } },
  { key: "content_five_scripts", name: "Storyteller", description: "Write 5 scripts", iconEmoji: "📖", xpReward: 30, tier: "bronze", category: "content", criteria: { type: "content_scripts", value: 5 } },
  { key: "content_ten_scripts", name: "Script Master", description: "Write 10 scripts", iconEmoji: "🎭", xpReward: 50, tier: "silver", category: "content", criteria: { type: "content_scripts", value: 10 } },
  { key: "content_twenty_scripts", name: "Screenwriter", description: "Write 20 scripts", iconEmoji: "🎬", xpReward: 100, tier: "gold", category: "content", criteria: { type: "content_scripts", value: 20 } },
  { key: "content_first_video", name: "Video Creator", description: "Create your first video plan", iconEmoji: "🎥", xpReward: 15, tier: "bronze", category: "content", criteria: { type: "content_videos", value: 1 } },
  { key: "content_five_videos", name: "Filmmaker", description: "Create 5 video plans", iconEmoji: "🎞️", xpReward: 30, tier: "bronze", category: "content", criteria: { type: "content_videos", value: 5 } },
  { key: "content_ten_videos", name: "Director", description: "Create 10 video plans", iconEmoji: "🎬", xpReward: 50, tier: "silver", category: "content", criteria: { type: "content_videos", value: 10 } },
  { key: "content_twenty_videos", name: "Auteur", description: "Create 20 video plans", iconEmoji: "🏅", xpReward: 100, tier: "gold", category: "content", criteria: { type: "content_videos", value: 20 } },
  { key: "content_first_blog", name: "Blog Starter", description: "Write your first blog post", iconEmoji: "📝", xpReward: 15, tier: "bronze", category: "content", criteria: { type: "content_blogs", value: 1 } },
  { key: "content_five_blogs", name: "Blogger", description: "Write 5 blog posts", iconEmoji: "📰", xpReward: 30, tier: "bronze", category: "content", criteria: { type: "content_blogs", value: 5 } },
  { key: "content_ten_blogs", name: "Blog Master", description: "Write 10 blog posts", iconEmoji: "📑", xpReward: 50, tier: "silver", category: "content", criteria: { type: "content_blogs", value: 10 } },
  { key: "content_twenty_blogs", name: "Prolific Writer", description: "Write 20 blog posts", iconEmoji: "✒️", xpReward: 100, tier: "gold", category: "content", criteria: { type: "content_blogs", value: 20 } },

  // ═══════════════════════════════════════════════
  // CONTENT LIVE STATUS ACHIEVEMENTS (7)
  // ═══════════════════════════════════════════════
  { key: "content_live_first", name: "First Live", description: "Complete your first content pipeline to posted status", iconEmoji: "🟢", xpReward: 20, tier: "bronze", category: "content", criteria: { type: "content_live_posted", value: 1 } },
  { key: "content_live_five", name: "Pipeline Runner", description: "Complete 5 content pipelines to posted", iconEmoji: "🚀", xpReward: 40, tier: "bronze", category: "content", criteria: { type: "content_live_posted", value: 5 } },
  { key: "content_live_ten", name: "Content Flow", description: "Complete 10 content pipelines to posted", iconEmoji: "🔄", xpReward: 75, tier: "silver", category: "content", criteria: { type: "content_live_posted", value: 10 } },
  { key: "content_live_twenty", name: "Publishing Pro", description: "Complete 20 content pipelines to posted", iconEmoji: "📦", xpReward: 150, tier: "gold", category: "content", criteria: { type: "content_live_posted", value: 20 } },
  { key: "content_live_fifty", name: "Content Empire", description: "Complete 50 content pipelines to posted", iconEmoji: "👑", xpReward: 300, tier: "platinum", category: "content", criteria: { type: "content_live_posted", value: 50 } },
  { key: "content_live_blog_published", name: "Blog Publisher", description: "Complete the live pipeline for your first blog post", iconEmoji: "📝", xpReward: 20, tier: "bronze", category: "content", criteria: { type: "content_live_pipeline_blog", value: 1 } },
  { key: "content_live_video_published", name: "Video Producer", description: "Complete the live pipeline for your first video", iconEmoji: "🎥", xpReward: 20, tier: "bronze", category: "content", criteria: { type: "content_live_pipeline_video", value: 1 } },
  { key: "content_live_post_published", name: "Post Publisher", description: "Complete the live pipeline for your first social post", iconEmoji: "📢", xpReward: 20, tier: "bronze", category: "content", criteria: { type: "content_live_pipeline_post", value: 1 } },
];
