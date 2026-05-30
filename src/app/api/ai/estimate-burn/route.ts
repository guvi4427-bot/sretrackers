import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiQuickCall } from '@/lib/ai-provider';

const BURN_ESTIMATES: Record<string, number> = {
  running: 11, walking: 4, cycling: 8, swimming: 10,
  'weight training': 6, hiit: 12, yoga: 3, pilates: 4,
  dance: 7, boxing: 10, 'jump rope': 12, rowing: 9,
  elliptical: 7, 'stair climbing': 9, stretching: 2,
  basketball: 8, football: 9, tennis: 7, badminton: 6,
  cricket: 5, 'push-ups': 8, 'pull-ups': 9, squats: 7,
  planks: 4, burpees: 10,
};

// ── AI call using provider chain (Gemini → ChatGPT → OpenRouter) ──
async function fetchAIBurn(
  workoutType: string, duration: number
): Promise<{ estimatedCalories: number; reasoning: string } | null> {
  try {
    const content = await aiQuickCall(
      'You are a fitness AI. Return only valid JSON.',
      `Calories burned for ${workoutType} for ${duration} minutes, average 70kg person. Return ONLY JSON: {"estimatedCalories":number,"reasoning":"one short sentence"}`,
      60,
    );

    if (!content) return null;
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    if (!parsed.estimatedCalories) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { workoutType, duration } = await req.json();
    if (!workoutType || !duration) {
      return NextResponse.json({ error: 'Workout type and duration required' }, { status: 400 });
    }

    const key          = workoutType.toLowerCase();
    const burnPerMin   = BURN_ESTIMATES[key] || 6;
    const localCalories = Math.round(burnPerMin * duration);

    // ── Step 1: Return local estimate INSTANTLY ──
    // BURN_ESTIMATES is accurate for common workouts.
    // If workout is in the table, return immediately — no AI wait.
    if (BURN_ESTIMATES[key]) {
      return NextResponse.json({
        estimatedCalories: localCalories,
        reasoning: `~${burnPerMin} kcal/min for ${workoutType} × ${duration} min`,
        source: 'table',
      });
    }

    // ── Step 2: Unknown workout → try AI with hard 3s timeout ──
    const aiResult = await fetchAIBurn(workoutType, duration);

    if (aiResult?.estimatedCalories) {
      return NextResponse.json({
        estimatedCalories: aiResult.estimatedCalories,
        reasoning: aiResult.reasoning || 'AI estimated',
        source: 'ai',
      });
    }

    // ── Step 3: Fallback for unknown workout ──
    return NextResponse.json({
      estimatedCalories: localCalories,
      reasoning: `General estimate ~${burnPerMin} kcal/min × ${duration} min`,
      source: 'estimate',
    });

  } catch (error) {
    console.error('Estimate burn error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
