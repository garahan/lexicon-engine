/**
 * Single-user progress model (Phase 1, persisted in localStorage).
 *
 * Pure, serialisable helpers so the learning loop is fully unit-testable and
 * the React layer only deals with read/write + rendering.
 */
import { createSrsState, schedule, selectDue, type SrsState, type ReviewGrade } from "./srs";
import type { Lesson, Track } from "./curriculum";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  concept: string;
  srs: SrsState;
}

export interface ConceptStat {
  correct: number;
  total: number;
}

export interface ProgressState {
  version: number;
  xp: number;
  /** Lesson ids that have been mastered. */
  completedLessons: string[];
  /** Per-concept running tally for weak-point ranking. */
  conceptStats: Record<string, ConceptStat>;
  flashcards: Flashcard[];
  streakDays: number;
  /** ISO day string (YYYY-MM-DD) of the last active day. */
  lastActiveDay: string | null;
  /** Whether the one grace/freeze day has been spent in the current run. */
  graceUsed: boolean;
  totalAnswers: number;
  bestCombo: number;
}

export const PROGRESS_VERSION = 1;
export const DAILY_REVIEW_CAP = 20;

export function createInitialProgress(): ProgressState {
  return {
    version: PROGRESS_VERSION,
    xp: 0,
    completedLessons: [],
    conceptStats: {},
    flashcards: [],
    streakDays: 0,
    lastActiveDay: null,
    graceUsed: false,
    totalAnswers: 0,
    bestCombo: 0,
  };
}

/** ISO day string (YYYY-MM-DD) in local time. */
export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayDiff(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00`).getTime();
  const db = new Date(`${b}T00:00:00`).getTime();
  return Math.round((db - da) / 86_400_000);
}

export interface StreakState {
  streakDays: number;
  lastActiveDay: string | null;
  graceUsed: boolean;
}

/**
 * Advance the streak for activity on `today`.
 * - Same day: unchanged.
 * - Next day: +1, grace refreshed.
 * - Exactly one day missed with grace available: +1, grace spent (freeze).
 * - Otherwise: reset to 1.
 */
export function advanceStreak(prev: StreakState, today: string): StreakState {
  if (prev.lastActiveDay === null) {
    return { streakDays: 1, lastActiveDay: today, graceUsed: false };
  }
  if (prev.lastActiveDay === today) return prev;

  const diff = dayDiff(prev.lastActiveDay, today);
  if (diff === 1) {
    return { streakDays: prev.streakDays + 1, lastActiveDay: today, graceUsed: false };
  }
  if (diff === 2 && !prev.graceUsed) {
    return { streakDays: prev.streakDays + 1, lastActiveDay: today, graceUsed: true };
  }
  return { streakDays: 1, lastActiveDay: today, graceUsed: false };
}

/** Record an answer against a concept tally (returns a new map). */
export function recordConcept(
  stats: Record<string, ConceptStat>,
  concept: string,
  correct: boolean,
): Record<string, ConceptStat> {
  const cur = stats[concept] ?? { correct: 0, total: 0 };
  return {
    ...stats,
    [concept]: {
      correct: cur.correct + (correct ? 1 : 0),
      total: cur.total + 1,
    },
  };
}

/** Insert a flashcard if one with the same id doesn't already exist. */
export function upsertFlashcard(cards: Flashcard[], card: Flashcard): Flashcard[] {
  if (cards.some((c) => c.id === card.id)) return cards;
  return [...cards, card];
}

export function makeFlashcard(
  id: string,
  front: string,
  back: string,
  concept: string,
  now: Date = new Date(),
): Flashcard {
  return { id, front, back, concept, srs: createSrsState(now) };
}

/** Apply a review grade to a flashcard by id (returns a new array). */
export function gradeFlashcard(
  cards: Flashcard[],
  id: string,
  grade: ReviewGrade,
  now: Date = new Date(),
): Flashcard[] {
  return cards.map((c) =>
    c.id === id ? { ...c, srs: schedule(c.srs, grade, now) } : c,
  );
}

export function dueCards(
  cards: Flashcard[],
  cap: number = DAILY_REVIEW_CAP,
  now: Date = new Date(),
): Flashcard[] {
  return selectDue(cards, cap, now);
}

/** Lesson is unlocked if it's the first, or the previous lesson is mastered. */
export function isLessonUnlocked(
  state: ProgressState,
  lesson: Lesson,
  track: Track,
): boolean {
  if (lesson.order <= 1) return true;
  const prev = track.lessons.find((l) => l.order === lesson.order - 1);
  if (!prev) return true;
  return state.completedLessons.includes(prev.id);
}

/** First non-mastered, unlocked lesson — the "continue" target. */
export function nextLesson(state: ProgressState, track: Track): Lesson | null {
  const ordered = [...track.lessons].sort((a, b) => a.order - b.order);
  for (const lesson of ordered) {
    if (
      !state.completedLessons.includes(lesson.id) &&
      isLessonUnlocked(state, lesson, track)
    ) {
      return lesson;
    }
  }
  return null;
}

export function markLessonComplete(state: ProgressState, lessonId: string): string[] {
  if (state.completedLessons.includes(lessonId)) return state.completedLessons;
  return [...state.completedLessons, lessonId];
}
