import { useEffect, useState } from "react";
import { GAME_CONFIG } from "../config/gameRules.config.js";

export default function useTurnCountdown({
  active,
  turnStartTime = null,
  totalPauseTime = 0,
  paused = false,
  turnKey = null,
}) {
  const { TURN_TIMER } = GAME_CONFIG;
  const [secondsLeft, setSecondsLeft] = useState(TURN_TIMER);

  useEffect(() => {
    // Not this player's turn: reset to the full timer.
    if (!active || !turnStartTime) {
      setSecondsLeft(TURN_TIMER);
      return;
    }

    const calculateSecondsLeft = () => {
      const elapsed = Math.floor(
        (Date.now() - turnStartTime - totalPauseTime) / 1000,
      );
      return Math.max(0, TURN_TIMER - elapsed);
    };

    // Show the correct value immediately (also covers pause/resume changes).
    setSecondsLeft(calculateSecondsLeft());

    // While paused, hold the value and don't tick.
    if (paused) return;

    const id = setInterval(() => {
      const next = calculateSecondsLeft();
      setSecondsLeft(next);
      if (next <= 0) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  }, [active, turnStartTime, totalPauseTime, paused, turnKey, TURN_TIMER]);

  return secondsLeft;
}
