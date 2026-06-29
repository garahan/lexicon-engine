"use client";

import { Flame } from "lucide-react";
import LevelRing from "./LevelRing";
import CountUp from "./CountUp";
import { levelProgress } from "@/lib/mastery";

interface Props {
  xp: number;
  streakDays: number;
  dueCount: number;
}

export default function StatusBar({ xp, streakDays, dueCount }: Props) {
  const lp = levelProgress(xp);
  const toNext = lp.levelSpan === null ? 0 : Math.max(0, lp.levelSpan - lp.intoLevel);

  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-cream/80 backdrop-blur-md border-b border-black/5">
      <LevelRing fraction={lp.fraction} label={lp.level} />
      <div className="flex-1">
        <div className="flex items-baseline gap-1">
          <CountUp value={xp} className="text-lg font-extrabold text-ink" />
          <span className="text-xs font-semibold text-ink/50">XP</span>
        </div>
        <div className="text-[11px] text-ink/50">
          {lp.next ? (
            <>
              {toNext} XP to <span className="font-semibold text-grape-500">{lp.next}</span>
            </>
          ) : (
            <span className="font-semibold text-grape-500">Top level reached</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5">
        <Flame
          size={18}
          className={streakDays > 0 ? "text-brand-500" : "text-ink/30"}
          fill={streakDays > 0 ? "#f25c2a" : "none"}
        />
        <span className="text-sm font-bold text-brand-600">{streakDays}</span>
      </div>
      {dueCount > 0 && (
        <div className="rounded-full bg-grape-500 text-white text-xs font-bold px-2.5 py-1.5">
          {dueCount}
        </div>
      )}
    </div>
  );
}
