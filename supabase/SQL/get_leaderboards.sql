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
    WHERE 
        COALESCE(s.total_matches, 0) >= 5
        AND p.username NOT LIKE 'DevAccount%'
    ORDER BY win_rate DESC, total_wins DESC, total_matches ASC
    LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_leaderboard(INT) TO authenticated;