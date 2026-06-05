import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/auth-helper';
import { awardXP, updateStreak, reverseXP } from '@/lib/xp';

export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const where: any = { userId };
    if (date) where.date = date;

    const foodLogs = await db.fitnessFoodLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Calculate daily totals if filtering by date
    const totals = foodLogs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.proteinG,
        carbs: acc.carbs + log.carbsG,
        fat: acc.fat + log.fatG,
        fiber: acc.fiber + log.fiberG,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    return NextResponse.json({ foodLogs, totals });
  } catch (error) {
    console.error('Food log GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch food logs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { mealName, quantity, quantityUnit, calories, proteinG, carbsG, fatG, fiberG, sugarG, date, mealCategory } = body;

    if (!mealName || !date || calories === undefined) {
      return NextResponse.json({ error: 'Meal name, date, and calories required' }, { status: 400 });
    }

    const foodLog = await db.fitnessFoodLog.create({
      data: {
        userId,
        mealName,
        quantity: quantity || 1,
        quantityUnit: quantityUnit || 'serving',
        calories: parseFloat(calories),
        proteinG: proteinG ? parseFloat(proteinG) : 0,
        carbsG: carbsG ? parseFloat(carbsG) : 0,
        fatG: fatG ? parseFloat(fatG) : 0,
        fiberG: fiberG ? parseFloat(fiberG) : 0,
        sugarG: sugarG ? parseFloat(sugarG) : 0,
        mealCategory: mealCategory || 'snack',
        date,
      },
    });

    // Award XP for meal logging (non-blocking — foodLog is already saved)
    let xpAwarded = 0;
    let newXP = 0;
    let newLevel = 0;
    try {
      const xpResult = await awardXP(userId, 'meal', `Logged meal: ${mealName}`);
      xpAwarded = xpResult.amount;
      newXP = xpResult.updated.xp;
      newLevel = xpResult.updated.level;
      await updateStreak(userId);
    } catch (xpError) {
      console.error('XP award error (foodLog still saved):', xpError);
    }

    return NextResponse.json({
      foodLog,
      xpAwarded,
      newXP,
      newLevel,
    }, { status: 201 });
  } catch (error) {
    console.error('Food log POST error:', error);
    return NextResponse.json({ error: 'Failed to create food log' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Food log ID required' }, { status: 400 });
    }

    const existing = await db.fitnessFoodLog.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Food log not found' }, { status: 404 });
    }

    // Reverse XP awarded for meal logging
    await reverseXP(userId, 5, `Deleted meal: ${existing.mealName}`);

    await db.fitnessFoodLog.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Food log DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete food log' }, { status: 500 });
  }
}
