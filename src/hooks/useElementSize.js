import { useLayoutEffect, useRef, useState } from "react";

/**
 * Measures an element's content box and keeps it up to date on resize
 * (orientation change, mobile browser bars, window resize...).
 * Usage: const [ref, { width, height }] = useElementSize();
 */
export function useElementSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
}
