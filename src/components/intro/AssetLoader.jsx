import { useState, useEffect } from "react";
import { CARD_SKINS_SHOP } from "../../config/cardSkins.config.js";

// Progress ring geometry
const RING_R = 52;
const RING_C = 2 * Math.PI * RING_R; // circumference

/**
 * AssetLoader - Preloads all game assets before starting
 * Shows a loading screen with progress indication
 */
export default function AssetLoader({
  onComplete,
  selectedSkinId = "classic_red",
}) {
  const [progress, setProgress] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentAsset, setCurrentAsset] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadAssets = async () => {
      try {
        // Collect all assets to load
        const assetsToLoad = [];

        // 1. Add all card skin SVGs (prioritize selected skin)
        const selectedSkin = CARD_SKINS_SHOP.find(
          (s) => s.id === selectedSkinId,
        );
        const otherSkins = CARD_SKINS_SHOP.filter(
          (s) => s.id !== selectedSkinId,
        );

        // Load selected skin first
        if (selectedSkin?.backSvg) {
          assetsToLoad.push({
            type: "image",
            url: selectedSkin.backSvg,
            name: `${selectedSkin.name} (back)`,
            critical: true,
          });
        }
        if (selectedSkin?.frontSvg) {
          assetsToLoad.push({
            type: "image",
            url: selectedSkin.frontSvg,
            name: `${selectedSkin.name} (front)`,
            critical: true,
          });
        }

        // Then load other skins
        otherSkins.forEach((skin) => {
          if (skin.backSvg) {
            assetsToLoad.push({
              type: "image",
              url: skin.backSvg,
              name: `${skin.name} (back)`,
              critical: false,
            });
          }
          if (skin.frontSvg) {
            assetsToLoad.push({
              type: "image",
              url: skin.frontSvg,
              name: `${skin.name} (front)`,
              critical: false,
            });
          }
        });

        // 2. Add sound effects (optional - non-critical)
        const sfxFiles = [
          "game_start",
          "card_draw",
          "turn_start",
          "countdown_tick",
          "countdown_go",
          "nine_hit",
          "victory",
          "defeat",
          "ui_click",
        ];

        sfxFiles.forEach((sfx) => {
          assetsToLoad.push({
            type: "audio",
            url: `/sfx/${sfx}.mp3`,
            name: sfx,
            critical: false, // Audio is optional
          });
        });

        setTotalCount(assetsToLoad.length);

        // Helper to preload an image
        const preloadImage = (url) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            const timeout = setTimeout(() => {
              reject(new Error(`Timeout loading ${url}`));
            }, 5000); // 5 second timeout per image

            img.onload = () => {
              clearTimeout(timeout);
              resolve();
            };
            img.onerror = () => {
              clearTimeout(timeout);
              reject(new Error(`Failed to load ${url}`));
            };
            img.src = url;
          });
        };

        // Helper to preload audio
        const preloadAudio = (url) => {
          return new Promise((resolve) => {
            const audio = new Audio();
            const timeout = setTimeout(() => {
              resolve(); // Audio is optional, don't fail
            }, 3000); // 3 second timeout per audio

            audio.oncanplaythrough = () => {
              clearTimeout(timeout);
              resolve();
            };
            audio.onerror = () => {
              clearTimeout(timeout);
              resolve(); // Audio is optional, don't fail
            };
            audio.src = url;
          });
        };

        // Load assets sequentially to show smooth progress
        let loaded = 0;
        for (const asset of assetsToLoad) {
          if (cancelled) return;

          setCurrentAsset(asset.name);

          try {
            if (asset.type === "image") {
              await preloadImage(asset.url);
            } else if (asset.type === "audio") {
              await preloadAudio(asset.url);
            }
          } catch (err) {
            // If it's a critical asset, log the error but continue
            if (asset.critical) {
              console.warn(
                `[AssetLoader] Failed to load critical asset: ${asset.name}`,
                err,
              );
            }
            // Non-critical assets fail silently
          }

          loaded++;
          setLoadedCount(loaded);
          setProgress(Math.round((loaded / assetsToLoad.length) * 100));

          // Small delay to prevent UI freezing
          await new Promise((resolve) => setTimeout(resolve, 20));
        }

        if (!cancelled) {
          // Wait a moment before completing to show 100%
          await new Promise((resolve) => setTimeout(resolve, 300));
          onComplete();
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[AssetLoader] Asset loading failed:", err);
          setError(err.message);
          // Complete anyway after a short delay
          setTimeout(() => {
            if (!cancelled) onComplete();
          }, 1500);
        }
      }
    };

    loadAssets();

    return () => {
      cancelled = true;
    };
  }, [onComplete, selectedSkinId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% -10%, #0c2a1a 0%, #061510 55%, #030a07 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Static suit decoration (no animation, so no extra paint cost) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 select-none"
      >
        {["♠", "♥", "♣", "♦"].map((suit, i) => (
          <span
            key={suit}
            className="absolute text-[6rem] leading-none text-gold/[0.04] sm:text-[9rem]"
            style={{
              [i < 2 ? "top" : "bottom"]: "8%",
              [i % 2 === 0 ? "left" : "right"]: "8%",
            }}
          >
            {suit}
          </span>
        ))}
      </div>

      <div className="relative z-10 flex w-full max-w-xs flex-col items-center gap-5 px-6 text-center sm:max-w-sm sm:gap-6">
        {/* Eyebrow */}
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold/60 sm:w-12" />
          <span className="font-serif text-[10px] uppercase tracking-[0.5em] text-gold/80 sm:text-xs">
            Lucky 9
          </span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-gold/60 sm:w-12" />
        </div>

        {/* Progress ring */}
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="Loading game assets"
          className="relative flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40"
        >
          <svg
            viewBox="0 0 120 120"
            className="absolute inset-0 h-full w-full -rotate-90"
          >
            {/* Track */}
            <circle
              cx="60"
              cy="60"
              r={RING_R}
              fill="none"
              stroke="rgba(201,168,76,0.15)"
              strokeWidth="1"
            />
            {/* Inner hairline */}
            <circle
              cx="60"
              cy="60"
              r={RING_R - 7}
              fill="none"
              stroke="rgba(201,168,76,0.12)"
              strokeWidth="1"
            />
            {/* Progress */}
            <circle
              cx="60"
              cy="60"
              r={RING_R}
              fill="none"
              stroke="#e2c97e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C * (1 - progress / 100)}
              style={{ transition: "stroke-dashoffset 300ms ease-out" }}
            />
          </svg>

          {/* Soft glow behind the number */}
          <div
            aria-hidden="true"
            className="absolute inset-4 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(201,168,76,0.14) 0%, transparent 70%)",
            }}
          />

          <div className="relative flex flex-col items-center leading-none">
            <span className="font-serif text-3xl font-medium tabular-nums text-gold-light sm:text-4xl">
              {progress}
              <span className="text-base text-gold/70 sm:text-lg">%</span>
            </span>
            <span className="mt-1.5 font-mono text-[9px] tabular-nums tracking-wider text-ivory-dim/60 sm:text-[10px]">
              {loadedCount} / {totalCount}
            </span>
          </div>
        </div>

        {/* Title + current asset */}
        <div className="space-y-1.5">
          <h2 className="font-serif text-lg font-medium tracking-wide text-ivory sm:text-2xl">
            Preparing the table
          </h2>
          <div className="flex h-4 items-center justify-center">
            {currentAsset && (
              <p className="max-w-full truncate text-[10px] tracking-wide text-ivory-dim/50 sm:text-xs">
                {currentAsset}
              </p>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="status"
            className="rounded-lg border border-chip-red/40 bg-chip-red/10 px-3 py-2 animate-fadeUp"
          >
            <p className="text-[10px] tracking-wide text-red-300/90 sm:text-xs">
              <i className="fa-solid fa-triangle-exclamation mr-2" />
              Some assets failed to load, but the game will continue
            </p>
          </div>
        )}

        {/* Suits */}
        <div className="flex items-center gap-3 text-xs text-gold/50">
          <span>♠</span>
          <span className="text-chip-red/60">♥</span>
          <span>♣</span>
          <span className="text-chip-red/60">♦</span>
        </div>

        <p className="text-[9px] uppercase tracking-[0.3em] text-ivory-dim/40 sm:text-[10px]">
          Preparing your cards and trump deck
        </p>
      </div>
    </div>
  );
}
