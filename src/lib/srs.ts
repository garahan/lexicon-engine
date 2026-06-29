/**
 * Spaced-repetition scheduling (SM-2 algorithm).
 *
 * Each card carries the SM-2 state needed to compute its next review date:
 * repetition count, inter-review interval (days), and an "ease factor" that
 * grows when you recall a card and shrinks when you miss it. This is what makes
 * reviews land just before you'd forget — spacing out over days → weeks →
 * months as a card is reliably recalled.
 */

/** Quality of a recall attempt, following SM-2's 0–5 grade scale. */
export type RecallQuality = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * The four user-facing grades, mapped to SM-2 qualities.
 * - again: total blackout / wrong          → 0
 * - hard:  correct but with difficulty      → 3
 * - good:  correct after some hesitation    → 4
 * - easy:  perfect, effortless recall        → 5
 */
export type ReviewGrade = "again" | "hard" | "good" | "easy";

export const GRADE_TO_QUALITY: Record<ReviewGrade, RecallQuality> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
};

/** The SM-2 scheduling state stored on every flashcard. */
export interface SrsState {
  /** Number of consecutive successful recalls. */
  reps: number;
  /** Current inter-review interval, in days. */
  interval: number;
  /** Ease factor; starts at 2.5, never drops below 1.3. */
  ease: number;
  /** Count of times the card was forgotten (quality < 3). */
  lapses: number;
  /** ISO timestamp of when the card is next due. */
  dueAt: string;
}

export const MIN_EASE = 1.3;
export const INITIAL_EASE = 2.5;
const DAY_MS = 24 * 60 * 60 * 1000;

/** A brand-new card: due immediately, default ease, no history. */
export function createSrsState(now: Date = new Date()): SrsState {
  return {
    reps: 0,
    interval: 0,
    ease: INITIAL_EASE,
    lapses: 0,
    dueAt: now.toISOString(),
  };
}

/**
 * Update the SM-2 ease factor given a recall quality.
 * Classic SM-2 formula, clamped to a 1.3 floor.
 */
export function updateEase(ease: number, quality: RecallQuality): number {
  const next = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  return Math.max(MIN_EASE, Number(next.toFixed(4)));
}

/**
 * Compute the next SM-2 state after grading a recall attempt.
 *
 * - quality < 3 (a lapse): reps reset, the card relearns tomorrow, ease drops,
 *   lapse count increments.
 * - quality >= 3 (a success): interval grows (1d → 6d → interval × ease …) and
 *   the repetition count and ease increase.
 */
export function schedule(
  state: SrsState,
  grade: ReviewGrade,
  now: Date = new Date(),
): SrsState {
  const quality = GRADE_TO_QUALITY[grade];
  const ease = updateEase(state.ease, quality);

  if (quality < 3) {
    return {
      reps: 0,
      interval: 1,
      ease,
      lapses: state.lapses + 1,
      dueAt: new Date(now.getTime() + DAY_MS).toISOString(),
    };
  }

  const reps = state.reps + 1;
  let interval: number;
  if (reps === 1) {
    interval = 1;
  } else if (reps === 2) {
    interval = 6;
  } else {
    interval = Math.round(state.interval * ease);
  }

  return {
    reps,
    interval,
    ease,
    lapses: state.lapses,
    dueAt: new Date(now.getTime() + interval * DAY_MS).toISOString(),
  };
}

/** Whether a card is due for review at the given time. */
export function isDue(state: SrsState, now: Date = new Date()): boolean {
  return new Date(state.dueAt).getTime() <= now.getTime();
}

/** Count how many of the given cards are due now. */
export function countDue(states: SrsState[], now: Date = new Date()): number {
  return states.filter((s) => isDue(s, now)).length;
}

/**
 * Select up to `cap` due cards, most-overdue first. Caps the daily review load
 * so a long absence doesn't produce an unmanageable "avalanche".
 */
export function selectDue<T extends { srs: SrsState }>(
  cards: T[],
  cap: number,
  now: Date = new Date(),
): T[] {
  return cards
    .filter((c) => isDue(c.srs, now))
    .sort(
      (a, b) => new Date(a.srs.dueAt).getTime() - new Date(b.srs.dueAt).getTime(),
    )
    .slice(0, cap);
}
