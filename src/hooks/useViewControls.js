import { useState } from "react";
import { useAudio } from "../contexts/AudioContext.jsx";
import { AUDIO_CONFIG } from "../config/audio.config.js";

/**
 * Hook for managing zoom and pan controls for the table view
 * @returns {Object} View control state and handlers
 */
export function useViewControls() {
  const audio = useAudio();
  const [zoom, setZoom] = useState(1); // Zoom level: 0.5 to 1.5
  const [panX, setPanX] = useState(0); // Pan X offset in pixels
  const [panY, setPanY] = useState(0); // Pan Y offset in pixels
  const [showViewControls, setShowViewControls] = useState(false);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 1.5));
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
  };

  const handleZoomReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
  };

  const handlePanUp = () => {
    setPanY((prev) => prev - 30);
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
  };

  const handlePanDown = () => {
    setPanY((prev) => prev + 30);
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
  };

  const handlePanLeft = () => {
    setPanX((prev) => prev - 30);
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
  };

  const handlePanRight = () => {
    setPanX((prev) => prev + 30);
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
  };

  const handlePanReset = () => {
    setPanX(0);
    setPanY(0);
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
  };

  const toggleViewControls = () => {
    setShowViewControls((v) => !v);
    audio.playSfx(AUDIO_CONFIG.SFX.UI_CLICK);
  };

  return {
    zoom,
    panX,
    panY,
    showViewControls,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handlePanUp,
    handlePanDown,
    handlePanLeft,
    handlePanRight,
    handlePanReset,
    toggleViewControls,
  };
}
