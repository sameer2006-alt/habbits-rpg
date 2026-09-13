-- ==========================================================
-- PHASE 4.1: WEEKLY CHALLENGES MIGRATION
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.weekly_challenges (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    template_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
    current_progress NUMERIC NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    reward_xp INTEGER NOT NULL DEFAULT 0,
    reward_coins INTEGER NOT NULL DEFAULT 0,
    reward_item_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT unique_user_week_start UNIQUE (user_id, week_start)
);

-- Indices for rapid querying
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_user_week ON public.weekly_challenges(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_user ON public.weekly_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_completed ON public.weekly_challenges(completed);

-- Row Level Security (RLS)
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

-- 1. SELECT: Users can only view their own weekly challenges
CREATE POLICY "Users can view their own weekly challenges"
ON public.weekly_challenges FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 2. INSERT: Users can only insert their own weekly challenges
CREATE POLICY "Users can insert their own weekly challenges"
ON public.weekly_challenges FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE: Users can only update their own weekly challenges
CREATE POLICY "Users can update their own weekly challenges"
ON public.weekly_challenges FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. DELETE: Users can only delete their own weekly challenges
CREATE POLICY "Users can delete their own weekly challenges"
ON public.weekly_challenges FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Permissions
GRANT ALL ON TABLE public.weekly_challenges TO anon, authenticated, service_role;
