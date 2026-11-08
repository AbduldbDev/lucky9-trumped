-- -- Fix the handle_new_user trigger to handle errors gracefully
-- -- This ensures profiles are created even if the trigger fails partially

-- -- Drop existing trigger
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- -- Recreate function with better error handling
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
-- DECLARE
--     v_username TEXT;
-- BEGIN
--     -- Get username from metadata or generate one
--     v_username := COALESCE(
--         NEW.raw_user_meta_data->>'username',
--         'player_' || substr(replace(NEW.id::text, '-', ''), 1, 8)
--     );
    
--     -- Insert profile with error handling
--     BEGIN
--         INSERT INTO public.profiles (id, username, chips)
--         VALUES (NEW.id, v_username, 1000);
--     EXCEPTION 
--         WHEN unique_violation THEN
--             -- Profile already exists, skip
--             RAISE NOTICE 'Profile already exists for user %', NEW.id;
--         WHEN OTHERS THEN
--             -- Log other errors but don't fail
--             RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
--     END;
    
--     -- Insert default card skin with error handling
--     BEGIN
--         INSERT INTO public.user_inventory (user_id, item_id, item_type)
--         VALUES (NEW.id, 'classic_red', 'CARD_SKIN');
--     EXCEPTION 
--         WHEN unique_violation THEN
--             -- Already has this item, skip
--             RAISE NOTICE 'Inventory already exists for user %', NEW.id;
--         WHEN OTHERS THEN
--             RAISE WARNING 'Error creating inventory for user %: %', NEW.id, SQLERRM;
--     END;
    
--     -- Insert stats with error handling
--     BEGIN
--         INSERT INTO public.player_stats (user_id) 
--         VALUES (NEW.id);
--     EXCEPTION 
--         WHEN unique_violation THEN
--             -- Stats already exist, skip
--             RAISE NOTICE 'Stats already exist for user %', NEW.id;
--         WHEN OTHERS THEN
--             RAISE WARNING 'Error creating stats for user %: %', NEW.id, SQLERRM;
--     END;
    
--     RETURN NEW;
-- END;
-- $$;

-- -- Recreate trigger
-- CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -- For existing users without profiles, create them manually
-- -- This is a one-time fix for users created before the trigger was working
-- DO $$
-- DECLARE
--     user_record RECORD;
--     v_username TEXT;
-- BEGIN
--     FOR user_record IN 
--         SELECT id, raw_user_meta_data 
--         FROM auth.users 
--         WHERE id NOT IN (SELECT id FROM public.profiles)
--     LOOP
--         v_username := COALESCE(
--             user_record.raw_user_meta_data->>'username',
--             'player_' || substr(replace(user_record.id::text, '-', ''), 1, 8)
--         );
        
--         -- Create profile
--         INSERT INTO public.profiles (id, username, chips)
--         VALUES (user_record.id, v_username, 1000)
--         ON CONFLICT (id) DO NOTHING;
        
--         -- Add default skin
--         INSERT INTO public.user_inventory (user_id, item_id, item_type)
--         VALUES (user_record.id, 'classic_red', 'CARD_SKIN')
--         ON CONFLICT (user_id, item_id) DO NOTHING;
        
--         -- Add stats
--         INSERT INTO public.player_stats (user_id)
--         VALUES (user_record.id)
--         ON CONFLICT (user_id) DO NOTHING;
        
--         RAISE NOTICE 'Created profile for existing user: %', user_record.id;
--     END LOOP;
-- END;
-- $$;
