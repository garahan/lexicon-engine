import {
  calculateEloDelta,
  calculateNewElo,
  computeProfileUpdate,
  getCorporateTier,
} from "./elo";

describe("calculateEloDelta", () => {
  it("floors score / 10", () => {
    expect(calculateEloDelta(75)).toBe(7);
    expect(calculateEloDelta(100)).toBe(10);
    expect(calculateEloDelta(1)).toBe(0);
    expect(calculateEloDelta(99)).toBe(9);
  });

  it("returns 0 for score 0", () => {
    expect(calculateEloDelta(0)).toBe(0);
  });

  it("handles scores that are exact multiples of 10", () => {
    expect(calculateEloDelta(10)).toBe(1);
    expect(calculateEloDelta(50)).toBe(5);
  });
});

describe("calculateNewElo", () => {
  it("adds the delta to current Elo", () => {
    expect(calculateNewElo(1200, 75)).toBe(1207);
    expect(calculateNewElo(1500, 100)).toBe(1510);
  });

  it("returns current Elo when score yields 0 delta", () => {
    expect(calculateNewElo(1200, 1)).toBe(1200);
    expect(calculateNewElo(1200, 9)).toBe(1200);
  });
});

describe("computeProfileUpdate", () => {
  it("computes correct update for a typical evaluation", () => {
    const profile = { elo_rating: 1200, current_streak: 3, max_streak: 5 };
    const update = computeProfileUpdate(profile, 80);

    expect(update.elo_rating).toBe(1208);
    expect(update.current_streak).toBe(4);
    expect(update.max_streak).toBe(5); // existing max is higher
    expect(update.streak_status).toBe("active");
    expect(update.last_completed_at).toBeDefined();
  });

  it("updates max_streak when new streak exceeds it", () => {
    const profile = { elo_rating: 1500, current_streak: 10, max_streak: 10 };
    const update = computeProfileUpdate(profile, 50);

    expect(update.current_streak).toBe(11);
    expect(update.max_streak).toBe(11);
  });

  it("preserves max_streak when current streak is below it", () => {
    const profile = { elo_rating: 1800, current_streak: 2, max_streak: 20 };
    const update = computeProfileUpdate(profile, 60);

    expect(update.current_streak).toBe(3);
    expect(update.max_streak).toBe(20);
  });

  it("handles a fresh profile (all zeros)", () => {
    const profile = { elo_rating: 1200, current_streak: 0, max_streak: 0 };
    const update = computeProfileUpdate(profile, 45);

    expect(update.elo_rating).toBe(1204);
    expect(update.current_streak).toBe(1);
    expect(update.max_streak).toBe(1);
  });

  it("sets last_completed_at to a valid ISO string", () => {
    const profile = { elo_rating: 1200, current_streak: 0, max_streak: 0 };
    const update = computeProfileUpdate(profile, 50);
    const parsed = new Date(update.last_completed_at);
    expect(parsed.getTime()).not.toBeNaN();
  });
});

describe("getCorporateTier", () => {
  it("returns Analyst for Elo below 1300", () => {
    expect(getCorporateTier(1200)).toBe("Analyst");
    expect(getCorporateTier(1299)).toBe("Analyst");
    expect(getCorporateTier(0)).toBe("Analyst");
  });

  it("returns Specialist for Elo 1300–1499", () => {
    expect(getCorporateTier(1300)).toBe("Specialist");
    expect(getCorporateTier(1499)).toBe("Specialist");
  });

  it("returns Technical Expert for Elo 1500–1799", () => {
    expect(getCorporateTier(1500)).toBe("Technical Expert");
    expect(getCorporateTier(1799)).toBe("Technical Expert");
  });

  it("returns Strategist / Advisory for Elo 1800+", () => {
    expect(getCorporateTier(1800)).toBe("Strategist / Advisory");
    expect(getCorporateTier(2500)).toBe("Strategist / Advisory");
  });

  it("handles exact boundary values", () => {
    expect(getCorporateTier(1299)).toBe("Analyst");
    expect(getCorporateTier(1300)).toBe("Specialist");
    expect(getCorporateTier(1499)).toBe("Specialist");
    expect(getCorporateTier(1500)).toBe("Technical Expert");
    expect(getCorporateTier(1799)).toBe("Technical Expert");
    expect(getCorporateTier(1800)).toBe("Strategist / Advisory");
  });
});
