# Lexicon Engine 🚀

A high-intensity, dopamine-driven application engineered to shatter the intermediate (B1/B2) English plateau. Built for ambitious professionals transitioning into high-level technical advisory, strategic consulting, and executive roles, this engine forces the adoption of C2-level precision and corporate diplomacy.

## 1. The Vision & Philosophy

The gap between functional fluency (B2) and native-level, executive mastery (C2) cannot be bridged by traditional language learning methods. Standard apps rely on passive recognition, low-stakes multiple-choice questions, and generic scenarios (e.g., ordering coffee). 

To thrive in high-stakes corporate environments—whether diagnosing complex enterprise hardware failures, advising on macroeconomic shifts, or structuring energy policy—communication must be razor-sharp, devoid of filler, and syntactically flawless. 

**The Lexicon Engine operates on three core principles:**
1. **Deliberate Practice:** Forced active recall in hyper-specific, high-cognitive-load scenarios.
2. **Strict Constraints:** Eliminating B1/B2 default vocabulary by forcing users to synthesize complex concepts within strict time or structural limits.
3. **Dopamine-Driven Progression:** Hacking the brain's reward circuits using variable ratio rewards, visual micro-interactions, and loss aversion to replace mindless social media scrolling with high-yield linguistic training.

## 2. The Core Challenge (Why This Exists)
* **The Procrastination Trap:** Language learning typically feels like a high-effort, low-reward grind. The dopamine release is delayed by months, leading to procrastination and eventual abandonment. 
* **The "Good Enough" Plateau:** At B2, users can survive most conversations. The brain naturally conserves energy by defaulting to basic vocabulary (e.g., using "fix" instead of "rectify", or "look at" instead of "investigate"). Without a ruthless external auditor, advanced vocabulary is never internalized.
* **The Solution:** A frictionless Progressive Web App (PWA) sitting directly on the mobile home screen. It leverages the "Zeigarnik Effect" (the psychological tension of incomplete patterns) via a high-stakes streak system to ensure daily engagement.

## 3. How It Works (The Core Loop)

1. **The Trigger:** The user opens the app from their home screen, entering instantly without menus or loading screens.
2. **The High-Friction Task:** A daily, randomized corporate scenario is presented (e.g., *Explaining the latency mitigation of VLESS+Reality protocols to a non-technical stakeholder*).
3. **The Active Output:** The user drafts a concise, professional response.
4. **The Audit:** The Gemini 1.5 Flash AI evaluates the text strictly as an elite corporate communications advisor.
5. **The Reward:** The UI visually "glows" as basic words are swapped for C2 upgrades. The user's Elo rating ticks up, and their daily streak is locked in.

## 4. Architectural Structure & Features

### 4.1 The Elastic Streak System
To build long-term discipline without the demoralizing effects of rigid habit trackers:
* **Active State:** The user maintains a daily completion record.
* **Fractured State:** If a day is missed, the streak is not immediately destroyed. It enters a "Fractured" state (glowing amber warning UI). 
* **Restitution Protocol:** To repair a Fractured streak within 24 hours, the user must complete a significantly harder restitution challenge. If failed or ignored, the streak breaks completely.

### 4.2 Elo Rating & Corporate Hierarchy
Progress is tracked via a chess-style Elo rating (starting at 1200). 
* **Analyst** (< 1300)
* **Specialist** (1300 - 1499)
* **Technical Expert** (1500 - 1799)
* **Strategist / Advisory** (1800+)
As Elo increases, the AI evaluator's strictness scales dynamically.

### 4.3 Vocabulary Graveyard (Future Roadmap)
Basic words flagged by the AI are sent to the "Graveyard." Future iterations of the app will utilize Spaced Repetition (SRS) to actively force the user to deploy their C2 upgrades in subsequent prompts until they graduate to the "Arsenal."

## 5. Technical Specifications

### Tech Stack
* **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS
* **Backend:** Supabase (PostgreSQL) for user state and tracking
* **AI Engine:** Google AI Studio (Gemini 1.5 Flash) via `@google/generative-ai` SDK
* **Deployment:** Vercel (Edge network)

### State Management & Variables
The React frontend tracks several critical variables synchronized with Supabase:
* `elo` (Integer): The user's current ranking score.
* `streak` (Integer): Consecutive days of successful prompt completion.
* `status` (String): Determines the UI state -> `'active'`, `'fractured'`, `'broken'`.
* `result` (JSON Object): The AI's parsed response containing `score`, `feedback`, `upgraded_text`, and an array of `replaced_words`.

### Environment Variables
Required configuration in Vercel:
* `GEMINI_API_KEY`: Google Generative AI access key.
* `NEXT_PUBLIC_SUPABASE_URL`: Supabase project connection string.
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase client-safe public key.

### Database Schema (Supabase)
```sql
-- Profiles: Tracks progression, Elo, and the Elastic Streak
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name VARCHAR DEFAULT 'Admin',
    elo_rating INT DEFAULT 1200,
    current_streak INT DEFAULT 0,
    max_streak INT DEFAULT 0,
    streak_status VARCHAR DEFAULT 'active',
    last_completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vocabulary: The Graveyard/Arsenal tracking for Spaced Repetition
CREATE TABLE vocabulary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    basic_word VARCHAR NOT NULL,
    c2_upgrade VARCHAR NOT NULL,
    mastery_level INT DEFAULT 0, -- 0 = Graveyard, 3 = Arsenal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
