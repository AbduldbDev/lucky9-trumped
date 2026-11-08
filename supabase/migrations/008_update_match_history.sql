-- Update match_history table to track all players, not just winners
-- Add player_id and won fields to store every player's match result

-- Add new columns
ALTER TABLE public.match_history
ADD COLUMN IF NOT EXISTS player_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS won BOOLEAN DEFAULT false;

-- Update winner_id to be nullable (for losses)
ALTER TABLE public.match_history
ALTER COLUMN winner_id DROP NOT NULL;

-- Create index for player lookups
CREATE INDEX IF NOT EXISTS idx_match_history_player ON public.match_history(player_id, completed_at DESC);

-- Update RLS policies to allow users to see their own matches
DROP POLICY IF EXISTS "history_select_all" ON public.match_history;
CREATE POLICY "history_select_player" ON public.match_history
    FOR SELECT
    USING (auth.uid() = player_id OR auth.uid() = winner_id);

DROP POLICY IF EXISTS "history_insert_own" ON public.match_history;
CREATE POLICY "history_insert_own" ON public.match_history
    FOR INSERT
    WITH CHECK (auth.uid() = player_id);

-- Update match history function to handle new schema
CREATE OR REPLACE FUNCTION public.get_match_history(
    p_user_id UUID DEFAULT NULL,
    p_limit INT DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    match_code TEXT,
    winner_username TEXT,
    won BOOLEAN,
    total_rounds INT,
    duration_seconds INT,
    chips_rewarded INT,
    completed_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    -- If no user_id provided, use current user
    IF p_user_id IS NULL THEN
        p_user_id := auth.uid();
    END IF;
    
    RETURN QUERY
    SELECT 
        m.id,
        m.match_code::TEXT,
        CASE 
            WHEN m.winner_id IS NOT NULL THEN (SELECT p.username FROM public.profiles p WHERE p.id = m.winner_id)
            ELSE 'No Winner'
        END as winner_username,
        m.won,
        m.total_rounds,
        m.duration_seconds,
        m.chips_rewarded,
        m.completed_at
    FROM public.match_history m
    WHERE m.player_id = p_user_id
    ORDER BY m.completed_at DESC
    LIMIT p_limit;
END;
$$;

COMMENT ON COLUMN public.match_history.player_id IS 
'ID of the player whose match history this is. Every player gets a row.';

COMMENT ON COLUMN public.match_history.won IS 
'Whether this player won the match';
