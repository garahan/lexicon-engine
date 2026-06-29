import {
  conceptMastery,
  dailySeries,
  retentionRate,
  leechCount,
  reviewForecast,
  statsSummary,
} from "./stats";
import { createInitialProgress, makeFlashcard, type Flashcard } from "./progress";
import type { SrsState } from "./srs";

const card = (id: string, srs: Partial<SrsState>): Flashcard => {
  const base = makeFlashcard(id, "f", "b", "tenses", new Date(2026, 0, 1));
  return { ...base, srs: { ...base.srs, ...srs } };
};

describe("conceptMastery", () => {
  it("computes accuracy per concept, strongest first", () => {
    const m = conceptMastery({
      tenses: { correct: 8, total: 10 },
      articles: { correct: 3, total: 10 },
      empty: { correct: 0, total: 0 },
    });
    expect(m.map((x) => x.concept)).toEqual(["tenses", "articles"]);
    expect(m[0].accuracy).toBeCloseTo(0.8, 5);
    expect(m[0].label).toBe("Tenses");
  });
});

describe("dailySeries", () => {
  it("fills the window with zeros and includes recorded days", () => {
    const today = new Date(2026, 5, 29);
    const history = {
      "2026-06-29": { answers: 4, correct: 3, xp: 30 },
      "2026-06-27": { answers: 2, correct: 1, xp: 10 },
    };
    const series = dailySeries(history, 3, today);
    expect(series.map((d) => d.day)).toEqual([
      "2026-06-27",
      "2026-06-28",
      "2026-06-29",
    ]);
    expect(series[0].accuracy).toBeCloseTo(0.5, 5);
    expect(series[1].answers).toBe(0);
    expect(series[2].correct).toBe(3);
  });
});

describe("retentionRate / leechCount", () => {
  it("is zero with no cards", () => {
    expect(retentionRate([])).toBe(0);
  });

  it("counts mature cards (long interval or many reps)", () => {
    const cards = [
      card("a", { interval: 12, reps: 3 }),
      card("b", { interval: 1, reps: 0 }),
    ];
    expect(retentionRate(cards)).toBeCloseTo(0.5, 5);
  });

  it("counts leeches over the lapse threshold", () => {
    const cards = [card("a", { lapses: 4 }), card("b", { lapses: 1 })];
    expect(leechCount(cards)).toBe(1);
  });
});

describe("reviewForecast", () => {
  it("buckets overdue cards into day 0 and future cards ahead", () => {
    const now = new Date(2026, 5, 29, 12);
    const DAY = 86_400_000;
    const cards = [
      card("overdue", { dueAt: new Date(now.getTime() - DAY).toISOString() }),
      card("tomorrow", { dueAt: new Date(now.getTime() + 1.5 * DAY).toISOString() }),
    ];
    const fc = reviewForecast(cards, 3, now);
    expect(fc).toHaveLength(3);
    expect(fc[0].count).toBe(1); // overdue lands on day 0
    expect(fc[1].count).toBe(1); // tomorrow
    expect(fc[2].count).toBe(0);
  });
});

describe("statsSummary", () => {
  it("aggregates headline numbers", () => {
    const s = createInitialProgress();
    s.totalAnswers = 10;
    s.bestCombo = 6;
    s.completedLessons = ["g1", "g2"];
    s.conceptStats = { tenses: { correct: 7, total: 10 } };
    s.history = { "2026-06-29": { answers: 10, correct: 7, xp: 70 } };
    s.flashcards = [
      card("a", { interval: 10, reps: 3, dueAt: new Date(2026, 6, 9).toISOString() }),
      card("b", { interval: 1, reps: 0, dueAt: new Date(2020, 0, 1).toISOString() }),
    ];
    const sum = statsSummary(s, new Date(2026, 5, 29, 12));
    expect(sum.totalAnswers).toBe(10);
    expect(sum.overallAccuracy).toBeCloseTo(0.7, 5);
    expect(sum.lessonsMastered).toBe(2);
    expect(sum.cards).toBe(2);
    expect(sum.matureCards).toBe(1);
    expect(sum.retention).toBeCloseTo(0.5, 5);
    expect(sum.bestCombo).toBe(6);
    expect(sum.activeDays).toBe(1);
    expect(sum.dueNow).toBe(1);
  });
});
