/**
 * AI Memory Extractor
 * ──────────────────
 * Analyzes user messages and AI responses to extract insights that should be
 * persisted into the user's module memory. This is what makes the AI "remember"
 * user preferences, frequently mentioned foods, brand choices, and stated goals
 * across conversations.
 *
 * Extraction is done via pattern matching (instant, no API call) for common
 * cases (milk variants, whey brands, goals), with an optional AI-assisted
 * extraction pass for richer insights when the message is long enough to
 * warrant it.
 *
 * The extractor is non-blocking: any error is swallowed so the chatbot
 * response is never delayed by memory extraction.
 */

import { aiQuickCall } from '@/lib/ai-provider';

export interface MemoryExtraction {
  preferences: string[];
  frequentItems: string[];
  goals: string[];
  notes: string[];
}

// ────────────────────────────────────────────────────────────
// Pattern-based extractors (instant, deterministic)
// ────────────────────────────────────────────────────────────

// Milk variant patterns — recognizes full cream, toned, skim, etc.
const MILK_PATTERNS: [RegExp, string][] = [
  [/\b(full[\s-]?cream|whole\s+milk|amul\s+gold|mother\s+dairy\s+full|arokya\s+full|nandini\s+full|heritage\s+full|britannia\s+full)\b/i, 'Full Cream Milk'],
  [/\b(standardized\s+milk|amul\s+standard)\b/i, 'Standardized Milk'],
  [/\b(toned\s+milk|amul\s+taaza|mother\s+dairy\s+toned|arokya\s+toned|nandini\s+toned|heritage\s+toned|britannia\s+toned)\b/i, 'Toned Milk'],
  [/\b(double[\s-]?toned|amul\s+slim)\b/i, 'Double Toned Milk'],
  [/\b(skim[\s-]?med|skim\s+milk|amul\s+skim)\b/i, 'Skim Milk'],
];

// Brand patterns for popular protein/supplement brands
const BRAND_PATTERNS: [RegExp, string][] = [
  [/\b(osoaa)\b/i, 'OSOAA'],
  [/\b(muscle[\s-]?blaze|mb\s+whey)\b/i, 'MuscleBlaze'],
  [/\b(avvatar)\b/i, 'Avvatar'],
  [/\b(nakpro|nak\s*pro)\b/i, 'Nakpro'],
  [/\b(as[\s-]?it[\s-]?is|atom\s+whey)\b/i, 'AS-IT-IS'],
  [/\b(optimum\s+nutrition|on\s+gold|on\s+whey|gold\s+standard)\b/i, 'Optimum Nutrition'],
  [/\b(dymatize|iso\s*100)\b/i, 'Dymatize'],
  [/\b(myprotein|impact\s+whey)\b/i, 'MyProtein'],
  [/\b(muscletech|nitro[\s-]?tech)\b/i, 'MuscleTech'],
  [/\b(isopure)\b/i, 'IsoPure'],
  [/\b(rule\s+one|r1\s+protein)\b/i, 'Rule One'],
  [/\b(gnc)\b/i, 'GNC'],
  [/\b(nutrabay)\b/i, 'Nutrabay'],
  [/\b(healthkart|hk\s+whey)\b/i, 'HealthKart'],
  [/\b(naturaltein)\b/i, 'Naturaltein'],
  [/\b(wellcore)\b/i, 'Wellcore'],
  [/\b(scitron)\b/i, 'Scitron'],
  [/\b(bigflex)\b/i, 'BigFlex'],
  [/\b(big\s+muscles)\b/i, 'Big Muscles'],
  [/\b(labrada)\b/i, 'Labrada'],
  [/\b(neulife)\b/i, 'Neulife'],
  [/\b(bsn|syntha[\s-]?6)\b/i, 'BSN'],
  [/\b(cellucor|c4\s+pre)\b/i, 'Cellucor'],
  [/\b(ghost\s+whey|ghost\s+protein)\b/i, 'Ghost'],
];

