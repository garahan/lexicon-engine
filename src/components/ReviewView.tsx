"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Eye } from "lucide-react";
import type { Flashcard } from "@/lib/progress";
import type { ReviewGrade } from "@/lib/srs";
import type { ProgressApi } from "@/lib/useProgress";
import { dueCards } from "@/lib/progress";
import { playCorrect, playWrong } from "@/lib/feedback";
import type { SessionSummary } from "./session";

interface Props {
  progress: ProgressApi;
  onComplete: (summary: SessionSummary) => void;
  onExit: () => void;
}

const GRADES: { grade: ReviewGrade; label: string; xp: number; cls: string }[] = [
  { grade: "again", label: "Again", xp: 0, cls: "bg-brand-500" },
  { grade: "hard", label: "Hard", xp: 4, cls: "bg-gold" },
  { grade: "good", label: "Good", xp: 8, cls: "bg-grape-500" },
  { grade: "easy", label: "Easy", xp: 12, cls: "bg-mint-500" },
];

export default function ReviewView({ progress, onComplete, onExit }: Props) {
  // Freeze the due set for this session so grading doesn't reshuffle mid-review.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialDue = useMemo<Flashcard[]>(() => dueCards(progress.state.flashcards), []);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const xpGained = useRef(0);
  const correctCount = useRef(0);

  const card = initialDue[idx];
  const total = initialDue.length;

  function grade(g: (typeof GRADES)[number]) {
    progress.gradeCard(card.id, g.grade);
    xpGained.current += g.xp;
    if (g.grade !== "again") {
      correctCount.current += 1;
      progress.applyAnswer({ concept: card.concept, correct: true, xp: g.xp, comboStreak: 0 });
      playCorrect();
    } else {
      progress.applyAnswer({ concept: card.concept, correct: false, xp: 0, comboStreak: 0 });
      playWrong();
    }

    const nextIdx = idx + 1;
    if (nextIdx >= total) {
      progress.registerActivity();
      onComplete({
        kind: "review",
        title: "Daily Review",
        xpGained: xpGained.current,
        firstTryCorrect: correctCount.current,
        totalFirstTry: total,
        bestCombo: 1,
        mastered: true,
        itemsCleared: total,
        bonusActive: false,
      });
    } else {
      setRevealed(false);
      setIdx(nextIdx);
    }
  }

  if (total === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-mint-400/20">
          <RotateCcw size={36} className="text-mint-500" />
        </div>
        <h1 className="mt-5 text-xl font-extrabold text-ink">All caught up!</h1>
        <p className="mt-2 text-sm text-ink/60">
          No cards are due right now. New cards appear as you learn and miss items — come back
          tomorrow to keep them strong.
        </p>
        <button
          onClick={onExit}
          className="mt-8 w-full rounded-2xl bg-grape-500 py-4 text-base font-bold text-white shadow-soft active:scale-[0.98]"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-5 pb-8 pt-4">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onExit} className="text-ink/50">
          <ArrowLeft size={18} />
        </button>
        <span className="text-sm font-bold text-ink/70">
          Review {idx + 1} / {total}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 24, rotateX: -8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="flex flex-1 flex-col items-center justify-center rounded-3xl bg-white p-7 text-center shadow-soft"
        >
          <span className="mb-3 rounded-full bg-cream px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-grape-500">
            {card.concept}
          </span>
          <p className="text-xl font-bold leading-snug text-ink">{card.front}</p>

          <AnimatePresence>
            {revealed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-5 w-full border-t border-black/5 pt-5"
              >
                <p className="text-lg font-semibold text-mint-600">{card.back}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <div className="mt-5">
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-base font-bold text-white shadow-soft active:scale-[0.98]"
          >
            <Eye size={18} /> Show answer
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {GRADES.map((g) => (
              <button
                key={g.grade}
                onClick={() => grade(g)}
                className={`rounded-2xl py-3.5 text-sm font-bold text-white shadow-soft active:scale-[0.95] ${g.cls}`}
              >
                {g.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
