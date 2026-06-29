/**
 * Shared curriculum types and answer-checking helpers.
 *
 * Pre-authored, level-banded content so the core learning loop is fast,
 * deterministic and doesn't depend on live AI generation / quota. Each lesson
 * teaches a concept then tests it with interleaved question types. Every
 * question can spawn a spaced-repetition flashcard.
 */
import type { CefrLevel } from "../mastery";

export type QuestionType = "mcq" | "cloze" | "type" | "writing";

export interface Question {
  id: string;
  type: QuestionType;
  /** Concept tag used for weak-point grouping. */
  concept: string;
  /** Sentence or instruction. Blanks are written as "___". */
  prompt: string;
  /** Options for multiple-choice questions. */
  choices?: string[];
  /** Canonical correct answer. */
  answer: string;
  /** Extra accepted answers for typed/cloze (compared case-insensitively). */
  accept?: string[];
  /** One-line "why" shown after answering. */
  explanation: string;
  /** Flashcard front/back generated for spaced repetition. */
  flashFront: string;
  flashBack: string;
  /**
   * Writing-only: a model answer revealed after the learner composes their own,
   * which they then self-rate against. (Phase: no live AI grading.)
   */
  model?: string;
  /** Writing-only: a short checklist of features a strong answer should show. */
  checklist?: string[];
}

export interface LessonTeach {
  intro: string;
  points: string[];
  examples: { text: string; note?: string }[];
}

export interface Lesson {
  id: string;
  level: CefrLevel;
  order: number;
  title: string;
  concept: string;
  /** Short subtitle shown on the lesson card. */
  blurb: string;
  teach: LessonTeach;
  questions: Question[];
  /** Reading-only: a passage shown during the Learn phase. */
  passage?: string;
}

export type TrackId = "grammar" | "vocabulary" | "reading" | "writing";

export interface Track {
  id: TrackId;
  name: string;
  /** Short human description of what the track builds. */
  tagline: string;
  /** Lucide icon name used on the track card. */
  icon: string;
  lessons: Lesson[];
}

/** Normalise a free-text answer for forgiving comparison. */
export function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:]+$/g, "")
    .replace(/\s+/g, " ");
}

/** Whether a user's answer matches a question's canonical/accepted answers. */
export function checkAnswer(question: Question, userAnswer: string): boolean {
  const candidate = normalize(userAnswer);
  if (candidate.length === 0) return false;
  const accepted = [question.answer, ...(question.accept ?? [])].map(normalize);
  return accepted.includes(candidate);
}
