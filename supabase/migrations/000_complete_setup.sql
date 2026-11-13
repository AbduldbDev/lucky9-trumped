-- Lucky 9: Complete Database Setup
-- Run this in Supabase SQL Editor if you want to set up everything at once
-- This combines all migrations into a single file for convenience
-- Safe to re-run: tables use IF NOT EXISTS, policies/functions are dropped or replaced.

-- ============================================================================
-- STEP 1: Extensions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 2: Tables
-- ============================================================================

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username        VARCHAR(20) UNIQUE NOT NULL,
    avatar_url      TEXT        DEFAULT 'default_avatar.png',
    chips           INT         DEFAULT 1000 CHECK (chips >= 0),
    level           INT         DEFAULT 1,
    current_rank    VARCHAR(30) DEFAULT 'Rookie',
    equipped_skin_id VARCHAR(50) DEFAULT 'default_green',
    table_color     VARCHAR(20) DEFAULT 'blue' CHECK (table_color IN ('green', 'purple', 'blue', 'red', 'black')),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- User cosmetic inventory
CREATE TABLE IF NOT EXISTS public.user_inventory (
    user_id      UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_id      VARCHAR(50) NOT NULL,
    item_type    VARCHAR(30) CHECK (item_type IN ('CARD_SKIN', 'TRUMP_SKIN', 'TABLE_BG', 'AVATAR_FRAME', 'NAME_EFFECT')),
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, item_id)
);

-- Player lifetime statistics
CREATE TABLE IF NOT EXISTS public.player_stats (
    user_id              UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    total_matches        INT  DEFAULT 0,
    total_wins           INT  DEFAULT 0,
    total_losses         INT  DEFAULT 0,
    current_win_streak   INT  DEFAULT 0,
    highest_win_streak   INT  DEFAULT 0,
    favorite_trump_card  VARCHAR(50) DEFAULT 'BET_UP'
);

