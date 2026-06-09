import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/auth-helper';
import { awardXP, updateStreak, reverseXP } from '@/lib/xp';
import { checkAndNotifyEligibleAchievements } from '@/lib/achievements';

// Calorie estimates per minute for different workout types
const CALORIE_RATES: Record<string, number> = {
  'Running': 10,
  'Walking': 4,
  'Cycling': 8,
  'Swimming': 9,
  'Weight Training': 6,
  'HIIT': 12,
  'Yoga': 3,
  'Pilates': 4,
  'Dance': 7,
  'Boxing': 10,
  'Jump Rope': 11,
  'Rowing': 8,
  'Elliptical': 7,
  'Stair Climbing': 9,
  'Stretching': 2,
  'Basketball': 8,
  'Football': 8,
  'Tennis': 7,
  'Badminton': 6,
  'Cricket': 5,
  'Push-ups': 8,
  'Pull-ups': 8,
  'Squats': 7,
  'Planks': 5,
  'Burpees': 10,
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const targetUserId = searchParams.get('userId');

    // If userId is provided (public profile), use it; otherwise use logged-in user
    let userId: string;
    let isOwnData = true;
    if (targetUserId) {
      userId = targetUserId;
      isOwnData = false;
    } else {
      userId = await getUserId();
    }

    // Access control: check sharing settings and private account when viewing another user's data
    if (!isOwnData && targetUserId) {
      const viewerId = await getUserId();
      if (viewerId !== targetUserId) {
        const targetProfile = await db.profile.findUnique({ where: { userId: targetUserId }, select: { shareFitnessProgress: true, isPublic: true } });
        // If sharing is OFF, deny access
        if (!targetProfile?.shareFitnessProgress) {
          return NextResponse.json({ workouts: [] });
        }
        // If private account, check if viewer follows them
        if (targetProfile.isPublic === false) {
          const follow = await db.follow.findUnique({
            where: { followerId_followingId: { followerId: viewerId, followingId: targetUserId } },
            select: { status: true },
          });
          if (follow?.status !== 'accepted') {
            return NextResponse.json({ workouts: [] });
          }
        }
      }
    }

    const where: any = { userId };
    if (date) where.date = date;

    // When no date filter, order by date ascending for chart use;
    // when filtering by date, keep newest-first for display
    const workouts = await db.fitnessWorkoutLog.findMany({
      where,
      orderBy: date ? { createdAt: 'desc' } : { date: 'asc' },
    });

    return NextResponse.json({ workouts });
  } catch (error) {
    console.error('Workout GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { workoutType, duration, estimatedCalories, notes, date,
            muscleGroup, sets, reps, loadKg, workoutSplit } = body;

    if (!workoutType || !duration || !date) {
      return NextResponse.json({ error: 'Workout type, duration, and date required' }, { status: 400 });
    }

    // Calculate estimated calories if not provided
    const rate = CALORIE_RATES[workoutType] || 6;
    const calcCalories = estimatedCalories ? parseFloat(estimatedCalories) : Math.round(rate * parseInt(duration));

    const workout = await db.fitnessWorkoutLog.create({
      data: {
        userId,
        workoutType,
        duration: parseInt(duration),
        estimatedCalories: calcCalories,
        notes: notes || null,
        date,
        muscleGroup: muscleGroup || null,
        sets: sets ? parseInt(sets) : null,
        reps: reps ? parseInt(reps) : null,
        loadKg: loadKg ? parseFloat(loadKg) : null,
        workoutSplit: workoutSplit || null,
      },
    });

    // Award XP for workout (non-blocking — workout is already saved)
    let xpAwarded = 0;
    let newXP = 0;
    let newLevel = 0;
    try {
      const xpResult = await awardXP(userId, 'workout', `Workout: ${workoutType} for ${duration} min`);
      xpAwarded = xpResult.amount;
      newXP = xpResult.updated.xp;
      newLevel = xpResult.updated.level;
    } catch (xpError) {
      console.error('XP award error (workout still saved):', xpError);
    }

    // Check weight training progression achievements
    if (workoutType === 'Weight Training') {
      try {
        await checkAndNotifyEligibleAchievements(userId);
      } catch (achError) {
        console.error('Achievement check error (workout still saved):', achError);
      }
    }

    return NextResponse.json({
      workout,
      xpAwarded,
      newXP,
      newLevel,
    }, { status: 201 });
  } catch (error) {
    console.error('Workout POST error:', error);
    return NextResponse.json({ error: 'Failed to create workout' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { id, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Workout ID required' }, { status: 400 });
    }

    const existing = await db.fitnessWorkoutLog.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    const updated = await db.fitnessWorkoutLog.update({
      where: { id },
      data: { notes: notes ?? existing.notes },
    });

    return NextResponse.json({ workout: updated });
  } catch (error) {
    console.error('Workout PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update workout' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Workout ID required' }, { status: 400 });
    }

    const existing = await db.fitnessWorkoutLog.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    // Reverse XP awarded for workout
    await reverseXP(userId, 15, `Deleted workout: ${existing.workoutType}`);

    await db.fitnessWorkoutLog.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Workout DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 });
  }
}
