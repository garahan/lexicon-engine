import { GRAMMAR_TRACK, checkAnswer, type Question } from "./curriculum";

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

describe("GRAMMAR_TRACK integrity", () => {
  const lessons = GRAMMAR_TRACK.lessons;

  it("has sequential lesson order starting at 1", () => {
    lessons.forEach((l, i) => expect(l.order).toBe(i + 1));
  });

  it("has unique lesson and question ids", () => {
    const lessonIds = lessons.map((l) => l.id);
    expect(new Set(lessonIds).size).toBe(lessonIds.length);
    const qIds = lessons.flatMap((l) => l.questions.map((x) => x.id));
    expect(new Set(qIds).size).toBe(qIds.length);
  });

  it("every MCQ answer is among its choices", () => {
    for (const l of lessons) {
      for (const question of l.questions) {
        if (question.type === "mcq") {
          expect(question.choices).toBeDefined();
          expect(question.choices).toContain(question.answer);
        }
      }
    }
  });

  it("every question has teaching + flashcard content", () => {
    for (const l of lessons) {
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
