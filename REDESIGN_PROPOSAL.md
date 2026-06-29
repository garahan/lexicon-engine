# Lexicon → "Ascend": a grammar-led English mastery course (B1 → C2)

Structured course: *learn → get quizzed → app finds weak points → drill them strong → mastery-gate to next lesson*, with **mathematically-correct spaced-repetition flashcards** so nothing fades — wrapped in an **engagement system designed so you *want* to come back daily** (healthy dopamine, not dark patterns).

Tracks: **Grammar (primary focus), Vocabulary, Reading, Writing.** No speaking/listening.

---

## 1. The curriculum (grammar-led, best-practice sequence)

Grammar is the backbone; vocab/reading/writing reinforce it. Lessons are short, ordered, and **mastery-gated** by CEFR band:

**B1 → B2 (consolidate the core)**
- Tense system review: present/past simple vs continuous; present perfect vs past simple
- Future forms (will / going to / present continuous)
- Conditionals 0–2; modals of obligation/advice/deduction
- Articles & quantifiers; gerunds vs infinitives; comparatives/superlatives
- Relative clauses; passive voice (present/past)

**B2 → C1 (precision & range)**
- Perfect continuous tenses; narrative tenses (past perfect, used to/would)
- Conditionals 3 + mixed; wish/if only; reported speech
- Advanced passive (passive reporting); causative (have/get something done)
- Modals of speculation in the past; linking & contrast (despite/however/whereas)

**C1 → C2 (nuance & native-like control)**
- Inversion & emphasis (cleft sentences, fronting); subjunctive/unreal forms
- Advanced conditionals & hedging; nominalisation; cohesion & register
- Idiomatic/collocational grammar; subtle aspect & tense nuance

Each grammar lesson pairs with **collocations + example-rich vocab**, a short **reading** that uses the structure in context, and a tiny **writing** task graded by AI — so you *use* what you learn, which is the single biggest driver of retention.

> **Best-practice principles baked in:** active recall (testing, not re-reading) · spaced repetition · interleaving (mixed question types) · immediate corrective feedback ("why it's wrong") · scaffolding that fades by level · learning by production.

---

## 2. The daily system — built so you *don't* procrastinate

The hard part isn't the content, it's coming back. Design choices specifically to beat procrastination and create a healthy daily pull:

