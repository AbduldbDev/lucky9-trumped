import { useEffect } from "react";

const BASE_TITLE = "Lucky 9 Trumped";

/**
 * Sets a per-route document title (falls back to the site name on unmount).
 * The static default lives in index.html; this keeps tabs/breadcrumbs
 * descriptive per screen without extra dependencies.
 */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE_TITLE}` : BASE_TITLE;
  }, [title]);
}
