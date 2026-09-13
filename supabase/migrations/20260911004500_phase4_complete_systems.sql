-- ====================================================================
-- PHASE 4 DATABASE MIGRATION
-- Systems: Monthly Challenges, 15-Day Seasons, Personal Records
-- ====================================================================

-- 1. MONTHLY CHALLENGES TABLE (Phase 4.2)
CREATE TABLE IF NOT EXISTS public.monthly_challenges (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month_start DATE NOT NULL,
    month_end DATE NOT NULL,
    template_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    reward_xp INTEGER NOT NULL DEFAULT 0,
    reward_coins INTEGER NOT NULL DEFAULT 0,
    reward_item_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT monthly_challenges_user_month_unique UNIQUE (user_id, month_start)
);

CREATE INDEX IF NOT EXISTS idx_monthly_challenges_user_month 
ON public.monthly_challenges(user_id, month_start);

ALTER TABLE public.monthly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own monthly challenges"
    ON public.monthly_challenges FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monthly challenges"
    ON public.monthly_challenges FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly challenges"
    ON public.monthly_challenges FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly challenges"
    ON public.monthly_challenges FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


-- 2. PLAYER SEASONS TABLE (Phase 4.3 15-Day Seasons)
CREATE TABLE IF NOT EXISTS public.player_seasons (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    season_id TEXT NOT NULL,
    season_xp INTEGER NOT NULL DEFAULT 0,
    season_level INTEGER NOT NULL DEFAULT 1,
    milestones_claimed JSONB NOT NULL DEFAULT '[]'::jsonb,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT player_seasons_user_season_unique UNIQUE (user_id, season_id)
);

CREATE INDEX IF NOT EXISTS idx_player_seasons_user_season 
ON public.player_seasons(user_id, season_id);

ALTER TABLE public.player_seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own seasons"
    ON public.player_seasons FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own seasons"
    ON public.player_seasons FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own seasons"
    ON public.player_seasons FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own seasons"
    ON public.player_seasons FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


-- 3. PLAYER RECORDS TABLE (Phase 4.4 Personal Records)
CREATE TABLE IF NOT EXISTS public.player_records (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    record_type TEXT NOT NULL,
    record_value NUMERIC NOT NULL DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT player_records_user_type_unique UNIQUE (user_id, record_type)
);

CREATE INDEX IF NOT EXISTS idx_player_records_user_type 
ON public.player_records(user_id, record_type);

ALTER TABLE public.player_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own records"
    ON public.player_records FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own records"
    ON public.player_records FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own records"
    ON public.player_records FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own records"
    ON public.player_records FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
