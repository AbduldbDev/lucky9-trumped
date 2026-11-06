// Audio Context Provider — makes audio manager available throughout the app

import { createContext, useContext } from "react";
import { useAudioManager } from "../hooks/useAudioManager.js";

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const audio = useAudioManager();
  
  return (
    <AudioContext.Provider value={audio}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
}
