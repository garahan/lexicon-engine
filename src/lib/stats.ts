/**
 * Stats aggregation for the dashboard.
 *
 * Pure functions that turn raw progress state into the series the Stats tab
 * renders (concept mastery, accuracy trend, review heatmap, retention, due
 * forecast). No rendering here — everything is unit-testable.
 */
import type { ProgressState, DayActivity, Flashcard } from "./progress";
import { dayKey } from "./progress";
import { accuracy } from "./mastery";
import { conceptLabel } from "./curriculum";
import { isDue } from "./srs";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface ConceptMastery {
  concept: string;
  label: string;
  correct: number;
  total: number;
  accuracy: number;
}

/** Per-concept mastery, strongest first (for the mastery bar chart). */
export function conceptMastery(
  conceptStats: ProgressState["conceptStats"],
): ConceptMastery[] {
  return Object.entries(conceptStats)
    .filter(([, s]) => s.total > 0)
    .map(([concept, s]) => ({
      concept,
      label: conceptLabel(concept),
      correct: s.correct,
      total: s.total,
      accuracy: accuracy(s.correct, s.total),
    }))
    .sort((a, b) => b.accuracy - a.accuracy || b.total - a.total);
}

export interface DayPoint extends DayActivity {
  day: string;
  accuracy: number;
}

/**
 * A continuous daily series for the last `days` days (gaps filled with zeros),
 * oldest first. Powers both the accuracy trend line and the activity heatmap.
 */
export function dailySeries(
  history: Record<string, DayActivity>,
  days: number,
  today: Date = new Date(),
): DayPoint[] {
  const out: DayPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY_MS);
    const key = dayKey(d);
    const a = history[key] ?? { answers: 0, correct: 0, xp: 0 };
    out.push({ day: key, ...a, accuracy: accuracy(a.correct, a.answers) });
  }
  return out;
}

/**
 * Retention rate = share of flashcards that are "mature" (recalled enough that
 * their interval has stretched to a week or more). A higher number means more
 * knowledge has moved into durable, long-interval memory.
 */
export function retentionRate(cards: Flashcard[]): number {
  if (cards.length === 0) return 0;
  const mature = cards.filter((c) => c.srs.interval >= 6 || c.srs.reps >= 3).length;
  return mature / cards.length;
}

/** Cards that have lapsed repeatedly — the stubborn "leeches". */
export function leechCount(cards: Flashcard[], threshold = 3): number {
  return cards.filter((c) => c.srs.lapses >= threshold).length;
}

/** Number of cards due to review on each of the next `days` days. */
export function reviewForecast(
  cards: Flashcard[],
  days: number,
  now: Date = new Date(),
): { day: string; count: number }[] {
  const out: { day: string; count: number }[] = [];
  for (let i = 0; i < days; i++) {
    const end = new Date(now.getTime() + (i + 1) * DAY_MS);
    const startMs = now.getTime() + i * DAY_MS;
    const count = cards.filter((c) => {
      const due = new Date(c.srs.dueAt).getTime();
      // Day 0 includes everything already overdue.
      return i === 0 ? due <= end.getTime() : due > startMs && due <= end.getTime();
    }).length;
    out.push({ day: dayKey(new Date(now.getTime() + i * DAY_MS)), count });
  }
  return out;
}

export interface StatsSummary {
  totalAnswers: number;
  overallAccuracy: number;
  lessonsMastered: number;
  cards: number;
  matureCards: number;
  retention: number;
  bestCombo: number;
  activeDays: number;
  dueNow: number;
}

/** Headline numbers for the top of the Stats tab. */
export function statsSummary(state: ProgressState, now: Date = new Date()): StatsSummary {
  const totals = Object.values(state.conceptStats).reduce(
    (acc2, s) => ({ correct: acc2.correct + s.correct, total: acc2.total + s.total }),
    { correct: 0, total: 0 },
  );
  const matureCards = state.flashcards.filter(
    (c) => c.srs.interval >= 6 || c.srs.reps >= 3,
  ).length;
  return {
    totalAnswers: state.totalAnswers,
    overallAccuracy: accuracy(totals.correct, totals.total),
    lessonsMastered: state.completedLessons.length,
    cards: state.flashcards.length,
    matureCards,
    retention: retentionRate(state.flashcards),
    bestCombo: state.bestCombo,
    activeDays: Object.values(state.history).filter((d) => d.answers > 0).length,
    dueNow: state.flashcards.filter((c) => isDue(c.srs, now)).length,
  };
}
