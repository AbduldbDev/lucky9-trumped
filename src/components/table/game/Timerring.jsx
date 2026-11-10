export default function TimerRing({ s, max, warn, paused = false }) {
  const pct = Math.max(0, Math.min(1, s / max));
  const isW = s <= warn && !paused;
  // Slightly softer palette
  const clr = paused ? "#d9a93a" : isW ? "#e5504f" : "#d9b650";

  return (
    <div
      className={isW ? "animate-beat" : ""}
      style={{ display: "flex", flexDirection: "column", gap: 3, width: 84 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: clr,
          opacity: 0.9,
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 10,
          fontWeight: 700,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          textShadow: `0 0 4px ${clr}60`,
        }}
      >
        {paused && (
          <svg
            width="7"
            height="9"
            viewBox="0 0 10 12"
            style={{ filter: `drop-shadow(0 0 2px ${clr}80)` }}
          >
            <rect x="0" y="0" width="3.5" height="12" fill={clr} rx="1" />
            <rect x="6.5" y="0" width="3.5" height="12" fill={clr} rx="1" />
          </svg>
        )}
        <span style={{ margin: "auto" }}>{Math.max(0, s).toFixed(2)}s</span>
      </div>

      <div
        style={{
          height: 4,
          borderRadius: 999,
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxSizing: "content-box",
          overflow: "visible",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${pct * 100}%`,
            height: "100%",
            borderRadius: 999,
            background: `linear-gradient(90deg, ${clr}99, ${clr}cc)`,
            boxShadow: `0 0 4px ${clr}60`,
            transition: "background 0.2s, box-shadow 0.2s",
          }}
        />
      </div>
    </div>
  );
}
