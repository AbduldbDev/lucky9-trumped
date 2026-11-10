-- ============================================================================
-- Public player stats (used by OpponentStatsModal)
-- ============================================================================
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
-- Leaderboard (safer version)
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
    WHERE COALESCE(s.total_matches, 0) >= 5
    ORDER BY win_rate DESC, total_wins DESC, total_matches ASC
    LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_leaderboard(INT) TO authenticated;