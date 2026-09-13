-- ==========================================================
-- PHASE 2.3, PHASE 2.4 & PHASE 3 DATABASE MIGRATION
-- ==========================================================

-- 1. DAILY ACTIVITY RECORDS (Phase 2.3 Streak Calendar)
CREATE TABLE IF NOT EXISTS public.daily_activity_records (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    activity_date DATE NOT NULL,
    quests_completed INTEGER NOT NULL DEFAULT 0,
    directive_completed BOOLEAN NOT NULL DEFAULT FALSE,
    perfect_day_earned BOOLEAN NOT NULL DEFAULT FALSE,
    streak_count INTEGER NOT NULL DEFAULT 0,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    coins_earned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_activity_date UNIQUE (user_id, activity_date)
);
CREATE INDEX IF NOT EXISTS idx_daily_activity_records_user_date ON public.daily_activity_records(user_id, activity_date);

ALTER TABLE public.daily_activity_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity records"
ON public.daily_activity_records FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity records"
ON public.daily_activity_records FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity records"
ON public.daily_activity_records FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity records"
ON public.daily_activity_records FOR DELETE TO authenticated
USING (auth.uid() = user_id);


-- 2. PLAYER RANDOM EVENTS (Phase 2.4 Controlled Random Events)
CREATE TABLE IF NOT EXISTS public.player_random_events (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    template_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirement_type TEXT NOT NULL,
    target_value INTEGER NOT NULL DEFAULT 1,
    target_stat TEXT,
    current_value INTEGER NOT NULL DEFAULT 0,
    reward_xp INTEGER NOT NULL DEFAULT 50,
    reward_coins INTEGER NOT NULL DEFAULT 20,
    reward_stat TEXT,
    reward_stat_amount INTEGER NOT NULL DEFAULT 0,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expiry_time TIMESTAMPTZ NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_player_random_events_user ON public.player_random_events(user_id);

ALTER TABLE public.player_random_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own random events"
ON public.player_random_events FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own random events"
ON public.player_random_events FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own random events"
ON public.player_random_events FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own random events"
ON public.player_random_events FOR DELETE TO authenticated
USING (auth.uid() = user_id);


-- 3. PLAYER INVENTORY (Phase 3 Shared Inventory)
CREATE TABLE IF NOT EXISTS public.player_inventory (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    item_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 999),
    acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_item UNIQUE (user_id, item_id)
);
CREATE INDEX IF NOT EXISTS idx_player_inventory_user ON public.player_inventory(user_id);

ALTER TABLE public.player_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inventory"
ON public.player_inventory FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory"
ON public.player_inventory FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory"
ON public.player_inventory FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory"
ON public.player_inventory FOR DELETE TO authenticated
USING (auth.uid() = user_id);


-- 4. PLAYER EQUIPMENT (Phase 3 Equipment Slots)
CREATE TABLE IF NOT EXISTS public.player_equipment (
    user_id UUID PRIMARY KEY,
    weapon_item_id TEXT,
    armor_item_id TEXT,
    accessory_item_id TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.player_equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own equipment"
ON public.player_equipment FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own equipment"
ON public.player_equipment FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own equipment"
ON public.player_equipment FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own equipment"
ON public.player_equipment FOR DELETE TO authenticated
USING (auth.uid() = user_id);


-- 5. PLAYER TITLES (Phase 3 Titles Catalog Unlock)
CREATE TABLE IF NOT EXISTS public.player_titles (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    title_id TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_title UNIQUE (user_id, title_id)
);
CREATE INDEX IF NOT EXISTS idx_player_titles_user ON public.player_titles(user_id);

ALTER TABLE public.player_titles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own titles"
ON public.player_titles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own titles"
ON public.player_titles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own titles"
ON public.player_titles FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own titles"
ON public.player_titles FOR DELETE TO authenticated
USING (auth.uid() = user_id);


-- 6. PLAYER TITLE STATE (Phase 3 Currently Equipped Title)
CREATE TABLE IF NOT EXISTS public.player_title_state (
    user_id UUID PRIMARY KEY,
    equipped_title_id TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.player_title_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own title state"
ON public.player_title_state FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own title state"
ON public.player_title_state FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own title state"
ON public.player_title_state FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own title state"
ON public.player_title_state FOR DELETE TO authenticated
USING (auth.uid() = user_id);


-- 7. PLAYER LOADOUTS (Phase 3 Saved Equipment Loadouts)
CREATE TABLE IF NOT EXISTS public.player_loadouts (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    slot_number INTEGER NOT NULL CHECK (slot_number >= 1 AND slot_number <= 5),
    name TEXT NOT NULL,
    weapon_item_id TEXT,
    armor_item_id TEXT,
    accessory_item_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_loadout_slot UNIQUE (user_id, slot_number)
);
CREATE INDEX IF NOT EXISTS idx_player_loadouts_user ON public.player_loadouts(user_id);

ALTER TABLE public.player_loadouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loadouts"
ON public.player_loadouts FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loadouts"
ON public.player_loadouts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loadouts"
ON public.player_loadouts FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loadouts"
ON public.player_loadouts FOR DELETE TO authenticated
USING (auth.uid() = user_id);


-- Grant permissions to authenticated & service_role
GRANT ALL ON TABLE public.daily_activity_records TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.player_random_events TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.player_inventory TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.player_equipment TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.player_titles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.player_title_state TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.player_loadouts TO anon, authenticated, service_role;

