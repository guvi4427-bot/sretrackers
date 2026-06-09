# Task: Fitness Workout Module UI/UX Redesign

## Task ID: fitness-workout-redesign

## Summary

Completed a comprehensive UI/UX redesign of the Fitness Workout module, covering the Workouts tab, Progress tab, and all workout sub-components.

## Changes Made

### 1. FitnessClient.tsx — State & Logic Changes

- **Added `WORKOUT_TYPE_META`** constant: Maps each workout type to an emoji icon, estimated cal/min range, and color scheme for the new card-based selector
- **Added `exercises` state**: Multi-exercise support array (`Array<{ name, muscleGroup, sets, notes }>`) for Hevy-style workouts
- **Updated `addWorkout()`**: Now handles multi-exercise mode — creates separate DB entries per exercise (first gets full duration, others get 0). Non-weight-training falls back to single-entry mode
- **Reset logic**: All state reset paths now include `setExercises([])`

### 2. Workouts Tab — Hevy-style Workout Session

**When no workout is active (`workoutStep === 'type'`):**
- Large cards in a grid layout (2-col mobile, 3-col desktop)
- Each card shows: emoji icon, workout type name, estimated cal/min
- Weight Training card has "SETS · Reps · Load" badge
- Staggered entrance animation
- Date selector moved to top-right header

**When workout is active (`workoutStep === 'log'`):**
- **Top Bar**: Back button | Emoji + Workout Type | Elapsed Timer | Date
- **Summary Stats**: Sets Done, Volume, Exercises count (computed from exercises array or exerciseSets)
- **Weight Training**: Multi-exercise card flow with:
  - Editable exercise name input
  - Per-exercise muscle group selector
  - Previous performance comparison (from allWorkouts history)
  - Sets table with inline editing
  - Add Set / Remove Last buttons
  - Per-exercise notes
  - Delete exercise button (if > 1 exercise)
  - "+ Add Exercise" dashed button
- **Non-Weight-Training**: Simple duration-only flow with activity name
- **Bottom Section**: Duration input, AI Estimate Calories, Workout notes, FINISH WORKOUT button, Discard button, Rest Timer with circular SVG

### 3. Tomorrow's Planned Workout Section

- GlassCard with glassmorphism variant
- Type selector now shows emoji icons from WORKOUT_TYPE_META
- Estimated duration + cal/min display
- Planned workouts show emoji + "Planned" badge + muscle group
- "Auto-migrates to today's log at midnight" hint

### 4. Daily Workout Log & Past 7 Days

- Cleaner glassmorphism cards
- Planned workouts show "Planned" badge (blue)
- Muscle group emoji tags
- Better spacing and typography

### 5. _workout-card.tsx — Glassmorphism Polish

- Changed variant to `glassmorphism`
- Added `previousWorkout` prop for performance comparison
- Shows "Previous: 20kg × 10 → Current: 22.5kg × 8" with up/down arrows
- Planned workouts get "📋 Planned" badge
- Muscle group tag uses amber color scheme
- Notes: Planned workouts strip "[PLANNED]" from display
- More subtle colors and better spacing

### 6. _workout-timeline.tsx — Notion-style Groups

- Added `allWorkouts` prop for previous performance lookup
- Group headers use Notion-style bold labels
- Stats shown in pill-style badges (workout count, duration, calories)
- Left border line uses subtle blue (border-blue-500/8)
- "+ New Workout" button uses dashed border style
- Previous workout lookup function for each card

### 7. _workout-tracker.tsx — Pass-through Update

- Added `allWorkouts` optional prop
- Passes `allWorkouts` to `WorkoutTimeline` for previous performance lookup

## Files Modified

1. `/home/z/my-project/src/app/(main)/fitness/FitnessClient.tsx` — State, addWorkout, Workouts tab UI, Tomorrow section
2. `/home/z/my-project/src/app/(main)/fitness/_workout-card.tsx` — Full rewrite with glassmorphism + previous performance
3. `/home/z/my-project/src/app/(main)/fitness/_workout-timeline.tsx` — Notion-style groups + allWorkouts prop
4. `/home/z/my-project/src/app/(main)/fitness/_workout-tracker.tsx` — Added allWorkouts prop pass-through

## Files NOT Modified (as requested)

- No API routes, Prisma schema, or backend logic
- Nutrition, food, macros, TDEE, AI Coach, auth, overview tab untouched
- _workout-filters.tsx untouched
- Feed routes untouched

## Build Status

✓ Build compiles successfully (0 errors)
✓ ESLint passes (0 errors, 4 pre-existing warnings unrelated to this task)
