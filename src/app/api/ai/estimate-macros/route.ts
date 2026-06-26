import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FOOD_DATABASE, UNIT_TO_GRAMS } from '@/lib/constants';
import { SUPPLEMENT_DATABASE } from '@/lib/supplement-db';
import { aiQuickCall } from '@/lib/ai-provider';
import { getModuleMemory } from '@/lib/ai-module-context';

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

// ── Milk variant detection ──
// Detects which milk variant the user is referring to based on the meal name.
// Returns the variant key for looking up in FOOD_DATABASE, or null if not milk.
const MILK_VARIANTS = [
  { pattern: /\b(full[\s-]?cream|whole\s+milk|amul\s+gold|mother\s+dairy\s+full|arokya\s+full|nandini\s+full|heritage\s+full|britannia\s+full)\b/i, dbKey: 'milk (full cream)' },
  { pattern: /\b(standardized\s+milk)\b/i, dbKey: 'milk (standardized)' },
  { pattern: /\b(toned\s+milk|amul\s+taaza|mother\s+dairy\s+toned|arokya\s+toned|nandini\s+toned|heritage\s+toned|britannia\s+toned)\b/i, dbKey: 'milk (toned)' },
  { pattern: /\b(double[\s-]?toned|amul\s+slim)\b/i, dbKey: 'milk (double toned)' },
  { pattern: /\b(skim[\s-]?med|skim\s+milk|amul\s+skim)\b/i, dbKey: 'milk (skim)' },
];

function detectMilkVariant(mealName: string): string | null {
  for (const { pattern, dbKey } of MILK_VARIANTS) {
    if (pattern.test(mealName)) return dbKey;
  }
  // Generic "milk" — caller will resolve using user preference or default to Full Cream
  if (/\bmilk\b/i.test(mealName) && !/\b(soy|almond|coconut|oat)\b/i.test(mealName)) {
    return 'milk'; // ambiguous — caller resolves
  }
  return null;
}

// ── Scored DB search (food database) ──
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

// ── Scored DB search (supplement database) ──
// Returns match + servingSize for accurate per-serving calculations
function findInSupplementDatabase(searchKey: string) {
  let best: typeof SUPPLEMENT_DATABASE[number] | null = null;
  let bestScore = 0;
  const searchWords = searchKey.split(/\s+/).filter(w => w.length > 1);

  for (const supp of SUPPLEMENT_DATABASE) {
    const suppKey = supp.name.toLowerCase().trim();
    const suppWords = suppKey.split(/\s+/);
    let score = 0;

    if (searchKey === suppKey) {
      score = 100;
    } else if (suppKey.includes(searchKey) || searchKey.includes(suppKey)) {
      const ratio = Math.min(searchKey.length, suppKey.length) / Math.max(searchKey.length, suppKey.length);
      score = 75 + ratio * 20;
    } else {
      const matched = searchWords.filter(sw =>
        suppWords.some(fw => fw === sw || (sw.length > 3 && fw.includes(sw)))
      ).length;
      if (matched > 0) score = (matched / Math.max(searchWords.length, suppWords.length)) * 65;
    }

    // Brand match bonus — if user mentions the brand, prioritize brand matches
    if (supp.brand) {
      const brandLower = supp.brand.toLowerCase();
      if (searchKey.includes(brandLower)) {
        score += 15;
      }
    }

    if (score > bestScore) { bestScore = score; best = supp; }
  }
  return bestScore >= 45 ? best : null;
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

function computeSupplementMacros(match: typeof SUPPLEMENT_DATABASE[number], grams: number) {
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

    // ── Step 0: Milk variant detection ──
    // If the user just said "milk" without specifying variant, check their
    // saved memory for a preferred milk variant. If they previously mentioned
    // "Arokya Full Cream Milk", that becomes their default.
    const milkVariant = detectMilkVariant(mealName);
    if (milkVariant === 'milk') {
      try {
        const memory = await getModuleMemory(session.user.id, 'fitness');
        const milkPrefs = memory.frequentItems.filter(item =>
          /full cream|toned|double toned|skim|standardized/i.test(item)
        );
        if (milkPrefs.length > 0) {
          // Use the most-recently mentioned milk variant
          const preferredVariant = milkPrefs[milkPrefs.length - 1].toLowerCase();
          const variantMap: Record<string, string> = {
            'full cream milk': 'milk (full cream)',
            'standardized milk': 'milk (standardized)',
            'toned milk': 'milk (toned)',
            'double toned milk': 'milk (double toned)',
            'skim milk': 'milk (skim)',
          };
          for (const [label, dbKey] of Object.entries(variantMap)) {
            if (preferredVariant.includes(label)) {
              const match = FOOD_DATABASE.find(f => f.name.toLowerCase() === dbKey);
              if (match) {
                const macros = computeDbMacros(match, grams);
                return NextResponse.json({
                  ...macros,
                  source: 'database',
                  confidence: 0.95,
                  calculatedGrams: Math.round(grams),
                  note: `Used your preferred milk variant: ${label} (from memory)`,
                });
              }
              break;
            }
          }
        }
      } catch {
        // Memory lookup failed — fall through to default search
      }
      // No saved preference — default to Full Cream (conservative, higher calories)
      // This fixes the original bug where "milk" was using toned milk values.
      const fullCream = FOOD_DATABASE.find(f => f.name.toLowerCase() === 'milk (full cream)');
      if (fullCream) {
        const macros = computeDbMacros(fullCream, grams);
        return NextResponse.json({
          ...macros,
          source: 'database',
          confidence: 0.90,
          calculatedGrams: Math.round(grams),
          note: 'Defaulted to Full Cream Milk (6% fat). To use a different variant, specify "toned milk", "skim milk", etc.',
        });
      }
    }

    // ── Step 1: Supplement database lookup (whey protein, etc.) ──
    // Check supplement DB FIRST for protein powders and branded supplements,
    // because these have brand-specific serving sizes and accurate macros.
    const supplementMatch = findInSupplementDatabase(searchKey);
    if (supplementMatch) {
      // If user specified a serving-based unit (scoop, bar, tablet, etc.) and
      // the supplement has a servingSize, calculate based on servings × servingSize
      let effectiveGrams = grams;
      if (supplementMatch.servingSize && supplementMatch.servingUnit) {
        const u = userUnit.toLowerCase();
        if (u === supplementMatch.servingUnit.toLowerCase() || (u === 'serving' && supplementMatch.servingUnit)) {
          effectiveGrams = quantityNum * supplementMatch.servingSize;
        }
      }
      const macros = computeSupplementMacros(supplementMatch, effectiveGrams);
      return NextResponse.json({
        ...macros,
        source: 'database',
        confidence: 0.95,
        calculatedGrams: Math.round(effectiveGrams),
        brand: supplementMatch.brand,
        matchedName: supplementMatch.name,
      });
    }

    // ── Step 2: Food database lookup (< 5ms) ──
    const dbMatch  = findInDatabase(searchKey);
    const dbMacros = dbMatch ? computeDbMacros(dbMatch, grams) : null;

    // ── Step 3: If DB matched → return instantly ──
    // DB is accurate for standard foods including all milk variants.
    if (dbMacros) {
      return NextResponse.json({
        ...dbMacros,
        source: 'database',
        confidence: 0.92,
        calculatedGrams: Math.round(grams),
        matchedName: dbMatch?.name,
      });
    }

    // ── Step 4: DB miss → try AI with hard 3s timeout ──
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

    // ── Step 5: Generic fallback (both failed) ──
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
