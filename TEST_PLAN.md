# Test Plan — Lexicon Engine interactive evaluation UI (PR #4)

Target: local dev server `http://localhost:3000` wired to the real Supabase project
(`htgjxeouscopfeksfbnh`) and a real `GEMINI_API_KEY`.

Source under test: `src/app/page.tsx` (new interactive UI), backed by
`src/app/api/evaluate/route.ts`.

## Test 1 — Scenario loads (the original bug fix)
Steps:
1. Open `http://localhost:3000`.
Pass criteria:
- A scenario card renders with real `prompt_text` (e.g. a "Track ..." or "Corporate Strategy" prompt).
- It does NOT say "No protocols found." and NOT "Connection error:".
- A textarea (placeholder "Draft your executive-level response…"), a "Submit for Evaluation" button, and a "New Scenario" button are visible.
Would-fail-if-broken: if the GRANT/RLS were still broken, the card would show "Connection error: permission denied for table scenarios" or "No protocols found."

## Test 2 — Full AI evaluation flow (primary feature)
Steps:
1. Click the textarea and type a deliberately weak response (e.g. "We should use this thing to make stuff better and avoid bad results.").
2. Click "Submit for Evaluation".
3. Wait for the AI response.
Pass criteria:
- Button shows "Analyzing…" while in flight.
- A results panel appears containing:
  - A numeric **Score** between 1 and 100 (e.g. "57/100") — NOT 0, NOT blank.
  - A one-sentence **feedback** critique (non-empty).
  - A **C2 Rewrite** paragraph (non-empty, different from the input).
  - At least one **Vocabulary Upgrade** row showing `basic → advanced`.
- The header shows **Elo** (a number around 1200+) and **Streak** (a number ≥ 1).
Would-fail-if-broken: if `/api/evaluate` were unwired or the key missing, a red error banner ("Failed to analyze syntax…" or "Network error") would appear instead of a score.

## Test 3 — New Scenario button (secondary)
Steps:
1. After Test 2, click "New Scenario".
Pass criteria:
- The scenario prompt text changes (or stays valid if only one row) and the previous results panel + textarea are cleared.
Would-fail-if-broken: clicking would do nothing / leave stale results.

Note: Test 3 may show the same prompt by chance if the random pick repeats; click again if needed. The key assertion is the response/results reset.
