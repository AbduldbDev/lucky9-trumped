/**
 * Asset Cache Utility
 * Preloads and caches all game assets (card skins, sounds)
 * Ensures assets are ready before gameplay begins
 */

import { CARD_SKINS_SHOP } from "../config/cardSkins.config.js";

// In-memory cache for loaded assets
const assetCache = {
  images: new Map(),
  audio: new Map(),
  loaded: false,
  loading: false,
};

/**
 * Preload a single image and cache it
 * @param {string} url - Image URL
 * @param {number} timeout - Timeout in ms (default: 8000)
 * @returns {Promise<HTMLImageElement>}
 */
export function preloadImage(url, timeout = 8000) {
  // Return cached image if available
  if (assetCache.images.has(url)) {
    return Promise.resolve(assetCache.images.get(url));
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    const timeoutId = setTimeout(() => {
      img.src = ""; // Cancel loading
      reject(new Error(`Image load timeout: ${url}`));
    }, timeout);

    img.onload = () => {
      clearTimeout(timeoutId);
      assetCache.images.set(url, img);
      resolve(img);
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error(`Failed to load image: ${url}`));
    };

    img.src = url;
  });
}

/**
 * Preload a single audio file and cache it
 * @param {string} url - Audio URL
 * @param {number} timeout - Timeout in ms (default: 5000)
 * @returns {Promise<HTMLAudioElement>}
 */
export function preloadAudio(url, timeout = 5000) {
  // Return cached audio if available
  if (assetCache.audio.has(url)) {
    return Promise.resolve(assetCache.audio.get(url));
  }

  return new Promise((resolve) => {
    const audio = new Audio();
    
    const timeoutId = setTimeout(() => {
      // Audio is optional, resolve anyway
      resolve(null);
    }, timeout);

    audio.oncanplaythrough = () => {
      clearTimeout(timeoutId);
      assetCache.audio.set(url, audio);
      resolve(audio);
    };

    audio.onerror = () => {
      clearTimeout(timeoutId);
      // Audio is optional, resolve anyway
      resolve(null);
    };

    audio.src = url;
  });
}

/**
 * Get all card skin SVG URLs that need to be preloaded
 * @returns {Array<string>} Array of SVG URLs
 */
export function getAllCardSkinUrls() {
  const urls = [];
  
  CARD_SKINS_SHOP.forEach((skin) => {
    if (skin.backSvg) {
      urls.push(skin.backSvg);
    }
    if (skin.frontSvg) {
      urls.push(skin.frontSvg);
    }
  });

  return urls;
}

/**
 * Get essential sound effect URLs
 * @returns {Array<string>} Array of audio URLs
 */
export function getEssentialSoundUrls() {
  return [
    "/sfx/game_start.mp3",
    "/sfx/card_draw.mp3",
    "/sfx/turn_start.mp3",
    "/sfx/countdown_tick.mp3",
    "/sfx/countdown_go.mp3",
    "/sfx/nine_hit.mp3",
    "/sfx/victory.mp3",
    "/sfx/defeat.mp3",
    "/sfx/ui_click.mp3",
  ];
}

/**
 * Preload all card skin images
 * @param {Function} onProgress - Callback with (loaded, total, currentUrl)
 * @returns {Promise<{success: number, failed: number, total: number}>}
 */
export async function preloadAllCardSkins(onProgress) {
  const urls = getAllCardSkinUrls();
  const results = {
    success: 0,
    failed: 0,
    total: urls.length,
    failedUrls: [],
  };

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    
    if (onProgress) {
      onProgress(i, urls.length, url);
    }

    try {
      await preloadImage(url);
      results.success++;
    } catch (error) {
      console.warn(`[AssetCache] Failed to load card skin: ${url}`, error);
      results.failed++;
      results.failedUrls.push(url);
    }

    // Small delay to prevent UI blocking
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  if (onProgress) {
    onProgress(urls.length, urls.length, null);
  }

  return results;
}

