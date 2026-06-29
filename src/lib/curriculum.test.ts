import {
  GRAMMAR_TRACK,
  ALL_TRACKS,
  allLessons,
  lessonById,
  trackOfLesson,
  conceptLabel,
  checkAnswer,
  type Question,
} from "./curriculum";

const q = (over: Partial<Question>): Question => ({
  id: "x",
  type: "type",
  concept: "c",
  prompt: "p",
  answer: "saw",
  explanation: "e",
  flashFront: "f",
  flashBack: "b",
  ...over,
});

describe("checkAnswer", () => {
  it("matches the canonical answer case-insensitively and trimmed", () => {
    expect(checkAnswer(q({}), "  Saw ")).toBe(true);
    expect(checkAnswer(q({}), "SAW.")).toBe(true);
  });

  it("rejects wrong and empty answers", () => {
    expect(checkAnswer(q({}), "seen")).toBe(false);
    expect(checkAnswer(q({}), "   ")).toBe(false);
  });

  it("accepts alternates in the accept list", () => {
    const question = q({ answer: "has just finished", accept: ["has finished"] });
    expect(checkAnswer(question, "has finished")).toBe(true);
    expect(checkAnswer(question, "has just finished")).toBe(true);
  });

  it("collapses internal whitespace", () => {
    const question = q({ answer: "to go" });
    expect(checkAnswer(question, "to    go")).toBe(true);
  });
});

describe("curriculum integrity (all tracks)", () => {
  it("has four uniquely-ided tracks", () => {
    const ids = ALL_TRACKS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(["grammar", "vocabulary", "reading", "writing"]);
  });

  it("each track has sequential lesson order starting at 1", () => {
    for (const track of ALL_TRACKS) {
      track.lessons.forEach((l, i) => expect(l.order).toBe(i + 1));
    }
  });

  it("has globally unique lesson and question ids", () => {
    const lessonIds = allLessons().map((l) => l.id);
    expect(new Set(lessonIds).size).toBe(lessonIds.length);
    const qIds = allLessons().flatMap((l) => l.questions.map((x) => x.id));
    expect(new Set(qIds).size).toBe(qIds.length);
  });

  it("every MCQ answer is among its choices", () => {
    for (const l of allLessons()) {
      for (const question of l.questions) {
        if (question.type === "mcq") {
          expect(question.choices).toBeDefined();
          expect(question.choices).toContain(question.answer);
        }
      }
    }
  });

  it("every writing question carries a model answer and checklist", () => {
    for (const l of allLessons()) {
      for (const question of l.questions) {
        if (question.type === "writing") {
          expect((question.model ?? "").length).toBeGreaterThan(0);
          expect((question.checklist ?? []).length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("every question has teaching + flashcard content", () => {
    for (const l of allLessons()) {
      expect(l.teach.points.length).toBeGreaterThan(0);
      expect(l.teach.examples.length).toBeGreaterThan(0);
      for (const question of l.questions) {
        expect(question.explanation.length).toBeGreaterThan(0);
        expect(question.flashFront.length).toBeGreaterThan(0);
        expect(question.flashBack.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("lookup helpers", () => {
  it("resolves lessons and their owning track", () => {
    const first = GRAMMAR_TRACK.lessons[0];
    expect(lessonById(first.id)).toBe(first);
    expect(trackOfLesson(first.id)?.id).toBe("grammar");
    expect(lessonById("does-not-exist")).toBeUndefined();
  });

  it("labels known concepts and title-cases unknown ones", () => {
    expect(conceptLabel("tenses")).toBe("Tenses");
    expect(conceptLabel("some-new-thing")).toBe("Some New Thing");
  });
});
