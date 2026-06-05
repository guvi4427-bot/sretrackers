import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
  { key: "time_streak_3", name: "3-Day Focus", description: "Maintain 3-day streak", iconEmoji: "🔥", xpReward: 25, tier: "bronze", category: "time", criteria: JSON.stringify({ type: "streak", value: 3 }) },
  { key: "time_streak_7", name: "Week Focused", description: "Maintain 7-day streak", iconEmoji: "🔥", xpReward: 50, tier: "silver", category: "time", criteria: JSON.stringify({ type: "streak", value: 7 }) },
  { key: "time_streak_30", name: "Monthly Focus", description: "Maintain 30-day streak", iconEmoji: "🔥", xpReward: 200, tier: "gold", category: "time", criteria: JSON.stringify({ type: "streak", value: 30 }) },

  // CONTENT (25)
  { key: "content_first_post", name: "Social Butterfly", description: "Make your first post", iconEmoji: "🦋", xpReward: 10, tier: "bronze", category: "content", criteria: JSON.stringify({ type: "content_posts", value: 1 }) },
  { key: "content_five_posts", name: "Rising Voice", description: "Make 5 posts", iconEmoji: "📢", xpReward: 20, tier: "bronze", category: "content", criteria: JSON.stringify({ type: "content_posts", value: 5 }) },
  { key: "content_ten_posts", name: "Content Creator", description: "Make 10 posts", iconEmoji: "🎬", xpReward: 50, tier: "silver", category: "content", criteria: JSON.stringify({ type: "content_posts", value: 10 }) },
  { key: "content_twenty_posts", name: "Broadcaster", description: "Make 20 posts", iconEmoji: "📡", xpReward: 75, tier: "silver", category: "content", criteria: JSON.stringify({ type: "content_posts", value: 20 }) },
  { key: "content_fifty_posts", name: "Influencer", description: "Make 50 posts", iconEmoji: "⭐", xpReward: 150, tier: "gold", category: "content", criteria: JSON.stringify({ type: "content_posts", value: 50 }) },
  { key: "content_hundred_posts", name: "Media Mogul", description: "Make 100 posts", iconEmoji: "🏆", xpReward: 300, tier: "platinum", category: "content", criteria: JSON.stringify({ type: "content_posts", value: 100 }) },
  { key: "content_streak_3", name: "3-Day Creator", description: "Maintain 3-day streak", iconEmoji: "🔥", xpReward: 25, tier: "bronze", category: "content", criteria: JSON.stringify({ type: "streak", value: 3 }) },
  { key: "content_streak_7", name: "Content Week", description: "Maintain 7-day streak", iconEmoji: "🔥", xpReward: 50, tier: "silver", category: "content", criteria: JSON.stringify({ type: "streak", value: 7 }) },
  { key: "content_streak_30", name: "Content Machine", description: "Maintain 30-day streak", iconEmoji: "🔥", xpReward: 200, tier: "gold", category: "content", criteria: JSON.stringify({ type: "streak", value: 30 }) },
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const adminEmail = process.env.ADMIN_EMAIL || 'myselfgowtham140707@gmail.com';
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Gowtham@123';
  const adminPhone = process.env.ADMIN_PHONE || '+918148796055';

  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL environment variable is required');
    process.exit(1);
  }

  let prisma;
  // Use Turso adapter if libsql URL, otherwise standard PrismaClient
  if (databaseUrl.startsWith('libsql://') || databaseUrl.startsWith('http://') || databaseUrl.startsWith('https://')) {
    const { PrismaLibSql } = await import('@prisma/adapter-libsql');
    const adapter = new PrismaLibSql({
      url: databaseUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    prisma = new PrismaClient({ adapter, log: ['error'] });
  } else {
    prisma = new PrismaClient({ log: ['error'] });
  }

  try {
    console.log('Seeding database...');

    // 1. Seed Achievements
    console.log(`Upserting ${ACHIEVEMENT_DEFS.length} achievements...`);
    let achievementCount = 0;
    for (const def of ACHIEVEMENT_DEFS) {
      await prisma.achievement.upsert({
        where: { key: def.key },
        update: { name: def.name, description: def.description, iconEmoji: def.iconEmoji, xpReward: def.xpReward, tier: def.tier, category: def.category, criteria: def.criteria },
        create: def,
      });
      achievementCount++;
    }
    console.log(`Seeded ${achievementCount} achievements`);

    // 2. Seed Admin User
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existingAdmin) {
      console.log(`Admin user already exists (${adminEmail}), skipping creation`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);
      const adminUser = await prisma.user.create({
        data: {
          email: adminEmail, phone: adminPhone, username: adminUsername, passwordHash,
          profile: { create: { name: 'Gowtham', xp: 0, level: 1, currentStreak: 0, longestStreak: 0, onboardingComplete: true, activePhases: '[]', phaseActivityMap: '{}' } },
          adminRole: { create: { email: adminEmail, isSuperAdmin: true } },
        },
        include: { profile: true, adminRole: true },
      });
      console.log(`Admin user created: ${adminUser.username} (${adminUser.email})`);
    }

    // 3. Summary
    const totalUsers = await prisma.user.count();
    const totalAchievements = await prisma.achievement.count();
    console.log(`\nDatabase seeding completed! Users: ${totalUsers}, Achievements: ${totalAchievements}`);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
