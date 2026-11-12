import { useCallback, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient.js";

/**
 * Loads the public hall-of-fame list. Shared by the leaderboard page and the
 * waiting-room modal so both stay on the same query.
 */
export function useLeaderboard(limit = 10) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase.rpc(
        "get_leaderboard",
        { p_limit: limit },
      );
      if (fetchError) throw fetchError;
      setEntries(data || []);
    } catch (err) {
      console.error("[Lucky9] Failed to load leaderboard:", err);
      setError(err.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { entries, loading, error, reload };
}
