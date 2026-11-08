-- -- Verification script to check that all sync is working properly
-- -- Run this in SQL Editor to verify your setup

-- -- ============================================================================
-- -- STEP 1: Check all tables exist
-- -- ============================================================================

-- DO $$
-- DECLARE
--     missing_tables TEXT[] := ARRAY[]::TEXT[];
-- BEGIN
--     -- Check profiles
--     IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'profiles') THEN
--         missing_tables := array_append(missing_tables, 'profiles');
--     END IF;
    
--     -- Check user_inventory
--     IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_inventory') THEN
--         missing_tables := array_append(missing_tables, 'user_inventory');
--     END IF;
    
--     -- Check player_stats
--     IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'player_stats') THEN
--         missing_tables := array_append(missing_tables, 'player_stats');
--     END IF;
    
--     -- Check match_history
--     IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'match_history') THEN
--         missing_tables := array_append(missing_tables, 'match_history');
--     END IF;
    
--     -- Check card_skins
--     IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'card_skins') THEN
--         missing_tables := array_append(missing_tables, 'card_skins');
--     END IF;
    
--     -- Check game_rooms
--     IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'game_rooms') THEN
--         missing_tables := array_append(missing_tables, 'game_rooms');
--     END IF;
    
--     IF array_length(missing_tables, 1) > 0 THEN
--         RAISE EXCEPTION 'Missing tables: %', array_to_string(missing_tables, ', ');
--     ELSE
--         RAISE NOTICE '✓ All tables exist';
--     END IF;
-- END $$;

-- -- ============================================================================
-- -- STEP 2: Check RLS is enabled
-- -- ============================================================================

-- DO $$
-- DECLARE
--     tables_without_rls TEXT[] := ARRAY[]::TEXT[];
--     rec RECORD;
-- BEGIN
--     FOR rec IN 
--         SELECT tablename 
--         FROM pg_tables 
--         WHERE schemaname = 'public' 
--         AND tablename IN ('profiles', 'user_inventory', 'player_stats', 'match_history', 'card_skins', 'game_rooms')
--     LOOP
--         IF NOT EXISTS (
--             SELECT 1 FROM pg_tables 
--             WHERE schemaname = 'public' 
--             AND tablename = rec.tablename 
--             AND rowsecurity = true
--         ) THEN
--             tables_without_rls := array_append(tables_without_rls, rec.tablename);
--         END IF;
--     END LOOP;
    
--     IF array_length(tables_without_rls, 1) > 0 THEN
--         RAISE EXCEPTION 'RLS not enabled on: %', array_to_string(tables_without_rls, ', ');
--     ELSE
--         RAISE NOTICE '✓ RLS enabled on all tables';
--     END IF;
-- END $$;

-- -- ============================================================================
-- -- STEP 3: Check permissions are granted
-- -- ============================================================================

-- DO $$
-- DECLARE
--     missing_grants TEXT[] := ARRAY[]::TEXT[];
-- BEGIN
--     -- Check profiles
--     IF NOT has_table_privilege('authenticated', 'public.profiles', 'SELECT') THEN
--         missing_grants := array_append(missing_grants, 'profiles SELECT');
--     END IF;
    
--     -- Check user_inventory
--     IF NOT has_table_privilege('authenticated', 'public.user_inventory', 'SELECT') THEN
--         missing_grants := array_append(missing_grants, 'user_inventory SELECT');
--     END IF;
    
--     -- Check player_stats
--     IF NOT has_table_privilege('authenticated', 'public.player_stats', 'SELECT') THEN
--         missing_grants := array_append(missing_grants, 'player_stats SELECT');
--     END IF;
--     IF NOT has_table_privilege('authenticated', 'public.player_stats', 'UPDATE') THEN
--         missing_grants := array_append(missing_grants, 'player_stats UPDATE');
--     END IF;
    
--     -- Check match_history
--     IF NOT has_table_privilege('authenticated', 'public.match_history', 'SELECT') THEN
--         missing_grants := array_append(missing_grants, 'match_history SELECT');
--     END IF;
--     IF NOT has_table_privilege('authenticated', 'public.match_history', 'INSERT') THEN
--         missing_grants := array_append(missing_grants, 'match_history INSERT');
--     END IF;
    
