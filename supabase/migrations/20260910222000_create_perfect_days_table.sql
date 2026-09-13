-- Create public.perfect_days table for Phase 2.2 Perfect Day System
CREATE TABLE IF NOT EXISTS public.perfect_days (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    perfect_date DATE NOT NULL,
    earned BOOLEAN NOT NULL DEFAULT FALSE,
    reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    reward_xp INTEGER NOT NULL DEFAULT 150,
    reward_coins INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    earned_at TIMESTAMPTZ,
    CONSTRAINT unique_user_perfect_date UNIQUE (user_id, perfect_date)
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_perfect_days_user_date ON public.perfect_days(user_id, perfect_date);

-- Enable Row Level Security strictly
ALTER TABLE public.perfect_days ENABLE ROW LEVEL SECURITY;

-- 1. SELECT: Authenticated users can ONLY view their own records
CREATE POLICY "Users can view their own perfect days"
ON public.perfect_days
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. INSERT: Authenticated users can ONLY insert their own records
CREATE POLICY "Users can insert their own perfect days"
ON public.perfect_days
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE: Authenticated users can ONLY update their own records
CREATE POLICY "Users can update their own perfect days"
ON public.perfect_days
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. DELETE: Authenticated users can ONLY delete their own records
CREATE POLICY "Users can delete their own perfect days"
ON public.perfect_days
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Grant privileges
GRANT ALL ON TABLE public.perfect_days TO anon, authenticated, service_role;

