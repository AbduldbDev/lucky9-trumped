import { useEffect, useState } from "react";
import { GAME_CONFIG } from "../config/gameRules.config.js";
import { PHASES } from "../utils/gameEngine.js";

// Seconds between the end of a round and the automatic start of the next one.
export const NEXT_ROUND_SECONDS = GAME_CONFIG.NEXT_ROUND_COUNTDOWN ?? 5;

/**
 * After a round result, every client shows a countdown and the host
 * automatically starts the next round when it ends.
 */
export function useAutoNextRound({ view, isHost, nextRound }) {
  const [nextRoundLeft, setNextRoundLeft] = useState(NEXT_ROUND_SECONDS);

  useEffect(() => {
    if (view?.phase !== PHASES.SHOWDOWN) return;
    const endsAt = Date.now() + NEXT_ROUND_SECONDS * 1000;
    const tick = () =>
      setNextRoundLeft(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [view?.phase, view?.round]);

  useEffect(() => {
    if (view?.phase !== PHASES.SHOWDOWN || !isHost) return;
    const id = setTimeout(() => nextRound(), NEXT_ROUND_SECONDS * 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view?.phase, view?.round, isHost]);

  return nextRoundLeft;
}
