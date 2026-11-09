import { useCallback, useState } from "react";
import { UPDATES } from "../config/updates.config.js";

/**
 * Put this file at: src/hooks/useUpdateNotice.js
 *
 * Decides whether to open the "What's new" modal when the site opens.
 * The last update the visitor has seen is remembered in localStorage.
 *
 *  - There is an update the visitor hasn't seen -> opens automatically.
 *  - Nothing new                                -> stays closed.
 *
 * The modal always receives the full list (newest first); it expands the
 * latest one and keeps older ones collapsed.
 */
const STORAGE_KEY = "lucky9:lastSeenUpdate";

const readSeen = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // private mode / blocked storage
  }
};

const writeSeen = (id) => {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
};

const hasUnseen = () => {
  if (!UPDATES.length) return false;
  return readSeen() !== UPDATES[0].id;
};

export default function useUpdateNotice() {
  const [open, setOpen] = useState(hasUnseen);

  // Close and remember the newest update as seen.
  const dismiss = useCallback(() => {
    if (UPDATES.length) writeSeen(UPDATES[0].id);
    setOpen(false);
  }, []);

  // Reopen later (e.g. from a "What's new" button).
  const show = useCallback(() => setOpen(true), []);

  return { open, updates: UPDATES, dismiss, show };
}
