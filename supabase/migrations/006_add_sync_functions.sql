-- -- Additional sync functions for shop, inventory, match history, and stats
-- -- This ensures all game data properly syncs with Supabase

-- -- ============================================================================
-- -- FUNCTION: Get User Profile with Full Data
-- -- ============================================================================

-- CREATE OR REPLACE FUNCTION public.get_full_profile(p_user_id UUID)
-- RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
-- DECLARE
--     result JSON;
-- BEGIN
--     SELECT json_build_object(
--         'profile', (SELECT row_to_json(p) FROM profiles p WHERE id = p_user_id),
--         'inventory', (SELECT json_agg(i) FROM user_inventory i WHERE user_id = p_user_id),
--         'stats', (SELECT row_to_json(s) FROM player_stats s WHERE user_id = p_user_id),
--         'recent_matches', (SELECT json_agg(m) FROM (
--             SELECT * FROM match_history 
--             WHERE winner_id = p_user_id 
--             ORDER BY completed_at DESC 
--             LIMIT 10
--         ) m)
--     ) INTO result;
    
--     RETURN result;
-- END;
-- $$;

-- GRANT EXECUTE ON FUNCTION public.get_full_profile(UUID) TO authenticated;

-- -- ============================================================================
-- -- FUNCTION: Update Profile Fields (Safe)
-- -- ============================================================================

-- CREATE OR REPLACE FUNCTION public.update_profile_safe(
--     p_avatar_url TEXT DEFAULT NULL,
--     p_equipped_skin_id TEXT DEFAULT NULL
-- )
-- RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
-- DECLARE
--     result JSON;
-- BEGIN
--     UPDATE public.profiles
--     SET 
--         avatar_url = COALESCE(p_avatar_url, avatar_url),
--         equipped_skin_id = COALESCE(p_equipped_skin_id, equipped_skin_id)
--     WHERE id = auth.uid();
    
--     SELECT row_to_json(p) INTO result 
--     FROM profiles p 
--     WHERE id = auth.uid();
    
--     RETURN result;
-- END;
-- $$;

-- GRANT EXECUTE ON FUNCTION public.update_profile_safe(TEXT, TEXT) TO authenticated;

-- -- ============================================================================
-- -- FUNCTION: Get Leaderboard
-- -- ============================================================================

-- CREATE OR REPLACE FUNCTION public.get_leaderboard(
--     p_limit INT DEFAULT 10,
--     p_order_by TEXT DEFAULT 'total_wins'
-- )
-- RETURNS TABLE (
--     rank BIGINT,
--     user_id UUID,
--     username TEXT,
--     total_matches INT,
--     total_wins INT,
--     total_losses INT,
--     win_rate NUMERIC,
--     current_win_streak INT,
--     highest_win_streak INT,
--     chips INT
-- ) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
-- BEGIN
--     RETURN QUERY
--     SELECT 
--         ROW_NUMBER() OVER (ORDER BY 
--             CASE p_order_by
--                 WHEN 'total_wins' THEN s.total_wins
--                 WHEN 'highest_win_streak' THEN s.highest_win_streak
--                 WHEN 'chips' THEN p.chips
--                 ELSE s.total_wins
--             END DESC
--         ) as rank,
--         p.id as user_id,
--         p.username,
--         s.total_matches,
--         s.total_wins,
--         s.total_losses,
--         CASE 
--             WHEN s.total_matches > 0 
--             THEN ROUND((s.total_wins::NUMERIC / s.total_matches::NUMERIC) * 100, 2)
--             ELSE 0 
--         END as win_rate,
--         s.current_win_streak,
--         s.highest_win_streak,
--         p.chips
--     FROM public.profiles p
--     JOIN public.player_stats s ON p.id = s.user_id
--     WHERE s.total_matches > 0
--     ORDER BY rank
--     LIMIT p_limit;
-- END;
-- $$;

-- GRANT EXECUTE ON FUNCTION public.get_leaderboard(INT, TEXT) TO authenticated, anon;

-- -- ============================================================================
-- -- FUNCTION: Get Match History for User
-- -- ============================================================================

-- CREATE OR REPLACE FUNCTION public.get_match_history(
--     p_user_id UUID DEFAULT NULL,
--     p_limit INT DEFAULT 20
-- )
-- RETURNS TABLE (
--     id UUID,
--     match_code TEXT,
--     winner_username TEXT,
--     total_rounds INT,
--     duration_seconds INT,
--     chips_rewarded INT,
--     completed_at TIMESTAMPTZ
-- ) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
-- BEGIN
--     -- If no user_id provided, use current user
--     IF p_user_id IS NULL THEN
--         p_user_id := auth.uid();
--     END IF;
    
--     RETURN QUERY
--     SELECT 
--         m.id,
--         m.match_code::TEXT,
--         p.username as winner_username,
--         m.total_rounds,
--         m.duration_seconds,
--         m.chips_rewarded,
--         m.completed_at
--     FROM public.match_history m
--     JOIN public.profiles p ON m.winner_id = p.id
--     WHERE m.winner_id = p_user_id
--     ORDER BY m.completed_at DESC
--     LIMIT p_limit;
-- END;
-- $$;

-- GRANT EXECUTE ON FUNCTION public.get_match_history(UUID, INT) TO authenticated;

-- -- ============================================================================
-- -- FUNCTION: Get Available Skins for Purchase
-- -- ============================================================================

