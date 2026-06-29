import {
  createSrsState,
  updateEase,
  schedule,
  isDue,
  countDue,
  selectDue,
  INITIAL_EASE,
  MIN_EASE,
  type SrsState,
} from "./srs";

const T0 = new Date("2026-01-01T00:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;

describe("createSrsState", () => {
  it("starts due immediately with default ease and no history", () => {
    const s = createSrsState(T0);
    expect(s).toEqual({
      reps: 0,
      interval: 0,
      ease: INITIAL_EASE,
      lapses: 0,
      dueAt: T0.toISOString(),
    });
  });
});

describe("updateEase", () => {
  it("leaves ease unchanged on a quality-4 (good) recall", () => {
    expect(updateEase(2.5, 4)).toBe(2.5);
  });

  it("increases ease on a perfect (5) recall", () => {
    expect(updateEase(2.5, 5)).toBeGreaterThan(2.5);
  });

  it("decreases ease on a low-quality recall", () => {
    expect(updateEase(2.5, 3)).toBeLessThan(2.5);
  });

  it("never drops below the 1.3 floor", () => {
    expect(updateEase(1.3, 0)).toBe(MIN_EASE);
  });
});

describe("schedule — success path", () => {
  it("first success schedules 1 day out", () => {
    const next = schedule(createSrsState(T0), "good", T0);
    expect(next.reps).toBe(1);
    expect(next.interval).toBe(1);
    expect(next.dueAt).toBe(new Date(T0.getTime() + 1 * DAY_MS).toISOString());
  });

  it("second success schedules 6 days out", () => {
    const first = schedule(createSrsState(T0), "good", T0);
    const second = schedule(first, "good", T0);
    expect(second.reps).toBe(2);
    expect(second.interval).toBe(6);
  });

  it("third success multiplies interval by ease", () => {
    const first = schedule(createSrsState(T0), "good", T0);
    const second = schedule(first, "good", T0);
    const third = schedule(second, "good", T0);
    // interval = round(6 * ease). ease stays 2.5 for grade "good" → 15.
    expect(third.interval).toBe(15);
    expect(third.dueAt).toBe(
      new Date(T0.getTime() + 15 * DAY_MS).toISOString(),
    );
  });

  it("intervals grow faster with 'easy' grades", () => {
    let s = schedule(createSrsState(T0), "easy", T0);
    s = schedule(s, "easy", T0);
    const easyThird = schedule(s, "easy", T0);
    expect(easyThird.interval).toBeGreaterThan(15);
  });
});

describe("schedule — lapse path", () => {
  it("a wrong answer resets reps, relearns tomorrow, and counts a lapse", () => {
    let s = schedule(createSrsState(T0), "good", T0);
    s = schedule(s, "good", T0); // interval now 6, reps 2
    const lapsed = schedule(s, "again", T0);
    expect(lapsed.reps).toBe(0);
    expect(lapsed.interval).toBe(1);
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.ease).toBeLessThan(s.ease);
    expect(lapsed.dueAt).toBe(new Date(T0.getTime() + DAY_MS).toISOString());
  });
});

describe("isDue / countDue", () => {
  it("a freshly created card is due", () => {
    expect(isDue(createSrsState(T0), T0)).toBe(true);
  });

  it("a scheduled card is not due before its dueAt", () => {
    const s = schedule(createSrsState(T0), "good", T0);
    expect(isDue(s, T0)).toBe(false);
    const later = new Date(T0.getTime() + 1 * DAY_MS);
    expect(isDue(s, later)).toBe(true);
  });

  it("countDue counts only due cards", () => {
    const due = createSrsState(T0);
    const notDue = schedule(createSrsState(T0), "good", T0);
    expect(countDue([due, notDue, due], T0)).toBe(2);
  });
});

describe("selectDue", () => {
  const mk = (dueAt: string): { srs: SrsState; id: string } => ({
    id: dueAt,
    srs: { ...createSrsState(T0), dueAt },
  });

  it("returns most-overdue cards first and respects the cap", () => {
    const now = new Date(T0.getTime() + 100 * DAY_MS);
    const cards = [
      mk(new Date(T0.getTime() + 10 * DAY_MS).toISOString()),
      mk(new Date(T0.getTime() + 1 * DAY_MS).toISOString()),
      mk(new Date(T0.getTime() + 5 * DAY_MS).toISOString()),
    ];
    const picked = selectDue(cards, 2, now);
    expect(picked).toHaveLength(2);
    expect(picked[0].id).toBe(cards[1].id); // due day 1 (most overdue)
    expect(picked[1].id).toBe(cards[2].id); // due day 5
  });

  it("excludes not-yet-due cards", () => {
    const cards = [mk(new Date(T0.getTime() + 50 * DAY_MS).toISOString())];
    expect(selectDue(cards, 10, T0)).toHaveLength(0);
  });
});