-- Match history log
CREATE TABLE IF NOT EXISTS public.match_history (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    match_code       VARCHAR(10) NOT NULL,
    winner_id        UUID        REFERENCES public.profiles(id),
    total_rounds     INT         NOT NULL,
    duration_seconds INT         NOT NULL,
    chips_rewarded   INT         NOT NULL,
    completed_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Card skins catalog
CREATE TABLE IF NOT EXISTS public.card_skins (
    id       VARCHAR(50) PRIMARY KEY,
    name     TEXT        NOT NULL,
    rarity   TEXT        NOT NULL,
    price    INT         NOT NULL CHECK (price >= 0)
);

-- Insert default card skins

-- DELETE FROM public.card_skins;
INSERT INTO public.card_skins (id, name, rarity, price) VALUES
    -- COMMON
    ('classic_red', 'Default Card', 'COMMON', 0),
    ('common_red', 'Default Red', 'COMMON', 100),
    ('common_purple', 'Default Purple', 'COMMON', 100),
    ('common_yellow', 'Default Yellow', 'COMMON', 100),
    ('common_pink', 'Default Pink', 'COMMON', 100),
    ('common_blue', 'Default Blue', 'COMMON', 100),

    -- UNCOMMON
    ('the_devil', 'The Devil', 'UNCOMMON', 300),
    ('the_castle', 'The Castle', 'UNCOMMON', 300),

    -- RARE
    ('silent_origin', 'Silent Origin', 'RARE', 1000),
    ('azure_horizon', 'Azure Horizon', 'RARE', 1000),
    ('void_prism', 'Void Prism', 'RARE', 1000),
    ('solaris_prime', 'Solaris Prime', 'RARE', 1000),

    -- EPIC
    ('celestial_reverie', 'Celestial Reverie', 'LEGENDARY', 2000),
    ('velvet_moon', 'Eclipse of the Velvet Moon', 'LEGENDARY', 2000),
    ('heavenly_ascendance', 'Heavenly Ascendance', 'LEGENDARY', 2000),
    ('petal_whispers', 'Petal Whispers', 'LEGENDARY', 2000),

    -- LEGENDARY
    ('abyssal_sovereign', 'Abyssal Sovereign', 'MYTHIC', 3500),
    ('crimson_requiem', 'Crimson Requiem', 'MYTHIC', 3500),
    ('void_empero', 'Void Emperor', 'MYTHIC', 3500),
    ('obsidian_sovereign', 'Obsidian Sovereign', 'MYTHIC', 3500),
    ('eternal_void', 'Eternal Void', 'MYTHIC', 3500),
    ('celestial_ascension', 'Celestial Ascension', 'MYTHIC', 3500),
    ('abyssal_overlord', 'Abyssal Overlord', 'MYTHIC', 3500),
    ('celestial_dominion', 'Celestial Dominion', 'MYTHIC', 3500),
    ('eternal_ascendant', 'Eternal Ascendant', 'MYTHIC', 3500)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    rarity = EXCLUDED.rarity,
    price = EXCLUDED.price;



-- Game rooms table
CREATE TABLE IF NOT EXISTS public.game_rooms (
    party_code    VARCHAR(10) PRIMARY KEY,
    host_id       UUID,
    full_state    JSONB       NOT NULL,
    public_state  JSONB       NOT NULL,
    updated_at    TIMESTAMPTZ DEFAULT NOW(),
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: Enable Row Level Security
-- ============================================================================

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_history  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_skins     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rooms     ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: RLS Policies
-- ============================================================================

-- Profiles policies
-- NOTE: SELECT stays owner-only on purpose. Other players' public info
-- (name, rank, stats, equipped skin) is exposed through the
-- get_public_player_stats() function below, so private columns never leak.
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles 
    FOR SELECT 
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles 
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- User inventory policies
DROP POLICY IF EXISTS "inventory_select_own" ON public.user_inventory;
CREATE POLICY "inventory_select_own" ON public.user_inventory 
    FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "inventory_insert_own" ON public.user_inventory;
CREATE POLICY "inventory_insert_own" ON public.user_inventory 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Player stats policies
DROP POLICY IF EXISTS "stats_select_own" ON public.player_stats;
CREATE POLICY "stats_select_own" ON public.player_stats 
    FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "stats_insert_own" ON public.player_stats;
CREATE POLICY "stats_insert_own" ON public.player_stats 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "stats_update_own" ON public.player_stats;
CREATE POLICY "stats_update_own" ON public.player_stats 
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Match history policies
DROP POLICY IF EXISTS "history_select_own" ON public.match_history;
CREATE POLICY "history_select_own" ON public.match_history 
    FOR SELECT 
    USING (auth.uid() = winner_id);

-- Card skins policies
DROP POLICY IF EXISTS "skins_select_all" ON public.card_skins;
CREATE POLICY "skins_select_all" ON public.card_skins 
    FOR SELECT 
    USING (true);

-- Game rooms policies
DROP POLICY IF EXISTS "rooms_read_all" ON public.game_rooms;
CREATE POLICY "rooms_read_all" ON public.game_rooms 
    FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "rooms_write_all" ON public.game_rooms;
CREATE POLICY "rooms_write_all" ON public.game_rooms 
    FOR ALL
    USING (true) 
    WITH CHECK (true);

-- ============================================================================
-- STEP 5: Grant Permissions
-- ============================================================================

-- Grant SELECT permissions
GRANT SELECT ON public.profiles TO authenticated, anon;
GRANT SELECT ON public.user_inventory TO authenticated, anon;
GRANT SELECT ON public.player_stats TO authenticated, anon;
GRANT SELECT ON public.match_history TO authenticated, anon;
GRANT SELECT ON public.card_skins TO authenticated, anon;
GRANT SELECT ON public.game_rooms TO authenticated, anon;

-- Grant INSERT permissions
GRANT INSERT ON public.profiles TO authenticated;
GRANT INSERT ON public.user_inventory TO authenticated;
GRANT INSERT ON public.player_stats TO authenticated;
GRANT INSERT ON public.game_rooms TO authenticated, anon;

-- Grant UPDATE permissions
GRANT UPDATE (username, avatar_url, equipped_skin_id) ON public.profiles TO authenticated;
GRANT UPDATE ON public.player_stats TO authenticated;
GRANT UPDATE ON public.game_rooms TO authenticated, anon;

-- Grant DELETE permissions
GRANT DELETE ON public.game_rooms TO authenticated, anon;

-- ============================================================================
-- STEP 6: Functions
-- ============================================================================

-- New user bootstrap function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_username TEXT;
BEGIN
    -- Get username from metadata or generate one
    v_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        'player_' || substr(replace(NEW.id::text, '-', ''), 1, 8)
    );
    
    -- Insert profile with error handling
    BEGIN
        INSERT INTO public.profiles (id, username, chips)
        VALUES (NEW.id, v_username, 1000);
    EXCEPTION 
        WHEN unique_violation THEN
            -- Profile already exists, skip
            RAISE NOTICE 'Profile already exists for user %', NEW.id;
    END;
    
    -- Insert default card skin with error handling
    BEGIN
        INSERT INTO public.user_inventory (user_id, item_id, item_type)
        VALUES (NEW.id, 'classic_red', 'CARD_SKIN');
    EXCEPTION 
        WHEN unique_violation THEN
            -- Already has this item, skip
            RAISE NOTICE 'Inventory already exists for user %', NEW.id;
    END;
    
    -- Insert stats with error handling
    BEGIN
        INSERT INTO public.player_stats (user_id) 
        VALUES (NEW.id);
    EXCEPTION 
        WHEN unique_violation THEN
            -- Stats already exist, skip
            RAISE NOTICE 'Stats already exist for user %', NEW.id;
    END;
    
    RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Purchase skin function
CREATE OR REPLACE FUNCTION public.purchase_skin(p_item_id TEXT)
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_price INT;
    v_chips INT;
BEGIN
    SELECT price INTO v_price FROM public.card_skins WHERE id = p_item_id;
    IF v_price IS NULL THEN RAISE EXCEPTION 'Unknown skin'; END IF;
    
    IF EXISTS (
        SELECT 1 FROM public.user_inventory
        WHERE user_id = auth.uid() AND item_id = p_item_id
    ) THEN RAISE EXCEPTION 'Already owned'; END IF;

    UPDATE public.profiles SET chips = chips - v_price
    WHERE id = auth.uid() RETURNING chips INTO v_chips;
    
    INSERT INTO public.user_inventory (user_id, item_id, item_type)
    VALUES (auth.uid(), p_item_id, 'CARD_SKIN');
    
    RETURN v_chips;
END;
$$;

-- Equip skin function
CREATE OR REPLACE FUNCTION public.equip_skin(p_item_id TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.user_inventory
        WHERE user_id = auth.uid() AND item_id = p_item_id
    ) THEN RAISE EXCEPTION 'Item not owned'; END IF;
    
    UPDATE public.profiles SET equipped_skin_id = p_item_id WHERE id = auth.uid();
END;
$$;

-- Record match function
CREATE OR REPLACE FUNCTION public.record_match(
    p_won     BOOLEAN,
    p_chips   INT,
    p_trumps  INT,
    p_naturals INT
) RETURNS INT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_chips INT;
BEGIN
    UPDATE public.player_stats SET
        total_matches  = total_matches + 1,
        total_wins     = total_wins    + CASE WHEN p_won THEN 1 ELSE 0 END,
        total_losses   = total_losses  + CASE WHEN p_won THEN 0 ELSE 1 END,
        current_win_streak  = CASE WHEN p_won THEN current_win_streak + 1 ELSE 0 END,
        highest_win_streak  = GREATEST(
            highest_win_streak,
            CASE WHEN p_won THEN current_win_streak + 1 ELSE current_win_streak END
        )
    WHERE user_id = auth.uid();

    UPDATE public.profiles
    SET chips = chips + LEAST(GREATEST(p_chips, 0), 240)
    WHERE id = auth.uid()
    RETURNING chips INTO v_chips;

    RETURN v_chips;
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.purchase_skin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.equip_skin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_match(BOOLEAN, INT, INT, INT) TO authenticated;

-- ============================================================================
-- STEP 7: Revoke unnecessary permissions
-- ============================================================================

-- Clients may only update specific fields directly
REVOKE UPDATE ON public.profiles FROM authenticated, anon;
GRANT UPDATE (username, avatar_url, equipped_skin_id) ON public.profiles TO authenticated;

-- ============================================================================
-- DONE!
-- ============================================================================
-- Your database is now fully configured for Lucky 9: Trump Card Edition
-- Make sure to disable email confirmation in Authentication → Settings


-- ============================================================================
-- FUNCTION: Get Public Player Stats (used by OpponentStatsModal)
-- ============================================================================
-- Lets any logged-in player view another player's PUBLIC info without
-- opening up SELECT on the whole profiles / player_stats tables.
-- Fixes: 406 / PGRST116 "The result contains 0 rows" caused by RLS
-- hiding other players' profile rows.

CREATE OR REPLACE FUNCTION public.get_public_player_stats(p_user_id UUID)
RETURNS TABLE (
    username            VARCHAR,
    chips               INT,
    level               INT,
    current_rank        VARCHAR,
    equipped_skin_id    VARCHAR,
    total_matches       INT,
    total_wins          INT,
    total_losses        INT,
    current_win_streak  INT,
    highest_win_streak  INT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        p.username,
        p.chips,
        p.level,
        p.current_rank,
        p.equipped_skin_id,
        COALESCE(s.total_matches, 0),
        COALESCE(s.total_wins, 0),
        COALESCE(s.total_losses, 0),
        COALESCE(s.current_win_streak, 0),
        COALESCE(s.highest_win_streak, 0)
    FROM public.profiles p
    LEFT JOIN public.player_stats s ON s.user_id = p.id
    WHERE p.id = p_user_id;
$$;

REVOKE ALL ON FUNCTION public.get_public_player_stats(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_player_stats(UUID) TO authenticated;


-- ============================================================================
-- FUNCTION: Get Leaderboard (Top Players by Win Rate)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_leaderboard(p_limit INT DEFAULT 10)
RETURNS TABLE (
    user_id         UUID,
    username        VARCHAR,
    avatar_url      TEXT,
    level           INT,
    current_rank    VARCHAR,
    total_matches   INT,
    total_wins      INT,
    total_losses    INT,
    win_rate        NUMERIC,
    highest_win_streak INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS user_id,
        p.username,
        p.avatar_url,
        p.level,
        p.current_rank,
        COALESCE(s.total_matches, 0) AS total_matches,
        COALESCE(s.total_wins, 0) AS total_wins,
        COALESCE(s.total_losses, 0) AS total_losses,
        CASE 
            WHEN COALESCE(s.total_matches, 0) > 0 
            THEN ROUND((COALESCE(s.total_wins, 0)::NUMERIC / s.total_matches::NUMERIC) * 100, 2)
            ELSE 0
        END AS win_rate,
        COALESCE(s.highest_win_streak, 0) AS highest_win_streak
    FROM public.profiles p
    LEFT JOIN public.player_stats s ON p.id = s.user_id
    WHERE COALESCE(s.total_matches, 0) >= 5  -- Only players with at least 5 matches
    ORDER BY win_rate DESC, total_wins DESC, total_matches ASC
    LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_leaderboard(INT) TO authenticated;