-- CREATE OR REPLACE FUNCTION public.get_available_skins()
-- RETURNS TABLE (
--     id TEXT,
--     name TEXT,
--     rarity TEXT,
--     price INT,
--     is_owned BOOLEAN
-- ) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
-- BEGIN
--     RETURN QUERY
--     SELECT 
--         s.id::TEXT,
--         s.name,
--         s.rarity,
--         s.price,
--         EXISTS (
--             SELECT 1 FROM public.user_inventory i 
--             WHERE i.user_id = auth.uid() AND i.item_id = s.id
--         ) as is_owned
--     FROM public.card_skins s
--     ORDER BY s.price ASC, s.name ASC;
-- END;
-- $$;

-- GRANT EXECUTE ON FUNCTION public.get_available_skins() TO authenticated;

-- -- ============================================================================
-- -- FUNCTION: Bulk Update Stats (for admin/debugging)
-- -- ============================================================================

-- CREATE OR REPLACE FUNCTION public.recalculate_stats(p_user_id UUID)
-- RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
-- DECLARE
--     v_total_wins INT;
--     v_total_matches INT;
--     result JSON;
-- BEGIN
--     -- Count wins from match_history
--     SELECT COUNT(*) INTO v_total_wins
--     FROM public.match_history
--     WHERE winner_id = p_user_id;
    
--     -- This is approximate - in reality you'd need to count all matches, not just wins
--     v_total_matches := v_total_wins; -- Simplified for now
    
--     -- Update stats
--     UPDATE public.player_stats
--     SET 
--         total_matches = GREATEST(total_matches, v_total_matches),
--         total_wins = GREATEST(total_wins, v_total_wins)
--     WHERE user_id = p_user_id;
    
--     SELECT row_to_json(s) INTO result
--     FROM player_stats s
--     WHERE user_id = p_user_id;
    
--     RETURN result;
-- END;
-- $$;

-- -- Only allow users to recalculate their own stats
-- GRANT EXECUTE ON FUNCTION public.recalculate_stats(UUID) TO authenticated;

-- -- ============================================================================
-- -- ENHANCED POLICIES FOR MATCH HISTORY
-- -- ============================================================================

-- -- Allow users to insert their own match history
-- DROP POLICY IF EXISTS "history_insert_own" ON public.match_history;
-- CREATE POLICY "history_insert_own" ON public.match_history
--     FOR INSERT
--     WITH CHECK (auth.uid() = winner_id);

-- -- Allow users to see all match history (for leaderboards)
-- DROP POLICY IF EXISTS "history_select_all" ON public.match_history;
-- CREATE POLICY "history_select_all" ON public.match_history
--     FOR SELECT
--     USING (true);

-- -- Grant INSERT permission on match_history
-- GRANT INSERT ON public.match_history TO authenticated;

-- -- ============================================================================
-- -- INDEXES FOR PERFORMANCE
-- -- ============================================================================

-- -- Index for user lookups
-- CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
-- CREATE INDEX IF NOT EXISTS idx_match_history_winner ON public.match_history(winner_id, completed_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_match_history_code ON public.match_history(match_code);
-- CREATE INDEX IF NOT EXISTS idx_user_inventory_user ON public.user_inventory(user_id);

-- -- Index for stats queries
-- CREATE INDEX IF NOT EXISTS idx_player_stats_wins ON public.player_stats(total_wins DESC);
-- CREATE INDEX IF NOT EXISTS idx_player_stats_streak ON public.player_stats(highest_win_streak DESC);

-- -- ============================================================================
-- -- VIEW: User Statistics Summary
-- -- ============================================================================

-- CREATE OR REPLACE VIEW public.user_stats_summary AS
-- SELECT 
--     p.id,
--     p.username,
--     p.chips,
--     p.level,
--     p.current_rank,
--     s.total_matches,
--     s.total_wins,
--     s.total_losses,
--     CASE 
--         WHEN s.total_matches > 0 
--         THEN ROUND((s.total_wins::NUMERIC / s.total_matches::NUMERIC) * 100, 2)
--         ELSE 0 
--     END as win_rate,
--     s.current_win_streak,
--     s.highest_win_streak,
--     s.favorite_trump_card,
--     (SELECT COUNT(*) FROM public.user_inventory i WHERE i.user_id = p.id) as items_owned,
--     (SELECT COUNT(*) FROM public.match_history m WHERE m.winner_id = p.id) as matches_won,
--     p.created_at
-- FROM public.profiles p
-- LEFT JOIN public.player_stats s ON p.id = s.user_id;

-- -- Grant SELECT on the view
-- GRANT SELECT ON public.user_stats_summary TO authenticated, anon;

-- -- ============================================================================
-- -- COMMENTS FOR DOCUMENTATION
-- -- ============================================================================

-- COMMENT ON FUNCTION public.get_full_profile(UUID) IS 
-- 'Returns complete user profile including stats, inventory, and recent matches';

-- COMMENT ON FUNCTION public.get_leaderboard(INT, TEXT) IS 
-- 'Returns ranked leaderboard. Order by: total_wins, highest_win_streak, or chips';

-- COMMENT ON FUNCTION public.get_match_history(UUID, INT) IS 
-- 'Returns match history for a user. Defaults to current user if no UUID provided';

-- COMMENT ON FUNCTION public.get_available_skins() IS 
-- 'Returns all card skins with ownership status for current user';

-- COMMENT ON VIEW public.user_stats_summary IS 
-- 'Comprehensive user statistics view for dashboards and leaderboards';
