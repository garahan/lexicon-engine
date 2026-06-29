import { calculateHoursSince, determineStreakStatus } from "./streak";

describe("calculateHoursSince", () => {
  it("calculates hours between two timestamps", () => {
    const baseDate = new Date("2024-01-15T12:00:00Z");
    const now = new Date("2024-01-16T12:00:00Z"); // 24 hours later
    expect(calculateHoursSince(baseDate.toISOString(), now)).toBe(24);
  });

  it("returns 0 when timestamps are identical", () => {
    const date = new Date("2024-01-15T12:00:00Z");
    expect(calculateHoursSince(date.toISOString(), date)).toBe(0);
  });

  it("handles fractional hours", () => {
    const baseDate = new Date("2024-01-15T12:00:00Z");
    const now = new Date("2024-01-15T13:30:00Z"); // 1.5 hours later
    expect(calculateHoursSince(baseDate.toISOString(), now)).toBe(1.5);
  });

  it("handles large time gaps", () => {
    const baseDate = new Date("2024-01-01T00:00:00Z");
    const now = new Date("2024-01-08T00:00:00Z"); // 7 days = 168 hours
    expect(calculateHoursSince(baseDate.toISOString(), now)).toBe(168);
  });
});

describe("determineStreakStatus", () => {
  describe("when active", () => {
    it("stays active when under 24 hours", () => {
      const result = determineStreakStatus(23, "active");
      expect(result.status).toBe("active");
      expect(result.resetStreak).toBe(false);
    });

    it("becomes fractured at exactly 24 hours", () => {
      const result = determineStreakStatus(24, "active");
      expect(result.status).toBe("fractured");
      expect(result.resetStreak).toBe(false);
    });

    it("becomes fractured between 24–47 hours", () => {
      const result = determineStreakStatus(36, "active");
      expect(result.status).toBe("fractured");
      expect(result.resetStreak).toBe(false);
    });

    it("becomes broken at exactly 48 hours", () => {
      const result = determineStreakStatus(48, "active");
      expect(result.status).toBe("broken");
      expect(result.resetStreak).toBe(true);
    });

    it("becomes broken after 48 hours", () => {
      const result = determineStreakStatus(72, "active");
      expect(result.status).toBe("broken");
      expect(result.resetStreak).toBe(true);
    });
  });

  describe("when fractured", () => {
    it("stays fractured under 48 hours", () => {
      const result = determineStreakStatus(30, "fractured");
      expect(result.status).toBe("fractured");
      expect(result.resetStreak).toBe(false);
    });

    it("becomes broken at 48 hours", () => {
      const result = determineStreakStatus(48, "fractured");
      expect(result.status).toBe("broken");
      expect(result.resetStreak).toBe(true);
    });

    it("does not re-fracture (already fractured)", () => {
      const result = determineStreakStatus(25, "fractured");
      expect(result.status).toBe("fractured");
      expect(result.resetStreak).toBe(false);
    });
  });

  describe("when already broken", () => {
    it("stays broken and does not reset again", () => {
      const result = determineStreakStatus(100, "broken");
      expect(result.status).toBe("broken");
      expect(result.resetStreak).toBe(false);
    });

    it("stays broken even at low hours (already broken)", () => {
      const result = determineStreakStatus(5, "broken");
      expect(result.status).toBe("broken");
      expect(result.resetStreak).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("returns no change for 0 hours active", () => {
      const result = determineStreakStatus(0, "active");
      expect(result.status).toBe("active");
      expect(result.resetStreak).toBe(false);
    });

    it("handles the 24-hour boundary precisely", () => {
      expect(determineStreakStatus(23.99, "active").status).toBe("active");
      expect(determineStreakStatus(24.0, "active").status).toBe("fractured");
    });

    it("handles the 48-hour boundary precisely", () => {
      expect(determineStreakStatus(47.99, "active").status).toBe("fractured");
      expect(determineStreakStatus(48.0, "active").status).toBe("broken");
    });
  });
});
