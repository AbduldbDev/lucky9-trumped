import { useState } from "react";

/** Max username length — must match profiles.username VARCHAR(20) in the DB. */
export const USERNAME_MAX_LENGTH = 20;

/**
 * Inline username editing state machine: open the editor pre-filled with the
 * current name, save through `onRename` (the service validates + persists),
 * surface the error, or cancel. `null` onRename disables the editor.
 */
export function useUsernameEditor({ username, onRename }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(username);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const start = () => {
    setDraft(username);
    setError("");
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setError("");
  };

  const save = async () => {
    if (!onRename || saving) return;
    const name = draft.trim();
    if (!name) {
      setError("Enter a username.");
      return;
    }
    if (name === username) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onRename(name);
      setEditing(false);
      setError("");
    } catch (err) {
      setError(err.message || "Could not update username.");
    } finally {
      setSaving(false);
    }
  };

  return {
    editing,
    draft,
    setDraft,
    saving,
    error,
    start,
    cancel,
    save,
    enabled: Boolean(onRename),
  };
}
