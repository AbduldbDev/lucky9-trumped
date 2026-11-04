-- Lucky 9: Game room state persistence
-- Stores the full game state so players can refresh without losing their session.
-- The host owns the full_state; guests read public_state (masked).

CREATE TABLE IF NOT EXISTS public.game_rooms (
    party_code    VARCHAR(10) PRIMARY KEY,
    host_id       UUID,
    full_state    JSONB       NOT NULL,
    public_state  JSONB       NOT NULL,
    updated_at    TIMESTAMPTZ DEFAULT NOW(),
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;

-- Anyone who knows the party code can read the room.
-- public_state is masked (no deck, no hidden cards, no trumps).
-- full_state contains secrets but is only read by the host client-side.
DROP POLICY IF EXISTS "rooms_read_all"   ON public.game_rooms;
CREATE POLICY "rooms_read_all"   ON public.game_rooms FOR SELECT USING (true);

-- Anyone can insert/update/delete (the host drives writes;
-- guests only read).  RLS is permissive for simplicity.
DROP POLICY IF EXISTS "rooms_write_all"  ON public.game_rooms;
CREATE POLICY "rooms_write_all"  ON public.game_rooms FOR ALL
    USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_rooms TO authenticated, anon;
