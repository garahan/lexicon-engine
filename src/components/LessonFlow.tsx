"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import type { Lesson, Question } from "@/lib/curriculum";
import { BASE_XP, comboMultiplier, accuracy, MASTERY_THRESHOLD } from "@/lib/mastery";
import { makeFlashcard } from "@/lib/progress";
import type { ProgressApi } from "@/lib/useProgress";
import { bonusMultiplier } from "@/lib/mastery";
import QuizCard from "./QuizCard";
import ComboMeter from "./ComboMeter";
import type { SessionSummary } from "./session";

type Phase = "learn" | "quiz";

interface Props {
  lesson: Lesson;
  progress: ProgressApi;
  onComplete: (summary: SessionSummary) => void;
  onExit: () => void;
}

const baseId = (id: string) => id.split("#")[0];

export default function LessonFlow({ lesson, progress, onComplete, onExit }: Props) {
  const [phase, setPhase] = useState<Phase>("learn");
  const [queue, setQueue] = useState<Question[]>(lesson.questions);
  const [pos, setPos] = useState(0);
  const [run, setRun] = useState(0);
  const [xpGained, setXpGained] = useState(0);

  // Session-level state kept in refs (not needed for render until the end).
  const firstAttempts = useRef<Record<string, boolean>>({});
  const bestCombo = useRef(0);
  const requeueCount = useRef(0);
  const bonus = useMemo(() => bonusMultiplier(Math.random()), []);

  const current = queue[pos];

  function handleAnswer(correct: boolean): number {
    const newRun = correct ? run + 1 : 0;
    setRun(newRun);
    bestCombo.current = Math.max(bestCombo.current, newRun);

    const xp = correct ? BASE_XP * comboMultiplier(newRun) * bonus : 0;
    setXpGained((x) => x + xp);

    const bid = baseId(current.id);
    if (!(bid in firstAttempts.current)) {
      firstAttempts.current[bid] = correct;
    }

    if (!correct) {
      // Spawn a flashcard and requeue the item until it's answered correctly.
      progress.addFlashcards([
        makeFlashcard(`fc-${bid}`, current.flashFront, current.flashBack, current.concept),
      ]);
      requeueCount.current += 1;
      setQueue((q) => [...q, { ...current, id: `${bid}#r${requeueCount.current}` }]);
    }

    progress.applyAnswer({
      concept: current.concept,
      correct,
      xp,
      comboStreak: newRun,
    });
    return xp;
  }

  function next() {
    const nextPos = pos + 1;
    if (nextPos >= queue.length) {
      finish();
    } else {
      setPos(nextPos);
    }
  }

  function finish() {
    const attempts = firstAttempts.current;
    const ids = Object.keys(attempts);
    const firstTryCorrect = ids.filter((id) => attempts[id]).length;
    const total = lesson.questions.length;
    const mastered = accuracy(firstTryCorrect, total) >= MASTERY_THRESHOLD;

    if (mastered) progress.completeLesson(lesson.id);
    progress.registerActivity();

    onComplete({
      kind: "lesson",
      title: lesson.title,
      xpGained,
      firstTryCorrect,
      totalFirstTry: total,
      bestCombo: bestCombo.current,
      mastered,
      itemsCleared: total,
      bonusActive: bonus > 1,
    });
  }

  if (phase === "learn") {
    return (
      <div className="flex flex-1 flex-col px-5 pb-8 pt-4">
        <button
          onClick={onExit}
          className="mb-3 flex w-fit items-center gap-1 text-sm font-semibold text-ink/50"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-1 flex-col rounded-3xl bg-white p-6 shadow-soft"
        >
          <div className="mb-1 flex items-center gap-2 text-grape-500">
            <BookOpen size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">
              {lesson.level} · Learn
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-ink">{lesson.title}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink/75">{lesson.teach.intro}</p>

          <ul className="mt-4 flex flex-col gap-2">
            {lesson.teach.points.map((p, i) => (
              <li key={i} className="flex gap-2 text-[15px] text-ink/80">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-col gap-2">
            {lesson.teach.examples.map((ex, i) => (
              <div key={i} className="rounded-2xl bg-cream px-4 py-3">
                <p className="font-semibold text-ink">{ex.text}</p>
                {ex.note && <p className="mt-0.5 text-xs text-grape-500">{ex.note}</p>}
              </div>
            ))}
          </div>

          <div className="flex-1" />
          <button
            onClick={() => setPhase("quiz")}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-grape-500 py-4 text-base font-bold text-white shadow-soft transition-all active:scale-[0.98]"
          >
            <Sparkles size={18} /> Start quiz
          </button>
        </motion.div>
      </div>
    );
  }

  // quiz phase
  const answeredFirst = Object.keys(firstAttempts.current).length;
  const progressPct = Math.min(100, (answeredFirst / lesson.questions.length) * 100);

  return (
    <div className="flex flex-1 flex-col px-5 pb-8 pt-4">
      <div className="mb-3 flex items-center gap-3">
        <button onClick={onExit} className="text-ink/50">
          <ArrowLeft size={18} />
        </button>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-grape-400 to-brand-500"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 160, damping: 22 }}
          />
        </div>
      </div>

      <div className="mb-5">
        <ComboMeter streak={run} />
      </div>

      <QuizCard question={current} onAnswer={handleAnswer} onNext={next} />
    </div>
  );
}
