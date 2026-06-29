"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type ProgressState,
  type Flashcard,
  type ConceptStat,
  createInitialProgress,
  recordConcept,
  upsertFlashcard,
  gradeFlashcard,
  markLessonComplete,
  advanceStreak,
  dayKey,
  PROGRESS_VERSION,
} from "./progress";
import type { ReviewGrade } from "./srs";

const STORAGE_KEY = "ascend.progress.v1";

function load(): ProgressState {
  if (typeof window === "undefined") return createInitialProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgress();
    const parsed = JSON.parse(raw) as ProgressState;
    if (parsed.version !== PROGRESS_VERSION) return createInitialProgress();
    return { ...createInitialProgress(), ...parsed };
  } catch {
    return createInitialProgress();
  }
}

export interface AnswerInput {
  concept: string;
  correct: boolean;
  xp: number;
  comboStreak: number;
}

export interface ProgressApi {
  state: ProgressState;
  ready: boolean;
  applyAnswer: (input: AnswerInput) => void;
  addFlashcards: (cards: Flashcard[]) => void;
  completeLesson: (lessonId: string) => void;
  gradeCard: (id: string, grade: ReviewGrade) => void;
  registerActivity: () => void;
  hardReset: () => void;
}

export function useProgress(): ProgressApi {
  const [state, setState] = useState<ProgressState>(createInitialProgress);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full / unavailable — ignore */
    }
  }, [state, ready]);

  const applyAnswer = useCallback((input: AnswerInput) => {
    setState((s) => {
      const conceptStats: Record<string, ConceptStat> = recordConcept(
        s.conceptStats,
        input.concept,
        input.correct,
      );
      return {
        ...s,
        xp: s.xp + input.xp,
        totalAnswers: s.totalAnswers + 1,
        bestCombo: Math.max(s.bestCombo, input.comboStreak),
        conceptStats,
      };
    });
  }, []);

  const addFlashcards = useCallback((cards: Flashcard[]) => {
    setState((s) => {
      let next = s.flashcards;
      for (const c of cards) next = upsertFlashcard(next, c);
      return next === s.flashcards ? s : { ...s, flashcards: next };
    });
  }, []);

  const completeLesson = useCallback((lessonId: string) => {
    setState((s) => ({ ...s, completedLessons: markLessonComplete(s, lessonId) }));
  }, []);

  const gradeCard = useCallback((id: string, grade: ReviewGrade) => {
    setState((s) => ({ ...s, flashcards: gradeFlashcard(s.flashcards, id, grade) }));
  }, []);

  const registerActivity = useCallback(() => {
    setState((s) => {
      const next = advanceStreak(
        { streakDays: s.streakDays, lastActiveDay: s.lastActiveDay, graceUsed: s.graceUsed },
        dayKey(),
      );
      if (
        next.streakDays === s.streakDays &&
        next.lastActiveDay === s.lastActiveDay &&
        next.graceUsed === s.graceUsed
      ) {
        return s;
      }
      return { ...s, ...next };
    });
  }, []);

  const hardReset = useCallback(() => {
    setState(createInitialProgress());
  }, []);

  return {
    state,
    ready,
    applyAnswer,
    addFlashcards,
    completeLesson,
    gradeCard,
    registerActivity,
    hardReset,
  };
}
