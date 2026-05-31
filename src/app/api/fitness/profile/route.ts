import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/auth-helper';
import { aiQuickCall } from '@/lib/ai-provider';

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

async function calculateMacrosWithAI(
  weight: number,
  height: number,
  age: number,
  gender: string,
  activityLevel: string,
  goal: string,
): Promise<{ tdee: number; calorieTarget: number; proteinTarget: number; fatTarget: number; carbTarget: number; fiberTarget: number }> {
  // Algorithm fallback — always computed first so it's available instantly
  const fallback = calculateTDEE(weight, height, age, gender, activityLevel, goal);

  try {
    const systemPrompt =
      'You are a certified sports nutritionist. Return ONLY valid JSON — no markdown, no explanation. Keys: tdee, calorieTarget, proteinTarget, fatTarget, carbTarget, fiberTarget. All values are integers (round to nearest). Units: calories (kcal), grams. Rules: calorieTarget must be between 1200 and 5000; proteinTarget between 50 and 350; fatTarget between 20 and 150; carbTarget between 50 and 500; fiberTarget between 15 and 50; tdee must be between 1000 and 5000. If any value is out of range the entire response is invalid.';

    const userPrompt =
      `Calculate personalized daily nutrition targets for: weight=${weight}kg, height=${height}cm, age=${age}, gender=${gender}, activity=${activityLevel}, goal=${goal}. Use evidence-based formulas (Mifflin-St Jeor + activity factor + goal adjustment) but also consider optimal macro ratios for the specific goal and activity level. Respond with ONLY the JSON object.`;

    const raw = await aiQuickCall(systemPrompt, userPrompt, 200);

    if (!raw) {
      console.log('[Macros] source=algorithm (AI returned null — no providers available)');
      return fallback;
    }

    // Extract JSON from response (may be wrapped in markdown code block)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('[Macros] source=algorithm (AI response had no JSON object)');
      return fallback;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate all required fields are present and are finite numbers
    const fields = ['tdee', 'calorieTarget', 'proteinTarget', 'fatTarget', 'carbTarget', 'fiberTarget'] as const;
    for (const field of fields) {
      if (typeof parsed[field] !== 'number' || !isFinite(parsed[field])) {
        console.warn(`[Macros] source=algorithm (AI field ${field} missing or non-finite)`);
        return fallback;
      }
    }

    // Sanity-check ranges — if any value is wildly out of range, fall back entirely
    if (
      parsed.calorieTarget < 1200 || parsed.calorieTarget > 5000 ||
      parsed.proteinTarget < 50 || parsed.proteinTarget > 350 ||
      parsed.fatTarget < 20 || parsed.fatTarget > 150 ||
      parsed.carbTarget < 50 || parsed.carbTarget > 500 ||
      parsed.fiberTarget < 15 || parsed.fiberTarget > 50 ||
      parsed.tdee < 1000 || parsed.tdee > 5000
    ) {
      console.warn(`[Macros] source=algorithm (AI values out of range: cal=${parsed.calorieTarget} pro=${parsed.proteinTarget} fat=${parsed.fatTarget} carb=${parsed.carbTarget})`);
      return fallback;
    }

    // Round all values to integers
    const result = {
      tdee: Math.round(parsed.tdee),
      calorieTarget: Math.round(parsed.calorieTarget),
      proteinTarget: Math.round(parsed.proteinTarget),
      fatTarget: Math.round(parsed.fatTarget),
      carbTarget: Math.round(parsed.carbTarget),
      fiberTarget: Math.round(parsed.fiberTarget),
    };

    console.log(`[Macros] source=ai cal=${result.calorieTarget} pro=${result.proteinTarget} fat=${result.fatTarget} carb=${result.carbTarget} fiber=${result.fiberTarget}`);
    return result;
  } catch (error: any) {
    console.warn(`[Macros] source=algorithm (AI error: ${error?.message?.slice(0, 120) || 'unknown'})`);
    return fallback;
  }
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
      const calc = await calculateMacrosWithAI(weight, height, age, gender, activityLevel, goal);
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
      const calc = await calculateMacrosWithAI(w, h, a, g, al, gl);
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
