const KEY = "lucky9:lastVisit";

/** Show the intro again if the previous page load was at least this long ago. */
export const INTRO_COOLDOWN_MS = 15 * 60 * 1000;

function readLastVisit() {
  try {
    const v = Number(localStorage.getItem(KEY));
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch {
    return null; // storage blocked (private mode, etc.)
  }
}

/** Call once per page load, BEFORE stampVisit(). */
export function getIntroState() {
  const last = readLastVisit();
  const isFirstVisit = last === null;
  const showIntro = isFirstVisit || Date.now() - last >= INTRO_COOLDOWN_MS;
  return { isFirstVisit, showIntro };
}

/** Records "now" as the latest page load. */
export function stampVisit() {
  try {
    localStorage.setItem(KEY, String(Date.now()));
  } catch {
    /* storage unavailable, intro will simply show next time */
  }
}
