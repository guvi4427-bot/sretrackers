import { db } from "@/lib/db";
import { calculateLevel } from "./gamification";

// ── Shared Achievement Eligibility Checker ──
// Called from awardXP() and the achievements GET endpoint.
// Checks all achievements for a user and creates `achievement_eligible`
// notifications for any newly eligible ones (that don't already have a notification).

interface CriteriaCheck {
  type: string;
  value: number;
}

async function checkCriteria(userId: string, criteria: CriteriaCheck): Promise<{ current: number; met: boolean }> {
  const profile = await db.profile.findUnique({ where: { userId } });
  if (!profile) return { current: 0, met: false };

  let current = 0;

  switch (criteria.type) {
    case 'learning_entries':
      current = await db.learningEntry.count({ where: { userId } });
      break;
    case 'learning_topics':
      current = await db.learningTopic.count({ where: { userId } });
      break;
    case 'learning_notes': {
      const entries = await db.learningEntry.findMany({ where: { userId, content: { not: null } } });
      current = entries.filter((e: any) => e.content && e.content.trim().length > 0).length;
      break;
    }
    case 'learning_duration': {
      const result = await db.learningEntry.aggregate({ where: { userId }, _sum: { duration: true } });
      current = result._sum.duration || 0;
      break;
    }
    case 'learning_shared':
      current = await db.learningTopic.count({ where: { userId, isSharedCollection: true } });
      break;
    case 'learning_deep_topic': {
      const topics = await db.learningTopic.findMany({ where: { userId }, include: { _count: { select: { entries: true } } } });
      current = topics.reduce((max: number, t: any) => Math.max(max, t._count.entries), 0);
      break;
    }
    case 'fitness_workouts':
      current = await db.fitnessWorkoutLog.count({ where: { userId } });
      break;
    case 'fitness_meals':
      current = await db.fitnessFoodLog.count({ where: { userId } });
      break;
    case 'fitness_weights':
      current = await db.fitnessWeightLog.count({ where: { userId } });
      break;
    case 'fitness_workout_duration': {
      const result = await db.fitnessWorkoutLog.aggregate({ where: { userId }, _sum: { duration: true } });
      current = result._sum.duration || 0;
      break;
    }
    case 'weight_training_sessions':
      current = await db.fitnessWorkoutLog.count({ where: { userId, workoutType: 'Weight Training' } });
      break;
    case 'weight_training_load_increase': {
      const sessions = await db.fitnessWorkoutLog.findMany({
        where: { userId, workoutType: 'Weight Training', loadKg: { not: null } },
        orderBy: { createdAt: 'asc' },
        select: { loadKg: true }
      });
      const hasIncrease = sessions.length >= 2 && sessions.some((s, i) =>
        i > 0 && (s.loadKg ?? 0) > (sessions[i - 1].loadKg ?? 0)
      );
      current = hasIncrease ? 1 : 0;
      break;
    }
    case 'weight_training_rep_increase': {
      const sessions = await db.fitnessWorkoutLog.findMany({
        where: { userId, workoutType: 'Weight Training', reps: { not: null } },
        orderBy: { createdAt: 'asc' },
        select: { reps: true }
      });
      const hasIncrease = sessions.length >= 2 && sessions.some((s, i) =>
        i > 0 && (s.reps ?? 0) > (sessions[i - 1].reps ?? 0)
      );
      current = hasIncrease ? 1 : 0;
      break;
    }
    case 'weight_training_set_increase': {
      const sessions = await db.fitnessWorkoutLog.findMany({
        where: { userId, workoutType: 'Weight Training', sets: { not: null } },
        orderBy: { createdAt: 'asc' },
        select: { sets: true }
      });
      const hasIncrease = sessions.length >= 2 && sessions.some((s, i) =>
        i > 0 && (s.sets ?? 0) > (sessions[i - 1].sets ?? 0)
      );
      current = hasIncrease ? 1 : 0;
      break;
    }
    case 'weight_training_intermediate': {
      const sessions = await db.fitnessWorkoutLog.findMany({
        where: { userId, workoutType: 'Weight Training', loadKg: { not: null } },
        orderBy: { createdAt: 'asc' },
        select: { loadKg: true }
      });
      current = sessions.filter((s, i) =>
        i > 0 && (s.loadKg ?? 0) > (sessions[i - 1].loadKg ?? 0)
      ).length;
      break;
    }
    case 'time_focus':
      current = await db.focusSession.count({ where: { userId, completed: true } });
      break;
    case 'time_tasks':
      current = await db.timeTask.count({ where: { userId, status: 'completed' } });
      break;
    case 'time_focus_duration': {
      const result = await db.focusSession.aggregate({ where: { userId, completed: true }, _sum: { duration: true } });
      current = result._sum.duration || 0;
      break;
    }
    case 'content_posts':
      current = await db.post.count({ where: { userId } });
      break;
    case 'content_scripts': {
      // Count entries where series.category is 'script' OR (contentType is 'video' and has moved past scripted step)
      const scriptBySeries = await db.contentEntry.count({ where: { userId, series: { category: 'script' } } });
      const scriptByLiveStatus = await db.contentEntry.count({ where: { userId, contentType: 'video', liveStatus: { in: ['scripted', 'shoot', 'edit', 'posted'] } } });
      current = scriptBySeries + scriptByLiveStatus;
      break;
    }
    case 'content_videos': {
      // Count video entries: series.category is 'video' OR contentType is 'video'
      const vidBySeries = await db.contentEntry.count({ where: { userId, series: { category: 'video' } } });
      // Count video-type entries NOT already counted by series category
      const vidByType = await db.contentEntry.count({ where: { userId, contentType: 'video', series: { OR: [{ category: null }, { category: { not: 'video' } }] } } });
      current = vidBySeries + vidByType;
      break;
    }
    case 'content_blogs': {
      // Count blog entries: series.category is 'blog' OR contentType is 'blog'
      const blogBySeries = await db.contentEntry.count({ where: { userId, series: { category: 'blog' } } });
      // Count blog-type entries NOT already counted by series category
      const blogByType = await db.contentEntry.count({ where: { userId, contentType: 'blog', series: { OR: [{ category: null }, { category: { not: 'blog' } }] } } });
      current = blogBySeries + blogByType;
      break;
    }
    case 'content_live_posted':
      current = await db.contentEntry.count({ where: { userId, liveStatus: 'posted' } });
      break;
    case 'content_live_pipeline_blog':
      current = await db.contentEntry.count({ where: { userId, contentType: 'blog', liveStatus: 'posted' } });
      break;
    case 'content_live_pipeline_video':
      current = await db.contentEntry.count({ where: { userId, contentType: 'video', liveStatus: 'posted' } });
      break;
    case 'content_live_pipeline_post':
      current = await db.contentEntry.count({ where: { userId, contentType: 'post', liveStatus: 'posted' } });
      break;
    case 'streak':
      current = profile.currentStreak || 0;
      break;
    case 'longest_streak':
      current = profile.longestStreak || 0;
      break;
    case 'level':
      current = profile.level || 1;
      break;
    case 'xp':
      current = profile.xp || 0;
      break;
    case 'followers':
      current = await db.follow.count({ where: { followingId: userId, status: 'accepted' } });
      break;
    default:
      current = 0;
  }

  return { current, met: current >= criteria.value };
}

