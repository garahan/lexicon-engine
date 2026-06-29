/**
 * Mastery, XP, combo and CEFR-level logic.
 *
 * Pure functions that decide: how much XP an answer is worth (with a combo
 * multiplier), when a lesson is "mastered" (gate), which concepts are weak, and
 * which CEFR band the learner has climbed to. Kept side-effect free so the
 * rules are fully unit-tested.
 */

/** The CEFR progression ladder this app climbs. */
export const CEFR_LADDER = [
  "B1",
  "B1+",
  "B2",
  "B2+",
  "C1",
  "C1+",
  "C2",
] as const;
export type CefrLevel = (typeof CEFR_LADDER)[number];

/** XP required to *enter* each level (cumulative). */
export const LEVEL_XP_THRESHOLDS: Record<CefrLevel, number> = {
  B1: 0,
  "B1+": 300,
  B2: 700,
  "B2+": 1200,
  C1: 1900,
  "C1+": 2800,
  C2: 4000,
};

/** Base XP awarded for a single correct answer. */
export const BASE_XP = 10;
/** Mastery threshold (fraction correct) required to pass a lesson. */
export const MASTERY_THRESHOLD = 0.85;

/**
 * Combo multiplier from a run of consecutive correct answers.
 * Every 3 in a row adds ×1, capped at ×4 so it stays fun but bounded.
 */
export function comboMultiplier(streak: number): number {
  if (streak <= 0) return 1;
  return Math.min(4, 1 + Math.floor(streak / 3));
}

/**
 * XP for a single answer. Wrong answers earn nothing; correct answers earn the
 * base amount scaled by the current combo multiplier.
 */
export function xpForAnswer(correct: boolean, comboStreak: number): number {
  if (!correct) return 0;
  return BASE_XP * comboMultiplier(comboStreak);
}

/** Fraction of attempts that were correct (0–1). Empty set → 0. */
export function accuracy(correct: number, total: number): number {
  if (total <= 0) return 0;
  return correct / total;
}

/** Whether a lesson is passed, i.e. accuracy meets the mastery threshold. */
export function isLessonMastered(
  correct: number,
  total: number,
  threshold: number = MASTERY_THRESHOLD,
): boolean {
  return total > 0 && accuracy(correct, total) >= threshold;
}

/** The CEFR level corresponding to a cumulative XP total. */
export function levelForXp(xp: number): CefrLevel {
  let level: CefrLevel = "B1";
  for (const l of CEFR_LADDER) {
    if (xp >= LEVEL_XP_THRESHOLDS[l]) level = l;
  }
  return level;
}

export interface LevelProgress {
  level: CefrLevel;
  next: CefrLevel | null;
  /** XP into the current band. */
  intoLevel: number;
  /** XP span of the current band (null at the top). */
  levelSpan: number | null;
  /** Fraction 0–1 toward the next level (1 at the top). */
  fraction: number;
}

/** Rich level progress for rendering the level ring. */
export function levelProgress(xp: number): LevelProgress {
  const level = levelForXp(xp);
  const idx = CEFR_LADDER.indexOf(level);
  const next = idx < CEFR_LADDER.length - 1 ? CEFR_LADDER[idx + 1] : null;
  const base = LEVEL_XP_THRESHOLDS[level];
  if (!next) {
    return { level, next: null, intoLevel: xp - base, levelSpan: null, fraction: 1 };
  }
  const span = LEVEL_XP_THRESHOLDS[next] - base;
  const intoLevel = xp - base;
  return {
    level,
    next,
    intoLevel,
    levelSpan: span,
    fraction: Math.max(0, Math.min(1, intoLevel / span)),
  };
}

export interface ConceptStat {
  concept: string;
  correct: number;
  total: number;
}

export interface WeakConcept extends ConceptStat {
  /** Fraction wrong (0–1) — higher means weaker. */
  errorRate: number;
  accuracy: number;
}

/**
 * Rank concepts from weakest to strongest by error rate. Concepts with no
 * attempts are excluded. Ties broken by attempt volume (more attempts first).
 */
export function rankWeakConcepts(stats: ConceptStat[]): WeakConcept[] {
  return stats
    .filter((s) => s.total > 0)
    .map((s) => ({
      ...s,
      accuracy: accuracy(s.correct, s.total),
      errorRate: 1 - accuracy(s.correct, s.total),
    }))
    .filter((s) => s.errorRate > 0)
    .sort((a, b) => b.errorRate - a.errorRate || b.total - a.total);
}

/**
 * Decide whether a 33%-base random bonus applies, returning the XP multiplier.
 * `roll` is an injected 0–1 random value so the rule stays testable. Keeps the
 * "variable reward" surprise without being manipulative.
 */
export function bonusMultiplier(roll: number): number {
  return roll < 0.2 ? 2 : 1;
}
