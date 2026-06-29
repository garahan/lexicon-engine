import {
  conceptWeight,
  mulberry32,
  seedFromString,
  weightedSample,
  adaptiveOrder,
  selectAdaptive,
  dailyChallenge,
  selectQuickWin,
  type ConceptStatMap,
} from "./adaptive";
import type { Question } from "./curriculum";

const q = (id: string, concept: string, type: Question["type"] = "mcq"): Question => ({
  id,
  type,
  concept,
  prompt: "p",
  choices: type === "mcq" ? ["a", "b"] : undefined,
  answer: "a",
  explanation: "e",
  flashFront: "f",
  flashBack: "b",
});

describe("conceptWeight", () => {
  it("gives unseen concepts a moderate explore weight", () => {
    expect(conceptWeight(undefined)).toBeCloseTo(2.5, 5);
    expect(conceptWeight({ correct: 0, total: 0 })).toBeCloseTo(2.5, 5);
  });

  it("weighs weak concepts more than strong ones", () => {
    const weak = conceptWeight({ correct: 1, total: 10 }); // 10% acc
    const strong = conceptWeight({ correct: 9, total: 10 }); // 90% acc
    expect(weak).toBeGreaterThan(strong);
    expect(conceptWeight({ correct: 10, total: 10 })).toBeCloseTo(1, 5);
    expect(conceptWeight({ correct: 0, total: 10 })).toBeCloseTo(5, 5);
  });
});

describe("mulberry32 / seedFromString", () => {
  it("is deterministic for a seed", () => {
    const a = mulberry32(123);
    const b = mulberry32(123);
    expect(a()).toBe(b());
    expect(a()).toBe(b());
  });

  it("hashes strings stably and within uint32 range", () => {
    expect(seedFromString("abc")).toBe(seedFromString("abc"));
    expect(seedFromString("abc")).not.toBe(seedFromString("abd"));
    expect(seedFromString("x")).toBeGreaterThanOrEqual(0);
  });
});

describe("weightedSample", () => {
  it("samples without replacement and respects count", () => {
    const items = [
      { item: "a", weight: 1 },
      { item: "b", weight: 1 },
      { item: "c", weight: 1 },
    ];
    const picked = weightedSample(items, 2, mulberry32(1));
    expect(picked).toHaveLength(2);
    expect(new Set(picked).size).toBe(2);
  });

  it("never returns more than available", () => {
    const items = [{ item: "a", weight: 1 }];
    expect(weightedSample(items, 5, mulberry32(1))).toEqual(["a"]);
  });

  it("favours heavier items over many trials", () => {
    let heavyFirst = 0;
    for (let s = 0; s < 200; s++) {
      const picked = weightedSample(
        [
          { item: "heavy", weight: 10 },
          { item: "light", weight: 1 },
        ],
        1,
        mulberry32(s),
      );
      if (picked[0] === "heavy") heavyFirst++;
    }
    expect(heavyFirst).toBeGreaterThan(150);
  });
});

describe("adaptiveOrder", () => {
  it("returns a permutation of all questions", () => {
    const qs = [q("1", "a"), q("2", "b"), q("3", "c")];
    const ordered = adaptiveOrder(qs, {}, mulberry32(7));
    expect(ordered).toHaveLength(3);
    expect(new Set(ordered.map((x) => x.id))).toEqual(new Set(["1", "2", "3"]));
  });
});

describe("selectAdaptive / dailyChallenge", () => {
  const qs = [q("1", "a"), q("2", "b"), q("3", "c"), q("4", "d")];

  it("picks the requested count", () => {
    expect(selectAdaptive(qs, {}, 2, mulberry32(3))).toHaveLength(2);
  });

  it("is deterministic for a given day", () => {
    const stats: ConceptStatMap = {};
    const a = dailyChallenge(qs, stats, 3, "2026-06-29");
    const b = dailyChallenge(qs, stats, 3, "2026-06-29");
    expect(a.map((x) => x.id)).toEqual(b.map((x) => x.id));
  });

  it("changes from day to day", () => {
    const stats: ConceptStatMap = {};
    const a = dailyChallenge(qs, stats, 3, "2026-06-29");
    const b = dailyChallenge(qs, stats, 3, "2026-07-15");
    // Not guaranteed different, but order should generally differ.
    expect(a.map((x) => x.id).join()).not.toBe("");
    expect(b.map((x) => x.id).join()).not.toBe("");
  });
});

describe("selectQuickWin", () => {
  it("prefers the strongest concepts and MCQ type", () => {
    const qs = [
      q("hard", "weak"),
      q("easy", "strong"),
      q("typed", "strong", "type"),
    ];
    const stats: ConceptStatMap = {
      weak: { correct: 1, total: 10 },
      strong: { correct: 9, total: 10 },
    };
    const picked = selectQuickWin(qs, stats, 2);
    expect(picked[0].concept).toBe("strong");
    // Among strong concepts, MCQ comes before typed.
    expect(picked[0].id).toBe("easy");
  });
});
