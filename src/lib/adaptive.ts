/**
 * Adaptive question selection.
 *
 * Builds question pools that keep the learner in the "flow zone": weak concepts
 * are surfaced more often (to strengthen them), unseen concepts get explored,
 * and well-mastered concepts appear less. All selection is driven by an
 * injectable RNG so the behaviour is deterministic and unit-testable.
 */
import type { Question } from "./curriculum";

export interface ConceptStat {
  correct: number;
  total: number;
}
export type ConceptStatMap = Record<string, ConceptStat>;

/**
 * Selection weight for a concept: weaker concepts weigh more so they're drawn
 * more often. Unseen concepts get a moderate "explore" weight.
 */
export function conceptWeight(stat?: ConceptStat): number {
  if (!stat || stat.total === 0) return 2.5;
  const acc = stat.correct / stat.total;
  return 1 + (1 - acc) * 4; // accuracy 1 → 1, accuracy 0 → 5
}

/** A deterministic 32-bit PRNG (mulberry32) returning values in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable hash of a string into a 32-bit integer (for seeding). */
export function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Weighted sampling without replacement using an injected RNG. */
export function weightedSample<T>(
  items: { item: T; weight: number }[],
  count: number,
  rng: () => number = Math.random,
): T[] {
  const pool = items.map((x) => ({ ...x }));
  const out: T[] = [];
  const n = Math.min(count, pool.length);
  for (let k = 0; k < n; k++) {
    const total = pool.reduce((s, x) => s + Math.max(0, x.weight), 0);
    if (total <= 0) {
      out.push(...pool.slice(0, n - out.length).map((x) => x.item));
      break;
    }
    let r = rng() * total;
    let idx = 0;
    for (let i = 0; i < pool.length; i++) {
      r -= Math.max(0, pool[i].weight);
      if (r <= 0) {
        idx = i;
        break;
      }
    }
    out.push(pool[idx].item);
    pool.splice(idx, 1);
  }
  return out;
}

/**
 * Order a lesson's questions adaptively: weak/unseen concepts are more likely
 * to come first, but every question still appears exactly once.
 */
export function adaptiveOrder(
  questions: Question[],
  stats: ConceptStatMap,
  rng: () => number = Math.random,
): Question[] {
  return weightedSample(
    questions.map((q) => ({ item: q, weight: conceptWeight(stats[q.concept]) })),
    questions.length,
    rng,
  );
}

/**
 * Build a drill of `count` questions from a pool, prioritising weak concepts.
 * Used by Daily Challenge / Strengthen mode.
 */
export function selectAdaptive(
  questions: Question[],
  stats: ConceptStatMap,
  count: number,
  rng: () => number = Math.random,
): Question[] {
  return weightedSample(
    questions.map((q) => ({ item: q, weight: conceptWeight(stats[q.concept]) })),
    count,
    rng,
  );
}

/**
 * A deterministic Daily Challenge for a given day: same questions all day, new
 * set tomorrow. Still weighted toward weak concepts.
 */
export function dailyChallenge(
  questions: Question[],
  stats: ConceptStatMap,
  count: number,
  dayKey: string,
): Question[] {
  const rng = mulberry32(seedFromString(`challenge-${dayKey}`));
  return selectAdaptive(questions, stats, count, rng);
}

/**
 * Quick-win drill: the easiest available questions (highest concept accuracy,
 * MCQ first) for a low-energy confidence boost. Deterministic.
 */
export function selectQuickWin(
  questions: Question[],
  stats: ConceptStatMap,
  count: number,
): Question[] {
  const acc = (q: Question): number => {
    const s = stats[q.concept];
    return s && s.total > 0 ? s.correct / s.total : 0.5;
  };
  const typeRank = (q: Question): number => (q.type === "mcq" ? 0 : q.type === "writing" ? 2 : 1);
  return [...questions]
    .sort((a, b) => acc(b) - acc(a) || typeRank(a) - typeRank(b))
    .slice(0, count);
}
