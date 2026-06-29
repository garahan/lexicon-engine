import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import LessonFlow from "./LessonFlow";
import type { Lesson } from "@/lib/curriculum";
import type { ProgressApi } from "@/lib/useProgress";
import { createInitialProgress } from "@/lib/progress";

const lesson: Lesson = {
  id: "test-lesson",
  level: "B1",
  order: 1,
  title: "Test Lesson",
  concept: "test",
  blurb: "A tiny lesson",
  teach: { intro: "intro", points: ["p1"], examples: [{ text: "ex1" }] },
  questions: [
    {
      id: "q1",
      type: "mcq",
      concept: "test",
      prompt: "Pick A",
      choices: ["A", "B"],
      answer: "A",
      explanation: "because A",
      flashFront: "f1",
      flashBack: "b1",
    },
    {
      id: "q2",
      type: "mcq",
      concept: "test",
      prompt: "Pick C",
      choices: ["C", "D"],
      answer: "C",
      explanation: "because C",
      flashFront: "f2",
      flashBack: "b2",
    },
  ],
};

function mockProgress(): ProgressApi {
  return {
    state: createInitialProgress(),
    ready: true,
    applyAnswer: jest.fn(),
    addFlashcards: jest.fn(),
    completeLesson: jest.fn(),
    gradeCard: jest.fn(),
    registerActivity: jest.fn(),
    applyPlacement: jest.fn(),
    passCheckpoint: jest.fn(),
    awardXp: jest.fn(),
    hardReset: jest.fn(),
  };
}

describe("LessonFlow quiz state", () => {
  beforeEach(() => {
    // Deterministic adaptive order ([q1, q2]) and no surprise bonus multiplier.
    jest.spyOn(Math, "random").mockReturnValue(0);
  });
  afterEach(() => {
    (Math.random as jest.Mock).mockRestore();
  });

  it("does not carry the previous question's answered state into the next question", () => {
    render(
      <LessonFlow lesson={lesson} progress={mockProgress()} onComplete={jest.fn()} onExit={jest.fn()} />,
    );

    // Enter quiz phase.
    fireEvent.click(screen.getByText("Start quiz"));

    // Answer the first question correctly.
    fireEvent.click(screen.getByText("A"));
    expect(screen.getByText("Correct!")).toBeInTheDocument();

    // Advance to the next question.
    fireEvent.click(screen.getByText("Continue"));

    // The second question must render UNanswered: no feedback banner, and its
    // answer buttons must be enabled. With the state-reset bug, "Correct!"
    // would persist and the answers would be disabled.
    expect(screen.getByText("Pick C")).toBeInTheDocument();
    expect(screen.queryByText("Correct!")).not.toBeInTheDocument();
    expect(screen.getByText("C")).not.toBeDisabled();
  });
});
