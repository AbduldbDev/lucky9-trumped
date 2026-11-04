-- Lucky 9: Trump Card Edition — Supabase schema
-- SRD §9 compliant.
-- Run in Supabase → SQL Editor (or `supabase db push`).
-- Also enable: Authentication → Providers → "Allow anonymous sign-ins".

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ─── 1. Profiles & Currency ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username        VARCHAR(20) UNIQUE NOT NULL,
    avatar_url      TEXT        DEFAULT 'default_avatar.png',
    chips           INT         DEFAULT 0 CHECK (chips >= 0),   -- SRD: STARTING_CHIPS = 0
    level           INT         DEFAULT 1,
    current_rank    VARCHAR(30) DEFAULT 'Rookie',
    equipped_skin_id VARCHAR(50) DEFAULT 'default_green',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. User Cosmetic Inventory ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_inventory (
    user_id      UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_id      VARCHAR(50) NOT NULL,
    item_type    VARCHAR(30) CHECK (item_type IN ('CARD_SKIN', 'TRUMP_SKIN', 'TABLE_BG', 'AVATAR_FRAME', 'NAME_EFFECT')),
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, item_id)
);

-- ─── 3. Player Lifetime Statistics ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.player_stats (
    user_id              UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    total_matches        INT  DEFAULT 0,
    total_wins           INT  DEFAULT 0,
    total_losses         INT  DEFAULT 0,
    current_win_streak   INT  DEFAULT 0,
    highest_win_streak   INT  DEFAULT 0,
    favorite_trump_card  VARCHAR(50) DEFAULT 'BET_UP'
);

-- ─── 4. Match History Log ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.match_history (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    match_code       VARCHAR(10) NOT NULL,
    winner_id        UUID        REFERENCES public.profiles(id),
    total_rounds     INT         NOT NULL,
    duration_seconds INT         NOT NULL,
    chips_rewarded   INT         NOT NULL,
    completed_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. Card Skins Catalog (server-side price authority) ─────────────────────
CREATE TABLE IF NOT EXISTS public.card_skins (
    id       VARCHAR(50) PRIMARY KEY,
    name     TEXT        NOT NULL,
    rarity   TEXT        NOT NULL,
    price    INT         NOT NULL CHECK (price >= 0)
);

INSERT INTO public.card_skins (id, name, rarity, price) VALUES
    ('classic_red',    'Classic Velvet Red',   'Common',    0),
    ('cyberpunk_neon', 'Cyberpunk Neon',       'Rare',      500),
    ('dragon_gold',    'Imperial Dragon Gold', 'Legendary', 1500)
ON CONFLICT (id) DO NOTHING;

-- ─── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_history  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_skins     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own"   ON public.profiles;
CREATE POLICY "profiles_select_own"   ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update_own"   ON public.profiles;
CREATE POLICY "profiles_update_own"   ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "inventory_select_own"  ON public.user_inventory;
CREATE POLICY "inventory_select_own"  ON public.user_inventory FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "stats_select_own"      ON public.player_stats;
CREATE POLICY "stats_select_own"      ON public.player_stats FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "history_select_own"    ON public.match_history;
CREATE POLICY "history_select_own"    ON public.match_history FOR SELECT USING (auth.uid() = winner_id);

DROP POLICY IF EXISTS "skins_select_all"      ON public.card_skins;
CREATE POLICY "skins_select_all"      ON public.card_skins FOR SELECT USING (true);

-- Clients may only update display name / avatar directly.
-- Chips and stats change only through SECURITY DEFINER functions.
REVOKE UPDATE ON public.profiles FROM authenticated, anon;
GRANT  UPDATE (username, avatar_url) ON public.profiles TO authenticated;

-- ─── New-User Bootstrap ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username',
                 'player_' || substr(replace(NEW.id::text, '-', ''), 1, 8))
    );
    -- Default free card skin
    INSERT INTO public.user_inventory (user_id, item_id, item_type)
    VALUES (NEW.id, 'classic_red', 'CARD_SKIN');
    INSERT INTO public.player_stats (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Shop RPCs ───────────────────────────────────────────────────────────────
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

    -- CHECK (chips >= 0) rejects update if balance is insufficient.
    UPDATE public.profiles SET chips = chips - v_price
    WHERE id = auth.uid() RETURNING chips INTO v_chips;
    INSERT INTO public.user_inventory (user_id, item_id, item_type)
    VALUES (auth.uid(), p_item_id, 'CARD_SKIN');
    RETURN v_chips;
END;
$$;

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

-- SRD §1: winners earn 100–120 chips per match.
-- Client-reported result; coin cap (240 per call) limits abuse.
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

GRANT EXECUTE ON FUNCTION public.purchase_skin(TEXT)                     TO authenticated;
GRANT EXECUTE ON FUNCTION public.equip_skin(TEXT)                        TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_match(BOOLEAN, INT, INT, INT)    TO authenticated;