/**
 * Preload essential sound effects
 * @param {Function} onProgress - Callback with (loaded, total, currentUrl)
 * @returns {Promise<{success: number, failed: number, total: number}>}
 */
export async function preloadEssentialSounds(onProgress) {
  const urls = getEssentialSoundUrls();
  const results = {
    success: 0,
    failed: 0,
    total: urls.length,
  };

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    
    if (onProgress) {
      onProgress(i, urls.length, url);
    }

    const audio = await preloadAudio(url);
    if (audio) {
      results.success++;
    } else {
      results.failed++;
    }

    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  if (onProgress) {
    onProgress(urls.length, urls.length, null);
  }

  return results;
}

/**
 * Preload all game assets (images + sounds)
 * @param {Function} onProgress - Callback with (loaded, total, currentAsset, phase)
 * @returns {Promise<{images: Object, sounds: Object}>}
 */
export async function preloadAllAssets(onProgress) {
  if (assetCache.loaded) {
    console.log("[AssetCache] Assets already loaded from cache");
    if (onProgress) {
      const total = getAllCardSkinUrls().length + getEssentialSoundUrls().length;
      onProgress(total, total, null, "complete");
    }
    return {
      images: { success: assetCache.images.size, failed: 0, total: assetCache.images.size },
      sounds: { success: assetCache.audio.size, failed: 0, total: assetCache.audio.size },
    };
  }

  if (assetCache.loading) {
    console.log("[AssetCache] Assets already loading, waiting...");
    // Wait for existing load to complete
    while (assetCache.loading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return preloadAllAssets(onProgress);
  }

  assetCache.loading = true;

  const skinUrls = getAllCardSkinUrls();
  const soundUrls = getEssentialSoundUrls();
  const totalAssets = skinUrls.length + soundUrls.length;

  // Phase 1: Load card skins (critical)
  const imageResults = await preloadAllCardSkins((loaded, total, url) => {
    if (onProgress) {
      onProgress(loaded, totalAssets, url, "images");
    }
  });

  // Phase 2: Load sounds (optional)
  const soundResults = await preloadEssentialSounds((loaded, total, url) => {
    if (onProgress) {
      onProgress(skinUrls.length + loaded, totalAssets, url, "sounds");
    }
  });

  assetCache.loaded = true;
  assetCache.loading = false;

  console.log("[AssetCache] All assets loaded:", {
    images: imageResults,
    sounds: soundResults,
  });

  if (onProgress) {
    onProgress(totalAssets, totalAssets, null, "complete");
  }

  return {
    images: imageResults,
    sounds: soundResults,
  };
}

/**
 * Check if specific card skin is cached
 * @param {string} skinId - Skin ID
 * @returns {boolean}
 */
export function isCardSkinCached(skinId) {
  const skin = CARD_SKINS_SHOP.find((s) => s.id === skinId);
  if (!skin) return false;

  const backCached = !skin.backSvg || assetCache.images.has(skin.backSvg);
  const frontCached = !skin.frontSvg || assetCache.images.has(skin.frontSvg);

  return backCached && frontCached;
}

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
export function getCacheStats() {
  return {
    imagesLoaded: assetCache.images.size,
    soundsLoaded: assetCache.audio.size,
    totalLoaded: assetCache.images.size + assetCache.audio.size,
    isFullyLoaded: assetCache.loaded,
    isLoading: assetCache.loading,
  };
}

/**
 * Clear the asset cache
 */
export function clearCache() {
  assetCache.images.clear();
  assetCache.audio.clear();
  assetCache.loaded = false;
  assetCache.loading = false;
}

export default {
  preloadImage,
  preloadAudio,
  preloadAllAssets,
  preloadAllCardSkins,
  preloadEssentialSounds,
  isCardSkinCached,
  getCacheStats,
  clearCache,
};
