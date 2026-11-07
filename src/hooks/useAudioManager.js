// Audio manager hook — handles SFX playback and heartbeat timing
// Place your SFX files in /public/sfx/ and name them according to AUDIO_CONFIG.SFX keys

import { useCallback, useEffect, useRef, useState } from "react";
import { AUDIO_CONFIG, getTrumpPlaySfx } from "../config/audio.config.js";

export function useAudioManager() {
  const [sfxEnabled, setSfxEnabled] = useState(AUDIO_CONFIG.ENABLE_SOUND);
  const [heartbeatEnabled, setHeartbeatEnabled] = useState(
    AUDIO_CONFIG.ENABLE_HEARTBEAT,
  );
  const [sfxVolume, setSfxVolume] = useState(AUDIO_CONFIG.SFX_VOLUME);
  const [musicVolume, setMusicVolume] = useState(AUDIO_CONFIG.MUSIC_VOLUME);

  // Cache audio instances to avoid reloading
  const audioCache = useRef(new Map());
  const currentHeartbeat = useRef(null);
  const musicRef = useRef(null);
  const lastPlayTimes = useRef(new Map()); // Track last play time per sound to prevent doubles

  // Load an audio file and cache it
  const loadAudio = useCallback((key) => {
    if (audioCache.current.has(key)) {
      return audioCache.current.get(key);
    }

    try {
      // Look for audio files in /public/sfx/
      const audio = new Audio(`/sfx/${key}.mp3`);
      audio.preload = "auto";
      audioCache.current.set(key, audio);
      return audio;
    } catch (error) {
      console.warn(`[Audio] Failed to load sound: ${key}`, error);
      return null;
    }
  }, []);

  // Play a sound effect
  const playSfx = useCallback(
    (key, options = {}) => {
      if (!sfxEnabled || !key) return;

      // Debounce: prevent same sound from playing within 100ms
      const now = Date.now();
      const lastPlay = lastPlayTimes.current.get(key) || 0;
      if (now - lastPlay < 100) {
        return;
      }
      lastPlayTimes.current.set(key, now);

      const audio = loadAudio(key);
      if (!audio) return;

      try {
        // Clone the audio for overlapping sounds
        const instance = audio.cloneNode();
        instance.volume = (options.volume ?? 1.0) * sfxVolume;
        instance.playbackRate = options.playbackRate ?? 1.0;

        instance.play().catch((err) => {
          // Autoplay policy might block this; fail silently
          console.debug(`[Audio] Playback blocked for ${key}:`, err.message);
        });
      } catch (error) {
        console.warn(`[Audio] Error playing ${key}:`, error);
      }
    },
    [sfxEnabled, sfxVolume, loadAudio],
  );

  // Play heartbeat sound when time is low
  const playHeartbeat = useCallback(() => {
    if (!heartbeatEnabled || !sfxEnabled) return;

    const audio = loadAudio(AUDIO_CONFIG.SFX.TIMER_HEARTBEAT);
    if (!audio) return;

    if (currentHeartbeat.current) {
      currentHeartbeat.current.pause();
    }

    try {
      audio.loop = true;
      audio.volume = sfxVolume * 0.6; // Slightly quieter for heartbeat
      audio.play().catch((err) => {
        console.debug(`[Audio] Heartbeat blocked:`, err.message);
      });
      currentHeartbeat.current = audio;
    } catch (error) {
      console.warn(`[Audio] Error playing heartbeat:`, error);
    }
  }, [heartbeatEnabled, sfxEnabled, sfxVolume, loadAudio]);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (currentHeartbeat.current) {
      currentHeartbeat.current.pause();
      currentHeartbeat.current.currentTime = 0;
      currentHeartbeat.current = null;
    }
  }, []);

  // Play background music (loop)
  const playMusic = useCallback(
    (key) => {
      if (!sfxEnabled) return;

      const audio = loadAudio(key);
      if (!audio) return;

      try {
        if (musicRef.current) {
          musicRef.current.pause();
        }

        audio.loop = true;
        audio.volume = musicVolume;
        audio.play().catch((err) => {
          console.debug(`[Audio] Music blocked:`, err.message);
        });
        musicRef.current = audio;
      } catch (error) {
        console.warn(`[Audio] Error playing music:`, error);
      }
    },
    [sfxEnabled, musicVolume, loadAudio],
  );

  // Stop background music
  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
      musicRef.current = null;
    }
  }, []);

  // Convenience helpers for common events
  const playTrumpSfx = useCallback(
    (rarity) => {
      const key = getTrumpPlaySfx(rarity);
      playSfx(key);
    },
    [playSfx],
  );

  const playCountdownTick = useCallback(() => {
    playSfx(AUDIO_CONFIG.SFX.COUNTDOWN_TICK);
  }, [playSfx]);

  const playCountdownGo = useCallback(() => {
    playSfx(AUDIO_CONFIG.SFX.COUNTDOWN_GO);
  }, [playSfx]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopHeartbeat();
      stopMusic();
      audioCache.current.clear();
    };
  }, [stopHeartbeat, stopMusic]);

  return {
    // State
    sfxEnabled,
    heartbeatEnabled,
    sfxVolume,
    musicVolume,

    // Setters
    setSfxEnabled,
    setHeartbeatEnabled,
    setSfxVolume,
    setMusicVolume,

    // Core methods
    playSfx,
    playMusic,
    stopMusic,
    playHeartbeat,
    stopHeartbeat,

    // Helpers
    playTrumpSfx,
    playCountdownTick,
    playCountdownGo,
  };
}
