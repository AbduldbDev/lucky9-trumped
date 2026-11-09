import { useEffect, useRef } from "react";
import { PHASES } from "../utils/gameEngine.js";
import { calcMatchChips, recordMatchResult } from "../services/statsService.js";

/**
 * Saves the player's stats + chips exactly once when the match ends.
 * The guard resets when the room returns to the lobby (rematch).
 */
export function useMatchSettlement({
  view,
  me,
  profile,
  partyCode,
  getDurationSeconds,
  onProfile,
}) {
  const settled = useRef(false);
  const phase = view?.phase;

  useEffect(() => {
    if (phase === PHASES.LOBBY) settled.current = false;
  }, [phase]);

  useEffect(() => {
    if (phase !== PHASES.GAMEOVER || !me || settled.current) return;
    settled.current = true;

    const won = view.winnerId === me.id;

    // Each player saves their own match result.
    recordMatchResult(profile, {
      won,
      chipsEarned: calcMatchChips({ won }),
      trumpsPlayed: me.stats.trumpsPlayed,
      naturals: me.stats.naturals,
      matchCode: partyCode,
      totalRounds: view.round || 1,
      durationSeconds: getDurationSeconds(),
      winnerId: view.winnerId,
    })
      .then(onProfile)
      .catch((e) =>
        console.warn("[Lucky9] Could not save match result:", e.message),
      );
  }, [phase, view?.round]); // eslint-disable-line react-hooks/exhaustive-deps
}
