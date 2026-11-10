import { useEffect, useRef, useState } from "react";
import { GAME_CONFIG } from "../config/gameRules.config.js";
import { PHASES } from "../utils/gameEngine.js";
import { useAudio } from "../contexts/AudioContext.jsx";
import { AUDIO_CONFIG } from "../config/audio.config.js";

const TICK_MS = 50;

/**
 * Returns secondsLeft as a float (e.g. 20.12), counting down to 0.
 * Params are unchanged from the previous version.
 */
export function useTurnTimer({
  active,
  phase,
  turnKey,
  turnStartTime,
  totalPauseTime = 0,
  paused = false,
  onTimeout,
}) {
  const audio = useAudio();
  const duration = GAME_CONFIG.TURN_TIMER;
  const warning = GAME_CONFIG.TIMER_WARNING;

  const [secondsLeft, setSecondsLeft] = useState(duration);
  const secondsLeftRef = useRef(duration);
  const intervalRef = useRef(null);
  const onTimeoutRef = useRef(onTimeout);
  const audioRef = useRef(audio);
  const heartbeatActiveRef = useRef(false);
  onTimeoutRef.current = onTimeout;
  audioRef.current = audio;

  const isPlaying = phase === PHASES.PLAYING;

  const update = (value) => {
    secondsLeftRef.current = value;
    setSecondsLeft(value);
  };

  const remainingFromServer = () =>
    Math.max(
      0,
      duration - (Date.now() - turnStartTime - totalPauseTime) / 1000,
    );

  const stopHeartbeat = () => {
    if (heartbeatActiveRef.current) {
      audioRef.current.stopHeartbeat();
      heartbeatActiveRef.current = false;
    }
  };

  // Sync displayed time whenever the turn / server timing changes
  useEffect(() => {
    update(turnStartTime ? remainingFromServer() : duration);
    stopHeartbeat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnKey, duration, turnStartTime, totalPauseTime]);

  // Run the countdown
  useEffect(() => {
    if (!active || !isPlaying || paused) {
      clearInterval(intervalRef.current);
      stopHeartbeat();
      return;
    }

    // Deadline from server time, or from the current local value if no timestamp
    const deadline = turnStartTime
      ? turnStartTime + totalPauseTime + duration * 1000
      : Date.now() +
        (secondsLeftRef.current > 0 ? secondsLeftRef.current : duration) * 1000;

    const initial = Math.max(0, (deadline - Date.now()) / 1000);
    update(initial);

    if (initial <= 0) {
      onTimeoutRef.current?.();
      return;
    }

    let lastWhole = Math.ceil(initial);

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, (deadline - Date.now()) / 1000);
      const a = audioRef.current;

      if (
        remaining > 0 &&
        remaining <= AUDIO_CONFIG.HEARTBEAT_WARNING_TIME &&
        !heartbeatActiveRef.current
      ) {
        heartbeatActiveRef.current = true;
        a.playHeartbeat();
      }

      // One tick sound per whole second in the last 10 seconds
      const whole = Math.ceil(remaining);
      if (whole !== lastWhole) {
        if (whole > 0 && whole <= 10) a.playSfx(AUDIO_CONFIG.SFX.TIMER_TICK);
        lastWhole = whole;
      }

      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        stopHeartbeat();
        a.playSfx(AUDIO_CONFIG.SFX.TIMER_EXPIRE);
        update(0);
        onTimeoutRef.current?.();
        return;
      }

      update(remaining);
    }, TICK_MS);

    return () => {
      clearInterval(intervalRef.current);
      stopHeartbeat();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    active,
    isPlaying,
    paused,
    turnKey,
    turnStartTime,
    totalPauseTime,
    duration,
  ]);

  const isWarning =
    active && isPlaying && secondsLeft <= warning && secondsLeft > 0;
  const isExpired = secondsLeft <= 0;

  return { secondsLeft, isWarning, isExpired };
}