/**
 * Check all achievements for a user and create `achievement_eligible` notifications
 * for any newly eligible achievements that don't already have a notification.
 * This is called from awardXP() so notifications appear immediately when earned,
 * not just when visiting the achievements page.
 * 
 * Returns the count of new notifications created.
 */
export async function checkAndNotifyEligibleAchievements(userId: string): Promise<number> {
  try {
    const allAchievements = await db.achievement.findMany({
      orderBy: [{ category: 'asc' }, { tier: 'asc' }, { xpReward: 'asc' }],
    });

    if (allAchievements.length === 0) {
      console.warn('[AchievementCheck] No achievements found in database. Run /api/seed to populate.');
      return 0;
    }

    const userAchievements = await db.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });
    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

    // Get existing eligible notifications to avoid duplicates
    const existingNotifs = await db.notification.findMany({
      where: {
        userId,
        type: 'achievement_eligible',
      },
      select: { data: true },
    });
    const alreadyNotifiedIds = new Set(
      existingNotifs.map(n => {
        try { return JSON.parse(n.data || '{}').achievementId; }
        catch { return null; }
      }).filter(Boolean)
    );

    let newNotificationCount = 0;

    // Check each achievement for eligibility
    for (const a of allAchievements) {
      // Skip already unlocked achievements
      if (unlockedIds.has(a.id)) continue;
      // Skip already notified achievements
      if (alreadyNotifiedIds.has(a.id)) continue;

      // Check eligibility
      if (a.criteria) {
        try {
          const criteria = JSON.parse(a.criteria) as CriteriaCheck;
          const check = await checkCriteria(userId, criteria);
          if (check.met) {
            // Create notification for this newly eligible achievement
            try {
              await db.notification.create({
                data: {
                  userId,
                  type: 'achievement_eligible',
                  title: 'Achievement Ready!',
                  message: `${a.iconEmoji} ${a.name}! +${a.xpReward} XP`,
                  data: JSON.stringify({ achievementId: a.id }),
                },
              });
              newNotificationCount++;
            } catch (createErr) {
              console.error('[AchievementCheck] Failed to create notification for', a.key, createErr);
            }
          }
        } catch (criteriaErr) {
          console.error('[AchievementCheck] Failed to check criteria for', a.key, criteriaErr);
        }
      }
    }

    return newNotificationCount;
  } catch (error) {
    console.error('[AchievementCheck] checkAndNotifyEligibleAchievements error:', error);
    return 0;
  }
}
