-- Lexicon Engine — Supabase setup
-- Run this in the Supabase SQL Editor (Role: postgres) to provision a fresh
-- project. It creates the schema, grants API-role privileges, enables RLS with
-- public policies, and seeds starter scenarios.
--
-- NOTE: Creating a table does NOT automatically grant the `anon`/`authenticated`
-- API roles access to it. Without the GRANTs below, the client receives
-- "permission denied for table ..." (Postgres error 42501) and the UI shows
-- "No protocols found." RLS policies alone are not sufficient — table-level
-- privileges must be granted too.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- Scenarios: the corporate prompts shown to the user.
CREATE TABLE IF NOT EXISTS scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_name VARCHAR NOT NULL,
    prompt_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles: progression, Elo, and the Elastic Streak.
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name VARCHAR DEFAULT 'Admin',
    elo_rating INT DEFAULT 1200,
    current_streak INT DEFAULT 0,
    max_streak INT DEFAULT 0,
    streak_status VARCHAR DEFAULT 'active',
    last_completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vocabulary: the Graveyard/Arsenal tracking for Spaced Repetition.
CREATE TABLE IF NOT EXISTS vocabulary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    basic_word VARCHAR NOT NULL,
    c2_upgrade VARCHAR NOT NULL,
    mastery_level INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Privileges (table-level GRANTs for the API roles)
-- ---------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.scenarios TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO anon, authenticated;
GRANT SELECT, INSERT ON public.vocabulary TO anon, authenticated;

-- Ensure future tables created by the postgres role also get privileges.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE ON TABLES TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read scenarios" ON scenarios;
CREATE POLICY "Public read scenarios" ON scenarios FOR SELECT USING (true);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read profiles" ON profiles;
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public update profiles" ON profiles;
CREATE POLICY "Public update profiles" ON profiles FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public insert profiles" ON profiles;
CREATE POLICY "Public insert profiles" ON profiles FOR INSERT WITH CHECK (true);

ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read vocabulary" ON vocabulary;
CREATE POLICY "Public read vocabulary" ON vocabulary FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert vocabulary" ON vocabulary;
CREATE POLICY "Public insert vocabulary" ON vocabulary FOR INSERT WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------

-- Default profile the API routes read/update (user_name = 'Admin').
INSERT INTO profiles (user_name) VALUES ('Admin')
ON CONFLICT DO NOTHING;

-- Starter scenarios.
INSERT INTO scenarios (track_name, prompt_text) VALUES
('Track A: Diagnostics', 'A flagship M-series device is experiencing aggressive thermal throttling under load, pointing to a potential heat sink or logic board failure. Draft a concise 3-sentence technical brief explaining the diagnostic protocol.'),
('Track B: Market Analysis', 'Articulate a fundamental analysis explaining why a leading foundry''s recent quarterly yields make it a stronger buy than its competitors in the AI semiconductor space, despite geopolitical volatility. You are forbidden from using the words "good", "bad", or "risk".'),
('Track C: Macro Policy', 'Draft the executive summary of a research brief analyzing the impact of export market diversification on reducing economic volatility in energy-dependent nations.'),
('Track D: Infrastructure', 'Explain the latency mitigation benefits of utilizing VLESS+Reality protocols over standard proxy configurations on a cloud virtual machine. Frame it for a non-technical stakeholder.'),
('Track E: Agri-Tech', 'Draft a technical proposal for implementing controlled-environment agriculture to optimize the cultivation of premium commodities. Focus specifically on the thermodynamic regulation required.');
