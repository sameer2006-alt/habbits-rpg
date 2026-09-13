-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can manage their daily directives" ON public.daily_directives;
DROP POLICY IF EXISTS "Users can view their own daily directives" ON public.daily_directives;
DROP POLICY IF EXISTS "Users can insert their own daily directives" ON public.daily_directives;
DROP POLICY IF EXISTS "Users can update their own daily directives" ON public.daily_directives;

-- Enable RLS strictly
ALTER TABLE public.daily_directives ENABLE ROW LEVEL SECURITY;

-- 1. SELECT: Authenticated users can ONLY select their own rows
CREATE POLICY "Users can view their own daily directives"
ON public.daily_directives
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. INSERT: Authenticated users can ONLY insert rows where user_id matches auth.uid()
CREATE POLICY "Users can insert their own daily directives"
ON public.daily_directives
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE: Authenticated users can ONLY update their own rows
CREATE POLICY "Users can update their own daily directives"
ON public.daily_directives
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. DELETE: Authenticated users can ONLY delete their own rows
CREATE POLICY "Users can delete their own daily directives"
ON public.daily_directives
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);