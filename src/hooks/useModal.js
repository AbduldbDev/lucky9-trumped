import { useCallback, useEffect, useState } from "react";

/** One open overlay at a time. Escape closes it. */
export function useModal() {
  const [active, setActive] = useState(null);

  const open = useCallback((name) => setActive(name), []);
  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (!active) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, close]);

  return { active, open, close };
}
