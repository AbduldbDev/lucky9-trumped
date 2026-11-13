import { useState, useEffect, useRef } from "react";
import { useAudio } from "../contexts/AudioContext.jsx";
import { AUDIO_CONFIG } from "../config/audio.config.js";

/**
 * Hook for managing personal player notifications (Lucky 9, etc.)
 * @param {Object} params - Notification parameters
 * @param {Object} params.view - Current game view state
 * @returns {Object} Personal notification state
 */
export function usePersonalNotifications({ view }) {
  const audio = useAudio();
  const [personalNotification, setPersonalNotification] = useState(null);
  
  // Personal notifications: remember what has already been shown in a ref
  // (no re-render, no effect re-run). Keys include the round so ids that
  // restart each round can't collide, and nothing needs resetting.
  const shownPersonalKeys = useRef(new Set());
  const personalSeeded = useRef(false);

  // Personal notifications (Lucky 9, etc.): show ONLY when a new one is
  // triggered. The child hides it after 3s and calls onDismiss.
  useEffect(() => {
    if (!view) return;

    // Ensure personalNotifications is always an array
    const list = Array.isArray(view.personalNotifications)
      ? view.personalNotifications
      : [];

    // First view we ever see: mark whatever already exists as "seen" so a
    // reload/reconnect doesn't replay an old popup.
    if (!personalSeeded.current) {
      personalSeeded.current = true;
      list.forEach((n) =>
        shownPersonalKeys.current.add(`${view.round}:${n.id}`),
      );
      return;
    }

    // Clear notification if personalNotifications is empty (round reset)
    if (list.length === 0) {
      setPersonalNotification(null);
      return;
    }

    const latest = list[list.length - 1];
    // Guard against undefined latest
    if (!latest || !latest.id) return;

    const key = `${view.round}:${latest.id}`;
    if (shownPersonalKeys.current.has(key)) return;

    // Trump Shop purchases are surfaced by the shop modal's RewardReveal —
    // don't also pop the generic personal-notification toast for them.
    if (latest.type === "TRUMP_SHOP") {
      shownPersonalKeys.current.add(key);
      return;
    }

    shownPersonalKeys.current.add(key);
    setPersonalNotification(latest);

    // Play audio for personal notifications
    if (latest.type === "NINE_HIT") {
      audio.playSfx(AUDIO_CONFIG.SFX.NINE_HIT);
    }
  }, [view?.personalNotifications, view?.round, audio]);

  return {
    personalNotification,
    dismissPersonalNotification: () => setPersonalNotification(null),
  };
}
