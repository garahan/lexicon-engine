"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Target, Flame, Layers, Brain, Zap, CalendarDays, TrendingDown } from "lucide-react";
import type { ProgressState } from "@/lib/progress";
import {
  conceptMastery,
  dailySeries,
  reviewForecast,
  statsSummary,
} from "@/lib/stats";
import { levelProgress, rankWeakConcepts } from "@/lib/mastery";
import { conceptLabel } from "@/lib/curriculum";
import LevelRing from "./LevelRing";

const pct = (x: number) => `${Math.round(x * 100)}%`;

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-white p-3.5 shadow-soft">
      <div className="flex items-center gap-1.5 text-ink/50">
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-wide">{label}</span>
      </div>
      <span className="text-xl font-extrabold text-ink">{value}</span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-soft">
      <p className="mb-3 text-base font-bold text-ink">{title}</p>
      {children}
    </div>
  );
}

/** Accuracy trend as a smooth SVG line over the active days in the window. */
function TrendLine({ points }: { points: { day: string; accuracy: number; answers: number }[] }) {
  const active = points.filter((p) => p.answers > 0);
  if (active.length < 2) {
    return (
      <p className="py-6 text-center text-sm text-ink/40">
        Answer questions on a few different days to see your accuracy trend.
      </p>
    );
  }
  const W = 300;
  const H = 90;
  const n = active.length;
  const coords = active.map((p, i) => {
    const x = (i / (n - 1)) * W;
    const y = H - p.accuracy * H;
    return [x, y] as const;
  });
  const path = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${path} L${W},${H} L0,${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" height={100}>
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c4dff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#7c4dff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#trendFill)" />
      <path d={path} fill="none" stroke="#7c4dff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill="#7c4dff" />
      ))}
    </svg>
  );
}

