"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Check,
  Play,
  RotateCcw,
  Flame,
  TrendingUp,
  BookOpen,
  BarChart3,
  Zap,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import {
  ALL_TRACKS,
  conceptLabel,
  type Lesson,
  type Question,
  type Track,
} from "@/lib/curriculum";
import { useProgress } from "@/lib/useProgress";
import {
  dueCards,
  isLessonUnlocked,
  nextLesson as pickNextLesson,
  dayKey,
} from "@/lib/progress";
import { levelForXp, rankWeakConcepts } from "@/lib/mastery";
import { dailyChallenge, selectQuickWin, selectAdaptive } from "@/lib/adaptive";
import StatusBar from "@/components/StatusBar";
import LessonFlow from "@/components/LessonFlow";
import ReviewView from "@/components/ReviewView";
import DrillFlow from "@/components/DrillFlow";
import PlacementTest from "@/components/PlacementTest";
import StatsView from "@/components/StatsView";
import Celebration from "@/components/Celebration";
import type { SessionSummary } from "@/components/session";

type Tab = "learn" | "review" | "stats";

const TRACK_ICONS: Record<string, LucideIcon> = {
  grammar: BookOpen,
  vocabulary: Sparkles,
  reading: BookOpen,
  writing: BookOpen,
};

/** Every lesson this user can act on becomes part of the drill pools. */
function unlockedQuestionPool(
  state: ReturnType<typeof useProgress>["state"],
): Question[] {
  const qs: Question[] = [];
  for (const track of ALL_TRACKS) {
    for (const lesson of track.lessons) {
      if (isLessonUnlocked(state, lesson, track)) {
        qs.push(...lesson.questions.filter((q) => q.type !== "writing"));
      }
    }
  }
  return qs;
}

function masteredQuestionPool(
  state: ReturnType<typeof useProgress>["state"],
): Question[] {
  const qs: Question[] = [];
  for (const track of ALL_TRACKS) {
    for (const lesson of track.lessons) {
      if (state.completedLessons.includes(lesson.id)) {
        qs.push(...lesson.questions.filter((q) => q.type !== "writing"));
      }
    }
  }
  return qs;
}

export default function Home() {
  const progress = useProgress();
  const { state, ready } = progress;

  const [tab, setTab] = useState<Tab>("learn");
  const [trackId, setTrackId] = useState<string>("grammar");
  const [overlay, setOverlay] = useState<
    | { kind: "lesson"; lesson: Lesson }
    | { kind: "review" }
    | { kind: "drill"; title: string; drillKind: SessionSummary["kind"]; questions: Question[]; flawlessBonus: number }
    | { kind: "celebrate"; summary: SessionSummary }
    | null
  >(null);
  const [celebrateMeta, setCelebrateMeta] = useState({ leveledUp: false, newLevel: "B1" });
  const preLevel = useRef("B1");

  const track = useMemo<Track>(
    () => ALL_TRACKS.find((t) => t.id === trackId) ?? ALL_TRACKS[0],
    [trackId],
  );
  const due = useMemo(() => dueCards(state.flashcards), [state.flashcards]);
  const dueCount = due.length;
  const next = pickNextLesson(state, track);

  const weak = useMemo(() => {
    const stats = Object.entries(state.conceptStats).map(([concept, s]) => ({
      concept,
      correct: s.correct,
      total: s.total,
    }));
    return rankWeakConcepts(stats).slice(0, 3);
  }, [state.conceptStats]);

  // Checkpoint becomes available every 3 mastered lessons.
  const checkpointDue =
    state.completedLessons.length >= (state.checkpointsPassed + 1) * 3;

  function startLesson(lesson: Lesson) {
    preLevel.current = levelForXp(state.xp);
    setOverlay({ kind: "lesson", lesson });
  }

  function startReview() {
    preLevel.current = levelForXp(state.xp);
    setOverlay({ kind: "review" });
  }

  function startDrill(
    title: string,
    drillKind: SessionSummary["kind"],
    questions: Question[],
    flawlessBonus: number,
  ) {
    if (questions.length === 0) return;
    preLevel.current = levelForXp(state.xp);
    setOverlay({ kind: "drill", title, drillKind, questions, flawlessBonus });
  }

  function startChallenge() {
    const pool = unlockedQuestionPool(state);
    startDrill("Daily Challenge", "challenge", dailyChallenge(pool, state.conceptStats, 6, dayKey()), 50);
  }

  function startQuickWin() {
    const pool = unlockedQuestionPool(state);
    startDrill("Quick Win", "quickwin", selectQuickWin(pool, state.conceptStats, 3), 0);
  }

  function startCheckpoint() {
    const pool = masteredQuestionPool(state);
    startDrill("Checkpoint", "checkpoint", selectAdaptive(pool, state.conceptStats, 6), 40);
  }

  function handleComplete(s: SessionSummary) {
    const newLevel = levelForXp(state.xp);
    setCelebrateMeta({ leveledUp: newLevel !== preLevel.current, newLevel });
    if (
      s.kind === "checkpoint" &&
      s.totalFirstTry > 0 &&
      s.firstTryCorrect / s.totalFirstTry >= 0.8
    ) {
      progress.passCheckpoint();
    }
    setOverlay({ kind: "celebrate", summary: s });
  }

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-grape-500 border-t-transparent" />
      </div>
    );
  }

  // First launch → placement diagnostic.
  if (!state.placementDone) {
    return <PlacementTest progress={progress} onDone={() => setTab("learn")} />;
  }

  // ---- Full-screen flows ----
  if (overlay?.kind === "lesson") {
    return (
      <LessonFlow
        lesson={overlay.lesson}
        progress={progress}
        onComplete={handleComplete}
        onExit={() => setOverlay(null)}
      />
    );
  }
  if (overlay?.kind === "review") {
    return (
      <ReviewView progress={progress} onComplete={handleComplete} onExit={() => setOverlay(null)} />
    );
  }
  if (overlay?.kind === "drill") {
    return (
      <DrillFlow
        title={overlay.title}
        kind={overlay.drillKind}
        questions={overlay.questions}
        progress={progress}
        flawlessBonus={overlay.flawlessBonus}
        onComplete={handleComplete}
        onExit={() => setOverlay(null)}
      />
    );
  }
  if (overlay?.kind === "celebrate") {
    return (
      <Celebration
        summary={overlay.summary}
        dueTomorrow={dueCards(state.flashcards).length}
        leveledUp={celebrateMeta.leveledUp}
        newLevel={celebrateMeta.newLevel}
        onDone={() => setOverlay(null)}
      />
    );
  }

  return (
    <>
      <StatusBar xp={state.xp} streakDays={state.streakDays} dueCount={dueCount} />

      <div className="flex-1 overflow-y-auto pb-24">
        {tab === "learn" && (
          <LearnTab
            state={state}
            track={track}
            trackId={trackId}
            setTrackId={setTrackId}
            next={next}
            weak={weak}
            checkpointDue={checkpointDue}
            onStartLesson={startLesson}
            onChallenge={startChallenge}
            onQuickWin={startQuickWin}
            onCheckpoint={startCheckpoint}
          />
        )}

        {tab === "review" && (
          <ReviewTab
            dueCount={dueCount}
            onStartReview={startReview}
            onChallenge={startChallenge}
            onQuickWin={startQuickWin}
          />
        )}

        {tab === "stats" && <StatsView state={state} />}
      </div>

      <BottomNav tab={tab} setTab={setTab} dueCount={dueCount} />
    </>
  );
}

