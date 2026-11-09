import Backdrop from "./Backdrop.jsx";

const Bar = ({ className = "" }) => (
  <div className={`animate-pulse rounded-md bg-white/[0.06] ${className}`} />
);

const Card = ({ children }) => (
  <div className="overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-b from-white/[0.05] to-black/50 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md">
    {children}
  </div>
);

export default function LobbySkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading"
      className="relative min-h-[100dvh] w-full overflow-x-hidden overflow-y-auto"
    >
      <Backdrop />
      <span className="sr-only">Loading your profile…</span>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col items-center justify-center gap-6 px-4 py-8 sm:gap-10 sm:px-8 sm:py-12 lg:flex-row lg:gap-20 lg:px-12">
        {/* Hero */}
        <div className="flex w-full max-w-md flex-col items-center lg:max-w-none lg:flex-1 lg:items-start">
          <Bar className="mb-3 h-4 w-28 sm:mb-4 sm:h-5 sm:w-36" />
          <Bar className="h-10 w-48 sm:h-16 sm:w-80 lg:h-20 lg:w-[26rem]" />
          <Bar className="mt-4 h-3 w-48 sm:mt-5 sm:w-72" />
          <div className="mt-4 flex gap-1.5 sm:mt-6 sm:gap-2">
            {[0, 1, 2].map((i) => (
              <Bar key={i} className="h-6 w-20 rounded-full sm:h-8 sm:w-28" />
            ))}
          </div>
        </div>

        {/* Panel */}
        <div className="w-full max-w-md space-y-3.5 sm:space-y-5 lg:flex-1 lg:max-w-md">
          {/* Player card */}
          <Card>
            <div className="flex items-center gap-3 px-4 pb-3 pt-4 sm:gap-4 sm:px-6 sm:pb-4 sm:pt-5">
              <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-white/[0.06] sm:h-14 sm:w-14" />
              <div className="flex-1 space-y-2">
                <Bar className="h-2 w-20" />
                <Bar className="h-4 w-full sm:h-5" />
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-white/5 border-t border-white/5 bg-black/30">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 px-2 py-3 sm:px-3 sm:py-4"
                >
                  <Bar className="h-4 w-12 sm:h-5 sm:w-16" />
                  <Bar className="h-2 w-14 sm:w-20" />
                </div>
              ))}
            </div>
          </Card>

          {/* Menu card */}
          <Card>
            <div className="p-1.5 sm:p-2">
              <Bar className="h-10 w-full rounded-2xl sm:h-12" />
            </div>
            <div className="space-y-3 px-4 pb-4 pt-2 sm:space-y-4 sm:px-6 sm:pb-6 sm:pt-3">
              <Bar className="mx-auto h-3 w-3/4" />
              <Bar className="h-11 w-full rounded-2xl sm:h-14" />
              <Bar className="h-12 w-full rounded-2xl sm:h-[3.75rem]" />
              <Bar className="h-12 w-full rounded-2xl sm:h-[3.75rem]" />
              <Bar className="h-12 w-full rounded-2xl sm:h-[1.25rem]" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
