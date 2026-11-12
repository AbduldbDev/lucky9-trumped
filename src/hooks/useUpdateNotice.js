import { useCallback, useState } from "react";
import { UPDATES } from "../config/updates.config.js";

const STORAGE_KEY = "lucky9:lastSeenUpdate";
const RELEASED_UPDATES = UPDATES.filter((u) => u.released === true);

const readSeen = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
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
  if (!RELEASED_UPDATES.length) return false;
  return readSeen() !== RELEASED_UPDATES[0].id;
};

export default function useUpdateNotice() {
  const [open, setOpen] = useState(hasUnseen);

  // Close and remember the newest released update as seen.
  const dismiss = useCallback(() => {
    if (RELEASED_UPDATES.length) writeSeen(RELEASED_UPDATES[0].id);
    setOpen(false);
  }, []);

  // Reopen later (e.g. from a "What's new" button).
  const show = useCallback(() => setOpen(true), []);

  return { open, updates: RELEASED_UPDATES, dismiss, show };
}