/** GitHub-style activity heatmap built from daily answer counts. */
function Heatmap({ points }: { points: { day: string; answers: number }[] }) {
  const max = Math.max(1, ...points.map((p) => p.answers));
  const shade = (a: number) => {
    if (a === 0) return "rgba(0,0,0,0.05)";
    const t = 0.25 + 0.75 * (a / max);
    return `rgba(124,77,255,${t.toFixed(2)})`;
  };
  // Lay out as columns of 7 (weeks).
  const weeks: { day: string; answers: number }[][] = [];
  for (let i = 0; i < points.length; i += 7) weeks.push(points.slice(i, i + 7));
  return (
    <div className="flex gap-1 overflow-x-auto">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map((d) => (
            <div
              key={d.day}
              title={`${d.day}: ${d.answers} answers`}
              className="h-3.5 w-3.5 rounded-[3px]"
              style={{ backgroundColor: shade(d.answers) }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function StatsView({ state }: { state: ProgressState }) {
  const lp = levelProgress(state.xp);
  const summary = useMemo(() => statsSummary(state), [state]);
  const mastery = useMemo(() => conceptMastery(state.conceptStats), [state.conceptStats]);
  const series = useMemo(() => dailySeries(state.history, 14), [state.history]);
  const heat = useMemo(() => dailySeries(state.history, 70), [state.history]);
  const forecast = useMemo(() => reviewForecast(state.flashcards, 7), [state.flashcards]);
  const weak = useMemo(
    () =>
      rankWeakConcepts(
        Object.entries(state.conceptStats).map(([concept, s]) => ({
          concept,
          correct: s.correct,
          total: s.total,
        })),
      ).slice(0, 5),
    [state.conceptStats],
  );

  const maxForecast = Math.max(1, ...forecast.map((f) => f.count));
  const empty = state.totalAnswers === 0;

  return (
    <div className="flex flex-col gap-4 px-5 pb-28 pt-5">
      <h1 className="px-1 text-2xl font-extrabold text-ink">Your progress</h1>

      {/* Level + headline */}
      <div className="flex items-center gap-4 rounded-3xl bg-gradient-to-br from-grape-500 to-brand-500 p-5 text-white shadow-soft">
        <LevelRing fraction={lp.fraction} label={lp.level} size={72} stroke={7} />
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-white/70">Current level</p>
          <p className="text-2xl font-extrabold leading-tight">{lp.level}</p>
          <p className="text-sm text-white/80">
            {state.xp} XP{lp.next ? ` · ${pct(lp.fraction)} to ${lp.next}` : " · top level"}
          </p>
        </div>
      </div>

      {empty && (
        <p className="rounded-2xl bg-white p-4 text-center text-sm text-ink/55 shadow-soft">
          Complete a lesson or a review to start filling in your stats.
        </p>
      )}

      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryTile icon={<Target size={14} />} label="Accuracy" value={pct(summary.overallAccuracy)} />
        <SummaryTile icon={<Flame size={14} />} label="Streak" value={`${state.streakDays}d`} />
        <SummaryTile icon={<Layers size={14} />} label="Lessons" value={summary.lessonsMastered} />
        <SummaryTile icon={<Brain size={14} />} label="Retention" value={pct(summary.retention)} />
        <SummaryTile icon={<Zap size={14} />} label="Best combo" value={`×${summary.bestCombo}`} />
        <SummaryTile icon={<CalendarDays size={14} />} label="Active days" value={summary.activeDays} />
      </div>

      {/* Concept mastery */}
      {mastery.length > 0 && (
        <Card title="Mastery by concept">
          <div className="flex flex-col gap-3">
            {mastery.map((m) => (
              <div key={m.concept}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold text-ink/80">{m.label}</span>
                  <span className="font-bold text-ink/50">
                    {pct(m.accuracy)}{" "}
                    <span className="font-normal text-ink/35">({m.correct}/{m.total})</span>
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-black/5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-grape-500 to-mint-500"
                    initial={{ width: 0 }}
                    animate={{ width: pct(m.accuracy) }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Accuracy trend */}
      <Card title="Accuracy trend">
        <TrendLine points={series} />
      </Card>

      {/* Activity heatmap */}
      <Card title="Activity (last 10 weeks)">
        <Heatmap points={heat} />
      </Card>

      {/* Weak spots */}
      {weak.length > 0 && (
        <Card title="Weak spots to strengthen">
          <div className="flex flex-col gap-2">
            {weak.map((w) => (
              <div
                key={w.concept}
                className="flex items-center justify-between rounded-2xl bg-cream px-3.5 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <TrendingDown size={15} className="text-brand-500" />
                  <span className="text-sm font-semibold text-ink/80">{conceptLabel(w.concept)}</span>
                </div>
                <span className="text-sm font-bold text-brand-600">
                  {pct(w.errorRate)} miss
                  <span className="ml-1 font-normal text-ink/40">({w.total})</span>
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Review forecast */}
      <Card title="Reviews coming up">
        <div className="flex items-end justify-between gap-1.5" style={{ height: 90 }}>
          {forecast.map((f, i) => (
            <div key={f.day} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full flex-1 items-end">
                <motion.div
                  className="w-full rounded-t-md bg-gradient-to-t from-grape-500 to-brand-400"
                  initial={{ height: 0 }}
                  animate={{ height: `${(f.count / maxForecast) * 100}%` }}
                  transition={{ delay: i * 0.03, type: "spring", stiffness: 140, damping: 20 }}
                  style={{ minHeight: f.count > 0 ? 6 : 0 }}
                />
              </div>
              <span className="text-[10px] font-bold text-ink/40">
                {i === 0 ? "now" : `+${i}d`}
              </span>
              <span className="text-[10px] font-semibold text-ink/60">{f.count}</span>
            </div>
          ))}
        </div>
      </Card>

      <p className="mt-1 text-center text-[11px] text-ink/40">
        Phase 2 · progress saved on this device
      </p>
    </div>
  );
}
