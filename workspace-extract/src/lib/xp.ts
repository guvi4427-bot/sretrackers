import { db } from "@/lib/db";
import { XP_REWARDS, calculateLevel } from "./gamification";
import { checkAndNotifyEligibleAchievements } from "./achievements";

export async function awardXP(userId: string, category: keyof typeof XP_REWARDS, reason: string) {
  const amount = XP_REWARDS[category] || 10;
  
  const result = await db.$transaction(async (tx) => {
    const gain = await tx.xPGain.create({
      data: { userId, amount, reason, category },
    });
    
    const profile = await tx.profile.findUnique({ where: { userId } });
    if (!profile) throw new Error("Profile not found");
    
    const newXP = Math.max(0, profile.xp + amount);
    const newLevel = calculateLevel(newXP);
    const oldLevel = profile.level;
    
    // Update streak
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    let newStreak = profile.currentStreak;
    let newLongest = profile.longestStreak;
    
    if (profile.lastActiveDate !== today) {
      newStreak = profile.lastActiveDate === yesterday ? profile.currentStreak + 1 : 1;
      newLongest = Math.max(newStreak, profile.longestStreak);
    }
    
    const updated = await tx.profile.update({
      where: { userId },
      data: {
        xp: newXP,
        level: newLevel,
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActiveDate: today,
      },
    });
    
    // Level up notification
    if (newLevel > oldLevel) {
      await tx.notification.create({
        data: { userId, type: "level_up", title: "Level Up!", message: `You reached Level ${newLevel}!`, fromUserId: userId },
      });
    }
    
    return { gain, updated, amount, achievementsUnlocked: [] as string[], levelUp: newLevel > oldLevel };
  });
  
  // After transaction completes, check for newly eligible achievements.
  // Fire-and-forget: run in background so the API returns instantly.
  // The frontend polls notification count rapidly after xp-updated events,
  // so achievement notifications appear within ~1-2 seconds.
  checkAndNotifyEligibleAchievements(userId).catch((e) => {
    console.error('Achievement check error (background):', e);
  });
  
  return result;
}

export async function reverseXP(userId: string, amount: number, reason: string) {
  const result = await db.$transaction(async (tx) => {
    const profile = await tx.profile.findUnique({ where: { userId } });
    if (!profile) throw new Error("Profile not found");
    
    const newXP = Math.max(0, profile.xp - amount);
    const newLevel = calculateLevel(newXP);
    
    await tx.xPGain.create({
      data: { userId, amount: -amount, reason, category: "learning" },
    });
    
    const updated = await tx.profile.update({
      where: { userId },
      data: { xp: newXP, level: newLevel },
    });
    
    return { updated, newXP };
  });
  
  return result;
}

export async function updateStreak(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  const profile = await db.profile.findUnique({ where: { userId } });
  if (!profile) return;
  
  if (profile.lastActiveDate === today) return;
  
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const newStreak = profile.lastActiveDate === yesterday ? profile.currentStreak + 1 : 1;
  const newLongest = Math.max(newStreak, profile.longestStreak);
  
  await db.profile.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: today,
    },
  });
  
  return { currentStreak: newStreak, longestStreak: newLongest };
}