**Lower the activation energy**
- **Tiny default daily goal** (one short lesson *or* clearing today's due reviews — ~5–10 min). A small, finite, visible task is far easier to start than an open-ended "study English."
- **"Just one card" entry** — the app always offers a single quick action so starting feels effortless; momentum does the rest.

**Make every correct answer *feel* good (dopamine at every detail)**
- Instant micro-feedback on each answer: satisfying tick, color pop, point count-up, subtle sound.
- **Combo meter** inside a quiz — consecutive correct answers build a multiplier; a wrong answer resets it (creates focus + a little thrill).
- **Variable bonus rewards** — occasional surprise bonus XP / "lucky streak" so rewards aren't perfectly predictable (this unpredictability is what makes it moreish — used gently, not manipulatively).
- **End-of-session celebration**: a quick summary of XP gained, cards mastered, accuracy, and your level ring ticking up.

**Visible, constant progress**
- Mastery bars that **fill in real time**; a CEFR **level ring**; "X cards due today" that you can drive to zero (a clear finish line).
- **Milestones & badges** at level-ups and review milestones (e.g. "30-day memory", "100 cards mastered").

**Gentle loss-aversion, never punishing**
- **Streak with a freeze/grace day** so one missed day doesn't wipe progress (punishing streaks cause *quitting*, not consistency).
- Optional daily reminder nudge.

**Keep it fresh (anti-boredom)**
- **Interleaved question types** every session (MCQ, cloze, matching, type-the-answer, flashcard, mini-writing) so it never feels repetitive.
- A **Daily Challenge** (a short mixed-skill quiz) for bonus XP.
- Adaptive difficulty: questions auto-tune to sit at the edge of your ability (the "flow" zone — not too easy/boring, not too hard/frustrating).

---

## 3. Memory engine — mathematically-correct repetition
- Every missed item + new word → an **auto-flashcard**.
- A separate **Daily Review** resurfaces due cards using a proven **SM-2 / FSRS** algorithm: interval + ease grow on recall, shrink on a miss, spacing reviews optimally over days → weeks → months.
- **Strengthen mode** drills *only* your weakest items until accuracy recovers, then graduates them to longer intervals.

## 4. Weak-point engine
- Every answer is logged → a **Weak Points dashboard** ranks your most-missed concepts/words across all tracks, and a lesson won't pass until you clear its weak items (mastery threshold ~85%).

## 5. Tracking (lots of it)
Per-track progress ladders · overall CEFR level ring · mastery % per concept · retention rate · review **calendar heatmap** · accuracy trends · current/longest streak · cards due today.

---

## 6. How we make it even better (engagement upgrades)
- **Adaptive difficulty / flow targeting** so each session sits right at your skill edge.
- **AI explanations** on every wrong answer — a one-line "why", so mistakes teach instead of frustrate.
- **Themed journeys / chapters** so the curriculum feels like a path with a story, not a spreadsheet.
- **Personal "best time of day" reminder** and a 2-minute "quick win" mode for low-energy days.
- (Later, optional) lightweight **leaderboard/leagues or a friend streak** for social pull — only if you want it.

---

## Tech (same stack: Next.js + Supabase + Gemini)
New testable modules with the same rigor as the existing `elo.ts` / `streak.ts`:
- `src/lib/srs.ts` — the SM-2/FSRS scheduling math (fully unit-tested)
- `src/lib/mastery.ts` — mastery %, pass/gate logic, weak-point ranking, combo/XP rules

Tables: `tracks`, `lessons` (track_id, cefr_level, order, teach_content), `lesson_items` (question/type/choices/answer), `profiles` (+ `cefr_level`, `xp`, streak fields), `srs_cards` (`due_at`, `interval`, `ease`, `reps`, `lapses`), `attempts` (weak-point analytics). AI generates lessons/quizzes, grades writing, and explains wrong answers.

---

## Gap analysis — what the concept was missing (and the fix)

Pressure-tested the whole picture. Real gaps, most important first:

1. **No user accounts (biggest gap).** The app today uses a single hardcoded `Admin` profile. Every personal feature — spaced repetition, weak points, level, streak — is meaningless without **auth + per-user data**. *Fix: add Supabase Auth (email/Google) and key all progress to a user id.*

2. **No proof of real improvement.** XP/streaks can inflate while actual ability stalls (the "Duolingo trap"). *Fix: a **placement test** to start at the right level + **periodic checkpoint assessments** that objectively confirm B1→B2→C1 movement, separate from lesson XP.*

3. **Grammar isn't flashcard-shaped.** Front/back recall works for vocab, but grammar mastery = *applying* a rule in new sentences. *Fix: grammar review resurfaces **fresh example items** (new cloze/transform sentences for that rule), not the identical card — true active application, not memorising one answer.*

4. **AI cost & content scale (practical blocker).** We already hit Gemini's **free-tier quota (429)**. Generating lessons/grading on the fly for a full B1→C2 path will blow quota and be slow/inconsistent. *Fix: **pre-generate + cache** lesson/quiz content in Supabase (author once, reuse), reserve live AI for writing-grading and "explain my mistake"; add graceful fallback when quota is hit.*

5. **Review overload / returning after a break.** SRS decks "avalanche" (hundreds due after a week away), which kills motivation. *Fix: **daily review caps**, smart rescheduling, and a gentle "catch-up" mode.*

6. **Mastery vs lucky guessing.** 4-option MCQ = 25% right by chance. *Fix: require **consecutive** correct + mix in **production/typed** answers before an item counts as mastered.*

7. **Real-world transfer.** Recognising a rule ≠ using it. *Fix: keep the **AI-graded mini-writing** task central (not a footnote) — it's the bridge from "knows about" to "can use".*

8. **Coming back depends on a nudge.** A daily habit needs a trigger. *Fix: **email reminders** (reliable) + optional browser notifications; a "best time of day" nudge. Note: web push is limited on iOS, so email is the dependable channel.*

9. **No reference layer.** Quizzing without a place to *re-read* the rule is frustrating. *Fix: a revisitable **grammar reference / cheat-sheet** per concept, linked from every related question.*

10. **Mobile-first.** Daily micro-learning happens on a phone. *Fix: design mobile-first, large tap targets, thumb-reachable actions.*

11. **Excluded-skills tradeoff (explicit).** No speaking/listening means this builds **reading + writing + grammar/vocab use**, not pronunciation or listening comprehension. That's a deliberate scope choice per your call — flagging it so it's a known limitation, not a surprise.

I'll bake fixes #2–#7, #9 into the design now; **#1 (auth) and #8 (reminders)** are infrastructure I'd slot into Phase 2 unless you want them in Phase 1.

---

## Design spec — "dopamine-grade", come-back-again feel

Goal: every interaction should feel as satisfying and effortless as scrolling Instagram — instant, tactile, rewarding, never a dull moment.

**Feel & motion**
- **Buttery micro-animations everywhere** (Framer Motion): cards spring in, buttons squish on press, the level ring fills with an eased sweep, numbers **count up** (XP, score), bars **animate** to their new value.
- **Instant tactile feedback** on every answer: correct = green flash + checkmark pop + upward point burst + a soft "ding"; wrong = gentle red shake (never harsh), then the fix slides in.
- **Confetti / particle bursts** on streak milestones, lesson completion, and level-ups — short and celebratory, not annoying.
- **Combo meter** that visibly charges and glows as you chain correct answers (×2, ×3…), with escalating sound pitch — the core "just one more" hook.
- Optional **haptics** on mobile (vibrate on correct/level-up via the Vibration API).

**Look**
- Modern, vibrant, **friendly** — soft gradients, rounded 2xl cards, generous spacing, a bold but warm accent color, big readable type. Light-first with an optional warm dark mode.
- **One focused thing on screen at a time** with a slim top progress bar — feed-like simplicity, thumb-reachable actions, mobile-first.
- A persistent, glanceable **status bar** (level ring, XP, streak flame, cards-due) that visibly reacts the instant you earn something.

**Come-back hooks (healthy, not manipulative)**
- **Streak flame** that grows with consecutive days; a gentle freeze/grace day so a miss doesn't sting.
- **"Daily goal" ring** you can fill in ~5 min — a small, finite, satisfying close-the-ring moment.
- **End-of-session reward screen**: animated XP tally, cards mastered, accuracy, level-ring tick-up, and a "tomorrow you have N reviews" teaser.
- **Surprise/variable bonuses** (occasional double-XP, "lucky card") so rewards aren't perfectly predictable.
- **Milestone badges** that unlock with a celebratory reveal.

**Sound & polish**
- A tiny, tasteful sound set (correct, wrong, level-up, combo) — on by default, one-tap mute.
- Empty/loading states are playful, never blank. Nothing ever feels broken or static.

> Principle: reward **real learning actions** (recall, correct application, consistency) — the dopamine is tied to genuine progress, so it stays motivating instead of hollow.

---

## Build order
- **Phase 1 (feel the direction):** new engaging design + **Grammar track** with ~5 lessons running the full **Learn → Quiz (interleaved types + combo meter + instant rewards) → repeat-weak-items → mastery gate → next lesson** loop, auto-flashcards + a basic **Daily Review** (SM-2), XP + CEFR level ring + streak, end-of-session celebration. One PR.
- **Phase 2:** placement quiz, Weak Points dashboard + Strengthen mode, Vocabulary/Reading/Writing tracks, retention heatmap, daily challenge, adaptive difficulty.
- **Phase 3:** AI-authored lessons on demand, badges/milestones, themed journeys, optional social.
