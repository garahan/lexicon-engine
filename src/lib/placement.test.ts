import {
  PLACEMENT_QUESTIONS,
  bandAccuracy,
  recommendLevel,
  lessonsBelowLevel,
  buildPlacement,
} from "./placement";
import { LEVEL_XP_THRESHOLDS } from "./mastery";

type Band = "B1" | "B2" | "C1";
const ans = (band: Band, correct: boolean) => ({ band, correct });

describe("PLACEMENT_QUESTIONS integrity", () => {
  it("covers all three bands and has unique ids", () => {
    const ids = PLACEMENT_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    const bands = new Set(PLACEMENT_QUESTIONS.map((q) => q.band));
    expect(bands).toEqual(new Set(["B1", "B2", "C1"]));
  });

  it("every MCQ answer is among its choices", () => {
    for (const q of PLACEMENT_QUESTIONS) {
      if (q.type === "mcq") expect(q.choices).toContain(q.answer);
    }
  });
});

describe("bandAccuracy", () => {
  it("computes accuracy per band", () => {
    const acc = bandAccuracy([
      ans("B1", true),
      ans("B1", false),
      ans("B2", true),
      ans("C1", false),
    ]);
    expect(acc.B1).toBeCloseTo(0.5, 5);
    expect(acc.B2).toBe(1);
    expect(acc.C1).toBe(0);
  });
});

describe("recommendLevel", () => {
  it("keeps a weak learner at B1", () => {
    const answers = [ans("B1", false), ans("B1", false), ans("B2", true)];
    expect(recommendLevel(answers)).toBe("B1");
  });

  it("advances to B2 when B1 is demonstrated but B2 is not", () => {
    const answers = [
      ans("B1", true),
      ans("B1", true),
      ans("B2", false),
      ans("B2", false),
    ];
    expect(recommendLevel(answers)).toBe("B2");
  });

  it("requires bands to be passed in order (no skipping)", () => {
    const answers = [
      ans("B1", false),
      ans("B1", false),
      ans("C1", true),
      ans("C1", true),
    ];
    expect(recommendLevel(answers)).toBe("B1");
  });

  it("reaches C2 when every band is aced", () => {
    const answers = [
      ans("B1", true),
      ans("B2", true),
      ans("C1", true),
    ];
    expect(recommendLevel(answers)).toBe("C2");
  });
});

describe("lessonsBelowLevel / buildPlacement", () => {
  it("clears no lessons at B1", () => {
    expect(lessonsBelowLevel("B1")).toEqual([]);
  });

  it("clears B1 lessons when placed at B2", () => {
    const cleared = lessonsBelowLevel("B2");
    expect(cleared).toContain("g1");
    expect(cleared).not.toContain("g4"); // g4 is B2
  });

  it("builds a full outcome with seeded XP", () => {
    const out = buildPlacement([
      ans("B1", true),
      ans("B1", true),
      ans("B2", false),
      ans("B2", false),
    ]);
    expect(out.level).toBe("B2");
    expect(out.startXp).toBe(LEVEL_XP_THRESHOLDS.B2);
    expect(out.clearedLessonIds).toContain("g1");
  });
});
