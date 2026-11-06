// SRD §3.2: 30-second turn timer with 10-second heartbeat warning.
// Counts down while it is "my turn" during the PLAYING phase.
// When the timer reaches 0, fires onTimeout so the caller can dispatch TIMEOUT.

import { useEffect, useRef, useState } from "react";
import { GAME_CONFIG } from "../config/gameRules.config.js";
import { PHASES } from "../utils/gameEngine.js";
import { useAudio } from "../contexts/AudioContext.jsx";
import { AUDIO_CONFIG } from "../config/audio.config.js";

/**
 * @param {object} params
 * @param {boolean} params.active     - true when it is this player's turn
 * @param {string}  params.phase      - current game phase
 * @param {string}  params.turnKey    - a key that changes every time the turn changes
 *                                      (e.g. `${round}-${turnIndex}`)
 * @param {function} params.onTimeout - called with no args when the timer hits 0
 */
export function useTurnTimer({ active, phase, turnKey, onTimeout }) {
  const audio = useAudio();
  const duration = GAME_CONFIG.TURN_TIMER; // 30 s
  const warning = GAME_CONFIG.TIMER_WARNING; // 10 s

  const [secondsLeft, setSecondsLeft] = useState(duration);
  const intervalRef = useRef(null);
  const onTimeoutRef = useRef(onTimeout);
  const heartbeatActiveRef = useRef(false);
  onTimeoutRef.current = onTimeout;

  const isPlaying = phase === PHASES.PLAYING;

  useEffect(() => {
    // Reset every time the active turn changes
    setSecondsLeft(duration);
    if (heartbeatActiveRef.current) {
      audio.stopHeartbeat();
      heartbeatActiveRef.current = false;
    }
  }, [turnKey, duration, audio]);

  useEffect(() => {
    if (!active || !isPlaying) {
      clearInterval(intervalRef.current);
      if (heartbeatActiveRef.current) {
        audio.stopHeartbeat();
        heartbeatActiveRef.current = false;
      }
      return;
    }

    // Start countdown
    setSecondsLeft(duration);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        // Start heartbeat when time is low
        if (
          s <= AUDIO_CONFIG.HEARTBEAT_WARNING_TIME &&
          !heartbeatActiveRef.current &&
          s > 0
        ) {
          heartbeatActiveRef.current = true;
          audio.playHeartbeat();
        }

        // Play tick sound in last 10 seconds
        if (s > 0 && s <= 10) {
          audio.playSfx(AUDIO_CONFIG.SFX.TIMER_TICK);
        }

        if (s <= 1) {
          clearInterval(intervalRef.current);
          if (heartbeatActiveRef.current) {
            audio.stopHeartbeat();
            heartbeatActiveRef.current = false;
          }
          audio.playSfx(AUDIO_CONFIG.SFX.TIMER_EXPIRE);
          onTimeoutRef.current?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
      if (heartbeatActiveRef.current) {
        audio.stopHeartbeat();
        heartbeatActiveRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, isPlaying, turnKey, audio]);

  const isWarning =
    active && isPlaying && secondsLeft <= warning && secondsLeft > 0;
  const isExpired = secondsLeft === 0;

  return { secondsLeft, isWarning, isExpired };
}