--     IF array_length(missing_grants, 1) > 0 THEN
--         RAISE EXCEPTION 'Missing grants: %', array_to_string(missing_grants, ', ');
--     ELSE
--         RAISE NOTICE '✓ All required grants exist';
--     END IF;
-- END $$;

-- -- ============================================================================
-- -- STEP 4: Check functions exist
-- -- ============================================================================

-- DO $$
-- DECLARE
--     missing_functions TEXT[] := ARRAY[]::TEXT[];
-- BEGIN
--     IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
--         missing_functions := array_append(missing_functions, 'handle_new_user');
--     END IF;
    
--     IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'purchase_skin') THEN
--         missing_functions := array_append(missing_functions, 'purchase_skin');
--     END IF;
    
--     IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'equip_skin') THEN
--         missing_functions := array_append(missing_functions, 'equip_skin');
--     END IF;
    
--     IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'record_match') THEN
--         missing_functions := array_append(missing_functions, 'record_match');
--     END IF;
    
--     IF array_length(missing_functions, 1) > 0 THEN
--         RAISE EXCEPTION 'Missing functions: %', array_to_string(missing_functions, ', ');
--     ELSE
--         RAISE NOTICE '✓ All required functions exist';
--     END IF;
-- END $$;

-- -- ============================================================================
-- -- STEP 5: Check trigger exists
-- -- ============================================================================

-- DO $$
-- BEGIN
--     IF NOT EXISTS (
--         SELECT 1 FROM information_schema.triggers 
--         WHERE trigger_name = 'on_auth_user_created'
--     ) THEN
--         RAISE EXCEPTION 'Trigger on_auth_user_created does not exist';
--     ELSE
--         RAISE NOTICE '✓ Trigger on_auth_user_created exists';
--     END IF;
-- END $$;

-- -- ============================================================================
-- -- STEP 6: Check RLS policies exist
-- -- ============================================================================

-- DO $$
-- DECLARE
--     policy_count INT;
-- BEGIN
--     SELECT COUNT(*) INTO policy_count
--     FROM pg_policies
--     WHERE schemaname = 'public'
--     AND tablename IN ('profiles', 'user_inventory', 'player_stats', 'match_history');
    
--     IF policy_count < 10 THEN
--         RAISE WARNING 'Only % RLS policies found. Expected at least 10', policy_count;
--     ELSE
--         RAISE NOTICE '✓ RLS policies exist (% found)', policy_count;
--     END IF;
-- END $$;

-- -- ============================================================================
-- -- STEP 7: Summary Report
-- -- ============================================================================

-- SELECT 
--     'Tables' as category,
--     COUNT(*) as count,
--     array_agg(tablename ORDER BY tablename) as items
-- FROM pg_tables 
-- WHERE schemaname = 'public'
-- AND tablename IN ('profiles', 'user_inventory', 'player_stats', 'match_history', 'card_skins', 'game_rooms')

-- UNION ALL

-- SELECT 
--     'Functions' as category,
--     COUNT(*) as count,
--     array_agg(routine_name ORDER BY routine_name) as items
-- FROM information_schema.routines
-- WHERE routine_schema = 'public'
-- AND routine_name IN ('handle_new_user', 'purchase_skin', 'equip_skin', 'record_match', 'get_full_profile', 'get_leaderboard')

-- UNION ALL

-- SELECT 
--     'Triggers' as category,
--     COUNT(*) as count,
--     array_agg(trigger_name ORDER BY trigger_name) as items
-- FROM information_schema.triggers
-- WHERE trigger_schema = 'public'

-- UNION ALL

-- SELECT 
--     'RLS Policies' as category,
--     COUNT(*) as count,
--     array_agg(DISTINCT tablename ORDER BY tablename) as items
-- FROM pg_policies
-- WHERE schemaname = 'public';

-- -- ============================================================================
-- -- FINAL MESSAGE
-- -- ============================================================================

-- DO $$
-- BEGIN
--     RAISE NOTICE '';
--     RAISE NOTICE '════════════════════════════════════════════════════════════';
--     RAISE NOTICE '  Verification Complete!';
--     RAISE NOTICE '  If you see this message with no errors above,';
--     RAISE NOTICE '  your database is properly configured for syncing.';
--     RAISE NOTICE '════════════════════════════════════════════════════════════';
--     RAISE NOTICE '';
-- END $$;
