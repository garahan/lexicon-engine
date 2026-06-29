import {
  comboMultiplier,
  xpForAnswer,
  accuracy,
  isLessonMastered,
  levelForXp,
  levelProgress,
  rankWeakConcepts,
  bonusMultiplier,
  BASE_XP,
  LEVEL_XP_THRESHOLDS,
} from "./mastery";

describe("comboMultiplier", () => {
  it("is 1 with no streak", () => {
    expect(comboMultiplier(0)).toBe(1);
    expect(comboMultiplier(-2)).toBe(1);
  });

  it("steps up every 3 consecutive correct", () => {
    expect(comboMultiplier(2)).toBe(1);
    expect(comboMultiplier(3)).toBe(2);
    expect(comboMultiplier(6)).toBe(3);
    expect(comboMultiplier(9)).toBe(4);
  });

  it("caps at 4", () => {
    expect(comboMultiplier(100)).toBe(4);
  });
});

describe("xpForAnswer", () => {
  it("awards nothing for a wrong answer", () => {
    expect(xpForAnswer(false, 10)).toBe(0);
  });

  it("awards base XP at no combo", () => {
    expect(xpForAnswer(true, 0)).toBe(BASE_XP);
  });

  it("scales with the combo multiplier", () => {
    expect(xpForAnswer(true, 3)).toBe(BASE_XP * 2);
    expect(xpForAnswer(true, 9)).toBe(BASE_XP * 4);
  });
});

describe("accuracy / isLessonMastered", () => {
  it("returns 0 accuracy for no attempts", () => {
    expect(accuracy(0, 0)).toBe(0);
    expect(isLessonMastered(0, 0)).toBe(false);
  });

  it("passes at or above the 85% threshold", () => {
    expect(isLessonMastered(17, 20)).toBe(true); // 0.85 exactly
    expect(isLessonMastered(18, 20)).toBe(true);
  });

  it("fails below the threshold", () => {
    expect(isLessonMastered(16, 20)).toBe(false); // 0.8
  });
});

describe("levelForXp", () => {
  it("starts at B1", () => {
    expect(levelForXp(0)).toBe("B1");
    expect(levelForXp(299)).toBe("B1");
  });

  it("climbs the ladder at each threshold", () => {
    expect(levelForXp(LEVEL_XP_THRESHOLDS["B1+"])).toBe("B1+");
    expect(levelForXp(LEVEL_XP_THRESHOLDS["B2"])).toBe("B2");
    expect(levelForXp(LEVEL_XP_THRESHOLDS["C2"])).toBe("C2");
    expect(levelForXp(999999)).toBe("C2");
  });
});

describe("levelProgress", () => {
  it("reports fraction toward the next level", () => {
    const p = levelProgress(150); // halfway from B1(0) to B1+(300)
    expect(p.level).toBe("B1");
    expect(p.next).toBe("B1+");
    expect(p.fraction).toBeCloseTo(0.5, 5);
  });

  it("is full and has no next at the top band", () => {
    const p = levelProgress(LEVEL_XP_THRESHOLDS["C2"] + 500);
    expect(p.level).toBe("C2");
    expect(p.next).toBeNull();
    expect(p.fraction).toBe(1);
    expect(p.levelSpan).toBeNull();
  });
});

describe("rankWeakConcepts", () => {
  it("orders weakest (highest error rate) first and drops perfect/empty", () => {
    const ranked = rankWeakConcepts([
      { concept: "tenses", correct: 1, total: 4 }, // 75% error
      { concept: "articles", correct: 3, total: 4 }, // 25% error
      { concept: "modals", correct: 5, total: 5 }, // perfect → dropped
      { concept: "passive", correct: 0, total: 0 }, // empty → dropped
    ]);
    expect(ranked.map((r) => r.concept)).toEqual(["tenses", "articles"]);
    expect(ranked[0].errorRate).toBeCloseTo(0.75, 5);
  });
});

describe("bonusMultiplier", () => {
  it("doubles XP on a low roll, otherwise 1x", () => {
    expect(bonusMultiplier(0.1)).toBe(2);
    expect(bonusMultiplier(0.5)).toBe(1);
    expect(bonusMultiplier(0.2)).toBe(1);
  });
});
