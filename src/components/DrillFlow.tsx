"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { Question } from "@/lib/curriculum";
import { BASE_XP, comboMultiplier, bonusMultiplier } from "@/lib/mastery";
import { makeFlashcard } from "@/lib/progress";
import type { ProgressApi } from "@/lib/useProgress";
import QuizCard from "./QuizCard";
import ComboMeter from "./ComboMeter";
import type { SessionSummary } from "./session";

interface Props {
  title: string;
  kind: SessionSummary["kind"];
  questions: Question[];
  progress: ProgressApi;
  /** Bonus XP granted for a flawless (all-first-try-correct) run. */
  flawlessBonus?: number;
  onComplete: (summary: SessionSummary) => void;
  onExit: () => void;
}

const baseId = (id: string) => id.split("#")[0];

/**
 * A fixed-length drill (Daily Challenge / Quick-win): runs a pre-selected list
 * of questions through the quiz UI, awards XP with the combo multiplier, spawns
 * flashcards on misses, and grants a flawless bonus. No requeueing — drills are
 * short and deterministic by design.
 */
export default function DrillFlow({
  title,
  kind,
  questions,
  progress,
  flawlessBonus = 0,
  onComplete,
  onExit,
}: Props) {
  const [pos, setPos] = useState(0);
  const [run, setRun] = useState(0);
  const correctCount = useRef(0);
  const bestCombo = useRef(0);
  const xpGained = useRef(0);
  const bonus = useMemo(() => bonusMultiplier(Math.random()), []);

  const current = questions[pos];
  const total = questions.length;

  function handleAnswer(correct: boolean): number {
    const newRun = correct ? run + 1 : 0;
    setRun(newRun);
    bestCombo.current = Math.max(bestCombo.current, newRun);

    const xp = correct ? BASE_XP * comboMultiplier(newRun) * bonus : 0;
    xpGained.current += xp;
    if (correct) correctCount.current += 1;

    const bid = baseId(current.id);
    if (!correct) {
      progress.addFlashcards([
        makeFlashcard(`fc-${bid}`, current.flashFront, current.flashBack, current.concept),
      ]);
    }

    progress.applyAnswer({ concept: current.concept, correct, xp, comboStreak: newRun });
    return xp;
  }

  function next() {
    const nextPos = pos + 1;
    if (nextPos >= total) finish();
    else setPos(nextPos);
  }

  function finish() {
    const flawless = correctCount.current === total;
    let bonusActive = bonus > 1;
    if (flawless && flawlessBonus > 0) {
      progress.awardXp(flawlessBonus);
      xpGained.current += flawlessBonus;
      bonusActive = true;
    }
    progress.registerActivity();
    onComplete({
      kind,
      title,
      xpGained: xpGained.current,
      firstTryCorrect: correctCount.current,
      totalFirstTry: total,
      bestCombo: bestCombo.current,
      mastered: flawless,
      itemsCleared: total,
      bonusActive,
    });
  }

  const progressPct = Math.min(100, (pos / total) * 100);

  return (
    <div className="flex flex-1 flex-col px-5 pb-8 pt-4">
      <div className="mb-2 flex items-center gap-3">
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
        <span className="text-xs font-bold text-ink/50">
          {pos + 1}/{total}
        </span>
      </div>

      <p className="mb-3 px-1 text-sm font-bold text-grape-500">{title}</p>

      <div className="mb-5">
        <ComboMeter streak={run} />
      </div>

      <QuizCard key={pos} question={current} onAnswer={handleAnswer} onNext={next} />
    </div>
  );
}
