"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Sparkles } from "lucide-react";
import { PLACEMENT_QUESTIONS, buildPlacement } from "@/lib/placement";
import type { ProgressApi } from "@/lib/useProgress";

interface Props {
  progress: ProgressApi;
  onDone: () => void;
}

type Band = "B1" | "B2" | "C1";

export default function PlacementTest({ progress, onDone }: Props) {
  const [started, setStarted] = useState(false);
  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<{ level: string } | null>(null);
  const answers = useRef<{ band: Band; correct: boolean }[]>([]);

  const q = PLACEMENT_QUESTIONS[pos];
  const total = PLACEMENT_QUESTIONS.length;

  function choose(choice: string) {
    if (picked !== null) return;
    setPicked(choice);
    answers.current.push({ band: q.band, correct: choice === q.answer });
    setTimeout(() => {
      if (pos + 1 >= total) {
        const outcome = buildPlacement(answers.current);
        progress.applyPlacement(outcome);
        setResult({ level: outcome.level });
      } else {
        setPos(pos + 1);
        setPicked(null);
      }
    }, 450);
  }

  // Intro
  if (!started) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 15 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-grape-400 to-brand-500 shadow-glow-combo"
        >
          <Compass size={46} className="text-white" />
        </motion.div>
        <h1 className="mt-6 text-2xl font-extrabold text-ink">Let&apos;s find your level</h1>
        <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-ink/65">
          A quick {total}-question check so Ascend starts you in the right place — no studying
          needed. Just answer honestly; skip if you&apos;re unsure.
        </p>
        <button
          onClick={() => setStarted(true)}
          className="mt-8 w-full rounded-2xl bg-grape-500 py-4 text-base font-bold text-white shadow-soft transition-all active:scale-[0.98]"
        >
          Start placement
        </button>
        <button
          onClick={() => {
            progress.applyPlacement({ level: "B1", startXp: 0, clearedLessonIds: [] });
            onDone();
          }}
          className="mt-3 text-sm font-semibold text-ink/50"
        >
          Skip — start me at B1
        </button>
      </div>
    );
  }

  // Result
  if (result) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
          className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-grape-400 to-brand-500 text-3xl font-extrabold text-white shadow-glow-combo"
        >
          {result.level}
        </motion.div>
        <h1 className="mt-6 text-2xl font-extrabold text-ink">You&apos;re starting at {result.level}</h1>
        <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-ink/65">
          We&apos;ve unlocked the lessons that match your level. You can always revisit earlier
          ones from the Learn tab.
        </p>
        <button
          onClick={onDone}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-grape-500 py-4 text-base font-bold text-white shadow-soft transition-all active:scale-[0.98]"
        >
          <Sparkles size={18} /> Start learning
        </button>
      </div>
    );
  }

  // Question
  const progressPct = (pos / total) * 100;
  return (
    <div className="flex flex-1 flex-col px-5 pb-8 pt-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-grape-400 to-brand-500"
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 160, damping: 22 }}
          />
        </div>
        <span className="text-xs font-bold text-ink/50">
          {pos + 1}/{total}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ type: "spring", stiffness: 240, damping: 24 }}
          className="flex flex-col gap-5"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-grape-500">
            Placement · {q.band}
          </p>
          <h2 className="text-xl font-bold leading-snug text-ink">{q.prompt}</h2>
          <div className="flex flex-col gap-2.5">
            {q.choices!.map((choice) => {
              const isPicked = picked === choice;
              return (
                <button
                  key={choice}
                  disabled={picked !== null}
                  onClick={() => choose(choice)}
                  className={`rounded-2xl border-2 px-4 py-3.5 text-left text-base font-semibold transition-all ${
                    isPicked
                      ? "border-grape-500 bg-grape-400/10"
                      : "border-black/10 bg-white hover:border-grape-400 active:scale-[0.98]"
                  }`}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
