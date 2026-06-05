import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { ACHIEVEMENT_DEFS } from "./gamification";

export async function seed() {
  console.log("🌱 Seeding database...");

  try {
    await db.$transaction(async (tx) => {
      for (const def of ACHIEVEMENT_DEFS) {
        await tx.achievement.upsert({
          where: { key: def.key },
          update: {
            name: def.name,
            description: def.description,
            iconEmoji: def.iconEmoji,
            xpReward: def.xpReward,
            tier: def.tier,
            category: def.category,
            criteria: JSON.stringify(def.criteria),
          },
          create: {
            key: def.key,
            name: def.name,
            description: def.description,
            iconEmoji: def.iconEmoji,
            xpReward: def.xpReward,
            tier: def.tier,
            category: def.category,
            criteria: JSON.stringify(def.criteria),
          },
        });
      }
      console.log(`✅ Seeded ${ACHIEVEMENT_DEFS.length} achievements`);

      // Check if admin already exists
      const existingAdmin = await tx.user.findUnique({
        where: { email: "myselfgowtham140707@gmail.com" },
      });

      if (existingAdmin) {
        console.log("ℹ️ Admin user already exists, skipping...");
        return;
      }

      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash("Gowtham@123", salt);

      const adminUser = await tx.user.create({
        data: {
          email: "myselfgowtham140707@gmail.com",
          phone: "+918148796055",
          username: "admin",
          passwordHash,
          profile: {
            create: {
              name: "Admin",
              xp: 0,
              level: 1,
              currentStreak: 0,
              longestStreak: 0,
              onboardingComplete: true,
              activePhases: JSON.stringify(["start", "restart", "explore"]),
              phaseActivityMap: JSON.stringify({}),
            },
          },
          adminRole: {
            create: {
              email: "myselfgowtham140707@gmail.com",
              isSuperAdmin: true,
            },
          },
        },
        include: { profile: true, adminRole: true },
      });

      console.log(`✅ Admin user created: ${adminUser.username} (${adminUser.email})`);
    }, { timeout: 30000 }); // 30 second timeout for Neon serverless

    console.log("🎉 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}
