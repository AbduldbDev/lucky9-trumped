import { useEffect, useState } from "react";
import { getMatchHistory } from "../services/statsService.js";
import { MATCH_HISTORY_LIMIT } from "../config/profilePreferences.config.js";

/**
 * Recent match history for profile pages. Non-critical data: the service
 * returns [] on failure, so the page always renders.
 */
export function useMatchHistory(profileId) {
  const [matchHistory, setMatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMatchHistory(profileId, MATCH_HISTORY_LIMIT).then((rows) => {
      if (cancelled) return;
      setMatchHistory(rows);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  return { matchHistory, loading };
}
