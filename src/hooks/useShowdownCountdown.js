import { useEffect, useRef, useState } from "react";
import { GAME_CONFIG } from "../config/gameRules.config.js";
import { PHASES } from "../utils/gameEngine.js";

/**
 * Showdown countdown (3-2-1 overlay).
 * Every client tracks the number from view.showdownAt; only the host
 * resolves the showdown when it expires.
 *
 * Production fixes:
 * - Locks timestamp to prevent desync
 * - Handles stale/past timestamps gracefully
 * - Clamps countdown values to valid range
 */
export function useShowdownCountdown({ view, isHost, resolveShowdown }) {
  const [countdown, setCountdown] = useState(
    GAME_CONFIG.ROUND_RESULT_COUNTDOWN,
  );
  const resolvedRef = useRef(false);
  const showdownAtRef = useRef(null);

  useEffect(() => {
    if (view?.phase !== PHASES.COUNTDOWN) {
      resolvedRef.current = false;
      showdownAtRef.current = null;
      setCountdown(GAME_CONFIG.ROUND_RESULT_COUNTDOWN);
      return;
    }

    // Lock in the showdownAt timestamp on first entry to COUNTDOWN phase
    // This prevents desync from multiple updates
    if (showdownAtRef.current === null) {
      if (view.showdownAt) {
        const now = Date.now();
        const timeUntilShowdown = view.showdownAt - now;

        // If timestamp is too far in the past (> 1s), it's stale - reset to 3s from now
        if (timeUntilShowdown < -1000) {
          console.warn("[Countdown] Stale timestamp detected, resetting to 3s");
          showdownAtRef.current =
            now + GAME_CONFIG.ROUND_RESULT_COUNTDOWN * 1000;
        } else {
          showdownAtRef.current = view.showdownAt;
        }
      } else {
        // Fallback: if no showdownAt, use 3s from now
        showdownAtRef.current =
          Date.now() + GAME_CONFIG.ROUND_RESULT_COUNTDOWN * 1000;
      }
    }

    const targetTime = showdownAtRef.current;

    const tick = () => {
      const ms = targetTime - Date.now();
      const nextCount = Math.ceil(ms / 1000);

      // Clamp countdown between 0 and max value
      const clampedCount = Math.max(
        0,
        Math.min(GAME_CONFIG.ROUND_RESULT_COUNTDOWN, nextCount),
      );
      setCountdown(clampedCount);
    };

    tick(); // Immediate tick
    const id = setInterval(tick, 100); // Update every 100ms for smooth countdown
    return () => clearInterval(id);
  }, [view?.phase, view?.showdownAt]);

  // Host-only: trigger resolution when countdown expires
  useEffect(() => {
    if (view?.phase !== PHASES.COUNTDOWN || !isHost || resolvedRef.current)
      return;

    const targetTime = showdownAtRef.current || view.showdownAt || Date.now();
    const ms = Math.max(0, targetTime - Date.now());

    const id = setTimeout(() => {
      if (!resolvedRef.current && view?.phase === PHASES.COUNTDOWN) {
        resolvedRef.current = true;
        resolveShowdown();
      }
    }, ms);

    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view?.phase, view?.showdownAt, isHost]);

  return countdown;
}
