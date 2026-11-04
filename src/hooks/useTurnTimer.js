// SRD §3.2: 30-second turn timer with 10-second heartbeat warning.
// Counts down while it is "my turn" during the PLAYING phase.
// When the timer reaches 0, fires onTimeout so the caller can dispatch TIMEOUT.

import { useEffect, useRef, useState } from 'react';
import { GAME_CONFIG } from '../config/gameRules.config.js';
import { PHASES } from '../utils/gameEngine.js';

/**
 * @param {object} params
 * @param {boolean} params.active     - true when it is this player's turn
 * @param {string}  params.phase      - current game phase
 * @param {string}  params.turnKey    - a key that changes every time the turn changes
 *                                      (e.g. `${round}-${turnIndex}`)
 * @param {function} params.onTimeout - called with no args when the timer hits 0
 */
export function useTurnTimer({ active, phase, turnKey, onTimeout }) {
  const duration = GAME_CONFIG.TURN_TIMER;   // 30 s
  const warning  = GAME_CONFIG.TIMER_WARNING; // 10 s

  const [secondsLeft, setSecondsLeft] = useState(duration);
  const intervalRef = useRef(null);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const isPlaying = phase === PHASES.PLAYING;

  useEffect(() => {
    // Reset every time the active turn changes
    setSecondsLeft(duration);
  }, [turnKey, duration]);

  useEffect(() => {
    if (!active || !isPlaying) {
      clearInterval(intervalRef.current);
      return;
    }

    // Start countdown
    setSecondsLeft(duration);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          onTimeoutRef.current?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, isPlaying, turnKey]);

  const isWarning = active && isPlaying && secondsLeft <= warning && secondsLeft > 0;
  const isExpired = secondsLeft === 0;

  return { secondsLeft, isWarning, isExpired };
}
