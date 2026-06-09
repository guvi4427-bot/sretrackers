/**
 * Local Protein Food Database
 * Offline-first — no AI dependency for core recommendations.
 * Contains common Indian, affordable, and globally accessible protein sources.
 *
 * Each food entry includes:
 * - name, serving, proteinG, calories per serving
 * - dietTypes: which diets include this food
 * - meals: which meals this food is appropriate for
 * - affordability: 1 (budget) → 5 (expensive)
 * - frequency: how often it's safe/practical to eat
 * - riskNote: safety limit or caveat (if any)
 * - proteinPerCal: protein-to-calorie ratio (higher = better for fat loss)
 */

export type DietType = 'non_veg' | 'eggetarian' | 'vegetarian' | 'vegan';

export interface ProteinFood {
  name: string;
  serving: string;
  proteinG: number;
  calories: number;
  dietTypes: DietType[];
  meals: ('breakfast' | 'lunch' | 'dinner' | 'snack')[];
  affordability: 1 | 2 | 3 | 4 | 5; // 1 = cheapest, 5 = most expensive
  frequency: string;
  riskNote?: string;
  category: 'egg' | 'dairy' | 'soy' | 'legume' | 'nut' | 'meat' | 'fish' | 'grain' | 'powder' | 'other';
}

// ──────────────────────────────────────────────────────
// PROTEIN FOOD DATABASE
// ──────────────────────────────────────────────────────

