-- Create public.daily_directives table for Phase 2.1 Daily Directives System
CREATE TABLE IF NOT EXISTS public.daily_directives (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    directive_date DATE NOT NULL,
    template_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirement_type TEXT NOT NULL,
    target_value INTEGER NOT NULL DEFAULT 1,
    target_stat TEXT,
    current_value INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    reward_xp INTEGER NOT NULL DEFAULT 0,
    reward_coins INTEGER NOT NULL DEFAULT 0,
    reward_stat TEXT,
    reward_stat_amount INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT unique_user_directive_date UNIQUE (user_id, directive_date)
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_daily_directives_user_date ON public.daily_directives(user_id, directive_date);

-- Enable RLS
ALTER TABLE public.daily_directives ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their daily directives
CREATE POLICY "Users can manage their daily directives"
ON public.daily_directives
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Grant permissions
GRANT ALL ON TABLE public.daily_directives TO anon, authenticated, service_role;