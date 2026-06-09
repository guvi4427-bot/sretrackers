import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/auth-helper';
import {
  PROTEIN_FOODS,
  filterByDiet,
  sortByProteinPerCal,
  sortByAffordability,
  filterByMeal,
  getProteinRange,
  calculateDailyProtein,
  distributeProtein,
  generateEasyWins,
  mapDietType,
  DietType,
} from '@/lib/protein-foods';

export async function GET() {
  try {
    const userId = await getUserId();

    // Fetch fitness profile
    const profile = await db.fitnessProfile.findUnique({ where: { userId } });

    // Defaults if no profile
    const weightKg = profile?.weight || 70;
    const goal = profile?.goal || 'maintain';
    const dietType = mapDietType(profile?.dietType);

    // Get today's food logs for current protein intake
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = await db.fitnessFoodLog.findMany({
      where: { userId, date: today },
    });
    const currentProteinG = todayLogs.reduce((sum, log) => sum + (log.proteinG || 0), 0);

    // ── Protein Target Calculation ──
    const proteinRange = getProteinRange(goal);
    const proteinTarget = calculateDailyProtein(weightKg, goal);
    const remainingProtein = Math.max(0, proteinTarget.targetG - currentProteinG);

    // ── Meal Distribution ──
    const mealDistribution = distributeProtein(proteinTarget.targetG);

    // ── Filter foods by diet type ──
    const dietFoods = filterByDiet(PROTEIN_FOODS, dietType);

    // Sort: for fat loss, prefer higher protein-per-calorie; otherwise prefer affordability
    const sortedFoods = goal === 'lose'
      ? sortByProteinPerCal(dietFoods)
      : sortByAffordability(dietFoods);

    // ── Meal-wise recommendations (top 4 per meal) ──
    const meals = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
    const mealRecommendations: Record<string, typeof sortedFoods> = {};
    for (const meal of meals) {
      mealRecommendations[meal] = filterByMeal(sortedFoods, meal).slice(0, 4);
    }

    // ── Top affordable sources (top 8) ──
    const affordableSources = sortByAffordability(dietFoods).slice(0, 8);

    // ── Easy Protein Wins ──
    const easyWins = generateEasyWins(currentProteinG, proteinTarget.targetG, dietType, goal);

    // ── Risk awareness: collect all foods with risk notes ──
    const safetyNotes = dietFoods
      .filter(f => f.riskNote)
      .map(f => ({ food: f.name, note: f.riskNote! }));

    return NextResponse.json({
      proteinTarget: {
        minG: proteinTarget.minG,
        maxG: proteinTarget.maxG,
        targetG: proteinTarget.targetG,
        currentG: Math.round(currentProteinG * 10) / 10,
        remainingG: remainingProtein,
        rangeLabel: proteinRange.label,
        gPerKg: `${proteinRange.min}–${proteinRange.max} g/kg`,
      },
      mealDistribution,
      mealRecommendations,
      affordableSources,
      easyWins,
      safetyNotes,
      profile: {
        weightKg,
        goal,
        dietType,
      },
    });
  } catch (error) {
    console.error('Protein recommendations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
