import { useEffect, useState } from "react";
import { GAME_CONFIG } from "../config/gameRules.config.js";
import { PHASES } from "../utils/gameEngine.js";

/**
 * Counts the rematch vote timer down once the game is over.
 * Returns both the time left and calls checkRematchTimer when expired.
 */
export function useRematchTimer(phase, isHost, checkRematchTimer) {
  const [rematchLeft, setRematchLeft] = useState(
    GAME_CONFIG.REMATCH_VOTING_TIMER,
  );

  useEffect(() => {
    if (phase !== PHASES.GAMEOVER) return;
    setRematchLeft(GAME_CONFIG.REMATCH_VOTING_TIMER);
    const id = setInterval(
      () =>
        setRematchLeft((v) => {
          const newVal = Math.max(0, v - 1);
          // Host checks if timer expired
          if (newVal === 0 && isHost && checkRematchTimer) {
            checkRematchTimer();
          }
          return newVal;
        }),
      1000,
    );
    return () => clearInterval(id);
  }, [phase, isHost, checkRematchTimer]);

  return rematchLeft;
}
