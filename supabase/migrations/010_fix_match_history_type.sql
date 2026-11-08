-- Fix get_match_history function return type mismatch
-- match_code is VARCHAR(10) in table but function was returning TEXT

DROP FUNCTION IF EXISTS public.get_match_history(UUID, INT);

CREATE OR REPLACE FUNCTION public.get_match_history(
    p_user_id UUID DEFAULT NULL,
    p_limit INT DEFAULT 20
)
RETURNS TABLE (
    match_id UUID,
    match_code VARCHAR,
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
        m.id as match_id,
        m.match_code,
        CASE 
            WHEN m.winner_id IS NOT NULL THEN (
                SELECT p.username 
                FROM public.profiles p 
                WHERE p.id = m.winner_id
            )
            ELSE 'No Winner'
        END as winner_username,
        COALESCE(m.won, false) as won,
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

GRANT EXECUTE ON FUNCTION public.get_match_history(UUID, INT) TO authenticated;

COMMENT ON FUNCTION public.get_match_history(UUID, INT) IS 
'Returns match history for a user with win/loss status. Defaults to current user if no UUID provided';
