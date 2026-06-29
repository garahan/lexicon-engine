"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Check, Play, RotateCcw, Flame, TrendingUp } from "lucide-react";
import { GRAMMAR_TRACK, type Lesson } from "@/lib/curriculum";
import { useProgress } from "@/lib/useProgress";
import {
  dueCards,
  isLessonUnlocked,
  nextLesson as pickNextLesson,
} from "@/lib/progress";
import { levelForXp, rankWeakConcepts } from "@/lib/mastery";
import StatusBar from "@/components/StatusBar";
import LessonFlow from "@/components/LessonFlow";
import ReviewView from "@/components/ReviewView";
import Celebration from "@/components/Celebration";
import type { SessionSummary } from "@/components/session";

type View = "home" | "lesson" | "review" | "celebrate";

const CONCEPT_LABELS: Record<string, string> = {
  tenses: "Tenses",
  conditionals: "Conditionals",
  articles: "Articles",
  "verb-patterns": "Gerunds & Infinitives",
  "relative-clauses": "Relative clauses",
};

export default function Home() {
  const progress = useProgress();
  const { state, ready } = progress;

  const [view, setView] = useState<View>("home");
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [celebrateMeta, setCelebrateMeta] = useState({ leveledUp: false, newLevel: "B1" });
  const preLevel = useRef("B1");

  const due = useMemo(() => dueCards(state.flashcards), [state.flashcards]);
  const dueCount = due.length;
  const next = pickNextLesson(state, GRAMMAR_TRACK);

  const weak = useMemo(() => {
    const stats = Object.entries(state.conceptStats).map(([concept, s]) => ({
      concept,
      correct: s.correct,
      total: s.total,
    }));
    return rankWeakConcepts(stats).slice(0, 3);
  }, [state.conceptStats]);

  function startLesson(lesson: Lesson) {
    preLevel.current = levelForXp(state.xp);
    setActiveLesson(lesson);
    setView("lesson");
  }

  function startReview() {
    preLevel.current = levelForXp(state.xp);
    setView("review");
  }

  function handleComplete(s: SessionSummary) {
    const newLevel = levelForXp(state.xp);
    setCelebrateMeta({ leveledUp: newLevel !== preLevel.current, newLevel });
    setSummary(s);
    setView("celebrate");
  }

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-grape-500 border-t-transparent" />
      </div>
    );
  }

  if (view === "lesson" && activeLesson) {
    return (
      <LessonFlow
        lesson={activeLesson}
        progress={progress}
        onComplete={handleComplete}
        onExit={() => setView("home")}
      />
    );
  }

  if (view === "review") {
    return (
      <ReviewView
        progress={progress}
        onComplete={handleComplete}
        onExit={() => setView("home")}
      />
    );
  }

  if (view === "celebrate" && summary) {
    return (
      <Celebration
        summary={summary}
        dueTomorrow={dueCards(state.flashcards).length}
        leveledUp={celebrateMeta.leveledUp}
        newLevel={celebrateMeta.newLevel}
        onDone={() => setView("home")}
      />
    );
  }

  // ---- Home ----
  return (
    <>
      <StatusBar xp={state.xp} streakDays={state.streakDays} dueCount={dueCount} />

      <div className="flex flex-col gap-5 px-5 pb-10 pt-5">
        {/* Hero: continue / review */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-br from-grape-500 to-brand-500 p-6 text-white shadow-soft"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-white/70">
            Grammar track
          </p>
          {next ? (
            <>
              <h1 className="mt-1 text-2xl font-extrabold leading-tight">{next.title}</h1>
              <p className="mt-1 text-sm text-white/80">{next.blurb}</p>
              <button
                onClick={() => startLesson(next)}
                className="mt-4 flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-base font-bold text-grape-600 transition-all active:scale-[0.97]"
              >
                <Play size={18} fill="#6a3de8" /> Continue
              </button>
            </>
          ) : (
            <>
              <h1 className="mt-1 text-2xl font-extrabold leading-tight">
                Track complete! 🎉
              </h1>
              <p className="mt-1 text-sm text-white/80">
                You&apos;ve mastered every lesson. Keep your knowledge sharp with daily reviews.
              </p>
            </>
          )}
        </motion.div>

        {/* Daily review */}
        <button
          onClick={startReview}
          className="flex items-center gap-4 rounded-3xl bg-white p-5 text-left shadow-soft transition-all active:scale-[0.98]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-grape-400/15 text-grape-500">
            <RotateCcw size={24} />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-ink">Daily Review</p>
            <p className="text-sm text-ink/60">
              {dueCount > 0
                ? `${dueCount} card${dueCount > 1 ? "s" : ""} ready to strengthen`
                : "All caught up — nothing due"}
            </p>
          </div>
          {dueCount > 0 && (
            <span className="rounded-full bg-grape-500 px-3 py-1 text-sm font-bold text-white">
              {dueCount}
            </span>
          )}
        </button>

        {/* Weak points */}
        {weak.length > 0 && (
          <div className="rounded-3xl bg-white p-5 shadow-soft">
            <div className="mb-3 flex items-center gap-2 text-ink">
              <TrendingUp size={18} className="text-brand-500" />
              <p className="text-base font-bold">Your weak spots</p>
            </div>
            <div className="flex flex-col gap-2.5">
              {weak.map((w) => (
                <div key={w.concept}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-semibold text-ink/80">
                      {CONCEPT_LABELS[w.concept] ?? w.concept}
                    </span>
                    <span className="font-bold text-ink/50">
                      {Math.round(w.accuracy * 100)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-black/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-400 to-mint-500"
                      style={{ width: `${Math.round(w.accuracy * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lesson list */}
        <div>
          <p className="mb-2 px-1 text-sm font-bold text-ink/50">All lessons</p>
          <div className="flex flex-col gap-2.5">
            {GRAMMAR_TRACK.lessons.map((lesson) => {
              const unlocked = isLessonUnlocked(state, lesson, GRAMMAR_TRACK);
              const done = state.completedLessons.includes(lesson.id);
              return (
                <button
                  key={lesson.id}
                  disabled={!unlocked}
                  onClick={() => startLesson(lesson)}
                  className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                    unlocked
                      ? "border-transparent bg-white shadow-soft active:scale-[0.98]"
                      : "border-transparent bg-black/[0.03] opacity-60"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                      done
                        ? "bg-mint-500 text-white"
                        : unlocked
                          ? "bg-grape-400/15 text-grape-500"
                          : "bg-black/5 text-ink/40"
                    }`}
                  >
                    {done ? <Check size={20} /> : unlocked ? lesson.order : <Lock size={16} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-bold text-ink">{lesson.title}</p>
                    <p className="text-xs text-ink/55">
                      {lesson.level} · {lesson.blurb}
                    </p>
                  </div>
                  {done && (
                    <span className="flex items-center gap-1 text-xs font-bold text-mint-600">
                      <Flame size={13} /> Done
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-2 text-center text-[11px] text-ink/40">
          Phase 1 · Grammar track · progress saved on this device
        </p>
      </div>
    </>
  );
}
