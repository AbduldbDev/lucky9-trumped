import { useState, useEffect } from "react";
import { useAudio } from "../contexts/AudioContext.jsx";
import { TRUMP_CARDS_CATALOG } from "../config/trumpCards.config.js";

/**
 * Hook for managing trump card play notifications and displayed trumps on table
 * @param {Object} params - Notification parameters
 * @param {Object} params.view - Current game view state
 * @returns {Object} Trump notification state
 */
export function useTrumpNotifications({ view }) {
  const audio = useAudio();
  const [notification, setNotification] = useState(null);
  const [displayedTrumps, setDisplayedTrumps] = useState([]);
  const [shownNotificationIds, setShownNotificationIds] = useState(new Set());

  // Handle trump card plays - show notification and update display
  useEffect(() => {
    if (!view?.trumpPlays || view.trumpPlays.length === 0) {
      setDisplayedTrumps([]);
      setNotification(null); // Clear notification when no trump plays
      return;
    }

    // Find all new trump plays that haven't been shown yet
    const newPlays = view.trumpPlays.filter(
      (play) => !shownNotificationIds.has(play.id),
    );

    const timeouts = [];

    if (newPlays.length > 0) {
      // Sort by timestamp to show in correct order
      newPlays.sort((a, b) => a.timestamp - b.timestamp);

      // Show notifications sequentially with delays
      newPlays.forEach((play, index) => {
        const timeoutId = setTimeout(() => {
          setNotification(play);
          setShownNotificationIds((prev) => new Set([...prev, play.id]));

          // Play trump card sound based on rarity
          const trumpCard = TRUMP_CARDS_CATALOG[play.trumpId];
          if (trumpCard) {
            audio.playTrumpSfx(trumpCard.rarity);
          }
        }, index * 4200); // Show each notification 4.2s apart (4s display + 0.2s gap)

        timeouts.push(timeoutId);
      });
    }

    // Update displayed trumps on table (filter out old ones)
    const now = Date.now();
    const recentTrumps = view.trumpPlays.filter(
      (tp) => now - tp.timestamp < 6000,
    );
    setDisplayedTrumps(recentTrumps);

    // Cleanup timeouts on unmount or dependency change
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [view?.trumpPlays, shownNotificationIds, audio]);

  // Clear notification IDs and notification state when round changes
  useEffect(() => {
    setShownNotificationIds(new Set());
    setNotification(null);
  }, [view?.round]);

  // Clear notification when phase changes (safety net)
  useEffect(() => {
    if (
      view?.phase === "COUNTDOWN" ||
      view?.phase === "SHOWDOWN" ||
      view?.phase === "GAMEOVER"
    ) {
      setNotification(null);
    }
  }, [view?.phase]);

  return {
    notification,
    displayedTrumps,
    dismissNotification: () => setNotification(null),
  };
}
