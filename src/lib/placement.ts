/**
 * Placement diagnostic + checkpoint logic.
 *
 * A short mixed-level quiz estimates the learner's starting CEFR band so the
 * course meets them at the right level instead of always starting at B1. Pure
 * scoring functions keep it fully unit-testable.
 */
import {
  CEFR_LADDER,
  LEVEL_XP_THRESHOLDS,
  accuracy,
  type CefrLevel,
} from "./mastery";
import { allLessons, type Question } from "./curriculum";

/** A placement question is a normal question tagged with the band it probes. */
export interface PlacementQuestion extends Question {
  band: "B1" | "B2" | "C1";
}

/** Minimum accuracy within a band to count it as "demonstrated". */
export const BAND_PASS = 0.6;

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: "p1",
    band: "B1",
    type: "mcq",
    concept: "tenses",
    prompt: "She ___ to Paris last summer.",
    choices: ["has gone", "went", "goes", "is going"],
    answer: "went",
    explanation: "'last summer' is a finished time → past simple.",
    flashFront: "Finished past time → tense?",
    flashBack: "Past simple.",
  },
  {
    id: "p2",
    band: "B1",
    type: "mcq",
    concept: "articles",
    prompt: "Can you pass me ___ salt, please?",
    choices: ["a", "an", "the", "—"],
    answer: "the",
    explanation: "Specific, shared item on the table → 'the'.",
    flashFront: "Article for a specific shared item?",
    flashBack: "the",
  },
  {
    id: "p3",
    band: "B1",
    type: "mcq",
    concept: "conditionals",
    prompt: "If it rains, we ___ at home.",
    choices: ["stay", "will stay", "stayed", "would stay"],
    answer: "will stay",
    explanation: "First conditional: present in 'if', will in main clause.",
    flashFront: "First conditional main clause?",
    flashBack: "will + base verb.",
  },
  {
    id: "p4",
    band: "B1",
    type: "mcq",
    concept: "verb-patterns",
    prompt: "I'd like ___ a coffee.",
    choices: ["having", "have", "to have", "had"],
    answer: "to have",
    explanation: "'would like' takes the infinitive.",
    flashFront: "'would like' + ?",
    flashBack: "infinitive (to + verb).",
  },
  {
    id: "p5",
    band: "B2",
    type: "mcq",
    concept: "verb-patterns",
    prompt: "He denied ___ the email.",
    choices: ["to send", "sending", "send", "sent"],
    answer: "sending",
    explanation: "'deny' takes a gerund.",
    flashFront: "deny + ?",
    flashBack: "gerund (-ing).",
  },
  {
    id: "p6",
    band: "B2",
    type: "mcq",
    concept: "relative-clauses",
    prompt: "The book ___ I borrowed was fascinating.",
    choices: ["who", "what", "which", "whose"],
    answer: "which",
    explanation: "A thing → 'which' (or 'that').",
    flashFront: "Relative pronoun for a thing?",
    flashBack: "which / that.",
  },
  {
    id: "p7",
    band: "B2",
    type: "mcq",
    concept: "tenses",
    prompt: "By the time we arrived, the film ___.",
    choices: ["already started", "had already started", "has already started", "starts"],
    answer: "had already started",
    explanation: "An earlier past action → past perfect.",
    flashFront: "Action before another past action → tense?",
    flashBack: "Past perfect (had + past participle).",
  },
  {
    id: "p8",
    band: "B2",
    type: "mcq",
    concept: "collocations",
    prompt: "They finally ___ a decision.",
    choices: ["did", "made", "took", "had"],
    answer: "made",
    explanation: "'make a decision'.",
    flashFront: "make or do a decision?",
    flashBack: "make a decision.",
  },
  {
    id: "p9",
    band: "C1",
    type: "mcq",
    concept: "inversion",
    prompt: "Seldom ___ such dedication.",
    choices: ["we see", "do we see", "we do see", "see we"],
    answer: "do we see",
    explanation: "Fronted 'Seldom' triggers inversion: do we see.",
    flashFront: "'Seldom ___ such…' — word order?",
    flashBack: "Invert: 'Seldom do we see…'",
  },
  {
    id: "p10",
    band: "C1",
    type: "mcq",
    concept: "cleft-sentences",
    prompt: "___ impressed me was her honesty.",
    choices: ["That", "It", "What", "Which"],
    answer: "What",
    explanation: "Wh-cleft: 'What … was …'.",
    flashFront: "Wh-cleft opener?",
    flashBack: "What … was …",
  },
  {
    id: "p11",
    band: "C1",
    type: "mcq",
    concept: "precise-verbs",
    prompt: "Choose the most precise verb: 'She ___ at the contract for an hour.'",
    choices: ["looked", "saw", "pored", "watched"],
    answer: "pored",
    explanation: "'pore over' = study/read intently.",
    flashFront: "Verb for 'study a text intently'?",
    flashBack: "pore over.",
  },
  {
    id: "p12",
    band: "C1",
    type: "mcq",
    concept: "inference",
    prompt: "'The plan is, at best, optimistic' implies the writer thinks it is ___.",
    choices: ["realistic", "unlikely to work", "excellent", "boring"],
    answer: "unlikely to work",
    explanation: "'at best, optimistic' is a polite way to doubt it.",
    flashFront: "'at best, optimistic' implies?",
    flashBack: "The writer doubts it will work.",
  },
];

type Band = PlacementQuestion["band"];
const BANDS: Band[] = ["B1", "B2", "C1"];

/** Per-band accuracy from a set of graded placement answers. */
export function bandAccuracy(
  answers: { band: Band; correct: boolean }[],
): Record<Band, number> {
  const out = {} as Record<Band, number>;
  for (const band of BANDS) {
    const inBand = answers.filter((a) => a.band === band);
    const correct = inBand.filter((a) => a.correct).length;
    out[band] = accuracy(correct, inBand.length);
  }
  return out;
}

/**
 * Recommend a starting CEFR band. A learner who demonstrates a band starts at
 * the next band up; failing the first band keeps them at B1. Bands must be
 * passed in order (you can't skip B2 by acing only C1).
 */
export function recommendLevel(
  answers: { band: Band; correct: boolean }[],
): CefrLevel {
  const acc = bandAccuracy(answers);
  if (acc.B1 < BAND_PASS) return "B1";
  if (acc.B2 < BAND_PASS) return "B2";
  if (acc.C1 < BAND_PASS) return "C1";
  return "C2";
}

const ladderIndex = (level: string): number =>
  CEFR_LADDER.indexOf(level as CefrLevel);

/** Lesson ids strictly below a given CEFR band (auto-cleared on placement). */
export function lessonsBelowLevel(level: CefrLevel): string[] {
  const cutoff = ladderIndex(level);
  return allLessons()
    .filter((l) => ladderIndex(l.level) < cutoff)
    .map((l) => l.id);
}

export interface PlacementOutcome {
  level: CefrLevel;
  startXp: number;
  clearedLessonIds: string[];
}

/** Full placement outcome ready to apply to progress state. */
export function buildPlacement(
  answers: { band: Band; correct: boolean }[],
): PlacementOutcome {
  const level = recommendLevel(answers);
  return {
    level,
    startXp: LEVEL_XP_THRESHOLDS[level],
    clearedLessonIds: lessonsBelowLevel(level),
  };
}