// ---------------- Learn tab ----------------

function LearnTab({
  state,
  track,
  trackId,
  setTrackId,
  next,
  weak,
  checkpointDue,
  onStartLesson,
  onChallenge,
  onQuickWin,
  onCheckpoint,
}: {
  state: ReturnType<typeof useProgress>["state"];
  track: Track;
  trackId: string;
  setTrackId: (id: string) => void;
  next: Lesson | null;
  weak: { concept: string; accuracy: number }[];
  checkpointDue: boolean;
  onStartLesson: (l: Lesson) => void;
  onChallenge: () => void;
  onQuickWin: () => void;
  onCheckpoint: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 px-5 pt-5">
      {/* Track selector */}
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {ALL_TRACKS.map((t) => {
          const Icon = TRACK_ICONS[t.id] ?? BookOpen;
          const active = t.id === trackId;
          return (
            <button
              key={t.id}
              onClick={() => setTrackId(t.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                active ? "bg-grape-500 text-white shadow-soft" : "bg-white text-ink/60"
              }`}
            >
              <Icon size={15} /> {t.name}
            </button>
          );
        })}
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-br from-grape-500 to-brand-500 p-6 text-white shadow-soft"
      >
        <p className="text-xs font-bold uppercase tracking-wider text-white/70">{track.name} track</p>
        {next ? (
          <>
            <h1 className="mt-1 text-2xl font-extrabold leading-tight">{next.title}</h1>
            <p className="mt-1 text-sm text-white/80">{next.blurb}</p>
            <button
              onClick={() => onStartLesson(next)}
              className="mt-4 flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-base font-bold text-grape-600 transition-all active:scale-[0.97]"
            >
              <Play size={18} fill="#6a3de8" /> Continue
            </button>
          </>
        ) : (
          <>
            <h1 className="mt-1 text-2xl font-extrabold leading-tight">Track complete! 🎉</h1>
            <p className="mt-1 text-sm text-white/80">
              You&apos;ve mastered every {track.name} lesson. Try another track or keep reviewing.
            </p>
          </>
        )}
      </motion.div>

      {/* Quick modes */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onChallenge}
          className="flex flex-col gap-1 rounded-2xl bg-white p-4 text-left shadow-soft transition-all active:scale-[0.98]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
            <Zap size={18} />
          </span>
          <span className="mt-1 text-sm font-bold text-ink">Daily Challenge</span>
          <span className="text-xs text-ink/55">6 questions · flawless = 2× XP</span>
        </button>
        <button
          onClick={onQuickWin}
          className="flex flex-col gap-1 rounded-2xl bg-white p-4 text-left shadow-soft transition-all active:scale-[0.98]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint-400/15 text-mint-600">
            <Sparkles size={18} />
          </span>
          <span className="mt-1 text-sm font-bold text-ink">Quick Win</span>
          <span className="text-xs text-ink/55">3 easy · 2-min boost</span>
        </button>
      </div>

      {/* Checkpoint */}
      {checkpointDue && (
        <button
          onClick={onCheckpoint}
          className="flex items-center gap-4 rounded-3xl bg-gradient-to-br from-gold to-brand-500 p-5 text-left text-white shadow-soft transition-all active:scale-[0.98]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <Trophy size={24} />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold">Checkpoint ready</p>
            <p className="text-sm text-white/85">Prove your progress and bank bonus XP</p>
          </div>
        </button>
      )}

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
                  <span className="font-semibold text-ink/80">{conceptLabel(w.concept)}</span>
                  <span className="font-bold text-ink/50">{Math.round(w.accuracy * 100)}%</span>
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
        <p className="mb-2 px-1 text-sm font-bold text-ink/50">{track.name} lessons</p>
        <div className="flex flex-col gap-2.5">
          {track.lessons.map((lesson) => {
            const unlocked = isLessonUnlocked(state, lesson, track);
            const done = state.completedLessons.includes(lesson.id);
            return (
              <button
                key={lesson.id}
                disabled={!unlocked}
                onClick={() => onStartLesson(lesson)}
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
        Phase 2 · {ALL_TRACKS.length} tracks · progress saved on this device
      </p>
    </div>
  );
}

// ---------------- Review tab ----------------

function ReviewTab({
  dueCount,
  onStartReview,
  onChallenge,
  onQuickWin,
}: {
  dueCount: number;
  onStartReview: () => void;
  onChallenge: () => void;
  onQuickWin: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 px-5 pt-5">
      <h1 className="px-1 text-2xl font-extrabold text-ink">Daily Review</h1>

      <button
        onClick={onStartReview}
        disabled={dueCount === 0}
        className={`flex items-center gap-4 rounded-3xl p-6 text-left shadow-soft transition-all ${
          dueCount > 0
            ? "bg-gradient-to-br from-grape-500 to-brand-500 text-white active:scale-[0.98]"
            : "bg-white text-ink/50"
        }`}
      >
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
            dueCount > 0 ? "bg-white/20" : "bg-grape-400/10 text-grape-500"
          }`}
        >
          <RotateCcw size={28} />
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold">
            {dueCount > 0 ? `${dueCount} card${dueCount > 1 ? "s" : ""} due` : "All caught up"}
          </p>
          <p className={`text-sm ${dueCount > 0 ? "text-white/85" : "text-ink/55"}`}>
            {dueCount > 0
              ? "Spaced repetition keeps it in long-term memory"
              : "Nothing due right now — come back tomorrow"}
          </p>
        </div>
      </button>

      <p className="px-1 text-sm font-bold text-ink/50">Keep the momentum</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onChallenge}
          className="flex flex-col gap-1 rounded-2xl bg-white p-4 text-left shadow-soft transition-all active:scale-[0.98]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
            <Zap size={18} />
          </span>
          <span className="mt-1 text-sm font-bold text-ink">Daily Challenge</span>
          <span className="text-xs text-ink/55">6 questions · flawless = 2× XP</span>
        </button>
        <button
          onClick={onQuickWin}
          className="flex flex-col gap-1 rounded-2xl bg-white p-4 text-left shadow-soft transition-all active:scale-[0.98]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint-400/15 text-mint-600">
            <Sparkles size={18} />
          </span>
          <span className="mt-1 text-sm font-bold text-ink">Quick Win</span>
          <span className="text-xs text-ink/55">3 easy · 2-min boost</span>
        </button>
      </div>
    </div>
  );
}

// ---------------- Bottom nav ----------------

function BottomNav({
  tab,
  setTab,
  dueCount,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  dueCount: number;
}) {
  const items: { id: Tab; label: string; icon: LucideIcon; badge?: number }[] = [
    { id: "learn", label: "Learn", icon: BookOpen },
    { id: "review", label: "Review", icon: RotateCcw, badge: dueCount },
    { id: "stats", label: "Stats", icon: BarChart3 },
  ];
  return (
    <nav className="sticky bottom-0 z-30 flex border-t border-black/5 bg-cream/90 px-2 py-2 backdrop-blur-md">
      {items.map((item) => {
        const Icon = item.icon;
        const active = tab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className="relative flex flex-1 flex-col items-center gap-0.5 py-1"
          >
            <span className={active ? "text-grape-500" : "text-ink/40"}>
              <Icon size={22} />
            </span>
            <span
              className={`text-[11px] font-bold ${active ? "text-grape-500" : "text-ink/40"}`}
            >
              {item.label}
            </span>
            {item.badge ? (
              <span className="absolute right-1/2 top-0 translate-x-4 rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-white">
                {item.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
