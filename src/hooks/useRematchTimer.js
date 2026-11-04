import { useEffect, useState } from "react";
import { GAME_CONFIG } from "../config/gameRules.config.js";
import { PHASES } from "../utils/gameEngine.js";

/** Counts the rematch vote timer down once the game is over. */
export function useRematchTimer(phase) {
  const [rematchLeft, setRematchLeft] = useState(
    GAME_CONFIG.REMATCH_VOTING_TIMER,
  );

  useEffect(() => {
    if (phase !== PHASES.GAMEOVER) return;
    setRematchLeft(GAME_CONFIG.REMATCH_VOTING_TIMER);
    const id = setInterval(
      () => setRematchLeft((v) => Math.max(0, v - 1)),
      1000,
    );
    return () => clearInterval(id);
  }, [phase]);

  return rematchLeft;
}