export const PROTEIN_FOODS: ProteinFood[] = [
  // ── EGGS ──
  {
    name: 'Eggs (Whole)',
    serving: '2 eggs',
    proteinG: 12,
    calories: 140,
    dietTypes: ['non_veg', 'eggetarian'],
    meals: ['breakfast', 'dinner'],
    affordability: 1,
    frequency: 'Daily',
    riskNote: 'Limit to 1–4 eggs/day depending on cholesterol profile.',
    category: 'egg',
  },
  {
    name: 'Egg Whites',
    serving: '4 egg whites',
    proteinG: 14,
    calories: 68,
    dietTypes: ['non_veg', 'eggetarian'],
    meals: ['breakfast', 'snack'],
    affordability: 1,
    frequency: 'Daily',
    category: 'egg',
  },

  // ── DAIRY ──
  {
    name: 'Milk (Full Cream)',
    serving: '1 glass (250ml)',
    proteinG: 8,
    calories: 150,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian'],
    meals: ['breakfast', 'snack'],
    affordability: 1,
    frequency: 'Daily',
    riskNote: 'Watch calories if on fat loss — consider toned/skim milk.',
    category: 'dairy',
  },
  {
    name: 'Milk (Toned/Skim)',
    serving: '1 glass (250ml)',
    proteinG: 8,
    calories: 90,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian'],
    meals: ['breakfast', 'snack'],
    affordability: 1,
    frequency: 'Daily',
    category: 'dairy',
  },
  {
    name: 'Curd/Yogurt',
    serving: '1 bowl (200g)',
    proteinG: 8,
    calories: 120,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian'],
    meals: ['lunch', 'snack'],
    affordability: 1,
    frequency: 'Daily',
    category: 'dairy',
  },
  {
    name: 'Greek Yogurt',
    serving: '1 cup (200g)',
    proteinG: 16,
    calories: 130,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian'],
    meals: ['breakfast', 'snack'],
    affordability: 3,
    frequency: '3–4x/week',
    category: 'dairy',
  },
  {
    name: 'Paneer',
    serving: '100g',
    proteinG: 18,
    calories: 265,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian'],
    meals: ['lunch', 'dinner'],
    affordability: 3,
    frequency: '3–4x/week',
    riskNote: 'High calorie density — limit portions during fat loss.',
    category: 'dairy',
  },

  // ── SOY ──
  {
    name: 'Soya Chunks (Textured Soy Protein)',
    serving: '50g dry (≈150g cooked)',
    proteinG: 25,
    calories: 170,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian', 'vegan'],
    meals: ['lunch', 'dinner'],
    affordability: 1,
    frequency: '4–5x/week',
    riskNote: 'Limit to 50–100g dry/day. Excessive daily intake may affect hormones.',
    category: 'soy',
  },
  {
    name: 'Tofu',
    serving: '100g',
    proteinG: 12,
    calories: 76,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian', 'vegan'],
    meals: ['lunch', 'dinner'],
    affordability: 2,
    frequency: '3–4x/week',
    category: 'soy',
  },
  {
    name: 'Soy Milk',
    serving: '1 glass (250ml)',
    proteinG: 7,
    calories: 80,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian', 'vegan'],
    meals: ['breakfast', 'snack'],
    affordability: 2,
    frequency: 'Daily',
    category: 'soy',
  },

  // ── LEGUMES ──
  {
    name: 'Moong Dal (Green Gram)',
    serving: '1 cup cooked (≈40g raw)',
    proteinG: 10,
    calories: 140,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian', 'vegan'],
    meals: ['lunch', 'dinner'],
    affordability: 1,
    frequency: 'Daily',
    category: 'legume',
  },
  {
    name: 'Chickpeas (Chana)',
    serving: '1 cup cooked (≈40g raw)',
    proteinG: 12,
    calories: 180,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian', 'vegan'],
    meals: ['lunch', 'snack'],
    affordability: 1,
    frequency: '4–5x/week',
    category: 'legume',
  },
  {
    name: 'Rajma (Kidney Beans)',
    serving: '1 cup cooked (≈40g raw)',
    proteinG: 11,
    calories: 170,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian', 'vegan'],
    meals: ['lunch', 'dinner'],
    affordability: 1,
    frequency: '2–3x/week',
    category: 'legume',
  },
  {
    name: 'Lentils (Masoor Dal)',
    serving: '1 cup cooked (≈40g raw)',
    proteinG: 9,
    calories: 130,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian', 'vegan'],
    meals: ['lunch', 'dinner'],
    affordability: 1,
    frequency: 'Daily',
    category: 'legume',
  },
  {
    name: 'Black Gram (Urad Dal)',
    serving: '1 cup cooked (≈40g raw)',
    proteinG: 10,
    calories: 150,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian', 'vegan'],
    meals: ['lunch', 'dinner'],
    affordability: 1,
    frequency: '3–4x/week',
    category: 'legume',
  },
  {
    name: 'Roasted Chana',
    serving: '50g',
    proteinG: 10,
    calories: 170,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian', 'vegan'],
    meals: ['snack'],
    affordability: 1,
    frequency: 'Daily',
    category: 'legume',
  },

  // ── NUTS & SEEDS ──
  {
    name: 'Groundnuts (Peanuts)',
    serving: '30g (1 handful)',
    proteinG: 8,
    calories: 170,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian', 'vegan'],
    meals: ['snack'],
    affordability: 1,
    frequency: 'Daily',
    riskNote: 'High calorie density — portion control important during fat loss.',
    category: 'nut',
  },
  {
    name: 'Almonds',
    serving: '20g (≈15 almonds)',
    proteinG: 4,
    calories: 115,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian', 'vegan'],
    meals: ['breakfast', 'snack'],
    affordability: 4,
    frequency: '4–5x/week',
    riskNote: 'Calorie-dense — stick to 15–20 almonds per serving.',
    category: 'nut',
  },
  {
    name: 'Chia Seeds',
    serving: '15g (1 tbsp)',
    proteinG: 3,
    calories: 70,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian', 'vegan'],
    meals: ['breakfast', 'snack'],
    affordability: 4,
    frequency: '3–4x/week',
    category: 'nut',
  },
  {
    name: 'Pumpkin Seeds',
    serving: '20g',
    proteinG: 5,
    calories: 110,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian', 'vegan'],
    meals: ['snack'],
    affordability: 3,
    frequency: '3–4x/week',
    category: 'nut',
  },

  // ── MEAT ──
  {
    name: 'Chicken Breast',
    serving: '100g cooked',
    proteinG: 31,
    calories: 165,
    dietTypes: ['non_veg'],
    meals: ['lunch', 'dinner'],
    affordability: 2,
    frequency: '4–5x/week',
    category: 'meat',
  },
  {
    name: 'Chicken Thigh',
    serving: '100g cooked',
    proteinG: 24,
    calories: 209,
    dietTypes: ['non_veg'],
    meals: ['lunch', 'dinner'],
    affordability: 2,
    frequency: '3–4x/week',
    category: 'meat',
  },

  // ── FISH ──
  {
    name: 'Fish (Rohu/Katla)',
    serving: '100g cooked',
    proteinG: 22,
    calories: 130,
    dietTypes: ['non_veg'],
    meals: ['lunch', 'dinner'],
    affordability: 2,
    frequency: '2–3x/week',
    category: 'fish',
  },
  {
    name: 'Salmon',
    serving: '100g cooked',
    proteinG: 25,
    calories: 208,
    dietTypes: ['non_veg'],
    meals: ['lunch', 'dinner'],
    affordability: 5,
    frequency: '1–2x/week',
    category: 'fish',
  },
  {
    name: 'Tuna (Canned)',
    serving: '1 can (100g drained)',
    proteinG: 25,
    calories: 110,
    dietTypes: ['non_veg'],
    meals: ['lunch', 'snack'],
    affordability: 3,
    frequency: '2–3x/week',
    category: 'fish',
  },

  // ── GRAINS ──
  {
    name: 'Quinoa',
    serving: '1 cup cooked (≈40g raw)',
    proteinG: 8,
    calories: 220,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian', 'vegan'],
    meals: ['lunch', 'dinner'],
    affordability: 4,
    frequency: '2–3x/week',
    category: 'grain',
  },
  {
    name: 'Oats',
    serving: '40g dry',
    proteinG: 5,
    calories: 150,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian', 'vegan'],
    meals: ['breakfast'],
    affordability: 1,
    frequency: 'Daily',
    category: 'grain',
  },

  // ── PROTEIN POWDER (Optional) ──
  {
    name: 'Whey Protein',
    serving: '1 scoop (30g)',
    proteinG: 24,
    calories: 120,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian'],
    meals: ['breakfast', 'snack'],
    affordability: 3,
    frequency: 'Optional — 1–2x/day',
    riskNote: 'Supplement, not a whole food. Use to fill protein gaps, not replace meals.',
    category: 'powder',
  },
  {
    name: 'Plant Protein Powder',
    serving: '1 scoop (30g)',
    proteinG: 20,
    calories: 130,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian', 'vegan'],
    meals: ['breakfast', 'snack'],
    affordability: 4,
    frequency: 'Optional — 1–2x/day',
    riskNote: 'Supplement, not a whole food. Use to fill protein gaps, not replace meals.',
    category: 'powder',
  },

  // ── OTHER ──
  {
    name: 'Sprouts (Moong)',
    serving: '1 cup (100g)',
    proteinG: 7,
    calories: 60,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian', 'vegan'],
    meals: ['breakfast', 'snack'],
    affordability: 1,
    frequency: 'Daily',
    category: 'other',
  },
  {
    name: 'Sattu (Roasted Gram Flour)',
    serving: '40g (1 glass drink)',
    proteinG: 8,
    calories: 140,
    dietTypes: ['non_veg', 'eggetarian', 'vegetarian', 'vegan'],
    meals: ['breakfast', 'snack'],
    affordability: 1,
    frequency: '3–4x/week',
    category: 'other',
  },
];

