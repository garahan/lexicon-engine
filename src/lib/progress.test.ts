import {
  createInitialProgress,
  dayKey,
  advanceStreak,
  recordConcept,
  upsertFlashcard,
  makeFlashcard,
  gradeFlashcard,
  dueCards,
  isLessonUnlocked,
  nextLesson,
  markLessonComplete,
} from "./progress";
import { GRAMMAR_TRACK } from "./curriculum";

describe("advanceStreak", () => {
  it("starts a streak from scratch", () => {
    const s = advanceStreak(
      { streakDays: 0, lastActiveDay: null, graceUsed: false },
      "2026-01-10",
    );
    expect(s).toEqual({ streakDays: 1, lastActiveDay: "2026-01-10", graceUsed: false });
  });

  it("is idempotent on the same day", () => {
    const prev = { streakDays: 5, lastActiveDay: "2026-01-10", graceUsed: false };
    expect(advanceStreak(prev, "2026-01-10")).toBe(prev);
  });

  it("increments on consecutive days and refreshes grace", () => {
    const s = advanceStreak(
      { streakDays: 5, lastActiveDay: "2026-01-10", graceUsed: true },
      "2026-01-11",
    );
    expect(s.streakDays).toBe(6);
    expect(s.graceUsed).toBe(false);
  });

  it("uses a grace day when exactly one day is missed", () => {
    const s = advanceStreak(
      { streakDays: 5, lastActiveDay: "2026-01-10", graceUsed: false },
      "2026-01-12",
    );
    expect(s.streakDays).toBe(6);
    expect(s.graceUsed).toBe(true);
  });

  it("resets when a day is missed and grace was already used", () => {
    const s = advanceStreak(
      { streakDays: 5, lastActiveDay: "2026-01-10", graceUsed: true },
      "2026-01-12",
    );
    expect(s.streakDays).toBe(1);
    expect(s.graceUsed).toBe(false);
  });

  it("resets after a long gap", () => {
    const s = advanceStreak(
      { streakDays: 9, lastActiveDay: "2026-01-10", graceUsed: false },
      "2026-01-20",
    );
    expect(s.streakDays).toBe(1);
  });
});

describe("dayKey", () => {
  it("formats a local YYYY-MM-DD string", () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("recordConcept", () => {
  it("accumulates correct/total immutably", () => {
    const a = recordConcept({}, "tenses", true);
    const b = recordConcept(a, "tenses", false);
    expect(b.tenses).toEqual({ correct: 1, total: 2 });
    expect(a.tenses).toEqual({ correct: 1, total: 1 }); // unchanged
  });
});

describe("flashcards", () => {
  it("upserts without duplicating ids", () => {
    const c1 = makeFlashcard("c1", "f", "b", "tenses", new Date(2026, 0, 1));
    const list = upsertFlashcard(upsertFlashcard([], c1), c1);
    expect(list).toHaveLength(1);
  });

  it("grades a card forward and surfaces due cards", () => {
    const now = new Date(2026, 0, 1, 12);
    const c1 = makeFlashcard("c1", "f", "b", "tenses", now);
    let cards = [c1];
    // New cards are due immediately.
    expect(dueCards(cards, 10, now)).toHaveLength(1);
    cards = gradeFlashcard(cards, "c1", "good", now);
    // After a good grade the interval pushes it out, so not due same day.
    expect(dueCards(cards, 10, now)).toHaveLength(0);
  });
});

describe("lesson gating", () => {
  it("unlocks the first lesson and locks later ones until mastery", () => {
    const state = createInitialProgress();
    const [l1, l2] = GRAMMAR_TRACK.lessons;
    expect(isLessonUnlocked(state, l1, GRAMMAR_TRACK)).toBe(true);
    expect(isLessonUnlocked(state, l2, GRAMMAR_TRACK)).toBe(false);

    state.completedLessons = markLessonComplete(state, l1.id);
    expect(isLessonUnlocked(state, l2, GRAMMAR_TRACK)).toBe(true);
  });

  it("nextLesson returns the first incomplete unlocked lesson", () => {
    const state = createInitialProgress();
    expect(nextLesson(state, GRAMMAR_TRACK)?.id).toBe(GRAMMAR_TRACK.lessons[0].id);
    state.completedLessons = [GRAMMAR_TRACK.lessons[0].id];
    expect(nextLesson(state, GRAMMAR_TRACK)?.id).toBe(GRAMMAR_TRACK.lessons[1].id);
  });

  it("markLessonComplete is idempotent", () => {
    const state = createInitialProgress();
    state.completedLessons = markLessonComplete(state, "g1");
    state.completedLessons = markLessonComplete(state, "g1");
    expect(state.completedLessons).toEqual(["g1"]);
  });
});
