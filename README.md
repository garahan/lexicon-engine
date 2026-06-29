# Ascend — English B1 → C2

A grammar-led, spaced-repetition English course that takes you from **B1 to C2**, one short, rewarding daily session at a time. Ascend pairs proven learning science (active recall, spaced repetition, interleaving, mastery learning, weak-point targeting) with a dopamine-grade UX so coming back feels effortless instead of like a chore.

> Single-user, runs entirely in the browser. All progress is saved to `localStorage` — no login, no backend required to learn.

---

## What it does

Ascend is built around one tight, satisfying loop and a memory engine that makes what you learn actually stick.

**The lesson loop**
1. **Learn** — a short, focused teaching card (the rule + clear examples; a passage for Reading lessons).
2. **Quiz** — interleaved question types (multiple-choice, fill-in-the-blank, type-the-answer, and self-rated writing), ordered **adaptively** so your weaker concepts surface first.
3. **Repeat weak items** — every miss is requeued and re-tested until you get it right, and becomes a spaced-repetition flashcard.
4. **Mastery gate** — hit **85% on first tries** to master the lesson, earn XP, and unlock the next one.

**The memory engine (Daily Review)**
- Every missed item / new card enters a deck scheduled with the **SM-2** spaced-repetition algorithm.
- Intervals grow when you recall and shrink when you miss, so reviews land right before you'd forget.

---

## Phase 2 features

This build adds four major pillars on top of the Phase 1 learning loop:

### B · Placement test + checkpoints
- A **12-question diagnostic** on first launch estimates your starting CEFR band (B1 → C2) and auto-unlocks the lessons below it, so the course meets you where you are.
- **Checkpoints** unlock every 3 mastered lessons — a short assessment drawn from what you've learned. Passing (≥80%) confirms real progression and banks bonus XP.

### C · Multi-track curriculum
Four tracks, each an ordered ladder of CEFR-tagged lessons:
- **Grammar** (the backbone): tenses, conditionals, articles, gerunds vs infinitives, relative clauses, inversion (C1), cleft & nominalisation (C2).
- **Vocabulary**: strong adjectives, make/do collocations, precise verbs.
- **Reading**: main idea, inference & tone (with passages).
- **Writing**: linking ideas, opinion paragraphs — *compose → reveal model answer → self-rate against a checklist*.

### E · Stats dashboard
A dedicated **Stats** tab with custom visualizations:
- CEFR level ring + XP progress, overall accuracy, streak, lessons mastered, retention rate, best combo, active days.
- **Mastery by concept** bars, an **accuracy trend** line, a **10-week activity heatmap**, a **weak-spot ranking**, and a **review forecast** for the next 7 days.

### F · Adaptive difficulty + come-back modes
- **Adaptive ordering** weights weak/unseen concepts to the front of every quiz and drill.
- **Daily Challenge** — 6 questions, deterministic per day; a flawless run earns **2× bonus XP**.
- **Quick Win** — 3 of your easiest items for a low-energy, ~2-minute confidence boost.

---

## Dopamine-grade UX
- Instant tactile feedback on every answer (green flash, checkmark pop, point float, soft ding).
- A glowing **combo meter** that builds a multiplier (capped ×4) as you chain correct answers.
- Count-up XP, an animated CEFR **level ring**, confetti on level-up, and an end-of-session celebration screen.
- A gentle **streak with a grace day** so one missed day doesn't punish you.
- Mobile-first, calm warm palette, one task on screen at a time.

---

## Navigation

A persistent bottom nav with three tabs:
- **Learn** — track selector, your next lesson, Daily Challenge / Quick Win, checkpoint, weak spots, and the full lesson list.
- **Review** — your spaced-repetition deck (cards due today) plus the quick modes.
- **Stats** — the full dashboard.

---

## Tech stack
- **Next.js 14** (App Router) · **React 18** · **TypeScript** · **Tailwind CSS**
- **Framer Motion** for animation; **lucide-react** icons
- **Jest + ts-jest** for unit tests (pure logic modules are fully testable)
- Progress persists to **`localStorage`** (single-user). No auth/backend needed to learn.

> A legacy Supabase + Gemini path (`/api/evaluate`, `/api/cron`) remains in the repo from the earlier corporate-eval app and is not used by the Ascend learning loop. Live AI grading of writing is reserved for a future phase.

### Project structure
```
src/
  app/page.tsx              Tabs, placement gate, drills, checkpoints
  components/               LessonFlow, DrillFlow, QuizCard, ReviewView,
                            PlacementTest, StatsView, Celebration, ComboMeter, …
  lib/
    curriculum/             Multi-track content (grammar, vocabulary, reading, writing)
    mastery.ts              XP, CEFR ladder, combo, weak-point ranking
    srs.ts                  SM-2 spaced-repetition scheduler
    placement.ts            Diagnostic questions + scoring
    adaptive.ts             Adaptive ordering, Daily Challenge, Quick Win
    stats.ts                Dashboard aggregation (mastery, trend, heatmap, forecast)
    progress.ts             Progress state + persistence helpers
    useProgress.ts          React hook wrapping progress state
```

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

On first launch you'll take the placement test. After that, jump into a lesson, build a streak, and watch your Stats fill in.

### Scripts
```bash
npm run dev        # start the dev server
npm run build      # production build
npm run lint       # eslint
npm run test       # jest unit tests
npx tsc --noEmit   # typecheck
```

### Resetting progress
Progress lives in `localStorage`. To start fresh, clear site data in your browser (or call the `hardReset()` exposed by `useProgress`).

---

## Roadmap
- **Phase 1** ✅ — grammar-led learning loop, SM-2 Daily Review, XP + CEFR ring + streak, dopamine UX.
- **Phase 2** ✅ — placement + checkpoints, multi-track curriculum, Stats dashboard, adaptive difficulty + Daily Challenge + Quick Win.
- **Next** — user accounts + cloud sync (progress follows you across devices), live AI-graded writing with inline "your phrasing → upgrade" diffs, email come-back reminders, and a larger B1→C2 content library.
