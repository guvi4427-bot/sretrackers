// ── Supplement Database (all values per 100g unless noted) ──
// Comprehensive Indian and International brand supplement macros.
// multiplier = userGrams / 100 (same as FOOD_DATABASE)
// For per-serving items (bars, RTD), the macros are normalized to per-100g for consistency.
// Brand-specific entries include the brand name for search matching.
//
// KEY: When a user enters a brand+variant name and selects a unit (serving/scoop/etc),
// the system finds the matching entry and uses its servingSize to convert to grams.
// e.g., "ON Gold Standard Whey" + "1 serving" → 31g → macros calculated from per-100g * (31/100)

export interface SupplementEntry {
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize?: number; // grams per serving (for unit conversion)
  servingUnit?: string; // default unit for this supplement
}

export const SUPPLEMENT_DATABASE: SupplementEntry[] = [
  // ═══════════════════════════════════════════════════════
  // ─── OSOAA (Full Spectrum - 2026 PDF Verified) ───
  // ═══════════════════════════════════════════════════════
  // Per-serving: 33g, 26.1P/1.8C/0.5F, 116cal → per-100g: 79.1P/5.5C/1.5F, 352cal
  { name: "OSOAA Ultimate ISO Whey", brand: "OSOAA", calories: 352, protein: 79.1, carbs: 5.5, fat: 1.5, fiber: 0, servingSize: 33, servingUnit: "scoop" },
  { name: "OSOAA Ultimate ISO Whey Tri-Blend", brand: "OSOAA", calories: 352, protein: 79.1, carbs: 5.5, fat: 1.5, fiber: 0, servingSize: 33, servingUnit: "scoop" },
  // Per-serving: 35g, 24.2P/3.5C/1.2F, 121cal → per-100g: 69.1P/10.0C/3.4F, 346cal
  { name: "OSOAA Impact Whey +Creatine", brand: "OSOAA", calories: 346, protein: 69.1, carbs: 10, fat: 3.4, fiber: 0, servingSize: 35, servingUnit: "scoop" },
  // Per-serving: 30g, 27.5P/0.8C/0.2F, 115cal → per-100g: 91.7P/2.7C/0.7F, 383cal
  { name: "OSOAA Whey Isolate Pure", brand: "OSOAA", calories: 383, protein: 91.7, carbs: 2.7, fat: 0.7, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "OSOAA Whey Isolate Unflavored", brand: "OSOAA", calories: 383, protein: 91.7, carbs: 2.7, fat: 0.7, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  // Per-serving: 30g, 24P/2.5C/1.5F, 119cal → per-100g: 80.0P/8.3C/5.0F, 397cal
  { name: "OSOAA Whey Concentrate 80%", brand: "OSOAA", calories: 397, protein: 80, carbs: 8.3, fat: 5, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  // Per-serving: 35g, 25P/4C/2F, 134cal → per-100g: 71.4P/11.4C/5.7F, 383cal
  { name: "OSOAA Plant Protein Isolate", brand: "OSOAA", calories: 383, protein: 71.4, carbs: 11.4, fat: 5.7, fiber: 3, servingSize: 35, servingUnit: "scoop" },
  { name: "OSOAA Plant Protein Pea Rice", brand: "OSOAA", calories: 383, protein: 71.4, carbs: 11.4, fat: 5.7, fiber: 3, servingSize: 35, servingUnit: "scoop" },
  // Per-serving: 35g, 26P/2C/0.5F, 117cal → per-100g: 74.3P/5.7C/1.4F, 334cal
  { name: "OSOAA Micellar Casein", brand: "OSOAA", calories: 334, protein: 74.3, carbs: 5.7, fat: 1.4, fiber: 0, servingSize: 35, servingUnit: "scoop" },
  // OSOAA Double Strength Fish Oil - 1 cap, ~10cal per softgel
  { name: "OSOAA Double Strength Fish Oil", brand: "OSOAA", calories: 10, protein: 0, carbs: 0, fat: 1, fiber: 0, servingSize: 1, servingUnit: "softgel" },
  // OSOAA Creapure Creatine - 3g per serving, 0 macros
  { name: "OSOAA Creapure Creatine", brand: "OSOAA", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, servingSize: 3, servingUnit: "g" },

  // ═══════════════════════════════════════════════════════
  // ─── MUSCLEBLAZE (India's Largest - 2026 PDF Verified) ───
  // ═══════════════════════════════════════════════════════
  // Biozyme Performance Whey: 36g, 25P/4.1C/1.8F → per-100g: 69.4P/11.4C/5.0F
  { name: "MuscleBlaze Biozyme Performance Whey", brand: "MuscleBlaze", calories: 370, protein: 69.4, carbs: 11.4, fat: 5, fiber: 0, servingSize: 36, servingUnit: "scoop" },
  // Biozyme ISO-Zero: 34g, 27P/0C/0.5F → per-100g: 79.4P/0C/1.5F
  { name: "MuscleBlaze Biozyme ISO-Zero", brand: "MuscleBlaze", calories: 334, protein: 79.4, carbs: 0, fat: 1.5, fiber: 0, servingSize: 34, servingUnit: "scoop" },
  // Raw Whey Protein: 30g, 24P/2.5C/1.5F → per-100g: 80.0P/8.3C/5.0F
  { name: "MuscleBlaze Raw Whey Protein", brand: "MuscleBlaze", calories: 400, protein: 80, carbs: 8.3, fat: 5, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  // Fuel One Whey Max: 33g, 24P/4.8C/1.5F → per-100g: 72.7P/14.5C/4.5F
  { name: "MuscleBlaze Fuel One Whey Max", brand: "MuscleBlaze", calories: 393, protein: 72.7, carbs: 14.5, fat: 4.5, fiber: 0, servingSize: 33, servingUnit: "scoop" },
  { name: "MuscleBlaze Fuel One Whey", brand: "MuscleBlaze", calories: 393, protein: 72.7, carbs: 14.5, fat: 4.5, fiber: 0, servingSize: 33, servingUnit: "scoop" },
  // Super Gainer XXL: 100g, 15P/75C/3F → per-100g: 15P/75C/3F, 390cal
  { name: "MuscleBlaze Super Gainer XXL", brand: "MuscleBlaze", calories: 390, protein: 15, carbs: 75, fat: 3, fiber: 0.5, servingSize: 100, servingUnit: "scoop" },
  // General MuscleBlaze entries (kept for search matching)
  { name: "MuscleBlaze Whey Protein", brand: "MuscleBlaze", calories: 395, protein: 78, carbs: 8, fat: 6, fiber: 0, servingSize: 33, servingUnit: "scoop" },
  { name: "MuscleBlaze Whey Gold", brand: "MuscleBlaze", calories: 380, protein: 82, carbs: 5, fat: 4.5, fiber: 0, servingSize: 31, servingUnit: "scoop" },
  { name: "MuscleBlaze Whey Isolate", brand: "MuscleBlaze", calories: 370, protein: 86, carbs: 3, fat: 1.5, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "MuscleBlaze Biozyme Whey", brand: "MuscleBlaze", calories: 375, protein: 83, carbs: 4.5, fat: 3, fiber: 0, servingSize: 36, servingUnit: "scoop" },
  { name: "MuscleBlaze Biozyme Isolate", brand: "MuscleBlaze", calories: 365, protein: 87, carbs: 2.5, fat: 1.5, fiber: 0, servingSize: 34, servingUnit: "scoop" },
  { name: "MuscleBlaze Beginner Whey", brand: "MuscleBlaze", calories: 400, protein: 72, carbs: 12, fat: 7, fiber: 0, servingSize: 36, servingUnit: "scoop" },
  { name: "MuscleBlaze 100% Whey", brand: "MuscleBlaze", calories: 390, protein: 80, carbs: 6, fat: 5.5, fiber: 0, servingSize: 33, servingUnit: "scoop" },
  { name: "MuscleBlaze Mass Gainer", brand: "MuscleBlaze", calories: 380, protein: 22, carbs: 68, fat: 4, fiber: 1, servingSize: 75, servingUnit: "scoop" },
  { name: "MuscleBlaze Mass Gainer XXL", brand: "MuscleBlaze", calories: 378, protein: 18, carbs: 72, fat: 3.5, fiber: 0.5, servingSize: 100, servingUnit: "scoop" },
  // WrathX Pre-Workout: 15g serving, ~200mg caffeine
  { name: "MuscleBlaze WrathX Pre-Workout", brand: "MuscleBlaze", calories: 18, protein: 0, carbs: 3.5, fat: 0, fiber: 0, servingSize: 15, servingUnit: "scoop" },
  // MB-Vite Multivitamin: 1 tablet
  { name: "MuscleBlaze MB-Vite Multivitamin", brand: "MuscleBlaze", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "tablet" },
  { name: "MuscleBlaze Multivitamin", brand: "MuscleBlaze", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "tablet" },
  // Creatine: PDF says 3g serving for MB
  { name: "MuscleBlaze Creatine", brand: "MuscleBlaze", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, servingSize: 3, servingUnit: "g" },
  { name: "MuscleBlaze BCAA", brand: "MuscleBlaze", calories: 8, protein: 50, carbs: 0, fat: 0, fiber: 0, servingSize: 7, servingUnit: "g" },
  { name: "MuscleBlaze Pre-Workout", brand: "MuscleBlaze", calories: 18, protein: 0, carbs: 3.5, fat: 0, fiber: 0, servingSize: 12, servingUnit: "g" },
  { name: "MuscleBlaze Protein Bar", brand: "MuscleBlaze", calories: 335, protein: 40, carbs: 36, fat: 9, fiber: 6, servingSize: 60, servingUnit: "bar" },
  { name: "MuscleBlaze Energy Bar", brand: "MuscleBlaze", calories: 345, protein: 30, carbs: 42, fat: 10, fiber: 4, servingSize: 60, servingUnit: "bar" },
  { name: "MuscleBlaze Fat Burner", brand: "MuscleBlaze", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "capsule" },
  { name: "MuscleBlaze Fish Oil", brand: "MuscleBlaze", calories: 10, protein: 0, carbs: 0, fat: 1, fiber: 0, servingSize: 1, servingUnit: "softgel" },
  { name: "MuscleBlaze Glutamine", brand: "MuscleBlaze", calories: 0, protein: 83, carbs: 0, fat: 0, fiber: 0, servingSize: 5, servingUnit: "g" },
  { name: "MuscleBlaze Casein", brand: "MuscleBlaze", calories: 388, protein: 75, carbs: 10, fat: 6, fiber: 0, servingSize: 35, servingUnit: "scoop" },
  { name: "MuscleBlaze ZMA", brand: "MuscleBlaze", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "capsule" },
  { name: "MuscleBlaze Ashwagandha", brand: "MuscleBlaze", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "tablet" },
  { name: "MuscleBlaze Plant Protein", brand: "MuscleBlaze", calories: 378, protein: 68, carbs: 14, fat: 8, fiber: 5, servingSize: 35, servingUnit: "scoop" },
  { name: "MuscleBlaze Beta-Alanine", brand: "MuscleBlaze", calories: 0, protein: 85, carbs: 0, fat: 0, fiber: 0, servingSize: 3, servingUnit: "g" },
  { name: "MuscleBlaze Citrulline", brand: "MuscleBlaze", calories: 0, protein: 55, carbs: 22, fat: 0, fiber: 0, servingSize: 8, servingUnit: "g" },

  // ═══════════════════════════════════════════════════════
  // ─── AVVATAR (Fresh Grass-Fed - 2026 PDF Verified) ───
  // ═══════════════════════════════════════════════════════
  // Whey Protein Standard: 35g, 28P/2.2C/1.6F → per-100g: 80.0P/6.3C/4.6F
  { name: "Avvatar Whey Protein", brand: "Avvatar", calories: 387, protein: 80, carbs: 6.3, fat: 4.6, fiber: 0, servingSize: 35, servingUnit: "scoop" },
  { name: "Avvatar Whey Protein Standard", brand: "Avvatar", calories: 387, protein: 80, carbs: 6.3, fat: 4.6, fiber: 0, servingSize: 35, servingUnit: "scoop" },
  // Isolate Pure: 30g, 29P/0.5C/0.3F → per-100g: 96.7P/1.7C/1.0F
  { name: "Avvatar Isolate", brand: "Avvatar", calories: 388, protein: 96.7, carbs: 1.7, fat: 1, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "Avvatar Whey Isolate Pure", brand: "Avvatar", calories: 388, protein: 96.7, carbs: 1.7, fat: 1, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  // Muscle Gainer: 60g, 24P/31C/1.5F → per-100g: 40.0P/51.7C/2.5F
  { name: "Avvatar Muscle Gainer", brand: "Avvatar", calories: 392, protein: 40, carbs: 51.7, fat: 2.5, fiber: 0, servingSize: 60, servingUnit: "scoop" },

  // ═══════════════════════════════════════════════════════
  // ─── NAKPRO (2026 PDF Verified) ───
  // ═══════════════════════════════════════════════════════
  // Platinum Isolate: 33g, 28P/1C/0.3F → per-100g: 84.8P/3.0C/0.9F
  { name: "Nakpro Platinum Isolate", brand: "Nakpro", calories: 358, protein: 84.8, carbs: 3, fat: 0.9, fiber: 0, servingSize: 33, servingUnit: "scoop" },
  // Perform Whey: 33g, 24P/4C/1.5F → per-100g: 72.7P/12.1C/4.5F
  { name: "Nakpro Perform Whey", brand: "Nakpro", calories: 382, protein: 72.7, carbs: 12.1, fat: 4.5, fiber: 0, servingSize: 33, servingUnit: "scoop" },
  // Gold Whey: 33g, 25P/3.5C/1.8F → per-100g: 75.8P/10.6C/5.5F
  { name: "Nakpro Gold Whey", brand: "Nakpro", calories: 391, protein: 75.8, carbs: 10.6, fat: 5.5, fiber: 0, servingSize: 33, servingUnit: "scoop" },
  // Impact Whey Blend: (common variant) 48g serving - user-specified
  { name: "Nakpro Impact Whey Blend", brand: "Nakpro", calories: 385, protein: 76, carbs: 8, fat: 5.5, fiber: 0, servingSize: 48, servingUnit: "scoop" },
  // Other Nakpro entries
  { name: "NakPro Whey Protein", brand: "Nakpro", calories: 395, protein: 77, carbs: 8, fat: 6, fiber: 0, servingSize: 33, servingUnit: "scoop" },
  { name: "NakPro Whey Isolate", brand: "Nakpro", calories: 370, protein: 85, carbs: 3.5, fat: 2, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "NakPro Gold Whey Isolate", brand: "Nakpro", calories: 368, protein: 87, carbs: 2, fat: 1.5, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "NakPro Mass Gainer", brand: "Nakpro", calories: 380, protein: 20, carbs: 70, fat: 4, fiber: 0.5, servingSize: 100, servingUnit: "scoop" },
  { name: "NakPro Creatine", brand: "Nakpro", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, servingSize: 3, servingUnit: "g" },
  { name: "NakPro EAA", brand: "Nakpro", calories: 10, protein: 55, carbs: 0, fat: 0, fiber: 0, servingSize: 10, servingUnit: "g" },
  // Budget entry from PDF
  { name: "Nakpro Whey with Enzymes", brand: "Nakpro", calories: 390, protein: 73, carbs: 16, fat: 5, fiber: 0, servingSize: 33, servingUnit: "scoop" },

  // ═══════════════════════════════════════════════════════
  // ─── AS-IT-IS NUTRITION (Raw & Atom - 2026 PDF Verified) ───
  // ═══════════════════════════════════════════════════════
  // Atom Whey Protein: 36g, 27P/3.5C/1.5F → per-100g: 75.0P/9.7C/4.2F
  { name: "AS-IT-IS Atom Whey Protein", brand: "AS-IT-IS", calories: 378, protein: 75, carbs: 9.7, fat: 4.2, fiber: 0, servingSize: 36, servingUnit: "scoop" },
  { name: "Atom Whey Protein", brand: "AS-IT-IS", calories: 378, protein: 75, carbs: 9.7, fat: 4.2, fiber: 0, servingSize: 36, servingUnit: "scoop" },
  // Pure Whey Concentrate: 30g, 24P/2.5C/1.5F → per-100g: 80.0P/8.3C/5.0F
  { name: "AS-IT-IS Pure Whey Concentrate", brand: "AS-IT-IS", calories: 400, protein: 80, carbs: 8.3, fat: 5, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "AS-IT-IS Whey Protein", brand: "AS-IT-IS", calories: 400, protein: 80, carbs: 8.3, fat: 5, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  // Pure Whey Isolate: 30g, 27P/1C/0.5F → per-100g: 90.0P/3.3C/1.7F
  { name: "AS-IT-IS Pure Whey Isolate", brand: "AS-IT-IS", calories: 387, protein: 90, carbs: 3.3, fat: 1.7, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "AS-IT-IS Whey Isolate", brand: "AS-IT-IS", calories: 387, protein: 90, carbs: 3.3, fat: 1.7, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  // Stevia sweetened variant
  { name: "AS-IT-IS Whey Isolate Stevia", brand: "AS-IT-IS", calories: 387, protein: 90, carbs: 3.3, fat: 1.7, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "AS-IT-IS Native Whey", brand: "AS-IT-IS", calories: 385, protein: 80, carbs: 6, fat: 4, fiber: 0, servingSize: 31, servingUnit: "scoop" },
  // Creatine: PDF says 3g per serving for AS-IT-IS
  { name: "AS-IT-IS Creatine", brand: "AS-IT-IS", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, servingSize: 3, servingUnit: "g" },
  { name: "AS-IT-IS Pea Protein", brand: "AS-IT-IS", calories: 375, protein: 75, carbs: 8, fat: 5, fiber: 3, servingSize: 30, servingUnit: "scoop" },
  { name: "Asitis Micellar Casein", brand: "AS-IT-IS", calories: 386, protein: 76, carbs: 9, fat: 5.5, fiber: 0, servingSize: 35, servingUnit: "scoop" },
  { name: "AS-IT-IS Glutamine", brand: "AS-IT-IS", calories: 0, protein: 83, carbs: 0, fat: 0, fiber: 0, servingSize: 5, servingUnit: "g" },

  // ═══════════════════════════════════════════════════════
  // ─── OPTIMUM NUTRITION (International - 2026 PDF Verified) ───
  // ═══════════════════════════════════════════════════════
  // Gold Standard 100% Whey: 31g, 24P/3C/1F, 120cal → per-100g: 77.4P/9.7C/3.2F, 387cal
  { name: "Optimum Nutrition Gold Standard 100% Whey", brand: "Optimum Nutrition", calories: 387, protein: 77.4, carbs: 9.7, fat: 3.2, fiber: 0, servingSize: 31, servingUnit: "scoop" },
  { name: "ON Gold Standard Whey", brand: "Optimum Nutrition", calories: 387, protein: 77.4, carbs: 9.7, fat: 3.2, fiber: 0, servingSize: 31, servingUnit: "scoop" },
  // Platinum Hydrowhey: 39g, 30P/2C/1F, 140cal → per-100g: 76.9P/5.1C/2.6F, 359cal
  { name: "Optimum Nutrition Platinum Hydrowhey", brand: "Optimum Nutrition", calories: 359, protein: 76.9, carbs: 5.1, fat: 2.6, fiber: 0, servingSize: 39, servingUnit: "scoop" },
  { name: "ON Platinum Hydrowhey", brand: "Optimum Nutrition", calories: 359, protein: 76.9, carbs: 5.1, fat: 2.6, fiber: 0, servingSize: 39, servingUnit: "scoop" },
  // Performance Whey: 34g, 24P/5C/2F, 130cal → per-100g: 70.6P/14.7C/5.9F, 382cal
  { name: "Optimum Nutrition Performance Whey", brand: "Optimum Nutrition", calories: 382, protein: 70.6, carbs: 14.7, fat: 5.9, fiber: 0, servingSize: 34, servingUnit: "scoop" },
  { name: "ON Performance Whey", brand: "Optimum Nutrition", calories: 382, protein: 70.6, carbs: 14.7, fat: 5.9, fiber: 0, servingSize: 34, servingUnit: "scoop" },
  // Gold Standard Casein: 33g, 24P/3C/1F, 120cal → per-100g: 72.7P/9.1C/3.0F, 364cal
  { name: "Optimum Nutrition Gold Standard Casein", brand: "Optimum Nutrition", calories: 364, protein: 72.7, carbs: 9.1, fat: 3, fiber: 0, servingSize: 33, servingUnit: "scoop" },
  { name: "ON Gold Standard Casein", brand: "Optimum Nutrition", calories: 364, protein: 72.7, carbs: 9.1, fat: 3, fiber: 0, servingSize: 33, servingUnit: "scoop" },
  // Serious Mass Gainer: 334g, 50P/252C/4.5F, 1250cal → per-100g: 15.0P/75.4C/1.3F, 374cal
  { name: "Optimum Nutrition Serious Mass", brand: "Optimum Nutrition", calories: 374, protein: 15, carbs: 75.4, fat: 1.3, fiber: 0.5, servingSize: 334, servingUnit: "scoop" },
  { name: "ON Serious Mass", brand: "Optimum Nutrition", calories: 374, protein: 15, carbs: 75.4, fat: 1.3, fiber: 0.5, servingSize: 334, servingUnit: "scoop" },
  // India variant
  { name: "Optimum Nutrition Gold Standard India", brand: "Optimum Nutrition", calories: 387, protein: 77.4, carbs: 9.7, fat: 3.2, fiber: 0, servingSize: 31, servingUnit: "scoop" },
  { name: "Optimum Nutrition Gold Standard Isolate", brand: "Optimum Nutrition", calories: 365, protein: 87, carbs: 2, fat: 1, fiber: 0, servingSize: 29, servingUnit: "scoop" },
  // Other ON products
  { name: "Optimum Nutrition Micronized Creatine", brand: "Optimum Nutrition", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, servingSize: 5, servingUnit: "g" },
  { name: "Optimum Nutrition Opti-Men", brand: "Optimum Nutrition", calories: 5, protein: 0, carbs: 0.8, fat: 0, fiber: 0, servingSize: 3, servingUnit: "tablet" },
  { name: "Optimum Nutrition Opti-Women", brand: "Optimum Nutrition", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 2, servingUnit: "capsule" },
  { name: "Optimum Nutrition Gold Standard Pre-Workout", brand: "Optimum Nutrition", calories: 15, protein: 0, carbs: 3, fat: 0, fiber: 0, servingSize: 9, servingUnit: "g" },
  { name: "Optimum Nutrition BCAA", brand: "Optimum Nutrition", calories: 5, protein: 50, carbs: 0, fat: 0, fiber: 0, servingSize: 5, servingUnit: "g" },
  { name: "Optimum Nutrition Fish Oil", brand: "Optimum Nutrition", calories: 10, protein: 0, carbs: 0, fat: 1, fiber: 0, servingSize: 1, servingUnit: "softgel" },
  { name: "Optimum Nutrition ZMA", brand: "Optimum Nutrition", calories: 5, protein: 0, carbs: 0.8, fat: 0, fiber: 0, servingSize: 3, servingUnit: "capsule" },
  { name: "Optimum Nutrition Glutamine", brand: "Optimum Nutrition", calories: 0, protein: 83, carbs: 0, fat: 0, fiber: 0, servingSize: 5, servingUnit: "g" },
  { name: "Optimum Nutrition Beta-Alanine", brand: "Optimum Nutrition", calories: 0, protein: 85, carbs: 0, fat: 0, fiber: 0, servingSize: 3, servingUnit: "g" },
  { name: "Optimum Nutrition Citrulline", brand: "Optimum Nutrition", calories: 0, protein: 55, carbs: 22, fat: 0, fiber: 0, servingSize: 8, servingUnit: "g" },
  { name: "Optimum Nutrition Protein Bar", brand: "Optimum Nutrition", calories: 340, protein: 38, carbs: 38, fat: 10, fiber: 8, servingSize: 60, servingUnit: "bar" },

  // ═══════════════════════════════════════════════════════
  // ─── DYMATIZE (International - 2026 PDF Verified) ───
  // ═══════════════════════════════════════════════════════
  // ISO 100: 30g, 25P/1C/0.5F → per-100g: 83.3P/3.3C/1.7F
  { name: "Dymatize ISO 100", brand: "Dymatize", calories: 362, protein: 83.3, carbs: 3.3, fat: 1.7, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "Dymatize ISO 100 Hydrolyzed", brand: "Dymatize", calories: 362, protein: 83.3, carbs: 3.3, fat: 1.7, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "Dymatize ISO100 India", brand: "Dymatize", calories: 362, protein: 83.3, carbs: 3.3, fat: 1.7, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  // Elite Whey: 36g, 25P/3C/2F → per-100g: 69.4P/8.3C/5.6F
  { name: "Dymatize Elite Whey", brand: "Dymatize", calories: 366, protein: 69.4, carbs: 8.3, fat: 5.6, fiber: 0, servingSize: 36, servingUnit: "scoop" },
  { name: "Dymatize Elite Casein", brand: "Dymatize", calories: 385, protein: 76, carbs: 9, fat: 5.5, fiber: 0, servingSize: 35, servingUnit: "scoop" },
  { name: "Dymatize Super Mass Gainer", brand: "Dymatize", calories: 383, protein: 17, carbs: 74, fat: 3, fiber: 0.5, servingSize: 148, servingUnit: "scoop" },
  { name: "Dymatize Creatine", brand: "Dymatize", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, servingSize: 5, servingUnit: "g" },

  // ═══════════════════════════════════════════════════════
  // ─── MYPROTEIN (International - 2026 PDF Verified) ───
  // ═══════════════════════════════════════════════════════
  // Impact Whey: 25g, 21P/1.1C/1.9F → per-100g: 84.0P/4.4C/7.6F
  { name: "MyProtein Impact Whey", brand: "MyProtein", calories: 420, protein: 84, carbs: 4.4, fat: 7.6, fiber: 0, servingSize: 25, servingUnit: "scoop" },
  { name: "MyProtein Impact Whey India", brand: "MyProtein", calories: 420, protein: 84, carbs: 4.4, fat: 7.6, fiber: 0, servingSize: 25, servingUnit: "scoop" },
  // Impact Isolate: 25g, 23P/0.6C/0.1F → per-100g: 92.0P/2.4C/0.4F
  { name: "MyProtein Impact Whey Isolate", brand: "MyProtein", calories: 382, protein: 92, carbs: 2.4, fat: 0.4, fiber: 0, servingSize: 25, servingUnit: "scoop" },
  { name: "MyProtein Impact Whey Isolate India", brand: "MyProtein", calories: 382, protein: 92, carbs: 2.4, fat: 0.4, fiber: 0, servingSize: 25, servingUnit: "scoop" },
  // Other MyProtein products
  { name: "MyProtein Whey Protein Smooth", brand: "MyProtein", calories: 398, protein: 78, carbs: 9, fat: 5.5, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "MyProtein Vegan Protein Blend", brand: "MyProtein", calories: 385, protein: 70, carbs: 12, fat: 7, fiber: 4, servingSize: 33, servingUnit: "scoop" },
  { name: "MyProtein Creatine Monohydrate", brand: "MyProtein", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, servingSize: 5, servingUnit: "g" },
  { name: "MyProtein BCAA", brand: "MyProtein", calories: 10, protein: 50, carbs: 0, fat: 0, fiber: 0, servingSize: 6, servingUnit: "g" },
  { name: "MyProtein Pre-Workout", brand: "MyProtein", calories: 10, protein: 0, carbs: 2, fat: 0, fiber: 0, servingSize: 10, servingUnit: "g" },
  { name: "MyProtein Casein", brand: "MyProtein", calories: 383, protein: 77, carbs: 8, fat: 5, fiber: 0, servingSize: 34, servingUnit: "scoop" },
  { name: "MyProtein Weight Gainer Blend", brand: "MyProtein", calories: 385, protein: 18, carbs: 72, fat: 4, fiber: 1, servingSize: 100, servingUnit: "scoop" },
  { name: "MyProtein Protein Bar", brand: "MyProtein", calories: 340, protein: 38, carbs: 38, fat: 10, fiber: 8, servingSize: 60, servingUnit: "bar" },
  { name: "MyProtein Alpha Men", brand: "MyProtein", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 2, servingUnit: "tablet" },
  { name: "MyProtein Glutamine", brand: "MyProtein", calories: 0, protein: 83, carbs: 0, fat: 0, fiber: 0, servingSize: 5, servingUnit: "g" },
  { name: "MyProtein Beta-Alanine", brand: "MyProtein", calories: 0, protein: 85, carbs: 0, fat: 0, fiber: 0, servingSize: 3, servingUnit: "g" },

  // ═══════════════════════════════════════════════════════
  // ─── MUSCLETECH (International - 2026 PDF Verified) ───
  // ═══════════════════════════════════════════════════════
  // Nitro-Tech: 46g, 30P/4C/3F → per-100g: 65.2P/8.7C/6.5F (includes 3g creatine)
  { name: "MuscleTech Nitro-Tech", brand: "MuscleTech", calories: 352, protein: 65.2, carbs: 8.7, fat: 6.5, fiber: 0, servingSize: 46, servingUnit: "scoop" },
  { name: "Muscletech Nitrotech India", brand: "MuscleTech", calories: 352, protein: 65.2, carbs: 8.7, fat: 6.5, fiber: 0, servingSize: 46, servingUnit: "scoop" },
  { name: "MuscleTech Nitro-Tech Isolate", brand: "MuscleTech", calories: 370, protein: 86, carbs: 2, fat: 1.5, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "MuscleTech Phase8", brand: "MuscleTech", calories: 400, protein: 70, carbs: 13, fat: 8, fiber: 2, servingSize: 42, servingUnit: "scoop" },
  { name: "MuscleTech Mass Tech", brand: "MuscleTech", calories: 380, protein: 19, carbs: 72, fat: 3.5, fiber: 1, servingSize: 115, servingUnit: "scoop" },
  { name: "MuscleTech Creatine", brand: "MuscleTech", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, servingSize: 5, servingUnit: "g" },
  { name: "MuscleTech Vapor X5", brand: "MuscleTech", calories: 5, protein: 0, carbs: 1, fat: 0, fiber: 0, servingSize: 7, servingUnit: "g" },
  { name: "MuscleTech Platinum Multivitamin", brand: "MuscleTech", calories: 3, protein: 0, carbs: 0.6, fat: 0, fiber: 0, servingSize: 3, servingUnit: "tablet" },
  { name: "MuscleTech Hydroxycut", brand: "MuscleTech", calories: 5, protein: 0, carbs: 1, fat: 0, fiber: 0, servingSize: 2, servingUnit: "capsule" },
  { name: "MuscleTech Amino Build", brand: "MuscleTech", calories: 8, protein: 45, carbs: 1, fat: 0, fiber: 0, servingSize: 9, servingUnit: "g" },

  // ═══════════════════════════════════════════════════════
  // ─── ISOPURE (International - 2026 PDF Verified) ───
  // ═══════════════════════════════════════════════════════
  // Zero Carb: 31g, 25P/0-1C/0F → per-100g: 80.6P/1.6C/0.3F
  { name: "Isopure Zero Carb Whey Isolate", brand: "IsoPure", calories: 333, protein: 80.6, carbs: 1.6, fat: 0.3, fiber: 0, servingSize: 31, servingUnit: "scoop" },
  { name: "Isopure Low Carb Whey", brand: "IsoPure", calories: 375, protein: 84, carbs: 3, fat: 2, fiber: 0, servingSize: 30, servingUnit: "scoop" },

  // ═══════════════════════════════════════════════════════
  // ─── RULE ONE PROTEINS (International - 2026 PDF Verified) ───
  // ═══════════════════════════════════════════════════════
  // R1 Protein: 29g, 25P/1C/0F → per-100g: 86.2P/3.4C/0.3F
  { name: "Rule One R1 Protein Isolate", brand: "Rule One", calories: 364, protein: 86.2, carbs: 3.4, fat: 0.3, fiber: 0, servingSize: 29, servingUnit: "scoop" },
  { name: "Rule One Proteins R1 Whey", brand: "Rule One", calories: 380, protein: 81, carbs: 5, fat: 4, fiber: 0, servingSize: 31, servingUnit: "scoop" },

  // ═══════════════════════════════════════════════════════
  // ─── GNC (India & International - 2026 PDF Verified) ──
  // ═══════════════════════════════════════════════════════
  // Pro Performance: 35g, 24P/4C/2F → per-100g: 68.6P/11.4C/5.7F
  { name: "GNC Pro Performance Whey", brand: "GNC", calories: 371, protein: 68.6, carbs: 11.4, fat: 5.7, fiber: 0, servingSize: 35, servingUnit: "scoop" },
  { name: "GNC India Pro Performance", brand: "GNC", calories: 371, protein: 68.6, carbs: 11.4, fat: 5.7, fiber: 0, servingSize: 35, servingUnit: "scoop" },
  // AMP Pure Isolate: 32g, 25P/1C/0.5F → per-100g: 78.1P/3.1C/1.6F
  { name: "GNC AMP Pure Isolate", brand: "GNC", calories: 338, protein: 78.1, carbs: 3.1, fat: 1.6, fiber: 0, servingSize: 32, servingUnit: "scoop" },
  { name: "GNC India AMP Pure Isolate", brand: "GNC", calories: 338, protein: 78.1, carbs: 3.1, fat: 1.6, fiber: 0, servingSize: 32, servingUnit: "scoop" },
  // Other GNC products
  { name: "GNC Whey Protein", brand: "GNC", calories: 388, protein: 79, carbs: 7, fat: 5, fiber: 0, servingSize: 32, servingUnit: "scoop" },
  { name: "GNC Amp Whey Isolate", brand: "GNC", calories: 370, protein: 86, carbs: 3, fat: 2, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "GNC Mega Men", brand: "GNC", calories: 5, protein: 0, carbs: 0.8, fat: 0, fiber: 0, servingSize: 2, servingUnit: "capsule" },
  { name: "GNC Women's One Daily", brand: "GNC", calories: 2, protein: 0, carbs: 0.4, fat: 0, fiber: 0, servingSize: 1, servingUnit: "tablet" },
  { name: "GNC Creatine", brand: "GNC", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, servingSize: 5, servingUnit: "g" },
  { name: "GNC Fish Oil", brand: "GNC", calories: 10, protein: 0, carbs: 0, fat: 1, fiber: 0, servingSize: 1, servingUnit: "softgel" },
  { name: "GNC Triple Strength Fish Oil", brand: "GNC", calories: 15, protein: 0, carbs: 0, fat: 1.5, fiber: 0, servingSize: 1, servingUnit: "softgel" },
  { name: "GNC Protein Bar", brand: "GNC", calories: 340, protein: 38, carbs: 37, fat: 10, fiber: 7, servingSize: 60, servingUnit: "bar" },
  { name: "GNC Pre-Workout", brand: "GNC", calories: 10, protein: 0, carbs: 2, fat: 0, fiber: 0, servingSize: 9, servingUnit: "g" },
  { name: "GNC Total Lean Burn 60", brand: "GNC", calories: 5, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 2, servingUnit: "tablet" },
  { name: "GNC BCAA", brand: "GNC", calories: 5, protein: 50, carbs: 0, fat: 0, fiber: 0, servingSize: 6, servingUnit: "g" },
  { name: "GNC Glutamine", brand: "GNC", calories: 0, protein: 83, carbs: 0, fat: 0, fiber: 0, servingSize: 5, servingUnit: "g" },
  { name: "GNC Ashwagandha", brand: "GNC", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "capsule" },
  { name: "GNC Pro Performance Mass Gainer", brand: "GNC", calories: 385, protein: 18, carbs: 72, fat: 4, fiber: 0.5, servingSize: 100, servingUnit: "scoop" },

  // ═══════════════════════════════════════════════════════
  // ─── NUTRABAY (2026 PDF Verified) ───
  // ═══════════════════════════════════════════════════════
  // Pure Whey Isolate: 30g, 26.5P/1.2C/0.3F → per-100g: 88.3P/4.0C/1.0F
  { name: "Nutrabay Pure Whey Isolate", brand: "Nutrabay", calories: 380, protein: 88.3, carbs: 4, fat: 1, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  // Gold Whey Blend: 33g, 25P/4C/1.9F → per-100g: 75.8P/12.1C/5.8F
  { name: "Nutrabay Gold Whey Blend", brand: "Nutrabay", calories: 406, protein: 75.8, carbs: 12.1, fat: 5.8, fiber: 0, servingSize: 33, servingUnit: "scoop" },
  { name: "Nutrabay Gold Whey", brand: "Nutrabay", calories: 406, protein: 75.8, carbs: 12.1, fat: 5.8, fiber: 0, servingSize: 33, servingUnit: "scoop" },
  { name: "Nutrabay Whey Protein", brand: "Nutrabay", calories: 390, protein: 78, carbs: 7, fat: 6, fiber: 0, servingSize: 32, servingUnit: "scoop" },
  { name: "Nutrabay Isolate", brand: "Nutrabay", calories: 380, protein: 88.3, carbs: 4, fat: 1, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "Nutrabay Creatine", brand: "Nutrabay", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, servingSize: 5, servingUnit: "g" },
  { name: "Nutrabay Pre-Workout", brand: "Nutrabay", calories: 12, protein: 0, carbs: 2.5, fat: 0, fiber: 0, servingSize: 10, servingUnit: "g" },
  { name: "Nutrabay Citrulline", brand: "Nutrabay", calories: 0, protein: 55, carbs: 22, fat: 0, fiber: 0, servingSize: 8, servingUnit: "g" },
  { name: "Nutrabay Fat Burner", brand: "Nutrabay", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "capsule" },
  { name: "Nutrabay India Whey Isolate", brand: "Nutrabay", calories: 380, protein: 88.3, carbs: 4, fat: 1, fiber: 0, servingSize: 30, servingUnit: "scoop" },

  // ═══════════════════════════════════════════════════════
  // ─── HEALTHKART ───
  // ═══════════════════════════════════════════════════════
  { name: "HealthKart Whey Protein", brand: "HealthKart", calories: 395, protein: 76, carbs: 9, fat: 6.5, fiber: 0, servingSize: 34, servingUnit: "scoop" },
  { name: "HealthKart Isolate", brand: "HealthKart", calories: 372, protein: 85, carbs: 3.5, fat: 2, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "HealthKart Plant Protein", brand: "HealthKart", calories: 380, protein: 66, carbs: 15, fat: 8, fiber: 5, servingSize: 36, servingUnit: "scoop" },
  { name: "HealthKart Mass Gainer", brand: "HealthKart", calories: 382, protein: 20, carbs: 70, fat: 4, fiber: 0.5, servingSize: 100, servingUnit: "scoop" },
  { name: "HealthKart Protein Bar", brand: "HealthKart", calories: 340, protein: 38, carbs: 36, fat: 10, fiber: 6, servingSize: 60, servingUnit: "bar" },
  { name: "HealthKart Fish Oil", brand: "HealthKart", calories: 10, protein: 0, carbs: 0, fat: 1, fiber: 0, servingSize: 1, servingUnit: "softgel" },
  { name: "HealthKart Multivitamin", brand: "HealthKart", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "tablet" },
  { name: "HealthKart Fat Burner", brand: "HealthKart", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "capsule" },

  // ═══════════════════════════════════════════════════════
  // ─── EMERGING & SPECIALIZED BRANDS (2026 PDF Verified) ──
  // ═══════════════════════════════════════════════════════
  // Naturaltein Raw Whey Grass-Fed: 30g, 24P/1.5C/1.5F → per-100g: 80.0P/5.0C/5.0F
  { name: "Naturaltein Raw Whey Grass-Fed", brand: "Naturaltein", calories: 385, protein: 80, carbs: 5, fat: 5, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "Naturaltein Raw Whey", brand: "Naturaltein", calories: 385, protein: 80, carbs: 5, fat: 5, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  // Wellcore Micro Pure Whey: 30g, 24P/1.2C/0.9F → per-100g: 80.0P/4.0C/3.0F
  { name: "Wellcore Micro Pure Whey", brand: "Wellcore", calories: 368, protein: 80, carbs: 4, fat: 3, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  // XLR8 Whey Protein: 34g, 24P/5.4C/2.3F → per-100g: 70.6P/15.9C/6.8F
  { name: "XLR8 Whey Protein", brand: "XLR8", calories: 413, protein: 70.6, carbs: 15.9, fat: 6.8, fiber: 0, servingSize: 34, servingUnit: "scoop" },
  { name: "XLR8 Whey with Enzymes", brand: "XLR8", calories: 413, protein: 70.6, carbs: 15.9, fat: 6.8, fiber: 0, servingSize: 34, servingUnit: "scoop" },
  { name: "XLR8 Isolate", brand: "XLR8", calories: 372, protein: 85, carbs: 3.5, fat: 2, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  // Scitron Advance Whey: 35g, 25.5P/4C/2F → per-100g: 72.9P/11.4C/5.7F
  { name: "Scitron Advance Whey", brand: "Scitron", calories: 389, protein: 72.9, carbs: 11.4, fat: 5.7, fiber: 0, servingSize: 35, servingUnit: "scoop" },
  // BigFlex Prime Whey Isolate: 30g, 26P/1C/0.5F → per-100g: 86.7P/3.3C/1.7F
  { name: "BigFlex Prime Whey Isolate", brand: "BigFlex", calories: 378, protein: 86.7, carbs: 3.3, fat: 1.7, fiber: 0, servingSize: 30, servingUnit: "scoop" },

  // ═══════════════════════════════════════════════════════
  // ─── BSN ───
  // ═══════════════════════════════════════════════════════
  { name: "BSN Syntha-6", brand: "BSN", calories: 415, protein: 66, carbs: 17, fat: 9, fiber: 1, servingSize: 47, servingUnit: "scoop" },
  { name: "BSN Syntha-6 India", brand: "BSN", calories: 415, protein: 66, carbs: 17, fat: 9, fiber: 1, servingSize: 47, servingUnit: "scoop" },
  { name: "BSN Isoburn", brand: "BSN", calories: 378, protein: 73, carbs: 8, fat: 4.5, fiber: 2, servingSize: 32, servingUnit: "scoop" },
  { name: "BSN True Mass", brand: "BSN", calories: 388, protein: 20, carbs: 68, fat: 6, fiber: 1, servingSize: 96, servingUnit: "scoop" },
  { name: "BSN N.O.-Xplode", brand: "BSN", calories: 15, protein: 0, carbs: 3, fat: 0, fiber: 0, servingSize: 13, servingUnit: "g" },
  { name: "BSN Amino X", brand: "BSN", calories: 10, protein: 40, carbs: 2, fat: 0, fiber: 0, servingSize: 14, servingUnit: "g" },
  { name: "BSN Protein Crisp Bar", brand: "BSN", calories: 350, protein: 38, carbs: 36, fat: 11, fiber: 5, servingSize: 56, servingUnit: "bar" },
  { name: "BSN Casein", brand: "BSN", calories: 395, protein: 73, carbs: 11, fat: 7, fiber: 1, servingSize: 36, servingUnit: "scoop" },
  { name: "BSN Creatine", brand: "BSN", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, servingSize: 5, servingUnit: "g" },
  { name: "BSN Hyper Shred", brand: "BSN", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "capsule" },

  // ═══════════════════════════════════════════════════════
  // ─── CELLUCOR ───
  // ═══════════════════════════════════════════════════════
  { name: "Cellucor C4 Pre-Workout", brand: "Cellucor", calories: 5, protein: 0, carbs: 1, fat: 0, fiber: 0, servingSize: 6, servingUnit: "g" },
  { name: "Cellucor C4 Sport", brand: "Cellucor", calories: 15, protein: 0, carbs: 3, fat: 0, fiber: 0, servingSize: 8, servingUnit: "g" },
  { name: "Cellucor C4 Ultimate", brand: "Cellucor", calories: 5, protein: 0, carbs: 1, fat: 0, fiber: 0, servingSize: 14, servingUnit: "g" },
  { name: "Cellucor C4 Original Pre-Workout", brand: "Cellucor", calories: 5, protein: 0, carbs: 1, fat: 0, fiber: 0, servingSize: 6, servingUnit: "g" },
  { name: "Cellucor COR-Performance Whey", brand: "Cellucor", calories: 390, protein: 77, carbs: 8, fat: 5.5, fiber: 0, servingSize: 33, servingUnit: "scoop" },
  { name: "Cellucor Whey Sport", brand: "Cellucor", calories: 395, protein: 76, carbs: 8, fat: 6, fiber: 0, servingSize: 34, servingUnit: "scoop" },
  { name: "Cellucor Cor-Performance Gainer", brand: "Cellucor", calories: 382, protein: 20, carbs: 69, fat: 4.5, fiber: 1, servingSize: 95, servingUnit: "scoop" },
  { name: "Cellucor Alpha Amino BCAA", brand: "Cellucor", calories: 5, protein: 42, carbs: 2, fat: 0, fiber: 0, servingSize: 10, servingUnit: "g" },
  { name: "Cellucor SuperHD", brand: "Cellucor", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "capsule" },
  { name: "Cellucor Creatine", brand: "Cellucor", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, servingSize: 5, servingUnit: "g" },
  { name: "Cellucor India C4", brand: "Cellucor", calories: 5, protein: 0, carbs: 1, fat: 0, fiber: 0, servingSize: 6, servingUnit: "scoop" },

  // ═══════════════════════════════════════════════════════
  // ─── GHOST ───
  // ═══════════════════════════════════════════════════════
  { name: "Ghost Whey Protein", brand: "Ghost", calories: 390, protein: 76, carbs: 8, fat: 6, fiber: 0, servingSize: 34, servingUnit: "scoop" },
  { name: "Ghost Isolate", brand: "Ghost", calories: 370, protein: 86, carbs: 2, fat: 2, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "Ghost Pre-Workout", brand: "Ghost", calories: 5, protein: 0, carbs: 1, fat: 0, fiber: 0, servingSize: 8, servingUnit: "g" },
  { name: "Ghost BCAA", brand: "Ghost", calories: 5, protein: 50, carbs: 0, fat: 0, fiber: 0, servingSize: 7, servingUnit: "g" },

  // ═══════════════════════════════════════════════════════
  // ─── OTHER INDIAN BRANDS ───
  // ═══════════════════════════════════════════════════════
  { name: "Big Muscles Whey Protein", brand: "Big Muscles", calories: 398, protein: 75, carbs: 10, fat: 7, fiber: 0, servingSize: 34, servingUnit: "scoop" },
  { name: "Big Muscles Gold Whey", brand: "Big Muscles", calories: 385, protein: 80, carbs: 6, fat: 5, fiber: 0, servingSize: 32, servingUnit: "scoop" },
  { name: "Big Muscles Mass Gainer", brand: "Big Muscles", calories: 385, protein: 18, carbs: 72, fat: 4, fiber: 0.5, servingSize: 100, servingUnit: "scoop" },
  { name: "Big Muscles BCAA", brand: "Big Muscles", calories: 8, protein: 48, carbs: 0, fat: 0, fiber: 0, servingSize: 7, servingUnit: "g" },
  { name: "Big Muscles India Carb Supplement", brand: "Big Muscles", calories: 380, protein: 0, carbs: 95, fat: 0, fiber: 0, servingSize: 30, servingUnit: "g" },
  { name: "Six Pack Nutrition Whey", brand: "Six Pack Nutrition", calories: 395, protein: 76, carbs: 9, fat: 6.5, fiber: 0, servingSize: 33, servingUnit: "scoop" },
  { name: "Six Pack Nutrition Mass Gainer", brand: "Six Pack Nutrition", calories: 383, protein: 19, carbs: 71, fat: 4, fiber: 0.5, servingSize: 100, servingUnit: "scoop" },
  { name: "British Nutritions Whey", brand: "British Nutritions", calories: 398, protein: 75, carbs: 10, fat: 7, fiber: 0, servingSize: 34, servingUnit: "scoop" },
  { name: "Labrada Whey Protein", brand: "Labrada", calories: 385, protein: 80, carbs: 6, fat: 4.5, fiber: 0, servingSize: 32, servingUnit: "scoop" },
  { name: "Neulife Whey Protein", brand: "Neulife", calories: 395, protein: 76, carbs: 9, fat: 7, fiber: 0, servingSize: 33, servingUnit: "scoop" },
  { name: "G Sport Whey Protein", brand: "G Sport", calories: 398, protein: 74, carbs: 10, fat: 7.5, fiber: 0, servingSize: 34, servingUnit: "scoop" },
  { name: "Node Whey Protein", brand: "Node", calories: 392, protein: 77, carbs: 8, fat: 6, fiber: 0, servingSize: 33, servingUnit: "scoop" },
  { name: "Cureveda Whey", brand: "Cureveda", calories: 388, protein: 78, carbs: 7.5, fat: 5.5, fiber: 0, servingSize: 32, servingUnit: "scoop" },
  { name: "Atp Whey Protein", brand: "ATP", calories: 390, protein: 78, carbs: 7, fat: 6, fiber: 0, servingSize: 32, servingUnit: "scoop" },
  { name: "Fast&Up Whey Protein", brand: "Fast&Up", calories: 388, protein: 79, carbs: 6.5, fat: 5.5, fiber: 0, servingSize: 32, servingUnit: "scoop" },
  { name: "Fast&Up Isolate", brand: "Fast&Up", calories: 370, protein: 86, carbs: 3, fat: 2, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "Fast&Up BCAA", brand: "Fast&Up", calories: 5, protein: 50, carbs: 0, fat: 0, fiber: 0, servingSize: 7, servingUnit: "g" },
  { name: "Fast&Up Pre-Workout", brand: "Fast&Up", calories: 15, protein: 0, carbs: 3, fat: 0, fiber: 0, servingSize: 10, servingUnit: "g" },
  { name: "Muscle Nation Whey", brand: "Muscle Nation", calories: 392, protein: 77, carbs: 8, fat: 6, fiber: 0, servingSize: 33, servingUnit: "scoop" },
  { name: "Oziva Plant Protein", brand: "Oziva", calories: 385, protein: 65, carbs: 16, fat: 8, fiber: 5, servingSize: 36, servingUnit: "scoop" },
  { name: "Corebolics EAA", brand: "Corebolics", calories: 8, protein: 53, carbs: 0, fat: 0, fiber: 0, servingSize: 9, servingUnit: "g" },

  // ═══════════════════════════════════════════════════════
  // ─── OTHER INTERNATIONAL BRANDS ───
  // ═══════════════════════════════════════════════════════
  { name: "Naked Nutrition Naked Whey", brand: "Naked Nutrition", calories: 382, protein: 83, carbs: 5, fat: 4, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "Naked Nutrition Naked Casein", brand: "Naked Nutrition", calories: 378, protein: 80, carbs: 6, fat: 4, fiber: 0, servingSize: 32, servingUnit: "scoop" },
  { name: "Naked Nutrition Naked Pea", brand: "Naked Nutrition", calories: 380, protein: 80, carbs: 6, fat: 4, fiber: 2, servingSize: 30, servingUnit: "scoop" },
  { name: "Naked Nutrition Naked Rice", brand: "Naked Nutrition", calories: 370, protein: 78, carbs: 7, fat: 3, fiber: 1, servingSize: 30, servingUnit: "scoop" },
  { name: "Legion Whey+", brand: "Legion", calories: 385, protein: 80, carbs: 5, fat: 4.5, fiber: 0, servingSize: 31, servingUnit: "scoop" },
  { name: "JYM Protein", brand: "JYM", calories: 395, protein: 76, carbs: 8, fat: 6, fiber: 0, servingSize: 34, servingUnit: "scoop" },
  { name: "Animal Whey", brand: "Universal", calories: 395, protein: 77, carbs: 8, fat: 6, fiber: 0, servingSize: 33, servingUnit: "scoop" },
  { name: "Promix Whey Isolate", brand: "Promix", calories: 370, protein: 86, carbs: 2, fat: 2, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "Levels Whey Protein", brand: "Levels", calories: 385, protein: 80, carbs: 5, fat: 4.5, fiber: 0, servingSize: 31, servingUnit: "scoop" },
  { name: "Nutricost Whey Isolate", brand: "Nutricost", calories: 372, protein: 85, carbs: 3, fat: 2, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "BulkSupplements Whey Isolate", brand: "BulkSupplements", calories: 375, protein: 84, carbs: 3, fat: 2.5, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "Now Sports Whey Isolate", brand: "Now Sports", calories: 372, protein: 85, carbs: 3, fat: 2, fiber: 0, servingSize: 30, servingUnit: "scoop" },
  { name: "Universal Whey India", brand: "Universal", calories: 395, protein: 77, carbs: 8, fat: 6, fiber: 0, servingSize: 33, servingUnit: "scoop" },
  { name: "Ryse Pre-Workout", brand: "Ryse", calories: 5, protein: 0, carbs: 1, fat: 0, fiber: 0, servingSize: 8, servingUnit: "g" },
  { name: "Alani Nu Pre-Workout", brand: "Alani Nu", calories: 5, protein: 0, carbs: 1, fat: 0, fiber: 0, servingSize: 6, servingUnit: "g" },
  { name: "Scivation Xtend BCAA", brand: "Scivation", calories: 0, protein: 50, carbs: 0, fat: 0, fiber: 0, servingSize: 7, servingUnit: "g" },
  { name: "Animal Cuts", brand: "Universal", calories: 5, protein: 0, carbs: 1, fat: 0, fiber: 0, servingSize: 1, servingUnit: "packet" },
  { name: "Evlution Nutrition LeanMode", brand: "EVL", calories: 2, protein: 0, carbs: 0.3, fat: 0, fiber: 0, servingSize: 1, servingUnit: "capsule" },
  { name: "Old School Labs Vintage Burn", brand: "Old School Labs", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 2, servingUnit: "capsule" },

  // ═══════════════════════════════════════════════════════
  // ─── PLANT-BASED / VEGAN PROTEIN ───
  // ═══════════════════════════════════════════════════════
  { name: "Vega Protein Smoothie", brand: "Vega", calories: 375, protein: 67, carbs: 14, fat: 7, fiber: 5, servingSize: 30, servingUnit: "scoop" },
  { name: "Vega One All-in-One", brand: "Vega", calories: 380, protein: 60, carbs: 17, fat: 8, fiber: 7, servingSize: 40, servingUnit: "scoop" },
  { name: "Garden of Life Raw Organic Protein", brand: "Garden of Life", calories: 360, protein: 72, carbs: 10, fat: 6, fiber: 4, servingSize: 33, servingUnit: "scoop" },
  { name: "Garden of Life Sport Organic Plant", brand: "Garden of Life", calories: 370, protein: 70, carbs: 11, fat: 7, fiber: 3, servingSize: 34, servingUnit: "scoop" },
  { name: "Orgain Organic Protein", brand: "Orgain", calories: 370, protein: 68, carbs: 13, fat: 7, fiber: 5, servingSize: 34, servingUnit: "scoop" },
  { name: "Orgain Protein Powder", brand: "Orgain", calories: 368, protein: 70, carbs: 12, fat: 6, fiber: 4, servingSize: 33, servingUnit: "scoop" },
  { name: "Huel Protein", brand: "Huel", calories: 390, protein: 62, carbs: 20, fat: 9, fiber: 6, servingSize: 38, servingUnit: "scoop" },
  { name: "Sprout Living Epic Protein", brand: "Sprout Living", calories: 365, protein: 72, carbs: 10, fat: 7, fiber: 4, servingSize: 32, servingUnit: "scoop" },
  { name: "NorCal Organic Pea Protein", brand: "NorCal", calories: 380, protein: 80, carbs: 5, fat: 3.5, fiber: 2, servingSize: 30, servingUnit: "scoop" },

  // ═══════════════════════════════════════════════════════
  // ─── GENERIC CREATINE ───
  // ═══════════════════════════════════════════════════════
  { name: "Creatine Monohydrate", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, servingSize: 5, servingUnit: "g" },
  { name: "Creatine HCL", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, servingSize: 1, servingUnit: "g" },
  { name: "Creatine Ethyl Ester", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, servingSize: 3, servingUnit: "g" },
  { name: "Buffered Creatine Kre-Alkalyn", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, servingSize: 3, servingUnit: "g" },

  // ═══════════════════════════════════════════════════════
  // ─── GENERIC BCAA / EAA ───
  // ═══════════════════════════════════════════════════════
  { name: "BCAA Powder", calories: 10, protein: 50, carbs: 0, fat: 0, fiber: 0, servingSize: 7, servingUnit: "g" },
  { name: "EAA Powder", calories: 15, protein: 55, carbs: 0, fat: 0, fiber: 0, servingSize: 10, servingUnit: "g" },

  // ═══════════════════════════════════════════════════════
  // ─── PROTEIN BARS ───
  // ═══════════════════════════════════════════════════════
  { name: "Quest Protein Bar", brand: "Quest", calories: 350, protein: 46, carbs: 37, fat: 8, fiber: 14, servingSize: 60, servingUnit: "bar" },
  { name: "Quest Bar", brand: "Quest", calories: 350, protein: 46, carbs: 37, fat: 8, fiber: 14, servingSize: 60, servingUnit: "bar" },
  { name: "Clif Bar", brand: "Clif", calories: 367, protein: 17, carbs: 58, fat: 7, fiber: 4, servingSize: 68, servingUnit: "bar" },
  { name: "Kind Protein Bar", brand: "Kind", calories: 365, protein: 25, carbs: 38, fat: 14, fiber: 5, servingSize: 50, servingUnit: "bar" },
  { name: "RXBAR", brand: "RXBAR", calories: 360, protein: 30, carbs: 37, fat: 12, fiber: 5, servingSize: 52, servingUnit: "bar" },
  { name: "ThinkThin Protein Bar", brand: "ThinkThin", calories: 330, protein: 40, carbs: 33, fat: 8, fiber: 3, servingSize: 60, servingUnit: "bar" },
  { name: "Pure Protein Bar", brand: "Pure Protein", calories: 335, protein: 42, carbs: 35, fat: 8, fiber: 3, servingSize: 58, servingUnit: "bar" },
  { name: "One Bar", brand: "One", calories: 340, protein: 38, carbs: 37, fat: 9, fiber: 7, servingSize: 60, servingUnit: "bar" },
  { name: "Lenny & Larry's Protein Bar", brand: "Lenny & Larry's", calories: 360, protein: 25, carbs: 48, fat: 11, fiber: 5, servingSize: 56, servingUnit: "bar" },
  { name: "Yoga Bar Protein Bar", brand: "Yoga Bar", calories: 350, protein: 30, carbs: 40, fat: 12, fiber: 5, servingSize: 60, servingUnit: "bar" },
  { name: "Rite Bite Protein Bar", brand: "Rite Bite", calories: 340, protein: 30, carbs: 42, fat: 10, fiber: 3, servingSize: 50, servingUnit: "bar" },
  { name: "Nature Valley Protein Bar", brand: "Nature Valley", calories: 365, protein: 19, carbs: 53, fat: 9, fiber: 3, servingSize: 42, servingUnit: "bar" },
  { name: "Detour Protein Bar", brand: "Detour", calories: 340, protein: 38, carbs: 35, fat: 10, fiber: 5, servingSize: 62, servingUnit: "bar" },
  { name: "Grenade Protein Bar", brand: "Grenade", calories: 340, protein: 37, carbs: 36, fat: 10, fiber: 7, servingSize: 60, servingUnit: "bar" },
  { name: "No Cow Protein Bar", brand: "No Cow", calories: 335, protein: 36, carbs: 38, fat: 7, fiber: 9, servingSize: 45, servingUnit: "bar" },

  // ═══════════════════════════════════════════════════════
  // ─── MULTIVITAMINS & MINERALS ───
  // ═══════════════════════════════════════════════════════
  { name: "Multivitamin Tablet", calories: 2, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "tablet" },
  { name: "Multivitamin Capsule", calories: 2, protein: 0, carbs: 0.3, fat: 0, fiber: 0, servingSize: 1, servingUnit: "capsule" },
  { name: "Centrum Multivitamin", brand: "Centrum", calories: 2, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "tablet" },
  { name: "Centrum Women", brand: "Centrum", calories: 2, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "tablet" },
  { name: "Nature Made Multivitamin", brand: "Nature Made", calories: 2, protein: 0, carbs: 0.4, fat: 0, fiber: 0, servingSize: 1, servingUnit: "tablet" },
  { name: "Rainbow Light Men's One", brand: "Rainbow Light", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "tablet" },
  { name: "Garden of Life Vitamin Code", brand: "Garden of Life", calories: 5, protein: 0, carbs: 0.8, fat: 0, fiber: 0, servingSize: 4, servingUnit: "capsule" },
  { name: "Now Foods ADAM", brand: "Now Foods", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 2, servingUnit: "capsule" },
  { name: "Himalaya Wellness Multivitamin", brand: "Himalaya", calories: 2, protein: 0, carbs: 0.4, fat: 0, fiber: 0, servingSize: 1, servingUnit: "tablet" },
  { name: "Supradyn Multivitamin", brand: "Supradyn", calories: 2, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "tablet" },
  { name: "Revital H Multivitamin", brand: "Revital H", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "capsule" },

  // ═══════════════════════════════════════════════════════
  // ─── OMEGA-3 / FISH OIL ───
  // ═══════════════════════════════════════════════════════
  { name: "Fish Oil Capsule", calories: 10, protein: 0, carbs: 0, fat: 1, fiber: 0, servingSize: 1, servingUnit: "capsule" },
  { name: "Omega-3 Capsule", calories: 10, protein: 0, carbs: 0, fat: 1, fiber: 0, servingSize: 1, servingUnit: "capsule" },
  { name: "Nature Made Fish Oil", brand: "Nature Made", calories: 10, protein: 0, carbs: 0, fat: 1, fiber: 0, servingSize: 1, servingUnit: "softgel" },
  { name: "Now Foods Omega-3", brand: "Now Foods", calories: 10, protein: 0, carbs: 0, fat: 1, fiber: 0, servingSize: 1, servingUnit: "softgel" },
  { name: "Carlson Fish Oil", brand: "Carlson", calories: 10, protein: 0, carbs: 0, fat: 1, fiber: 0, servingSize: 1, servingUnit: "softgel" },
  { name: "Nordic Naturals Omega-3", brand: "Nordic Naturals", calories: 10, protein: 0, carbs: 0, fat: 1, fiber: 0, servingSize: 1, servingUnit: "softgel" },
  { name: "Flaxseed Oil Capsule", calories: 10, protein: 0, carbs: 0, fat: 1, fiber: 0, servingSize: 1, servingUnit: "capsule" },
  { name: "Krill Oil Capsule", calories: 8, protein: 0, carbs: 0, fat: 0.8, fiber: 0, servingSize: 1, servingUnit: "softgel" },

  // ═══════════════════════════════════════════════════════
  // ─── GLUTAMINE / BETA-ALANINE / CITRULLINE ───
  // ═══════════════════════════════════════════════════════
  { name: "L-Glutamine Powder", calories: 0, protein: 83, carbs: 0, fat: 0, fiber: 0, servingSize: 5, servingUnit: "g" },
  { name: "Beta-Alanine Powder", calories: 0, protein: 85, carbs: 0, fat: 0, fiber: 0, servingSize: 3, servingUnit: "g" },
  { name: "L-Citrulline Powder", calories: 0, protein: 80, carbs: 0, fat: 0, fiber: 0, servingSize: 6, servingUnit: "g" },
  { name: "Citrulline Malate Powder", calories: 0, protein: 55, carbs: 22, fat: 0, fiber: 0, servingSize: 8, servingUnit: "g" },

  // ═══════════════════════════════════════════════════════
  // ─── ZMA / SLEEP / ASHWAGANDHA ───
  // ═══════════════════════════════════════════════════════
  { name: "ZMA Capsule", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "capsule" },
  { name: "Melatonin Tablet", calories: 2, protein: 0, carbs: 0.3, fat: 0, fiber: 0, servingSize: 1, servingUnit: "tablet" },
  { name: "Ashwagandha Capsule", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "capsule" },
  { name: "Himalaya Ashwagandha", brand: "Himalaya", calories: 2, protein: 0, carbs: 0.3, fat: 0, fiber: 0, servingSize: 1, servingUnit: "tablet" },
  { name: "KSM-66 Ashwagandha", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "capsule" },

  // ═══════════════════════════════════════════════════════
  // ─── CALCIUM / VITAMIN D / BONE HEALTH ───
  // ═══════════════════════════════════════════════════════
  { name: "Calcium Tablet", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "tablet" },
  { name: "Vitamin D Capsule", calories: 2, protein: 0, carbs: 0.2, fat: 0, fiber: 0, servingSize: 1, servingUnit: "capsule" },
  { name: "Magnesium Tablet", calories: 2, protein: 0, carbs: 0.3, fat: 0, fiber: 0, servingSize: 1, servingUnit: "tablet" },
  { name: "Zinc Tablet", calories: 2, protein: 0, carbs: 0.2, fat: 0, fiber: 0, servingSize: 1, servingUnit: "tablet" },
  { name: "Iron Tablet", calories: 2, protein: 0, carbs: 0.2, fat: 0, fiber: 0, servingSize: 1, servingUnit: "tablet" },

  // ═══════════════════════════════════════════════════════
  // ─── INDIAN NUTRITIONAL DRINKS ───
  // ═══════════════════════════════════════════════════════
  { name: "Ensure Complete Nutrition", brand: "Ensure", calories: 430, protein: 15, carbs: 60, fat: 11, fiber: 1.5, servingSize: 230, servingUnit: "ml" },
  { name: "Boost Nutritional Drink", brand: "Boost", calories: 410, protein: 15, carbs: 58, fat: 11, fiber: 1, servingSize: 237, servingUnit: "ml" },
  { name: "Horlicks Protein Plus", brand: "Horlicks", calories: 380, protein: 24, carbs: 55, fat: 6, fiber: 2, servingSize: 30, servingUnit: "g" },
  { name: "Bournvita", brand: "Bournvita", calories: 370, protein: 12, carbs: 73, fat: 3, fiber: 0, servingSize: 20, servingUnit: "g" },
  { name: "Complan", brand: "Complan", calories: 390, protein: 16, carbs: 62, fat: 8, fiber: 1, servingSize: 33, servingUnit: "g" },
  { name: "Protinex", brand: "Protinex", calories: 370, protein: 28, carbs: 52, fat: 5, fiber: 2, servingSize: 30, servingUnit: "g" },

  // ═══════════════════════════════════════════════════════
  // ─── AYURVEDIC / HERBAL ───
  // ═══════════════════════════════════════════════════════
  { name: "Shilajit Capsule", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "capsule" },
  { name: "Chyawanprash", calories: 290, protein: 2, carbs: 65, fat: 4, fiber: 3, servingSize: 20, servingUnit: "g" },
  { name: "Moringa Powder", calories: 340, protein: 25, carbs: 45, fat: 5, fiber: 20, servingSize: 5, servingUnit: "g" },
  { name: "Spirulina Tablet", calories: 290, protein: 55, carbs: 20, fat: 3, fiber: 5, servingSize: 0.5, servingUnit: "tablet" },
  { name: "Wheatgrass Powder", calories: 280, protein: 22, carbs: 48, fat: 2, fiber: 15, servingSize: 5, servingUnit: "g" },
  { name: "Triphala Capsule", calories: 2, protein: 0, carbs: 0.3, fat: 0, fiber: 0, servingSize: 1, servingUnit: "capsule" },
  { name: "Tulsi Capsule", calories: 2, protein: 0, carbs: 0.3, fat: 0, fiber: 0, servingSize: 1, servingUnit: "capsule" },
  { name: "Giloy Tablet", calories: 2, protein: 0, carbs: 0.3, fat: 0, fiber: 0, servingSize: 1, servingUnit: "tablet" },

  // ═══════════════════════════════════════════════════════
  // ─── INDIAN FLOURS / GRAINS (Supplement Context) ───
  // ═══════════════════════════════════════════════════════
  { name: "Ragi Flour", calories: 328, protein: 7.3, carbs: 72, fat: 1.3, fiber: 11, servingSize: 30, servingUnit: "g" },
  { name: "Jowar Flour", calories: 349, protein: 10.4, carbs: 72, fat: 1.9, fiber: 10, servingSize: 30, servingUnit: "g" },
  { name: "Bajra Flour", calories: 361, protein: 11.6, carbs: 67, fat: 5, fiber: 11, servingSize: 30, servingUnit: "g" },
  { name: "Foxtail Millet Flour", calories: 351, protein: 12.3, carbs: 60, fat: 4.3, fiber: 8, servingSize: 30, servingUnit: "g" },
  { name: "Besan (Gram Flour)", calories: 387, protein: 22, carbs: 58, fat: 6.7, fiber: 10, servingSize: 30, servingUnit: "g" },
  { name: "Soya Flour", calories: 440, protein: 48, carbs: 22, fat: 17, fiber: 8, servingSize: 30, servingUnit: "g" },
  { name: "Peanut Powder", calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8, servingSize: 30, servingUnit: "g" },
  { name: "Makhana Powder", calories: 350, protein: 9.7, carbs: 71, fat: 0.1, fiber: 14, servingSize: 20, servingUnit: "g" },
  { name: "Sattu Powder", calories: 406, protein: 20, carbs: 65, fat: 5, fiber: 6, servingSize: 30, servingUnit: "g" },

  // ═══════════════════════════════════════════════════════
  // ─── ADDITIONAL INDIAN BRAND VARIANTS ───
  // ═══════════════════════════════════════════════════════
  { name: "Muscletech India Mass Gainer", brand: "MuscleTech", calories: 380, protein: 19, carbs: 72, fat: 3.5, fiber: 1, servingSize: 115, servingUnit: "scoop" },
  { name: "Dymatize India Mass Gainer", brand: "Dymatize", calories: 383, protein: 17, carbs: 74, fat: 3, fiber: 0.5, servingSize: 148, servingUnit: "scoop" },
  { name: "BSN India True Mass", brand: "BSN", calories: 388, protein: 20, carbs: 68, fat: 6, fiber: 1, servingSize: 96, servingUnit: "scoop" },
  { name: "Universal India Animal Whey", brand: "Universal", calories: 395, protein: 77, carbs: 8, fat: 6, fiber: 0, servingSize: 33, servingUnit: "scoop" },
  { name: "Optimum Nutrition India Serious Mass", brand: "Optimum Nutrition", calories: 374, protein: 15, carbs: 75.4, fat: 1.3, fiber: 0.5, servingSize: 334, servingUnit: "scoop" },
  { name: "MyProtein India Weight Gainer", brand: "MyProtein", calories: 385, protein: 18, carbs: 72, fat: 4, fiber: 1, servingSize: 100, servingUnit: "scoop" },
  { name: "NakPro India Performance Whey", brand: "Nakpro", calories: 382, protein: 72.7, carbs: 12.1, fat: 4.5, fiber: 0, servingSize: 33, servingUnit: "scoop" },

  // ═══════════════════════════════════════════════════════
  // ─── COLLAGEN / JOINT HEALTH ───
  // ═══════════════════════════════════════════════════════
  { name: "Collagen Peptides Powder", calories: 40, protein: 90, carbs: 0, fat: 0, fiber: 0, servingSize: 10, servingUnit: "g" },
  { name: "Vital Proteins Collagen", brand: "Vital Proteins", calories: 40, protein: 90, carbs: 0, fat: 0, fiber: 0, servingSize: 10, servingUnit: "g" },
  { name: "Glucosamine Tablet", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "tablet" },
  { name: "Joint Support Capsule", calories: 3, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 1, servingUnit: "capsule" },

  // ═══════════════════════════════════════════════════════
  // ─── ELECTROLYTES / HYDRATION ───
  // ═══════════════════════════════════════════════════════
  { name: "Electrolyte Powder", calories: 10, protein: 0, carbs: 2, fat: 0, fiber: 0, servingSize: 5, servingUnit: "g" },
  { name: "Gatorade Powder", brand: "Gatorade", calories: 160, protein: 0, carbs: 40, fat: 0, fiber: 0, servingSize: 33, servingUnit: "g" },
  { name: "ORS Sachet", calories: 80, protein: 0, carbs: 20, fat: 0, fiber: 0, servingSize: 21, servingUnit: "sachet" },

  // ═══════════════════════════════════════════════════════
  // ─── CARB SUPPLEMENTS ───
  // ═══════════════════════════════════════════════════════
  { name: "Maltodextrin Powder", calories: 380, protein: 0, carbs: 95, fat: 0, fiber: 0, servingSize: 30, servingUnit: "g" },
  { name: "Dextrose Powder", calories: 370, protein: 0, carbs: 93, fat: 0, fiber: 0, servingSize: 30, servingUnit: "g" },
  { name: "Waxy Maize Powder", calories: 370, protein: 0, carbs: 93, fat: 0, fiber: 0, servingSize: 30, servingUnit: "g" },
  { name: "Cluster Dextrin", calories: 380, protein: 0, carbs: 95, fat: 0, fiber: 0, servingSize: 30, servingUnit: "g" },
];

// ── Brand+Variant specific unit conversions ──
// When a user enters a specific supplement with brand+variant and a measurement unit,
// this map provides the exact grams per unit for precise macro calculation.
// Priority: Brand-specific > Generic supplement type > Default
export const SUPPLEMENT_UNIT_TO_GRAMS: Record<string, number> = {
  // ═══════════════════════════════════════════════════════
  // ─── DEFAULT SUPPLEMENT UNIT CONVERSIONS ───
  // ═══════════════════════════════════════════════════════
  "default:scoop": 30,
  "default:tablet": 1,
  "default:tab": 1,
  "default:capsule": 0.8,
  "default:cap": 0.8,
  "default:softgel": 1,
  "default:gummy": 3,
  "default:bar": 60,
  "default:packet": 30,
  "default:sachet": 30,
  "default:can": 330,
  "default:caplet": 1,
  "default:pill": 0.5,
  "default:lozenge": 2,
  "default:drop": 0.05,
  "default:ml": 1,
  "default:g": 1,
  "default:serving": 30,
  "default:piece": 60,
  "default:mg": 0.001,

  // ═══════════════════════════════════════════════════════
  // ─── BRAND+VARIANT SPECIFIC SERVING SIZES ───
  // Key format: "brandname variantname:unit" or "variantname:unit"
  // These override the generic supplement type conversions
  // ═══════════════════════════════════════════════════════

  // ── OSOAA ──
  "osoaa ultimate iso whey:scoop": 33,
  "osoaa ultimate iso whey:serving": 33,
  "osoaa impact whey:scoop": 35,
  "osoaa impact whey:serving": 35,
  "osoaa impact whey creatine:scoop": 35,
  "osoaa impact whey creatine:serving": 35,
  "osoaa whey isolate:scoop": 30,
  "osoaa whey isolate:serving": 30,
  "osoaa whey concentrate:scoop": 30,
  "osoaa whey concentrate:serving": 30,
  "osoaa plant protein:scoop": 35,
  "osoaa plant protein:serving": 35,
  "osoaa micellar casein:scoop": 35,
  "osoaa micellar casein:serving": 35,
  "osoaa creapure creatine:g": 3,
  "osoaa creapure creatine:serving": 3,
  "osoaa fish oil:softgel": 1,
  "osoaa fish oil:capsule": 1,
  "osoaa fish oil:serving": 1,

  // ── MUSCLEBLAZE ──
  "muscleblaze biozyme performance whey:scoop": 36,
  "muscleblaze biozyme performance whey:serving": 36,
  "muscleblaze biozyme iso-zero:scoop": 34,
  "muscleblaze biozyme iso-zero:serving": 34,
  "muscleblaze biozyme isolate:scoop": 34,
  "muscleblaze biozyme isolate:serving": 34,
  "muscleblaze biozyme whey:scoop": 36,
  "muscleblaze biozyme whey:serving": 36,
  "muscleblaze raw whey:scoop": 30,
  "muscleblaze raw whey:serving": 30,
  "muscleblaze fuel one whey:scoop": 33,
  "muscleblaze fuel one whey:serving": 33,
  "muscleblaze super gainer xxl:scoop": 100,
  "muscleblaze super gainer xxl:serving": 100,
  "muscleblaze mass gainer xxl:scoop": 100,
  "muscleblaze mass gainer xxl:serving": 100,
  "muscleblaze wrathe pre-workout:scoop": 15,
  "muscleblaze wrathe:serving": 15,
  "muscleblaze creatine:g": 3,
  "muscleblaze creatine:serving": 3,

  // ── AVVATAR ──
  "avvatar whey protein:scoop": 35,
  "avvatar whey protein:serving": 35,
  "avvatar whey:scoop": 35,
  "avvatar whey:serving": 35,
  "avvatar isolate:scoop": 30,
  "avvatar isolate:serving": 30,
  "avvatar muscle gainer:scoop": 60,
  "avvatar muscle gainer:serving": 60,

  // ── NAKPRO ──
  "nakpro platinum isolate:scoop": 33,
  "nakpro platinum isolate:serving": 33,
  "nakpro perform whey:scoop": 33,
  "nakpro perform whey:serving": 33,
  "nakpro gold whey:scoop": 33,
  "nakpro gold whey:serving": 33,
  "nakpro impact whey blend:scoop": 48,
  "nakpro impact whey blend:serving": 48,
  "nakpro impact whey:scoop": 48,
  "nakpro impact whey:serving": 48,
  "nakpro creatine:g": 3,
  "nakpro creatine:serving": 3,

  // ── AS-IT-IS ──
  "as-it-is atom whey:scoop": 36,
  "as-it-is atom whey:serving": 36,
  "atom whey:scoop": 36,
  "atom whey:serving": 36,
  "as-it-is whey concentrate:scoop": 30,
  "as-it-is whey concentrate:serving": 30,
  "as-it-is whey isolate:scoop": 30,
  "as-it-is whey isolate:serving": 30,
  "as-it-is creatine:g": 3,
  "as-it-is creatine:serving": 3,

  // ── OPTIMUM NUTRITION ──
  "gold standard whey:scoop": 31,
  "gold standard whey:serving": 31,
  "on gold standard whey:scoop": 31,
  "on gold standard whey:serving": 31,
  "on platinum hydrowhey:scoop": 39,
  "on platinum hydrowhey:serving": 39,
  "platinum hydrowhey:scoop": 39,
  "platinum hydrowhey:serving": 39,
  "on performance whey:scoop": 34,
  "on performance whey:serving": 34,
  "performance whey:scoop": 34,
  "performance whey:serving": 34,
  "on gold standard casein:scoop": 33,
  "on gold standard casein:serving": 33,
  "on serious mass:scoop": 334,
  "on serious mass:serving": 334,
  "serious mass:scoop": 334,
  "serious mass:serving": 334,

  // ── DYMATIZE ──
  "dymatize iso 100:scoop": 30,
  "dymatize iso 100:serving": 30,
  "iso 100:scoop": 30,
  "iso 100:serving": 30,
  "dymatize elite whey:scoop": 36,
  "dymatize elite whey:serving": 36,

  // ── MYPROTEIN ──
  "myprotein impact whey:scoop": 25,
  "myprotein impact whey:serving": 25,
  "impact whey:scoop": 25,
  "impact whey:serving": 25,
  "myprotein impact isolate:scoop": 25,
  "myprotein impact isolate:serving": 25,
  "impact isolate:scoop": 25,
  "impact isolate:serving": 25,

  // ── MUSCLETECH ──
  "muscletech nitro-tech:scoop": 46,
  "muscletech nitro-tech:serving": 46,
  "nitro-tech:scoop": 46,
  "nitro-tech:serving": 46,

  // ── ISOPURE ──
  "isopure zero carb:scoop": 31,
  "isopure zero carb:serving": 31,
  "isopure low carb:scoop": 30,
  "isopure low carb:serving": 30,

  // ── RULE ONE ──
  "rule one r1 protein:scoop": 29,
  "rule one r1 protein:serving": 29,
  "r1 protein:scoop": 29,
  "r1 protein:serving": 29,

  // ── GNC ──
  "gnc pro performance:scoop": 35,
  "gnc pro performance:serving": 35,
  "gnc amp pure isolate:scoop": 32,
  "gnc amp pure isolate:serving": 32,

  // ── NUTRABAY ──
  "nutrabay pure whey isolate:scoop": 30,
  "nutrabay pure whey isolate:serving": 30,
  "nutrabay gold whey:scoop": 33,
  "nutrabay gold whey:serving": 33,
  "nutrabay gold whey blend:scoop": 33,
  "nutrabay gold whey blend:serving": 33,

  // ── EMERGING BRANDS ──
  "naturaltein raw whey:scoop": 30,
  "naturaltein raw whey:serving": 30,
  "wellcore micro pure whey:scoop": 30,
  "wellcore micro pure whey:serving": 30,
  "xlr8 whey:scoop": 34,
  "xlr8 whey:serving": 34,
  "scitron advance whey:scoop": 35,
  "scitron advance whey:serving": 35,
  "bigflex prime whey isolate:scoop": 30,
  "bigflex prime whey isolate:serving": 30,

  // ═══════════════════════════════════════════════════════
  // ─── GENERIC SUPPLEMENT TYPE CONVERSIONS ──
  // ═══════════════════════════════════════════════════════
  "whey protein:scoop": 30,
  "whey protein isolate:scoop": 30,
  "whey protein concentrate:scoop": 32,
  "casein protein:scoop": 33,
  "mass gainer:scoop": 100,
  "weight gainer:scoop": 100,
  "pre-workout:scoop": 8,
  "protein bar:bar": 60,
  "energy bar:bar": 65,
  "creatine:scoop": 5,
  "creatine monohydrate:scoop": 5,
  "bcaa:scoop": 7,
  "eaa:scoop": 10,
  "glutamine:scoop": 5,
  "beta-alanine:scoop": 3,
  "citrulline:scoop": 6,
  "citrulline malate:scoop": 8,
  "greens:scoop": 10,
  "meal replacement:scoop": 100,
  "collagen:scoop": 10,
  "carb powder:scoop": 30,
  "maltodextrin:scoop": 30,
  "electrolyte:scoop": 5,
  "sattu:scoop": 30,
  "protein shake:ml": 1,
  "rtd protein:ml": 1,
  "gatorade:ml": 1,
  "energy gel:sachet": 32,
  "ensure:ml": 1,
  "boost:ml": 1,
  "herbalife:scoop": 26,
  "horlicks:scoop": 20,
  "bournvita:scoop": 20,
  "complan:scoop": 33,
  "protinex:scoop": 30,
  "chyawanprash:tbsp": 20,
  "moringa:tsp": 3,
  "spirulina:tablet": 0.5,
  "wheatgrass:tsp": 3,
};
