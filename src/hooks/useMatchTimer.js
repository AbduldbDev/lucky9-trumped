import { useCallback, useEffect, useRef } from "react";
import { PHASES } from "../utils/gameEngine.js";

/**
 * Tracks when the match started (persisted in sessionStorage so refreshes
 * don't reset it). Returns a function that gives elapsed seconds.
 */
export function useMatchTimer({ phase, partyCode }) {
  const startedAt = useRef(null);
  const storageKey = `lucky9.matchStart.${partyCode}`;

  useEffect(() => {
    if (!phase) return;

    if (phase === PHASES.LOBBY) {
      // New match / rematch: clear the timer.
      startedAt.current = null;
      sessionStorage.removeItem(storageKey);
      return;
    }

    if (startedAt.current == null) {
      const saved = Number(sessionStorage.getItem(storageKey));
      startedAt.current = saved > 0 ? saved : Date.now();
      sessionStorage.setItem(storageKey, String(startedAt.current));
    }
  }, [phase, storageKey]);

  return useCallback(
    () =>
      startedAt.current
        ? Math.max(0, Math.floor((Date.now() - startedAt.current) / 1000))
        : 0,
    [],
  );
}
