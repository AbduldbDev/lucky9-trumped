import { useEffect, useState } from "react";
import { GAME_CONFIG } from "../config/gameRules.config.js";
import { PHASES } from "../utils/gameEngine.js";

/**
 * Showdown countdown (3-2-1 overlay).
 * Every client tracks the number from view.showdownAt; only the host
 * resolves the showdown when it expires.
 */
export function useShowdownCountdown({ view, isHost, resolveShowdown }) {
  const [countdown, setCountdown] = useState(
    GAME_CONFIG.ROUND_RESULT_COUNTDOWN,
  );

  useEffect(() => {
    if (view?.phase !== PHASES.COUNTDOWN) return;
    const tick = () => {
      const ms = (view.showdownAt ?? Date.now()) - Date.now();
      setCountdown(Math.max(1, Math.ceil(ms / 1000)));
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [view?.phase, view?.showdownAt]);

  useEffect(() => {
    if (view?.phase !== PHASES.COUNTDOWN || !isHost) return;
    const ms = Math.max(0, (view.showdownAt ?? Date.now()) - Date.now());
    const id = setTimeout(() => resolveShowdown(), ms);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view?.phase, view?.showdownAt, isHost]);

  return countdown;
}
