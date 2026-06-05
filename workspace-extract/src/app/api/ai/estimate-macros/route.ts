import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FOOD_DATABASE, UNIT_TO_GRAMS } from '@/lib/constants';
import { aiQuickCall } from '@/lib/ai-provider';

// ── Unit conversion ──
function convertToGrams(mealName: string, quantity: number, unit: string): number {
  const u = unit.toLowerCase().trim();
  if (u === 'g' || u === 'ml') return quantity;

  const foodKey = mealName.toLowerCase().trim();
  for (const key of [`${foodKey}:${u}`, `${foodKey.split(' ')[0]}:${u}`, `default:${u}`]) {
    if (UNIT_TO_GRAMS[key]) return quantity * UNIT_TO_GRAMS[key];
  }

  const EXTRA: Record<string, number> = {
    piece: 120, pc: 120, slice: 30, bowl: 250, plate: 300,
    glass: 240, can: 330, bottle: 500, packet: 50, bar: 60,
    scoop: 30, medium: 150, large: 250, small: 80, whole: 200,
    half: 100, handful: 30, pcs: 120, katori: 150,
  };
  return EXTRA[u] ? quantity * EXTRA[u] : quantity;
}

// ── Scored DB search ──
function findInDatabase(searchKey: string) {
  let best: typeof FOOD_DATABASE[number] | null = null;
  let bestScore = 0;
  const searchWords = searchKey.split(/\s+/).filter(w => w.length > 1);

  for (const food of FOOD_DATABASE) {
    const foodKey = food.name.toLowerCase().trim();
    const foodWords = foodKey.split(/\s+/);
    let score = 0;

    if (searchKey === foodKey) {
      score = 100;
    } else if (foodKey.includes(searchKey) || searchKey.includes(foodKey)) {
      const ratio = Math.min(searchKey.length, foodKey.length) / Math.max(searchKey.length, foodKey.length);
      score = 70 + ratio * 20;
    } else {
      const matched = searchWords.filter(sw =>
        foodWords.some(fw => fw === sw || (sw.length > 3 && fw.includes(sw)))
      ).length;
      if (matched > 0) score = (matched / Math.max(searchWords.length, foodWords.length)) * 60;
    }

    if (score > bestScore) { bestScore = score; best = food; }
  }
  return bestScore >= 40 ? best : null;
}

function computeDbMacros(match: typeof FOOD_DATABASE[number], grams: number) {
  const m = Math.max(0.01, grams / 100);
  return {
    calories:  Math.round(match.calories * m),
    proteinG:  Math.round(match.protein  * m * 10) / 10,
    carbsG:    Math.round(match.carbs    * m * 10) / 10,
    fatG:      Math.round(match.fat      * m * 10) / 10,
    fiberG:    Math.round(match.fiber    * m * 10) / 10,
  };
}

// ── AI call using provider chain (Gemini → ChatGPT → OpenRouter) ──
async function fetchAIMacros(
  mealName: string, quantity: number, unit: string, grams: number
): Promise<{ calories: number; proteinG: number; carbsG: number; fatG: number; fiberG: number } | null> {
  try {
    const prompt = `Estimate macros for: ${mealName}, quantity: ${quantity} ${unit} (~${Math.round(grams)}g). Return ONLY JSON: {"calories":number,"proteinG":number,"carbsG":number,"fatG":number,"fiberG":number}. Calculate for the EXACT quantity given.`;

    const content = await aiQuickCall(
      'You are a nutrition database. Return only valid JSON macros for the exact quantity specified.',
      prompt,
      100,
    );

    if (!content) return null;
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    if (!parsed.calories) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { mealName, quantity, quantityUnit } = await req.json();
    if (!mealName) return NextResponse.json({ error: 'Meal name required' }, { status: 400 });

    const quantityNum = typeof quantity === 'number' ? quantity : parseFloat(quantity) || 1;
    const userUnit    = (quantityUnit || 'g').toLowerCase();
    const searchKey   = mealName.toLowerCase().trim();
    const grams       = convertToGrams(mealName, quantityNum, userUnit);

    // ── Step 1: Instant DB lookup (< 5ms) ──
    const dbMatch  = findInDatabase(searchKey);
    const dbMacros = dbMatch ? computeDbMacros(dbMatch, grams) : null;

    // ── Step 2: If DB matched → return instantly, fire AI in background (ignored) ──
    // DB is accurate for standard foods. No need to wait for AI.
    if (dbMacros) {
      return NextResponse.json({
        ...dbMacros,
        source: 'database',
        confidence: 0.92,
        calculatedGrams: Math.round(grams),
      });
    }

    // ── Step 3: DB miss → try AI with hard 3s timeout ──
    // Only unknown/custom foods reach here (e.g. "Mum's dal tadka")
    const aiMacros = await fetchAIMacros(mealName, quantityNum, userUnit, grams);

    if (aiMacros && aiMacros.calories > 0) {
      return NextResponse.json({
        calories:  Math.round(aiMacros.calories),
        proteinG:  Math.round((aiMacros.proteinG || 0) * 10) / 10,
        carbsG:    Math.round((aiMacros.carbsG   || 0) * 10) / 10,
        fatG:      Math.round((aiMacros.fatG      || 0) * 10) / 10,
        fiberG:    Math.round((aiMacros.fiberG    || 0) * 10) / 10,
        source: 'ai',
        confidence: 0.65,
        calculatedGrams: Math.round(grams),
      });
    }

    // ── Step 4: Generic fallback (both failed) ──
    const m = Math.max(0.01, grams / 100);
    return NextResponse.json({
      calories: Math.round(200 * m),
      proteinG: Math.round(10  * m * 10) / 10,
      carbsG:   Math.round(25  * m * 10) / 10,
      fatG:     Math.round(8   * m * 10) / 10,
      fiberG:   Math.round(2   * m * 10) / 10,
      source: 'estimate',
      confidence: 0.3,
      calculatedGrams: Math.round(grams),
    });

  } catch (error) {
    console.error('Estimate macros error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
