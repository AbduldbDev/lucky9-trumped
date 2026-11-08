// Audio manager hook — handles SFX playback and heartbeat timing
// Place your SFX files in /public/sfx/ and name them according to AUDIO_CONFIG.SFX keys

import { useCallback, useEffect, useRef, useState } from "react";
import { AUDIO_CONFIG, getTrumpPlaySfx } from "../config/audio.config.js";

// Fallback mapping for missing audio files
const AUDIO_FALLBACKS = {
  showdown_reveal: "nine_hit",
  round_end: "round_start",
  countdown_go: "countdown_go",
  trump_play: "card_draw",
  trump_rare: "card_draw",
  trump_legendary: "card_draw",
  trump_mythic: "card_draw",
  trump_blocked: "ui_click",
  trump_discard: "card_draw",
  angel_activate: "card_draw",
  card_flip: "card_draw",
  card_place: "card_draw",
  trump_draw: "card_draw",
  trump_place: "card_draw",
  bet_change: "ui_click",
  bet_up: "ui_click",
  bet_down: "ui_click",
  win_round: "victory",
  lose_round: "defeat",
  draw_round: "round_start",
  player_join: "ui_click",
  player_leave: "ui_click",
  ready: "ui_click",
  ui_hover: "ui_click",
  ui_error: "ui_click",
  timer_tick: "countdown_tick",
  timer_expire: "countdown_tick",
  rematch_vote: "ui_click",
};

// Shared across ALL hook instances / providers, so duplicates can't bypass the debounce
const audioCache = new Map(); // resolved src -> { src, pool: HTMLAudioElement[] }
const lastPlayTimes = new Map(); // resolved src -> timestamp of last play

export function useAudioManager() {
  const [sfxEnabled, setSfxEnabled] = useState(AUDIO_CONFIG.ENABLE_SOUND);
  const [heartbeatEnabled, setHeartbeatEnabled] = useState(
    AUDIO_CONFIG.ENABLE_HEARTBEAT,
  );
  const [sfxVolume, setSfxVolume] = useState(AUDIO_CONFIG.SFX_VOLUME);
  const [musicVolume, setMusicVolume] = useState(AUDIO_CONFIG.MUSIC_VOLUME);

  const currentHeartbeat = useRef(null);
  const musicRef = useRef(null);

  // Load an audio file and cache it. Returns { src, pool } or null.
  // Keyed by the resolved file, so timer_tick and countdown_tick share one entry.
  const loadAudio = useCallback((key) => {
    const audioKey = AUDIO_FALLBACKS[key] || key;
    const src = `/sfx/${audioKey}.mp3`;

    if (audioCache.has(src)) return audioCache.get(src);

    try {
      const first = new Audio(src);
      first.preload = "auto";
      first.load();

      // Handle load errors gracefully
      first.addEventListener(
        "error",
        () => {
          console.debug(
            `[Audio] File not found: ${audioKey}.mp3 (original: ${key})`,
          );
        },
        { once: true },
      );

      const entry = { src, pool: [first] };
      audioCache.set(src, entry);
      return entry;
    } catch (error) {
      console.debug(`[Audio] Failed to load sound: ${key}`, error.message);
      return null;
    }
  }, []);

  // Play a sound effect
  const playSfx = useCallback(
    (key, options = {}) => {
      if (!sfxEnabled || !key) return;

      const entry = loadAudio(key);
      if (!entry) return;

      // Debounce per FILE, not per key. Countdown ticks are 1s apart,
      // so a 400ms window safely blocks echoes without dropping real ticks.
      const isCountdown = entry.src.includes("countdown");
      const debounceTime = isCountdown ? 400 : 100;
      const now = Date.now();
      if (now - (lastPlayTimes.get(entry.src) || 0) < debounceTime) return;
      lastPlayTimes.set(entry.src, now);

      // Temporary debugging: uncomment to see who calls and how often
      // console.trace(`[Audio] play ${key} -> ${entry.src}`);

      try {
        // Reuse an idle element, otherwise grow the pool (served from HTTP cache)
        let instance = entry.pool.find((a) => a.paused || a.ended);
        if (!instance) {
          instance = new Audio(entry.src);
          entry.pool.push(instance);
        }

        instance.currentTime = 0;
        instance.volume = Math.min(1, (options.volume ?? 1.0) * sfxVolume);
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

    const audio = loadAudio(AUDIO_CONFIG.SFX.TIMER_HEARTBEAT)?.pool[0];
    if (!audio) return;

    // Already playing the heartbeat; don't restart it
    if (currentHeartbeat.current === audio && !audio.paused) return;

    if (currentHeartbeat.current && currentHeartbeat.current !== audio) {
      currentHeartbeat.current.pause();
    }

    try {
      audio.loop = true;
      audio.volume = Math.min(1, sfxVolume * 0.6); // Slightly quieter for heartbeat
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
      currentHeartbeat.current.loop = false;
      currentHeartbeat.current = null;
    }
  }, []);

  // Play background music (loop)
  const playMusic = useCallback(
    (key) => {
      if (!sfxEnabled) return;

      const audio = loadAudio(key)?.pool[0];
      if (!audio) return;

      try {
        if (musicRef.current && musicRef.current !== audio) {
          musicRef.current.pause();
        }

        audio.loop = true;
        audio.volume = Math.min(1, musicVolume);
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
      musicRef.current.loop = false;
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

  // Cleanup on unmount.
  // Don't clear the shared module-level cache here: other hook instances
  // still use it, and StrictMode runs this cleanup on every dev mount.
  useEffect(() => {
    return () => {
      stopHeartbeat();
      stopMusic();
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
