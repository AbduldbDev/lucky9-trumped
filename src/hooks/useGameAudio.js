import { useEffect, useRef } from "react";
import { useAudio } from "../contexts/AudioContext.jsx";
import { PHASES } from "../utils/gameEngine.js";
import { AUDIO_CONFIG } from "../config/audio.config.js";

/**
 * Hook for managing game audio effects based on game state changes
 * @param {Object} params - Audio parameters
 * @param {Object} params.view - Current game view state
 * @param {Object} params.me - Current player data
 */
export function useGameAudio({ view, me }) {
  const audio = useAudio();
  const prevPhaseRef = useRef(null);
  const prevRoundRef = useRef(null);
  const prevTurnPlayerRef = useRef(null);

  // Audio: Phase changes
  useEffect(() => {
    if (!view?.phase || prevPhaseRef.current === view.phase) return;
    prevPhaseRef.current = view.phase;

    switch (view.phase) {
      case PHASES.PLAYING:
        // Don't play GAME_START on first render, only on transitions back to PLAYING
        if (prevRoundRef.current !== null) {
          audio.playSfx(AUDIO_CONFIG.SFX.ROUND_START);
        }
        break;
      case PHASES.COUNTDOWN:
        // Play showdown audio only once when entering COUNTDOWN phase
        // The countdown ticks are handled by ShowdownOverlay component
        audio.playSfx(AUDIO_CONFIG.SFX.SHOWDOWN);
        break;
      case PHASES.SHOWDOWN:
        audio.playSfx(AUDIO_CONFIG.SFX.ROUND_END);
        break;
      case PHASES.GAMEOVER:
        // Determine if local player won
        const won = view.winnerId === me?.id;
        audio.playSfx(won ? AUDIO_CONFIG.SFX.VICTORY : AUDIO_CONFIG.SFX.DEFEAT);
        break;
    }
  }, [view?.phase, audio, me?.id]);

  // Audio: Round changes
  useEffect(() => {
    if (!view?.round || prevRoundRef.current === view.round) return;
    if (prevRoundRef.current !== null) {
      audio.playSfx(AUDIO_CONFIG.SFX.ROUND_START);
    }
    prevRoundRef.current = view.round;
  }, [view?.round, audio]);

  // Audio: Turn changes
  useEffect(() => {
    if (!view?.turnIndex || !view?.players) return;
    const currentTurnPlayer = view.players[view.turnIndex];
    if (
      !currentTurnPlayer ||
      prevTurnPlayerRef.current === currentTurnPlayer.id
    )
      return;

    prevTurnPlayerRef.current = currentTurnPlayer.id;

    // Play turn start sound only if it's my turn
    if (currentTurnPlayer.id === me?.id) {
      audio.playSfx(AUDIO_CONFIG.SFX.TURN_START);
    }
  }, [view?.turnIndex, view?.players, audio, me?.id]);
}
