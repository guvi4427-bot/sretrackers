import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ACHIEVEMENT_DEFS } from '@/lib/gamification';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * Sync all achievements from ACHIEVEMENT_DEFS into the database.
 * Uses upsert by key so existing achievements are updated and missing ones are created.
 * Protected by admin authorization.
 */
export async function POST(request: Request) {
  try {
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) {
      // Allow internal invocation via CRON_SECRET if automated
      const authHeader = request.headers.get('authorization');
      const cronSecret = process.env.CRON_SECRET;
      const isInternal = Boolean(cronSecret && authHeader === `Bearer ${cronSecret}`);

      if (!isInternal) {
        return NextResponse.json(
          { error: adminCheck.error!.message },
          { status: adminCheck.error!.status }
        );
      }
    }

    let created = 0;
    let updated = 0;

    for (const def of ACHIEVEMENT_DEFS) {
      const existing = await db.achievement.findUnique({ where: { key: def.key } });
      if (existing) {
        await db.achievement.update({
          where: { key: def.key },
          data: {
            name: def.name,
            description: def.description,
            iconEmoji: def.iconEmoji,
            xpReward: def.xpReward,
            tier: def.tier,
            category: def.category,
            criteria: JSON.stringify(def.criteria),
          },
        });
        updated++;
      } else {
        await db.achievement.create({
          data: {
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
        created++;
      }
    }

    const totalInDb = await db.achievement.count();

    return NextResponse.json({
      success: true,
      total: ACHIEVEMENT_DEFS.length,
      created,
      updated,
      totalInDb,
    });
  } catch (error) {
    console.error('Achievement sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
