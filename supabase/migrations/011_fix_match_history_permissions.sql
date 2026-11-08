-- Fix match_history permissions to allow players to insert their own entries
-- This allows each player to save their match history when a game ends

-- Grant INSERT permission on match_history table
GRANT INSERT ON public.match_history TO authenticated;

-- Update RLS policy to allow users to insert their own match history
DROP POLICY IF EXISTS "history_insert_own" ON public.match_history;
CREATE POLICY "history_insert_own" ON public.match_history
    FOR INSERT
    WITH CHECK (auth.uid() = player_id);

-- Update SELECT policy to allow users to see matches they participated in
DROP POLICY IF EXISTS "history_select_player" ON public.match_history;
CREATE POLICY "history_select_player" ON public.match_history
    FOR SELECT
    USING (auth.uid() = player_id OR auth.uid() = winner_id);

-- Add comment explaining the policy
COMMENT ON POLICY "history_insert_own" ON public.match_history IS 
'Players can insert their own match history entries when games end';

COMMENT ON POLICY "history_select_player" ON public.match_history IS 
'Players can view matches they participated in (as player or winner)';
