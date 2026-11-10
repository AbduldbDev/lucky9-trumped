import { useState, useEffect } from "react";
import Card from "../../cards/Card.jsx"; // adjust path
import { useAudio } from "../../../contexts/AudioContext.jsx";
import { AUDIO_CONFIG } from "../../../config/audio.config.js";

export default function FlyingCard({
  fromX,
  fromY,
  toX,
  toY,
  delay = 0,
  skinId = "classic_red",
  onComplete,
}) {
  const [visible, setVisible] = useState(false);
  const audio = useAudio();

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setVisible(true);
      // Play card draw sound when the card starts flying
      audio.playSfx(AUDIO_CONFIG.SFX.CARD_DEAL);
    }, delay);

    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, delay + 600);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(completeTimer);
    };
  }, [delay, onComplete, audio]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed z-[100]"
      style={{
        left: `${fromX}px`,
        top: `${fromY}px`,
        width: "48px",
        height: "64px",
        animation: "flyCard 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "--target-x": `${toX - fromX}px`,
        "--target-y": `${toY - fromY}px`,
      }}
    >
      <div className="shadow-2xl rounded">
        <Card faceDown skinId={skinId} size="deck" glow={false} />
      </div>
    </div>
  );
}