// ──────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ──────────────────────────────────────────────────────

/** Filter foods by diet type */
export function filterByDiet(foods: ProteinFood[], dietType: DietType): ProteinFood[] {
  return foods.filter(f => f.dietTypes.includes(dietType));
}

/** Sort foods by protein-per-calorie ratio (best for fat loss) */
export function sortByProteinPerCal(foods: ProteinFood[]): ProteinFood[] {
  return [...foods].sort((a, b) => {
    const ratioA = a.proteinG / Math.max(a.calories, 1);
    const ratioB = b.proteinG / Math.max(b.calories, 1);
    return ratioB - ratioA;
  });
}

/** Sort foods by affordability (cheapest first) */
export function sortByAffordability(foods: ProteinFood[]): ProteinFood[] {
  return [...foods].sort((a, b) => a.affordability - b.affordability);
}

/** Get foods appropriate for a specific meal */
export function filterByMeal(foods: ProteinFood[], meal: 'breakfast' | 'lunch' | 'dinner' | 'snack'): ProteinFood[] {
  return foods.filter(f => f.meals.includes(meal));
}

/**
 * Calculate recommended daily protein range based on goal.
 * Returns [min, max] in g/kg.
 */
export function getProteinRange(goal: string): { min: number; max: number; label: string } {
  switch (goal) {
    case 'lose':
      return { min: 1.6, max: 2.2, label: 'Fat Loss' };
    case 'gain':
      return { min: 1.6, max: 2.4, label: 'Muscle Gain' };
    case 'maintain':
    default:
      return { min: 1.2, max: 1.8, label: 'Maintenance' };
  }
}

