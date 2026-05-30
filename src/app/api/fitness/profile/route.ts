import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/auth-helper';

const ACTIVITY_MULTIPLIERS: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
const GOAL_MULTIPLIERS: Record<string, number> = { lose: 0.8, maintain: 1.0, gain: 1.15 };

function calculateTDEE(weight: number, height: number, age: number, gender: string, activityLevel: string, goal: string): { tdee: number; calorieTarget: number; proteinTarget: number; fatTarget: number; carbTarget: number; fiberTarget: number } {
  // Mifflin-St Jeor equation
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const tdee = Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.375));

  // Required calories based on goal
  const calorieTarget = Math.round(tdee * (GOAL_MULTIPLIERS[goal] || 1.0));

  // Protein: 2g/kg body weight (male and female)
  const proteinTarget = Math.round(weight * 2);

  // Fat: (27.5% of required cal) / 9
  const fatTarget = Math.round((calorieTarget * 0.275) / 9);

  // Carb: (55% of required cal) / 4
  const carbTarget = Math.round((calorieTarget * 0.55) / 4);

  // Fiber: 14g per 1000 cal intake
  const fiberTarget = Math.round((calorieTarget / 1000) * 14);

  return { tdee, calorieTarget, proteinTarget, fatTarget, carbTarget, fiberTarget };
}

export async function GET() {
  try {
    const userId = await getUserId();
    const profile = await db.fitnessProfile.findUnique({ where: { userId } });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Fitness profile GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { weight, height, age, gender, activityLevel, goal, workoutLevel, dietType, fitnessPhase, unitSystem } = body;

    let tdee: number | null = null;
    let calorieTarget: number | null = null;
    let proteinTarget: number | null = null;

    if (weight && height && age && gender && activityLevel && goal) {
      const calc = calculateTDEE(weight, height, age, gender, activityLevel, goal);
      tdee = calc.tdee;
      calorieTarget = calc.calorieTarget;
      proteinTarget = calc.proteinTarget;
    }

    const profile = await db.fitnessProfile.create({
      data: {
        userId,
        weight: weight || null,
        height: height || null,
        age: age || null,
        gender: gender || null,
        activityLevel: activityLevel || null,
        goal: goal || null,
        tdee,
        workoutLevel: workoutLevel || null,
        dietType: dietType || null,
        fitnessPhase: fitnessPhase || null,
        unitSystem: unitSystem || 'metric',
        proteinTarget,
        calorieTarget,
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error('Fitness profile POST error:', error);
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { weight, height, age, gender, activityLevel, goal, workoutLevel, dietType, fitnessPhase, unitSystem } = body;

    const existing = await db.fitnessProfile.findUnique({ where: { userId } });
    if (!existing) {
      return NextResponse.json({ error: 'Profile not found. Create one first.' }, { status: 404 });
    }

    const w = weight ?? existing.weight;
    const h = height ?? existing.height;
    const a = age ?? existing.age;
    const g = gender ?? existing.gender;
    const al = activityLevel ?? existing.activityLevel;
    const gl = goal ?? existing.goal;

    let tdee = existing.tdee;
    let calorieTarget = existing.calorieTarget;
    let proteinTarget = existing.proteinTarget;

    if (w && h && a && g && al && gl) {
      const calc = calculateTDEE(w, h, a, g, al, gl);
      tdee = calc.tdee;
      calorieTarget = calc.calorieTarget;
      proteinTarget = calc.proteinTarget;
    }

    const profile = await db.fitnessProfile.update({
      where: { userId },
      data: {
        ...(weight !== undefined && { weight }),
        ...(height !== undefined && { height }),
        ...(age !== undefined && { age }),
        ...(gender !== undefined && { gender }),
        ...(activityLevel !== undefined && { activityLevel }),
        ...(goal !== undefined && { goal }),
        ...(workoutLevel !== undefined && { workoutLevel }),
        ...(dietType !== undefined && { dietType }),
        ...(fitnessPhase !== undefined && { fitnessPhase }),
        ...(unitSystem !== undefined && { unitSystem }),
        tdee,
        calorieTarget,
        proteinTarget,
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Fitness profile PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