// Diet preference patterns
const DIET_PATTERNS: [RegExp, string][] = [
  [/\b(i\s+am\s+(?:a\s+)?vegetarian|vegetarian\s+diet|veg\s+diet|don't?\s+eat\s+meat|no\s+meat)\b/i, 'Vegetarian'],
  [/\b(i\s+am\s+(?:a\s+)?vegan|vegan\s+diet|no\s+animal\s+products|no\s+dairy)\b/i, 'Vegan'],
  [/\b(i\s+am\s+(?:a\s+)?non[\s-]?veg|non[\s-]?vegetarian|eat\s+(?:all|meat|chicken|beef|fish))\b/i, 'Non-Vegetarian'],
  [/\b(eggetarian|eat\s+eggs\s+but\s+no\s+meat)\b/i, 'Eggetarian'],
  [/\b(keto\s+diet|ketogenic)\b/i, 'Keto'],
  [/\b(paleo)\b/i, 'Paleo'],
];

// Goal patterns
const GOAL_PATTERNS: [RegExp, string][] = [
  [/\b(lose\s+weight|fat\s+loss|cutting|weight\s+loss|lose\s+fat)\b/i, 'Fat Loss'],
  [/\b(gain\s+(?:weight|muscle)|muscle\s+gain|bulking|build\s+muscle|bulk\s+up)\b/i, 'Muscle Gain'],
  [/\b(maintain\s+weight|maintain(?:ance)?|recomp)\b/i, 'Maintenance'],
  [/\b(run\s+a\s+5k|run\s+a\s+10k|marathon|couch\s+to\s+5k|improve\s+(?:my\s+)?running)\b/i, 'Running Goal'],
  [/\b(improve\s+(?:my\s+)?sleep|better\s+sleep)\b/i, 'Better Sleep'],
  [/\b(reduce\s+stress|manage\s+stress|stress\s+relief)\b/i, 'Stress Reduction'],
  [/\b(study\s+(?:for|hard)|pass\s+(?:my\s+)?(?:exam|certification)|learn\s+(?:a\s+)?(?:new\s+)?language)\b/i, 'Learning Goal'],
  [/\b(wake\s+up\s+early|early\s+riser|morning\s+routine)\b/i, 'Early Riser'],
  [/\b(quit\s+(?:smoking|drinking)|stop\s+(?:smoking|drinking))\b/i, 'Quit Smoking/Drinking'],
  [/\b(reduce\s+(?:screen\s+time|phone\s+usage)|digital\s+detox)\b/i, 'Reduce Screen Time'],
];

// Workout preference patterns
const WORKOUT_PREFERENCE_PATTERNS: [RegExp, string][] = [
  [/\b(home\s+workout|bodyweight\s+(?:workout|exercises))\b/i, 'Prefers Home Workouts'],
  [/\b(gym(?:\s+workout)?|gym\s+session)\b/i, 'Gym Member'],
  [/\b(outdoor\s+(?:run|workout)|jogging|running)\b/i, 'Outdoor Running'],
  [/\b(push\s*pull\s*legs|ppl)\b/i, 'Push/Pull/Legs Split'],
  [/\b(upper\s*lower)\b/i, 'Upper/Lower Split'],
  [/\b(full\s*body\s*(?:workout|split)?)\b/i, 'Full Body Split'],
  [/\b(bro\s*split)\b/i, 'Bro Split'],
  [/\b(yoga|meditation|mindfulness)\b/i, 'Yoga/Meditation'],
  [/\b(high\s+intensity|hiit)\b/i, 'HIIT'],
  [/\b(strength\s+training|powerlifting)\b/i, 'Strength Training'],
];

// Learning preference patterns
const LEARNING_PREFERENCE_PATTERNS: [RegExp, string][] = [
  [/\b(i'?m\s+learning|studying|teaching\s+myself)\s+([^.,!?]+)/i, 'Learning: '],
  [/\b(i\s+want\s+to\s+learn|i'?d\s+like\s+to\s+learn|help\s+me\s+learn)\s+([^.,!?]+)/i, 'Wants to learn: '],
  [/\b(spaced\s+repetition|active\s+recall|feynman\s+technique|pomodoro)\b/i, 'Study Technique'],
];

// Allergy/restriction patterns
const ALLERGY_PATTERNS: [RegExp, string][] = [
  [/\b(lactose\s+intolerant)\b/i, 'Lactose Intolerant'],
  [/\b(gluten\s+(?:free|intolerant|sensitive|allergy)|celiac)\b/i, 'Gluten-Free'],
  [/\b(nut\s+allergy|peanut\s+allergy)\b/i, 'Nut Allergy'],
  [/\b(diabetic|diabetes)\b/i, 'Diabetic'],
  [/\b(high\s+(?:blood\s+)?pressure|hypertension)\b/i, 'Hypertension'],
  [/\b(high\s+cholesterol)\b/i, 'High Cholesterol'],
  [/\b(pcos|pcod)\b/i, 'PCOS'],
  [/\b(thyroid|hypothyroid)\b/i, 'Thyroid Condition'],
];

// ────────────────────────────────────────────────────────────
// Pattern-based extractor
// ────────────────────────────────────────────────────────────

/**
 * Fast pattern-based extraction. Always runs first.
 * Returns whatever it can find via regex — no API call.
 */
export function extractFromPatterns(
  userMessage: string,
  module: string,
): MemoryExtraction {
  const result: MemoryExtraction = {
    preferences: [],
    frequentItems: [],
    goals: [],
    notes: [],
  };

  // ── Diet preferences (fitness + general) ──
  if (module === 'fitness' || module === 'nutrition' || module === 'general') {
    for (const [pattern, label] of DIET_PATTERNS) {
      if (pattern.test(userMessage)) {
        result.preferences.push(`Diet: ${label}`);
      }
    }

    // ── Allergies & conditions ──
    for (const [pattern, label] of ALLERGY_PATTERNS) {
      if (pattern.test(userMessage)) {
        result.preferences.push(`Health: ${label}`);
      }
    }

    // ── Milk variants (very common — track as frequent items) ──
    for (const [pattern, label] of MILK_PATTERNS) {
      if (pattern.test(userMessage)) {
        result.frequentItems.push(label);
      }
    }

    // ── Brand preferences ──
    for (const [pattern, label] of BRAND_PATTERNS) {
      if (pattern.test(userMessage)) {
        result.frequentItems.push(`Brand: ${label}`);
      }
    }
  }

  // ── Workout preferences (fitness module) ──
  if (module === 'fitness' || module === 'general') {
    for (const [pattern, label] of WORKOUT_PREFERENCE_PATTERNS) {
      if (pattern.test(userMessage)) {
        result.preferences.push(`Workout: ${label}`);
      }
    }
  }

  // ── Learning preferences (learning module) ──
  if (module === 'learning' || module === 'general') {
    for (const [pattern, labelPrefix] of LEARNING_PREFERENCE_PATTERNS) {
      const match = userMessage.match(pattern);
      if (match) {
        const subject = match[2]?.trim();
        if (subject && subject.length > 1 && subject.length < 60) {
          result.preferences.push(`${labelPrefix}${subject}`);
        } else if (labelPrefix === 'Study Technique') {
          // The match was the technique itself
          const techniqueMatch = userMessage.match(/\b(spaced\s+repetition|active\s+recall|feynman\s+technique|pomodoro)\b/i);
          if (techniqueMatch) result.preferences.push(`Study Technique: ${techniqueMatch[0]}`);
        }
      }
    }
  }

  // ── Goals (all modules) ──
  for (const [pattern, label] of GOAL_PATTERNS) {
    if (pattern.test(userMessage)) {
      result.goals.push(label);
    }
  }

  // ── Time-based preferences (time module) ──
  if (module === 'time' || module === 'general') {
    if (/\b(morning\s+person|early\s+bird)\b/i.test(userMessage)) {
      result.preferences.push('Time: Morning Person');
    }
    if (/\b(night\s+owl|evening\s+person)\b/i.test(userMessage)) {
      result.preferences.push('Time: Night Owl');
    }
    if (/\b(pomodoro|25\s*\/\s*5|focus\s+sprint)\b/i.test(userMessage)) {
      result.preferences.push('Time: Pomodoro Technique');
    }
    if (/\b(time\s+blocking|deep\s+work)\b/i.test(userMessage)) {
      result.preferences.push('Time: Time Blocking');
    }
  }

  // ── Content creation preferences (content module) ──
  if (module === 'content' || module === 'general') {
    if (/\b(youtube|video\s+content)\b/i.test(userMessage)) {
      result.preferences.push('Content: YouTube');
    }
    if (/\b(blog|blogging|article)\b/i.test(userMessage)) {
      result.preferences.push('Content: Blog');
    }
    if (/\b(instagram|reels|shorts)\b/i.test(userMessage)) {
      result.preferences.push('Content: Instagram/Shorts');
    }
    if (/\b(podcast)\b/i.test(userMessage)) {
      result.preferences.push('Content: Podcast');
    }
  }

  return result;
}

// ────────────────────────────────────────────────────────────
// AI-assisted extractor (optional, for richer insights)
// ────────────────────────────────────────────────────────────

/**
 * AI-assisted extraction for richer insights. Only runs when the user message
 * is long enough (>120 chars) to warrant an extra API call. Falls back to
 * pattern-only extraction if AI fails or returns nothing useful.
 *
 * Returns null on any failure — pattern-based extraction is always the source
 * of truth.
 */
export async function extractWithAI(
  userMessage: string,
  aiReply: string,
  module: string,
): Promise<MemoryExtraction | null> {
  // Only run AI extraction for substantive messages
  if (userMessage.length < 120) return null;

  try {
    const prompt = `Analyze this user message and AI reply for a "${module}" coaching chatbot. Extract:
- preferences: User's stated preferences (diet, workout style, study methods, content types, schedule). Max 3 items.
- frequentItems: Specific foods, exercises, brands, topics, or tools the user mentions frequently. Max 5 items.
- goals: User's stated goals (lose weight, learn X, build Y, etc.). Max 2 items.
- notes: Any non-obvious coach observations (e.g. "user struggles with consistency on weekends", "user is recovering from injury"). Max 2 items.

Each item must be a short string (max 60 chars), prefixed with a category label like "Diet:", "Brand:", "Workout:", "Goal:", etc.

Return ONLY valid JSON: {"preferences":["..."],"frequentItems":["..."],"goals":["..."],"notes":["..."]}

If nothing extractable, return: {"preferences":[],"frequentItems":[],"goals":[],"notes":[]}

User message: "${userMessage.slice(0, 800)}"
AI reply: "${aiReply.slice(0, 400)}"`;

    const content = await aiQuickCall(
      'You are a memory extraction assistant. Return only valid JSON with the four arrays. Be conservative — only extract clearly stated facts, never infer.',
      prompt,
      300,
    );

    if (!content) return null;

    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const parsed = JSON.parse(match[0]);
    const result: MemoryExtraction = {
      preferences: Array.isArray(parsed.preferences) ? parsed.preferences.filter((x: any) => typeof x === 'string' && x.length < 80).slice(0, 3) : [],
      frequentItems: Array.isArray(parsed.frequentItems) ? parsed.frequentItems.filter((x: any) => typeof x === 'string' && x.length < 80).slice(0, 5) : [],
      goals: Array.isArray(parsed.goals) ? parsed.goals.filter((x: any) => typeof x === 'string' && x.length < 80).slice(0, 2) : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes.filter((x: any) => typeof x === 'string' && x.length < 80).slice(0, 2) : [],
    };

    // Only return if we found something
    const total = result.preferences.length + result.frequentItems.length + result.goals.length + result.notes.length;
    return total > 0 ? result : null;
  } catch (e) {
    console.error('[AI Memory Extractor] AI extraction failed:', e instanceof Error ? e.message : 'unknown');
    return null;
  }
}

// ────────────────────────────────────────────────────────────
// Combined extractor: pattern first, AI enrichment optional
// ────────────────────────────────────────────────────────────

/**
 * Run pattern-based extraction (always) + AI enrichment (when warranted).
 * Returns a merged MemoryExtraction ready to be passed to updateModuleMemory.
 */
export async function extractMemoryInsights(
  userMessage: string,
  aiReply: string,
  module: string,
): Promise<MemoryExtraction> {
  const patternResult = extractFromPatterns(userMessage, module);

  // Skip AI extraction if patterns already found plenty
  const patternCount =
    patternResult.preferences.length +
    patternResult.frequentItems.length +
    patternResult.goals.length +
    patternResult.notes.length;

  if (patternCount >= 5) {
    return patternResult; // Pattern extraction was rich enough
  }

  // Try AI enrichment
  const aiResult = await extractWithAI(userMessage, aiReply, module);
  if (!aiResult) return patternResult;

  // Merge — pattern results take priority, AI adds new items only
  return {
    preferences: [...patternResult.preferences, ...aiResult.preferences],
    frequentItems: [...patternResult.frequentItems, ...aiResult.frequentItems],
    goals: [...patternResult.goals, ...aiResult.goals],
    notes: [...patternResult.notes, ...aiResult.notes],
  };
}