/**
 * Calculate recommended daily protein in grams.
 */
export function calculateDailyProtein(weightKg: number, goal: string): { minG: number; maxG: number; targetG: number } {
  const range = getProteinRange(goal);
  const minG = Math.round(weightKg * range.min);
  const maxG = Math.round(weightKg * range.max);
  const targetG = Math.round((minG + maxG) / 2); // midpoint as target
  return { minG, maxG, targetG };
}

/**
 * Suggest meal distribution for a total protein target.
 */
export function distributeProtein(targetG: number): Record<'breakfast' | 'lunch' | 'snack' | 'dinner', number> {
  // Typical distribution: 20% breakfast, 35% lunch, 15% snack, 30% dinner
  return {
    breakfast: Math.round(targetG * 0.20),
    lunch: Math.round(targetG * 0.35),
    snack: Math.round(targetG * 0.15),
    dinner: Math.round(targetG * 0.30),
  };
}

/**
 * Generate "Easy Protein Wins" — practical suggestions to boost protein.
 */
export function generateEasyWins(
  currentProteinG: number,
  targetProteinG: number,
  dietType: DietType,
  goal: string
): string[] {
  const wins: string[] = [];
  const deficit = targetProteinG - currentProteinG;

  if (deficit <= 0) return ['You are hitting your protein target — great job!'];

  const foods = filterByDiet(PROTEIN_FOODS, dietType);
  const affordableFoods = sortByAffordability(foods);

  // Check for common high-impact additions
  const hasEggs = dietType !== 'vegan' && dietType !== 'vegetarian';
  const hasSoya = true; // Soya is available for all diets in our DB
  const hasRoastedChana = true;
  const hasChicken = dietType === 'non_veg';

  if (hasEggs && deficit >= 10) {
    wins.push('Add 2 eggs to breakfast (+12g protein)');
  }
  if (hasRoastedChana && deficit >= 6) {
    wins.push('Replace a low-protein snack with roasted chana (+10g protein)');
  }
  if (hasSoya && deficit >= 20) {
    wins.push('Add 50g soya chunks to lunch (+25g protein)');
  }
  if (hasChicken && deficit >= 25) {
    wins.push('Add 100g chicken breast to dinner (+31g protein)');
  }
  if (deficit >= 5) {
    const milkOpt = dietType === 'vegan' ? 'soy milk' : 'skim milk';
    wins.push(`Add 1 glass of ${milkOpt} as a snack (+8g protein)`);
  }
  if (deficit >= 4) {
    wins.push('Add 30g groundnuts/peanuts as a snack (+8g protein)');
  }
  if (deficit >= 8 && dietType !== 'vegan') {
    wins.push('Add 100g curd/yogurt to lunch (+8g protein)');
  }
  if (deficit >= 10 && dietType === 'vegan') {
    wins.push('Add 100g tofu to dinner (+12g protein)');
  }

  // Goal-specific advice
  if (goal === 'lose') {
    wins.push('Choose higher protein-per-calorie foods to stay full on fewer calories');
  }
  if (goal === 'gain') {
    wins.push('Distribute protein across 4–5 meals for better absorption');
  }

  // Limit to 5 most relevant
  return wins.slice(0, 5);
}

/**
 * Map the database dietType to our DietType enum.
 * The schema has: omnivore, vegetarian, vegan, keto, paleo
 * We also handle: eggetarian (a common Indian diet)
 */
export function mapDietType(dbDietType: string | null | undefined): DietType {
  if (!dbDietType) return 'non_veg'; // default fallback
  const lower = dbDietType.toLowerCase();
  if (lower === 'vegan') return 'vegan';
  if (lower === 'vegetarian') return 'vegetarian';
  if (lower === 'eggetarian') return 'eggetarian';
  // omnivore, keto, paleo → all include meat
  return 'non_veg';
}
