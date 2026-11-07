import { useEffect, useRef, useState } from "react";
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
  const resolvedRef = useRef(false);

  useEffect(() => {
    if (view?.phase !== PHASES.COUNTDOWN) {
      resolvedRef.current = false;
      return;
    }

    const tick = () => {
      const ms = (view.showdownAt ?? Date.now()) - Date.now();
      const nextCount = Math.ceil(ms / 1000);

      // Allow countdown to reach 0, but clamp minimum display to 0
      setCountdown(Math.max(0, nextCount));
    };

    tick();
    const id = setInterval(tick, 100); // More frequent for smoother countdown
    return () => clearInterval(id);
  }, [view?.phase, view?.showdownAt]);

  useEffect(() => {
    if (view?.phase !== PHASES.COUNTDOWN || !isHost || resolvedRef.current)
      return;

    const ms = Math.max(0, (view.showdownAt ?? Date.now()) - Date.now());
    const id = setTimeout(() => {
      if (!resolvedRef.current) {
        resolvedRef.current = true;
        resolveShowdown();
      }
    }, ms);

    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view?.phase, view?.showdownAt, isHost]);

  return countdown;
}
