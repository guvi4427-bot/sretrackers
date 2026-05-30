#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  S/R/E Platform — Production Database Seeding Script
#  Seeds: Admin user, Achievements, initial configuration
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Color Palette ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ── Constants ──
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env.production"
CREDENTIALS_FILE="$PROJECT_DIR/.turso-credentials"

# Default admin credentials (CHANGE IN PRODUCTION!)
DEFAULT_ADMIN_EMAIL="myselfgowtham140707@gmail.com"
DEFAULT_ADMIN_USERNAME="admin"
DEFAULT_ADMIN_PASSWORD="Gowtham@123"
DEFAULT_ADMIN_PHONE="+918148796055"

# ── Helper Functions ──
info()    { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warn()    { echo -e "${YELLOW}⚠️  $1${NC}"; }
error()   { echo -e "${RED}❌ $1${NC}"; }
step()    { echo -e "\n${CYAN}${BOLD}──▶ $1 ──${NC}"; }

banner() {
  echo -e "\n${BOLD}${CYAN}═══════════════════════════════════════════════════════${NC}"
  echo -e "${BOLD}${CYAN}   S/R/E Platform — Production Database Seeding${NC}"
  echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════${NC}\n"
}

# ── Resolve Database Connection ──
resolve_db_connection() {
  step "Resolving database connection"

  # Try credentials file first
  if [[ -f "$CREDENTIALS_FILE" ]]; then
    source "$CREDENTIALS_FILE"
    success "Using credentials from .turso-credentials"
    return 0
  fi

  # Try .env.production
  if [[ -f "$ENV_FILE" ]]; then
    DATABASE_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | head -1 | sed 's/^DATABASE_URL="//' | sed 's/"$//')
    TURSO_AUTH_TOKEN=$(grep "^TURSO_AUTH_TOKEN=" "$ENV_FILE" | head -1 | sed 's/^TURSO_AUTH_TOKEN="//' | sed 's/"$//')

    if [[ -n "$DATABASE_URL" && "$DATABASE_URL" == libsql://* ]]; then
      success "Using credentials from .env.production"
      return 0
    fi
  fi

  # Try .env.local
  local env_local="$PROJECT_DIR/.env.local"
  if [[ -f "$env_local" ]]; then
    DATABASE_URL=$(grep "^DATABASE_URL=" "$env_local" | head -1 | sed 's/^DATABASE_URL="//' | sed 's/"$//')
    TURSO_AUTH_TOKEN=$(grep "^TURSO_AUTH_TOKEN=" "$env_local" | head -1 | sed 's/^TURSO_AUTH_TOKEN="//' | sed 's/"$//')

    if [[ -n "$DATABASE_URL" && "$DATABASE_URL" == libsql://* ]]; then
      success "Using credentials from .env.local"
      return 0
    fi
  fi

  # Prompt user
  warn "Could not find database credentials automatically."
  echo -e "\n${YELLOW}Enter your Turso DATABASE_URL (libsql://...):${NC} "
  read -r DATABASE_URL
  echo -e "${YELLOW}Enter your TURSO_AUTH_TOKEN:${NC} "
  read -r TURSO_AUTH_TOKEN

  if [[ -z "$DATABASE_URL" || -z "$TURSO_AUTH_TOKEN" ]]; then
    error "Database credentials are required"
    exit 1
  fi

  success "Database connection configured"
}

# ── Verify Database Connection ──
verify_connection() {
  step "Verifying database connection"

  cd "$PROJECT_DIR"

  # Generate Prisma client if needed
  if [[ ! -d "node_modules/.prisma/client" ]]; then
    info "Generating Prisma client..."
    npx prisma generate 2>&1 | tail -3
  fi

  # Quick test: try to push schema (idempotent)
  info "Testing connection with prisma db push..."
  DATABASE_URL="$DATABASE_URL" TURSO_AUTH_TOKEN="$TURSO_AUTH_TOKEN" npx prisma db push 2>&1 | tail -5

  success "Database connection verified"
}

# ── Prompt for Admin Credentials ──
prompt_admin_credentials() {
  step "Configuring admin user"

  echo -e "${YELLOW}${BOLD}Admin User Configuration${NC}"
  echo -e "${YELLOW}Press Enter to use defaults, or type new values:${NC}\n"

  echo -e "Admin email [${CYAN}$DEFAULT_ADMIN_EMAIL${NC}]:"
  read -r ADMIN_EMAIL
  ADMIN_EMAIL="${ADMIN_EMAIL:-$DEFAULT_ADMIN_EMAIL}"

  echo -e "Admin username [${CYAN}$DEFAULT_ADMIN_USERNAME${NC}]:"
  read -r ADMIN_USERNAME
  ADMIN_USERNAME="${ADMIN_USERNAME:-$DEFAULT_ADMIN_USERNAME}"

  echo -e "Admin password [${CYAN}(using default)${NC}]:"
  read -r ADMIN_PASSWORD
  ADMIN_PASSWORD="${ADMIN_PASSWORD:-$DEFAULT_ADMIN_PASSWORD}"

  echo -e "Admin phone [${CYAN}$DEFAULT_ADMIN_PHONE${NC}]:"
  read -r ADMIN_PHONE
  ADMIN_PHONE="${ADMIN_PHONE:-$DEFAULT_ADMIN_PHONE}"

  echo -e ""
  info "Admin will be created with:"
  info "  Email:    $ADMIN_EMAIL"
  info "  Username: $ADMIN_USERNAME"
  info "  Phone:    $ADMIN_PHONE"
}

# ── Create Seed Script ──
create_seed_script() {
  step "Creating seed script"

  cat > "$PROJECT_DIR/scripts/_seed-runner.mjs" << 'SEED_SCRIPT'
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

// ── Achievement Definitions (matching src/lib/gamification.ts) ──
const ACHIEVEMENT_DEFS = [
  // LEARNING (25)
  { key: "learn_first_entry", name: "First Step", description: "Log your first learning entry", iconEmoji: "📝", xpReward: 15, tier: "bronze", category: "learning", criteria: JSON.stringify({ type: "learning_entries", value: 1 }) },
  { key: "learn_five_entries", name: "Curious Mind", description: "Log 5 learning entries", iconEmoji: "📖", xpReward: 25, tier: "bronze", category: "learning", criteria: JSON.stringify({ type: "learning_entries", value: 5 }) },
  { key: "learn_ten_entries", name: "Knowledge Seeker", description: "Log 10 learning entries", iconEmoji: "📚", xpReward: 50, tier: "silver", category: "learning", criteria: JSON.stringify({ type: "learning_entries", value: 10 }) },
  { key: "learn_twenty_entries", name: "Bookworm", description: "Log 20 learning entries", iconEmoji: "📗", xpReward: 75, tier: "silver", category: "learning", criteria: JSON.stringify({ type: "learning_entries", value: 20 }) },
  { key: "learn_fifty_entries", name: "Scholar", description: "Log 50 learning entries", iconEmoji: "🎓", xpReward: 100, tier: "gold", category: "learning", criteria: JSON.stringify({ type: "learning_entries", value: 50 }) },
  { key: "learn_hundred_entries", name: "Encyclopedia", description: "Log 100 learning entries", iconEmoji: "🏛️", xpReward: 200, tier: "platinum", category: "learning", criteria: JSON.stringify({ type: "learning_entries", value: 100 }) },
  { key: "learn_first_topic", name: "Topic Starter", description: "Create your first topic", iconEmoji: "💡", xpReward: 10, tier: "bronze", category: "learning", criteria: JSON.stringify({ type: "learning_topics", value: 1 }) },
  { key: "learn_five_topics", name: "Topic Explorer", description: "Create 5 topics", iconEmoji: "🔍", xpReward: 25, tier: "bronze", category: "learning", criteria: JSON.stringify({ type: "learning_topics", value: 5 }) },
  { key: "learn_ten_topics", name: "Subject Master", description: "Create 10 topics", iconEmoji: "🧠", xpReward: 50, tier: "silver", category: "learning", criteria: JSON.stringify({ type: "learning_topics", value: 10 }) },
  { key: "learn_twenty_topics", name: "Polymath", description: "Create 20 topics", iconEmoji: "🌐", xpReward: 100, tier: "gold", category: "learning", criteria: JSON.stringify({ type: "learning_topics", value: 20 }) },
  { key: "learn_notes_five", name: "Note Taker", description: "Write notes in 5 entries", iconEmoji: "✏️", xpReward: 20, tier: "bronze", category: "learning", criteria: JSON.stringify({ type: "learning_notes", value: 5 }) },
  { key: "learn_notes_twenty", name: "Detailed Scholar", description: "Write notes in 20 entries", iconEmoji: "📋", xpReward: 50, tier: "silver", category: "learning", criteria: JSON.stringify({ type: "learning_notes", value: 20 }) },
  { key: "learn_notes_fifty", name: "Chronicler", description: "Write notes in 50 entries", iconEmoji: "📜", xpReward: 100, tier: "gold", category: "learning", criteria: JSON.stringify({ type: "learning_notes", value: 50 }) },
  { key: "learn_hour", name: "Hour Learner", description: "Log 60+ minutes total study time", iconEmoji: "⏱️", xpReward: 20, tier: "bronze", category: "learning", criteria: JSON.stringify({ type: "learning_duration", value: 60 }) },
  { key: "learn_five_hours", name: "Dedicated Student", description: "Log 5+ hours total study time", iconEmoji: "⏳", xpReward: 50, tier: "silver", category: "learning", criteria: JSON.stringify({ type: "learning_duration", value: 300 }) },
  { key: "learn_day", name: "Full Day Scholar", description: "Log 24+ hours total study time", iconEmoji: "📅", xpReward: 100, tier: "gold", category: "learning", criteria: JSON.stringify({ type: "learning_duration", value: 1440 }) },
  { key: "learn_week", name: "Week Scholar", description: "Log 168+ hours total study time", iconEmoji: "🗓️", xpReward: 200, tier: "platinum", category: "learning", criteria: JSON.stringify({ type: "learning_duration", value: 10080 }) },
  { key: "learn_shared_topic", name: "Sharing Knowledge", description: "Share 1 topic publicly", iconEmoji: "🌍", xpReward: 20, tier: "bronze", category: "learning", criteria: JSON.stringify({ type: "learning_shared", value: 1 }) },
  { key: "learn_five_shared", name: "Knowledge Sharer", description: "Share 5 topics publicly", iconEmoji: "🤝", xpReward: 50, tier: "silver", category: "learning", criteria: JSON.stringify({ type: "learning_shared", value: 5 }) },
  { key: "learn_streak_3", name: "Consistent Learner", description: "Maintain 3-day learning streak", iconEmoji: "🔥", xpReward: 25, tier: "bronze", category: "learning", criteria: JSON.stringify({ type: "streak", value: 3 }) },
  { key: "learn_streak_7", name: "Weekly Scholar", description: "Maintain 7-day learning streak", iconEmoji: "🔥", xpReward: 50, tier: "silver", category: "learning", criteria: JSON.stringify({ type: "streak", value: 7 }) },
  { key: "learn_streak_30", name: "Monthly Master", description: "Maintain 30-day learning streak", iconEmoji: "🔥", xpReward: 200, tier: "gold", category: "learning", criteria: JSON.stringify({ type: "streak", value: 30 }) },
  { key: "learn_deep_dive", name: "Deep Diver", description: "Log 10 entries in a single topic", iconEmoji: "🤿", xpReward: 75, tier: "silver", category: "learning", criteria: JSON.stringify({ type: "learning_deep_topic", value: 10 }) },
  { key: "learn_level_5", name: "Rising Mind", description: "Reach Level 5", iconEmoji: "⭐", xpReward: 50, tier: "silver", category: "learning", criteria: JSON.stringify({ type: "level", value: 5 }) },
  { key: "learn_level_10", name: "Enlightened", description: "Reach Level 10", iconEmoji: "🏆", xpReward: 100, tier: "gold", category: "learning", criteria: JSON.stringify({ type: "level", value: 10 }) },

  // FITNESS (25)
  { key: "fit_first_workout", name: "Gym Starter", description: "Log your first workout", iconEmoji: "💪", xpReward: 15, tier: "bronze", category: "fitness", criteria: JSON.stringify({ type: "fitness_workouts", value: 1 }) },
  { key: "fit_five_workouts", name: "Regular", description: "Log 5 workouts", iconEmoji: "🏃", xpReward: 25, tier: "bronze", category: "fitness", criteria: JSON.stringify({ type: "fitness_workouts", value: 5 }) },
  { key: "fit_ten_workouts", name: "Fitness Buff", description: "Log 10 workouts", iconEmoji: "🏋️", xpReward: 50, tier: "silver", category: "fitness", criteria: JSON.stringify({ type: "fitness_workouts", value: 10 }) },
  { key: "fit_twenty_workouts", name: "Gym Rat", description: "Log 20 workouts", iconEmoji: "💯", xpReward: 75, tier: "silver", category: "fitness", criteria: JSON.stringify({ type: "fitness_workouts", value: 20 }) },
  { key: "fit_fifty_workouts", name: "Iron Will", description: "Log 50 workouts", iconEmoji: "🦾", xpReward: 150, tier: "gold", category: "fitness", criteria: JSON.stringify({ type: "fitness_workouts", value: 50 }) },
  { key: "fit_hundred_workouts", name: "Unstoppable", description: "Log 100 workouts", iconEmoji: "🏆", xpReward: 300, tier: "platinum", category: "fitness", criteria: JSON.stringify({ type: "fitness_workouts", value: 100 }) },
  { key: "fit_first_meal", name: "Nutrition Starter", description: "Log your first meal", iconEmoji: "🥗", xpReward: 10, tier: "bronze", category: "fitness", criteria: JSON.stringify({ type: "fitness_meals", value: 1 }) },
  { key: "fit_ten_meals", name: "Food Tracker", description: "Log 10 meals", iconEmoji: "🥦", xpReward: 25, tier: "bronze", category: "fitness", criteria: JSON.stringify({ type: "fitness_meals", value: 10 }) },
  { key: "fit_fifty_meals", name: "Nutrition Pro", description: "Log 50 meals", iconEmoji: "🍎", xpReward: 50, tier: "silver", category: "fitness", criteria: JSON.stringify({ type: "fitness_meals", value: 50 }) },
  { key: "fit_hundred_meals", name: "Diet Master", description: "Log 100 meals", iconEmoji: "🥇", xpReward: 100, tier: "gold", category: "fitness", criteria: JSON.stringify({ type: "fitness_meals", value: 100 }) },
  { key: "fit_five_hundred_meals", name: "Nutrition Legend", description: "Log 500 meals", iconEmoji: "👑", xpReward: 200, tier: "platinum", category: "fitness", criteria: JSON.stringify({ type: "fitness_meals", value: 500 }) },
  { key: "fit_first_weight", name: "Scale Starter", description: "Log your first weight entry", iconEmoji: "⚖️", xpReward: 10, tier: "bronze", category: "fitness", criteria: JSON.stringify({ type: "fitness_weights", value: 1 }) },
  { key: "fit_five_weights", name: "Tracking Progress", description: "Log 5 weight entries", iconEmoji: "📊", xpReward: 20, tier: "bronze", category: "fitness", criteria: JSON.stringify({ type: "fitness_weights", value: 5 }) },
  { key: "fit_ten_weights", name: "Body Tracker", description: "Log 10 weight entries", iconEmoji: "📈", xpReward: 50, tier: "silver", category: "fitness", criteria: JSON.stringify({ type: "fitness_weights", value: 10 }) },
  { key: "fit_thirty_weights", name: "Data Driven", description: "Log 30 weight entries", iconEmoji: "📉", xpReward: 75, tier: "silver", category: "fitness", criteria: JSON.stringify({ type: "fitness_weights", value: 30 }) },
  { key: "fit_workout_hour", name: "Sweat Hour", description: "Log 60+ minutes of workouts", iconEmoji: "💦", xpReward: 25, tier: "bronze", category: "fitness", criteria: JSON.stringify({ type: "fitness_workout_duration", value: 60 }) },
  { key: "fit_workout_five_hours", name: "Endurance", description: "Log 5+ hours of workouts", iconEmoji: "🫀", xpReward: 50, tier: "silver", category: "fitness", criteria: JSON.stringify({ type: "fitness_workout_duration", value: 300 }) },
  { key: "fit_workout_day", name: "Full Day Grind", description: "Log 24+ hours of workouts", iconEmoji: "💪", xpReward: 150, tier: "gold", category: "fitness", criteria: JSON.stringify({ type: "fitness_workout_duration", value: 1440 }) },
  { key: "fit_streak_3", name: "3-Day Fitness", description: "Maintain 3-day streak", iconEmoji: "🔥", xpReward: 25, tier: "bronze", category: "fitness", criteria: JSON.stringify({ type: "streak", value: 3 }) },
  { key: "fit_streak_7", name: "Week Warrior", description: "Maintain 7-day streak", iconEmoji: "🔥", xpReward: 50, tier: "silver", category: "fitness", criteria: JSON.stringify({ type: "streak", value: 7 }) },
  { key: "fit_streak_30", name: "Monthly Machine", description: "Maintain 30-day streak", iconEmoji: "🔥", xpReward: 200, tier: "gold", category: "fitness", criteria: JSON.stringify({ type: "streak", value: 30 }) },
  { key: "fit_level_5", name: "Rising Athlete", description: "Reach Level 5", iconEmoji: "⭐", xpReward: 50, tier: "silver", category: "fitness", criteria: JSON.stringify({ type: "level", value: 5 }) },
  { key: "fit_level_10", name: "Fitness Champion", description: "Reach Level 10", iconEmoji: "🏆", xpReward: 100, tier: "gold", category: "fitness", criteria: JSON.stringify({ type: "level", value: 10 }) },
  { key: "fit_xp_1000", name: "XP Centurion", description: "Earn 1000 total XP", iconEmoji: "🌟", xpReward: 50, tier: "silver", category: "fitness", criteria: JSON.stringify({ type: "xp", value: 1000 }) },
  { key: "fit_xp_10000", name: "XP Titan", description: "Earn 10000 total XP", iconEmoji: "💫", xpReward: 200, tier: "platinum", category: "fitness", criteria: JSON.stringify({ type: "xp", value: 10000 }) },

  // Weight training achievements
  { key: "fit_wt_first_session", name: "Iron Initiate", description: "Complete your first weight training session", iconEmoji: "🏋️", xpReward: 20, tier: "bronze", category: "fitness", criteria: JSON.stringify({ type: "weight_training_sessions", value: 1 }) },
  { key: "fit_wt_ten_sessions", name: "Plate Chaser", description: "Complete 10 weight training sessions", iconEmoji: "💪", xpReward: 50, tier: "bronze", category: "fitness", criteria: JSON.stringify({ type: "weight_training_sessions", value: 10 }) },
  { key: "fit_wt_fifty_sessions", name: "Iron Veteran", description: "Complete 50 weight training sessions", iconEmoji: "🦾", xpReward: 150, tier: "silver", category: "fitness", criteria: JSON.stringify({ type: "weight_training_sessions", value: 50 }) },
  { key: "fit_wt_load_increase", name: "Progressive Overload", description: "Increase your training load for the first time", iconEmoji: "📈", xpReward: 30, tier: "bronze", category: "fitness", criteria: JSON.stringify({ type: "weight_training_load_increase", value: 1 }) },
  { key: "fit_wt_rep_increase", name: "Rep Climber", description: "Log more reps than your previous best", iconEmoji: "🔁", xpReward: 30, tier: "bronze", category: "fitness", criteria: JSON.stringify({ type: "weight_training_rep_increase", value: 1 }) },
  { key: "fit_wt_set_increase", name: "Volume Builder", description: "Log more sets than your previous session", iconEmoji: "📊", xpReward: 30, tier: "bronze", category: "fitness", criteria: JSON.stringify({ type: "weight_training_set_increase", value: 1 }) },
  { key: "fit_wt_intermediate", name: "Strength Forged", description: "Log 25 weight training sessions with progressive load increases", iconEmoji: "⚙️", xpReward: 100, tier: "silver", category: "fitness", criteria: JSON.stringify({ type: "weight_training_intermediate", value: 25 }) },
  { key: "fit_wt_advanced", name: "Iron Sovereign", description: "Log 100 weight training sessions", iconEmoji: "👑", xpReward: 300, tier: "gold", category: "fitness", criteria: JSON.stringify({ type: "weight_training_sessions", value: 100 }) },
  { key: "fit_wt_legendary", name: "Barbarian", description: "Log 200 weight training sessions", iconEmoji: "🔱", xpReward: 500, tier: "platinum", category: "fitness", criteria: JSON.stringify({ type: "weight_training_sessions", value: 200 }) },

  // TIME (25)
  { key: "time_first_focus", name: "Focus Starter", description: "Complete your first focus session", iconEmoji: "🎯", xpReward: 15, tier: "bronze", category: "time", criteria: JSON.stringify({ type: "time_focus", value: 1 }) },
  { key: "time_five_focus", name: "Focus Builder", description: "Complete 5 focus sessions", iconEmoji: "🧘", xpReward: 25, tier: "bronze", category: "time", criteria: JSON.stringify({ type: "time_focus", value: 5 }) },
  { key: "time_ten_focus", name: "Focus Adept", description: "Complete 10 focus sessions", iconEmoji: "⚡", xpReward: 50, tier: "silver", category: "time", criteria: JSON.stringify({ type: "time_focus", value: 10 }) },
  { key: "time_twenty_focus", name: "Focus Master", description: "Complete 20 focus sessions", iconEmoji: "🧠", xpReward: 75, tier: "silver", category: "time", criteria: JSON.stringify({ type: "time_focus", value: 20 }) },
  { key: "time_fifty_focus", name: "Zen Master", description: "Complete 50 focus sessions", iconEmoji: "🏔️", xpReward: 150, tier: "gold", category: "time", criteria: JSON.stringify({ type: "time_focus", value: 50 }) },
  { key: "time_hundred_focus", name: "Transcendent", description: "Complete 100 focus sessions", iconEmoji: "☯️", xpReward: 300, tier: "platinum", category: "time", criteria: JSON.stringify({ type: "time_focus", value: 100 }) },
  { key: "time_first_task", name: "Task Starter", description: "Complete your first task", iconEmoji: "✅", xpReward: 10, tier: "bronze", category: "time", criteria: JSON.stringify({ type: "time_tasks", value: 1 }) },
  { key: "time_ten_tasks", name: "Task Manager", description: "Complete 10 tasks", iconEmoji: "📋", xpReward: 30, tier: "bronze", category: "time", criteria: JSON.stringify({ type: "time_tasks", value: 10 }) },
  { key: "time_twenty_tasks", name: "Task Master", description: "Complete 20 tasks", iconEmoji: "📝", xpReward: 50, tier: "silver", category: "time", criteria: JSON.stringify({ type: "time_tasks", value: 20 }) },
  { key: "time_fifty_tasks", name: "Productive Pro", description: "Complete 50 tasks", iconEmoji: "🗂️", xpReward: 75, tier: "silver", category: "time", criteria: JSON.stringify({ type: "time_tasks", value: 50 }) },
  { key: "time_hundred_tasks", name: "Task Legend", description: "Complete 100 tasks", iconEmoji: "🏅", xpReward: 150, tier: "gold", category: "time", criteria: JSON.stringify({ type: "time_tasks", value: 100 }) },
  { key: "time_two_hundred_tasks", name: "Productivity God", description: "Complete 200 tasks", iconEmoji: "👑", xpReward: 300, tier: "platinum", category: "time", criteria: JSON.stringify({ type: "time_tasks", value: 200 }) },
  { key: "time_focus_hour", name: "Deep Worker", description: "Complete 60+ minutes total focus time", iconEmoji: "⏰", xpReward: 20, tier: "bronze", category: "time", criteria: JSON.stringify({ type: "time_focus_duration", value: 60 }) },
  { key: "time_focus_five_hours", name: "Marathon Mind", description: "Complete 5+ hours total focus time", iconEmoji: "🏃‍♂️", xpReward: 50, tier: "silver", category: "time", criteria: JSON.stringify({ type: "time_focus_duration", value: 300 }) },
  { key: "time_focus_day", name: "Deep Flow", description: "Complete 24+ hours total focus time", iconEmoji: "🌊", xpReward: 150, tier: "gold", category: "time", criteria: JSON.stringify({ type: "time_focus_duration", value: 1440 }) },
  { key: "time_focus_week", name: "Flow State", description: "Complete 168+ hours total focus time", iconEmoji: "🌀", xpReward: 300, tier: "platinum", category: "time", criteria: JSON.stringify({ type: "time_focus_duration", value: 10080 }) },
  { key: "time_streak_3", name: "3-Day Focus", description: "Maintain 3-day streak", iconEmoji: "🔥", xpReward: 25, tier: "bronze", category: "time", criteria: JSON.stringify({ type: "streak", value: 3 }) },
  { key: "time_streak_7", name: "Week Focused", description: "Maintain 7-day streak", iconEmoji: "🔥", xpReward: 50, tier: "silver", category: "time", criteria: JSON.stringify({ type: "streak", value: 7 }) },
  { key: "time_streak_30", name: "Monthly Focus", description: "Maintain 30-day streak", iconEmoji: "🔥", xpReward: 200, tier: "gold", category: "time", criteria: JSON.stringify({ type: "streak", value: 30 }) },
  { key: "time_level_5", name: "Time Manager", description: "Reach Level 5", iconEmoji: "⭐", xpReward: 50, tier: "silver", category: "time", criteria: JSON.stringify({ type: "level", value: 5 }) },
  { key: "time_level_10", name: "Time Master", description: "Reach Level 10", iconEmoji: "🏆", xpReward: 100, tier: "gold", category: "time", criteria: JSON.stringify({ type: "level", value: 10 }) },
  { key: "time_level_20", name: "Time Lord", description: "Reach Level 20", iconEmoji: "👑", xpReward: 200, tier: "platinum", category: "time", criteria: JSON.stringify({ type: "level", value: 20 }) },
  { key: "time_xp_500", name: "XP Earner", description: "Earn 500 total XP", iconEmoji: "✨", xpReward: 25, tier: "bronze", category: "time", criteria: JSON.stringify({ type: "xp", value: 500 }) },
  { key: "time_xp_5000", name: "XP Master", description: "Earn 5000 total XP", iconEmoji: "💫", xpReward: 100, tier: "gold", category: "time", criteria: JSON.stringify({ type: "xp", value: 5000 }) },
  { key: "time_xp_50000", name: "XP Demigod", description: "Earn 50000 total XP", iconEmoji: "🌟", xpReward: 300, tier: "platinum", category: "time", criteria: JSON.stringify({ type: "xp", value: 50000 }) },

  // CONTENT (25)
  { key: "content_first_post", name: "Social Butterfly", description: "Make your first post", iconEmoji: "🦋", xpReward: 10, tier: "bronze", category: "content", criteria: JSON.stringify({ type: "content_posts", value: 1 }) },
  { key: "content_five_posts", name: "Rising Voice", description: "Make 5 posts", iconEmoji: "📢", xpReward: 20, tier: "bronze", category: "content", criteria: JSON.stringify({ type: "content_posts", value: 5 }) },
  { key: "content_ten_posts", name: "Content Creator", description: "Make 10 posts", iconEmoji: "🎬", xpReward: 50, tier: "silver", category: "content", criteria: JSON.stringify({ type: "content_posts", value: 10 }) },
  { key: "content_twenty_posts", name: "Broadcaster", description: "Make 20 posts", iconEmoji: "📡", xpReward: 75, tier: "silver", category: "content", criteria: JSON.stringify({ type: "content_posts", value: 20 }) },
  { key: "content_fifty_posts", name: "Influencer", description: "Make 50 posts", iconEmoji: "⭐", xpReward: 150, tier: "gold", category: "content", criteria: JSON.stringify({ type: "content_posts", value: 50 }) },
  { key: "content_hundred_posts", name: "Media Mogul", description: "Make 100 posts", iconEmoji: "🏆", xpReward: 300, tier: "platinum", category: "content", criteria: JSON.stringify({ type: "content_posts", value: 100 }) },
  { key: "content_first_script", name: "Script Writer", description: "Write your first script", iconEmoji: "✍️", xpReward: 15, tier: "bronze", category: "content", criteria: JSON.stringify({ type: "content_scripts", value: 1 }) },
  { key: "content_five_scripts", name: "Storyteller", description: "Write 5 scripts", iconEmoji: "📖", xpReward: 30, tier: "bronze", category: "content", criteria: JSON.stringify({ type: "content_scripts", value: 5 }) },
  { key: "content_ten_scripts", name: "Script Master", description: "Write 10 scripts", iconEmoji: "🎭", xpReward: 50, tier: "silver", category: "content", criteria: JSON.stringify({ type: "content_scripts", value: 10 }) },
  { key: "content_twenty_scripts", name: "Screenwriter", description: "Write 20 scripts", iconEmoji: "🎬", xpReward: 100, tier: "gold", category: "content", criteria: JSON.stringify({ type: "content_scripts", value: 20 }) },
  { key: "content_first_video", name: "Video Creator", description: "Create your first video plan", iconEmoji: "🎥", xpReward: 15, tier: "bronze", category: "content", criteria: JSON.stringify({ type: "content_videos", value: 1 }) },
  { key: "content_five_videos", name: "Filmmaker", description: "Create 5 video plans", iconEmoji: "🎞️", xpReward: 30, tier: "bronze", category: "content", criteria: JSON.stringify({ type: "content_videos", value: 5 }) },
  { key: "content_ten_videos", name: "Director", description: "Create 10 video plans", iconEmoji: "🎬", xpReward: 50, tier: "silver", category: "content", criteria: JSON.stringify({ type: "content_videos", value: 10 }) },
  { key: "content_twenty_videos", name: "Auteur", description: "Create 20 video plans", iconEmoji: "🏅", xpReward: 100, tier: "gold", category: "content", criteria: JSON.stringify({ type: "content_videos", value: 20 }) },
  { key: "content_first_blog", name: "Blog Starter", description: "Write your first blog post", iconEmoji: "📝", xpReward: 15, tier: "bronze", category: "content", criteria: JSON.stringify({ type: "content_blogs", value: 1 }) },
  { key: "content_five_blogs", name: "Blogger", description: "Write 5 blog posts", iconEmoji: "📰", xpReward: 30, tier: "bronze", category: "content", criteria: JSON.stringify({ type: "content_blogs", value: 5 }) },
  { key: "content_ten_blogs", name: "Blog Master", description: "Write 10 blog posts", iconEmoji: "📑", xpReward: 50, tier: "silver", category: "content", criteria: JSON.stringify({ type: "content_blogs", value: 10 }) },
  { key: "content_twenty_blogs", name: "Prolific Writer", description: "Write 20 blog posts", iconEmoji: "✒️", xpReward: 100, tier: "gold", category: "content", criteria: JSON.stringify({ type: "content_blogs", value: 20 }) },
  { key: "content_streak_3", name: "3-Day Creator", description: "Maintain 3-day streak", iconEmoji: "🔥", xpReward: 25, tier: "bronze", category: "content", criteria: JSON.stringify({ type: "streak", value: 3 }) },
  { key: "content_streak_7", name: "Content Week", description: "Maintain 7-day streak", iconEmoji: "🔥", xpReward: 50, tier: "silver", category: "content", criteria: JSON.stringify({ type: "streak", value: 7 }) },
  { key: "content_streak_30", name: "Content Machine", description: "Maintain 30-day streak", iconEmoji: "🔥", xpReward: 200, tier: "gold", category: "content", criteria: JSON.stringify({ type: "streak", value: 30 }) },
  { key: "content_level_5", name: "Rising Creator", description: "Reach Level 5", iconEmoji: "⭐", xpReward: 50, tier: "silver", category: "content", criteria: JSON.stringify({ type: "level", value: 5 }) },
  { key: "content_level_10", name: "Creative Force", description: "Reach Level 10", iconEmoji: "🏆", xpReward: 100, tier: "gold", category: "content", criteria: JSON.stringify({ type: "level", value: 10 }) },
  { key: "content_xp_1000", name: "Creative XP", description: "Earn 1000 total XP", iconEmoji: "💫", xpReward: 50, tier: "silver", category: "content", criteria: JSON.stringify({ type: "xp", value: 1000 }) },
  { key: "content_xp_10000", name: "Creative Legend", description: "Earn 10000 total XP", iconEmoji: "🌟", xpReward: 200, tier: "platinum", category: "content", criteria: JSON.stringify({ type: "xp", value: 10000 }) },

  // CONTENT LIVE STATUS (7)
  { key: "content_live_first", name: "First Live", description: "Complete your first content pipeline to posted status", iconEmoji: "🟢", xpReward: 20, tier: "bronze", category: "content", criteria: JSON.stringify({ type: "content_live_posted", value: 1 }) },
  { key: "content_live_five", name: "Pipeline Runner", description: "Complete 5 content pipelines to posted", iconEmoji: "🚀", xpReward: 40, tier: "bronze", category: "content", criteria: JSON.stringify({ type: "content_live_posted", value: 5 }) },
  { key: "content_live_ten", name: "Content Flow", description: "Complete 10 content pipelines to posted", iconEmoji: "🔄", xpReward: 75, tier: "silver", category: "content", criteria: JSON.stringify({ type: "content_live_posted", value: 10 }) },
  { key: "content_live_twenty", name: "Publishing Pro", description: "Complete 20 content pipelines to posted", iconEmoji: "📦", xpReward: 150, tier: "gold", category: "content", criteria: JSON.stringify({ type: "content_live_posted", value: 20 }) },
  { key: "content_live_fifty", name: "Content Empire", description: "Complete 50 content pipelines to posted", iconEmoji: "👑", xpReward: 300, tier: "platinum", category: "content", criteria: JSON.stringify({ type: "content_live_posted", value: 50 }) },
  { key: "content_live_blog_published", name: "Blog Publisher", description: "Complete the live pipeline for your first blog post", iconEmoji: "📝", xpReward: 20, tier: "bronze", category: "content", criteria: JSON.stringify({ type: "content_live_pipeline_blog", value: 1 }) },
  { key: "content_live_video_published", name: "Video Producer", description: "Complete the live pipeline for your first video", iconEmoji: "🎥", xpReward: 20, tier: "bronze", category: "content", criteria: JSON.stringify({ type: "content_live_pipeline_video", value: 1 }) },
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || '';
  const adminEmail = process.env.ADMIN_EMAIL || 'myselfgowtham140707@gmail.com';
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Gowtham@123';
  const adminPhone = process.env.ADMIN_PHONE || '+918148796055';

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  // Create Prisma client with Turso adapter for cloud DB
  let prisma;
  if (databaseUrl.startsWith('libsql://') || databaseUrl.startsWith('http://') || databaseUrl.startsWith('https://')) {
    const adapter = new PrismaLibSql({
      url: databaseUrl,
      authToken: tursoAuthToken,
    });
    prisma = new PrismaClient({ adapter, log: ['error'] });
  } else {
    prisma = new PrismaClient({ log: ['error'] });
  }

  try {
    console.log('🌱 Seeding production database...');

    // 1. Seed Achievements
    console.log(`📥 Upserting ${ACHIEVEMENT_DEFS.length} achievements...`);
    let achievementCount = 0;
    for (const def of ACHIEVEMENT_DEFS) {
      await prisma.achievement.upsert({
        where: { key: def.key },
        update: {
          name: def.name,
          description: def.description,
          iconEmoji: def.iconEmoji,
          xpReward: def.xpReward,
          tier: def.tier,
          category: def.category,
          criteria: def.criteria,
        },
        create: {
          key: def.key,
          name: def.name,
          description: def.description,
          iconEmoji: def.iconEmoji,
          xpReward: def.xpReward,
          tier: def.tier,
          category: def.category,
          criteria: def.criteria,
        },
      });
      achievementCount++;
    }
    console.log(`✅ Seeded ${achievementCount} achievements`);

    // 2. Seed Admin User
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`ℹ️  Admin user already exists (${adminEmail}), skipping creation`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      const adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          phone: adminPhone,
          username: adminUsername,
          passwordHash,
          profile: {
            create: {
              name: 'Admin',
              xp: 0,
              level: 1,
              currentStreak: 0,
              longestStreak: 0,
              onboardingComplete: true,
              activePhases: JSON.stringify(['start', 'restart', 'explore']),
              phaseActivityMap: JSON.stringify({}),
            },
          },
          adminRole: {
            create: {
              email: adminEmail,
              isSuperAdmin: true,
            },
          },
        },
        include: { profile: true, adminRole: true },
      });

      console.log(`✅ Admin user created: ${adminUser.username} (${adminUser.email})`);
      console.log(`   Admin ID: ${adminUser.id}`);
      console.log(`   Super Admin: ${adminUser.adminRole?.isSuperAdmin}`);
    }

    // 3. Summary
    const totalUsers = await prisma.user.count();
    const totalAchievements = await prisma.achievement.count();
    const totalProfiles = await prisma.profile.count();

    console.log('\n🎉 Production database seeding completed!');
    console.log(`   Users:          ${totalUsers}`);
    console.log(`   Profiles:       ${totalProfiles}`);
    console.log(`   Achievements:   ${totalAchievements}`);

  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
SEED_SCRIPT

  success "Seed runner script created"
}

# ── Run Seed ──
run_seed() {
  step "Seeding production database"

  cd "$PROJECT_DIR"

  # Ensure dependencies are installed
  if [[ ! -d "node_modules" ]]; then
    info "Installing dependencies..."
    if command -v bun &> /dev/null; then
      bun install 2>&1 | tail -3
    else
      npm install 2>&1 | tail -3
    fi
  fi

  # Generate Prisma client
  info "Generating Prisma client..."
  npx prisma generate 2>&1 | tail -3

  # Run the seed script
  info "Running seed script against production database..."
  DATABASE_URL="$DATABASE_URL" \
  TURSO_AUTH_TOKEN="$TURSO_AUTH_TOKEN" \
  ADMIN_EMAIL="$ADMIN_EMAIL" \
  ADMIN_USERNAME="$ADMIN_USERNAME" \
  ADMIN_PASSWORD="$ADMIN_PASSWORD" \
  ADMIN_PHONE="$ADMIN_PHONE" \
  node "$PROJECT_DIR/scripts/_seed-runner.mjs"

  if [[ $? -eq 0 ]]; then
    success "Production database seeded successfully!"
  else
    error "Database seeding failed. Check the error output above."
    exit 1
  fi

  # Clean up the temporary seed script
  rm -f "$PROJECT_DIR/scripts/_seed-runner.mjs"
}

# ── Verify Seed ──
verify_seed() {
  step "Verifying seed data"

  cd "$PROJECT_DIR"

  # Quick verification via Prisma Studio or a count query
  info "Verifying database contents..."

  # Use a simple Node.js script for verification
  node -e "
    const { PrismaClient } = require('@prisma/client');
    const { PrismaLibSql } = require('@prisma/adapter-libsql');

    async function verify() {
      const url = '$DATABASE_URL';
      const token = '$TURSO_AUTH_TOKEN';
      let prisma;
      if (url.startsWith('libsql://')) {
        const adapter = new PrismaLibSql({ url, authToken: token });
        prisma = new PrismaClient({ adapter, log: ['error'] });
      } else {
        prisma = new PrismaClient({ log: ['error'] });
      }

      try {
        const users = await prisma.user.count();
        const achievements = await prisma.achievement.count();
        const profiles = await prisma.profile.count();
        const adminRoles = await prisma.adminRole.count();

        console.log('  Users:        ' + users);
        console.log('  Profiles:     ' + profiles);
        console.log('  Achievements: ' + achievements);
        console.log('  Admin Roles:  ' + adminRoles);

        if (users > 0 && achievements > 0) {
          console.log('✅ Verification passed — database is populated');
        } else {
          console.log('⚠️  Database may be empty or incomplete');
        }
      } catch(e) {
        console.log('⚠️  Could not verify:', e.message);
      } finally {
        await prisma.\$disconnect();
      }
    }
    verify();
  " 2>/dev/null || warn "Could not run verification (Prisma client may need regeneration)"
}

# ── Output Summary ──
output_summary() {
  echo -e "\n${BOLD}${GREEN}═══════════════════════════════════════════════════════${NC}"
  echo -e "${BOLD}${GREEN}   Database Seeding Complete! 🎉${NC}"
  echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════════${NC}\n"

  echo -e "${BOLD}Admin Credentials:${NC}"
  echo -e "  Email:    $ADMIN_EMAIL"
  echo -e "  Username: $ADMIN_USERNAME"
  echo -e "  Phone:    $ADMIN_PHONE"
  echo -e "  Password: ${CYAN}(set during configuration)${NC}"
  echo -e ""
  echo -e "${YELLOW}${BOLD}⚠️  IMPORTANT:${NC}"
  echo -e "  • Change the admin password after first login!"
  echo -e "  • Do NOT use default credentials in production!"
  echo -e "  • Re-run this script anytime to add new achievements"
  echo -e ""
}

# ── Main ──
main() {
  banner
  resolve_db_connection
  verify_connection
  prompt_admin_credentials
  create_seed_script
  run_seed
  verify_seed
  output_summary
}

# Handle flags
while [[ $# -gt 0 ]]; do
  case "$1" in
    --non-interactive)
      # Use default credentials without prompting
      ADMIN_EMAIL="$DEFAULT_ADMIN_EMAIL"
      ADMIN_USERNAME="$DEFAULT_ADMIN_USERNAME"
      ADMIN_PASSWORD="$DEFAULT_ADMIN_PASSWORD"
      ADMIN_PHONE="$DEFAULT_ADMIN_PHONE"
      shift ;;
    --help|-h)
      echo "Usage: $0 [--non-interactive] [--help]"
      echo ""
      echo "  --non-interactive   Use default admin credentials without prompting"
      echo "  --help              Show this help message"
      echo ""
      echo "Environment variables (override defaults):"
      echo "  ADMIN_EMAIL       Admin email address"
      echo "  ADMIN_USERNAME    Admin username"
      echo "  ADMIN_PASSWORD    Admin password"
      echo "  ADMIN_PHONE       Admin phone number"
      echo "  DATABASE_URL      Turso database URL"
      echo "  TURSO_AUTH_TOKEN  Turso auth token"
      exit 0
      ;;
    *) error "Unknown option: $1"; exit 1 ;;
  esac
done

main
