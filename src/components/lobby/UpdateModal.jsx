import { useEffect, useState } from "react";

const TYPE_STYLES = {
  new: { label: "New", cls: "border-gold/40 bg-gold/15 text-gold-light" },
  improved: {
    label: "Improved",
    cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  fixed: {
    label: "Fixed",
    cls: "border-white/15 bg-white/5 text-ivory-dim/80",
  },
};

/**
 * "What's new" modal as an accordion.
 * The latest update opens automatically; older updates stay collapsed
 * and can be expanded to read. Only one is open at a time.
 */
export default function UpdateModal({ open, updates, onClose }) {
  const latestId = updates?.[0]?.id ?? null;
  const [openId, setOpenId] = useState(latestId);

  const close = () => {
    setOpenId(latestId); // next time it opens, the latest is expanded again
    onClose();
  };

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, latestId]);

  if (!open || !updates?.length) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="What's new"
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-fadeIn"
      onClick={close}
    >
      <div
        className="relative flex max-h-[85dvh] w-full max-w-sm flex-col overflow-hidden rounded-xl border border-gold/30 bg-gradient-to-b from-white/[0.06] to-black/80 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] animate-fadeUp sm:max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top hairline accent */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold-light/70 to-transparent" />

        {/* Header */}
        <div className="flex-none border-b border-white/5 bg-black/30 px-4 py-3 text-center sm:px-6 sm:py-4">
          <span className="text-[8px] font-semibold uppercase tracking-[0.35em] text-gold/80 sm:text-[10px]">
            Release Notes
          </span>
          <h2 className="mt-1 font-serif text-base font-medium tracking-wide text-ivory sm:text-xl">
            What's New
          </h2>
        </div>

        {/* Accordion (scrolls if long) */}
        <div className="flex-1 space-y-2 overflow-y-auto overscroll-contain p-3 [scrollbar-color:rgba(212,175,55,0.35)_transparent] [scrollbar-width:thin] sm:space-y-2.5 sm:p-4">
          {updates.map((update, index) => {
            const isOpen = openId === update.id;
            const isLatest = index === 0;
            const panelId = `update-panel-${update.id}`;

            return (
              <div
                key={update.id}
                className={`overflow-hidden rounded-md border transition-colors duration-200  ${
                  isOpen
                    ? "border-gold/40 bg-gradient-to-br from-gold-faint/30 to-black/40"
                    : "border-gold/15 bg-black/30 hover:border-gold/30"
                }`}
              >
                {/* Accordion header */}
                <button
                  onClick={() => setOpenId(isOpen ? null : update.id)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 sm:gap-3 sm:px-4 sm:py-3"
                >
                  <span className="shrink-0 rounded-full border border-gold/30 bg-gold-faint/40 px-2 py-0.5 font-mono text-[9px] text-gold-light sm:text-[10px]">
                    v{update.version}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate font-serif text-xs font-medium tracking-wide text-ivory sm:text-sm">
                        {update.title}
                      </span>
                      {isLatest && (
                        <span className="shrink-0 rounded-full bg-gold px-1.5 py-px text-[7px] font-bold uppercase tracking-wider text-black sm:text-[8px]">
                          Latest
                        </span>
                      )}
                    </span>
                    <span className="block text-[9px] text-ivory-dim/50 sm:text-[11px]">
                      {update.date}
                    </span>
                  </span>

                  <i
                    className={`fa-solid fa-chevron-down shrink-0 text-[10px] text-gold/70 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Accordion panel: smooth height via grid rows */}
                <div
                  id={panelId}
                  role="region"
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <ul className="space-y-2 border-t border-white/5 px-3 pb-3 pt-3 sm:px-4 sm:pb-4">
                      {update.items.map((item, i) => {
                        const t = TYPE_STYLES[item.type] ?? TYPE_STYLES.new;
                        return (
                          <li key={i} className="flex items-start gap-2.5">
                            <span
                              className={`mt-px w-[58px] flex-none rounded-full border px-1.5 py-0.5 text-center text-[8px] font-semibold uppercase tracking-wider sm:w-16 sm:text-[9px] ${t.cls}`}
                            >
                              {t.label}
                            </span>
                            <span className="text-[11px] leading-relaxed text-ivory-dim/80 sm:text-xs">
                              {item.text}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex flex-none justify-end border-t border-white/5 bg-black/30 px-4 py-3 sm:px-6">
          <button
            onClick={close}
            className="rounded-lg border border-gold/50 bg-gradient-to-b from-gold-faint/70 to-gold-faint/30 px-5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gold-light transition hover:border-gold/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 active:scale-[0.97] sm:text-[11px]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
