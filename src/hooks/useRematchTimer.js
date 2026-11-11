import { useEffect, useRef, useState } from "react";
import { GAME_CONFIG } from "../config/gameRules.config.js";
import { PHASES } from "../utils/gameEngine.js";

export function useRematchTimer(phase, isHost, checkRematchTimer) {
  const [rematchLeft, setRematchLeft] = useState(
    GAME_CONFIG.REMATCH_VOTING_TIMER,
  );

  // Keep the latest callback without restarting the interval when it changes
  const checkRef = useRef(checkRematchTimer);
  useEffect(() => {
    checkRef.current = checkRematchTimer;
  }, [checkRematchTimer]);

  // Tick down once per second while in GAMEOVER (pure updater)
  useEffect(() => {
    if (phase !== PHASES.GAMEOVER) return;
    setRematchLeft(GAME_CONFIG.REMATCH_VOTING_TIMER);
    const id = setInterval(() => {
      setRematchLeft((v) => Math.max(0, v - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Side effect: host fires the expiry check when the timer hits 0
  useEffect(() => {
    if (phase === PHASES.GAMEOVER && rematchLeft === 0 && isHost) {
      checkRef.current?.();
    }
  }, [phase, rematchLeft, isHost]);

  return rematchLeft;
}
