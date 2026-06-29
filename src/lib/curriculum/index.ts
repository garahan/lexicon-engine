/**
 * Multi-track curriculum entry point.
 *
 * Pre-authored, level-banded content across four tracks (Grammar, Vocabulary,
 * Reading, Writing). Re-exports the shared types/helpers and provides lookup
 * utilities used across the app (lesson/track resolution, concept labels).
 */
export * from "./types";
import type { Lesson, Track, TrackId } from "./types";
import { GRAMMAR_TRACK } from "./grammar";
import { VOCABULARY_TRACK } from "./vocabulary";
import { READING_TRACK } from "./reading";
import { WRITING_TRACK } from "./writing";

export { GRAMMAR_TRACK, VOCABULARY_TRACK, READING_TRACK, WRITING_TRACK };

/** All learning tracks in display order. */
export const ALL_TRACKS: Track[] = [
  GRAMMAR_TRACK,
  VOCABULARY_TRACK,
  READING_TRACK,
  WRITING_TRACK,
];

export function trackById(id: TrackId): Track | undefined {
  return ALL_TRACKS.find((t) => t.id === id);
}

/** Every lesson across every track. */
export function allLessons(): Lesson[] {
  return ALL_TRACKS.flatMap((t) => t.lessons);
}

export function lessonById(id: string): Lesson | undefined {
  return allLessons().find((l) => l.id === id);
}

export function trackOfLesson(lessonId: string): Track | undefined {
  return ALL_TRACKS.find((t) => t.lessons.some((l) => l.id === lessonId));
}

/**
 * Human-readable labels for concept tags (used in weak-spot lists and stats).
 * Falls back to a title-cased version of the tag for anything unmapped.
 */
const CONCEPT_LABEL_MAP: Record<string, string> = {
  tenses: "Tenses",
  conditionals: "Conditionals",
  articles: "Articles",
  "verb-patterns": "Verb Patterns",
  "relative-clauses": "Relative Clauses",
  inversion: "Inversion",
  "cleft-sentences": "Cleft & Nominalisation",
  adjectives: "Strong Adjectives",
  collocations: "Collocations",
  "precise-verbs": "Precise Verbs",
  "main-idea": "Main Idea",
  inference: "Inference & Tone",
  "vocabulary-in-context": "Vocab in Context",
  linking: "Linking Ideas",
  "opinion-writing": "Opinion Writing",
};

export function conceptLabel(concept: string): string {
  return (
    CONCEPT_LABEL_MAP[concept] ??
    concept
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}
