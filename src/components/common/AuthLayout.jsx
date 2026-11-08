import BrandHero from "./BrandHero.jsx";
export default function AuthLayout({
  children,
  showTagline = true,
  showRules = true,
}) {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden overflow-y-auto">
      {/* ── Ambient background ───────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.04),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.6),transparent_60%)]" />
        {["♠", "♥", "♣", "♦"].map((s, i) => (
          <div
            key={i}
            className="absolute select-none font-serif text-[5rem] sm:text-[11rem] leading-none text-white/[0.03]"
            style={{
              [i < 2 ? "top" : "bottom"]: "2.5rem",
              [i % 2 === 0 ? "left" : "right"]: "2.5rem",
            }}
          >
            {s}
          </div>
        ))}
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col items-center justify-center gap-6 px-4 py-8 sm:gap-10 sm:px-8 sm:py-12 lg:flex-row lg:gap-20 lg:px-12">
        <BrandHero showTagline={showTagline} showRules={showRules} />
        <main className="w-full max-w-md lg:flex-1 lg:max-w-md">
          {children}
        </main>
      </div>
    </div>
  );
}
