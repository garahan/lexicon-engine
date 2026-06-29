"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Target, Zap, Sparkles, CalendarClock } from "lucide-react";
import Confetti from "./Confetti";
import CountUp from "./CountUp";
import { playComplete, playLevelUp } from "@/lib/feedback";
import { accuracy } from "@/lib/mastery";
import type { SessionSummary } from "./session";

interface Props {
  summary: SessionSummary;
  dueTomorrow: number;
  leveledUp: boolean;
  newLevel: string;
  onDone: () => void;
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-white px-3 py-4 shadow-soft">
      <div className="text-grape-500">{icon}</div>
      <div className="text-xl font-extrabold text-ink">{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/50">
        {label}
      </div>
    </div>
  );
}

export default function Celebration({
  summary,
  dueTomorrow,
  leveledUp,
  newLevel,
  onDone,
}: Props) {
  const acc = Math.round(accuracy(summary.firstTryCorrect, summary.totalFirstTry) * 100);

  useEffect(() => {
    if (leveledUp) playLevelUp();
    else playComplete();
  }, [leveledUp]);

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-6 pb-10 pt-6 text-center">
      <Confetti />

      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-grape-400 to-brand-500 shadow-glow-combo"
      >
        {summary.mastered ? (
          <Trophy size={44} className="text-white" />
        ) : (
          <Target size={44} className="text-white" />
        )}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-5 text-2xl font-extrabold text-ink"
      >
        {summary.kind === "review"
          ? "Review complete!"
          : summary.mastered
            ? "Lesson mastered!"
            : "Great effort!"}
      </motion.h1>
      <p className="mt-1 text-sm text-ink/60">{summary.title}</p>

      {leveledUp && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="mt-4 flex items-center gap-2 rounded-full bg-grape-500 px-4 py-2 text-sm font-bold text-white"
        >
          <Sparkles size={16} /> Level up — you&apos;re now {newLevel}!
        </motion.div>
      )}

      <div className="mt-6 grid w-full grid-cols-3 gap-3">
        <Stat
          icon={<Zap size={20} />}
          label="XP earned"
          value={<CountUp value={summary.xpGained} />}
        />
        <Stat icon={<Target size={20} />} label="Accuracy" value={`${acc}%`} />
        <Stat icon={<Sparkles size={20} />} label="Best combo" value={`×${summary.bestCombo}`} />
      </div>

      {summary.bonusActive && (
        <p className="mt-3 text-sm font-bold text-brand-500">⚡ 2× surprise bonus was active!</p>
      )}

      {!summary.mastered && summary.kind === "lesson" && (
        <p className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-600">
          You need 85% on first tries to unlock the next lesson. Replay to lock it in!
        </p>
      )}

      <div className="mt-4 flex items-center gap-2 text-sm text-ink/60">
        <CalendarClock size={16} />
        {dueTomorrow > 0 ? (
          <span>
            <span className="font-bold text-grape-500">{dueTomorrow}</span> reviews waiting for you
          </span>
        ) : (
          <span>No reviews due yet — come back tomorrow!</span>
        )}
      </div>

      <button
        onClick={onDone}
        className="mt-8 w-full rounded-2xl bg-grape-500 py-4 text-base font-bold text-white shadow-soft transition-all active:scale-[0.98]"
      >
        Continue
      </button>
    </div>
  );
}
