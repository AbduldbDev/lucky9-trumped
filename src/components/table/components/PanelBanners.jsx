export function SpectatorBanner() {
  return (
    <div className="flex-none px-4 py-1.5 bg-purple-950/60 border-b border-purple-700/20 text-center">
      <span className="text-xs text-purple-300/70">
        <i className="fa-solid fa-eye mr-1.5" />
        Spectating — All cards are visible
      </span>
    </div>
  );
}

export function CheckerBanner({ result }) {
  return (
    <div className="flex-none px-4 py-1.5 bg-blue-950/40 border-b border-blue-700/20 text-center">
      <span className="text-xs text-blue-300/70">
        <i className="fa-solid fa-magnifying-glass mr-1.5" />
        Checker: <b className="text-white">{result.count}</b>{" "}
        <span className="font-mono">{result.rank}</span>s left
      </span>
    </div>
  );
}
