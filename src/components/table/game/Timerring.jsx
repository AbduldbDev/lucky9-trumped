export default function TimerRing({ s, max, warn, paused = false }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const pct = s / max;
  const isW = s <= warn && !paused;
  const clr = paused ? "#fbbf24" : isW ? "#ef4444" : "#c9a84c";

  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 48 48"
      className={isW ? "animate-beat" : ""}
    >
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="3"
      />
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke={clr}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        transform="rotate(-90 24 24)"
        className="timer-circle"
        style={{ filter: `drop-shadow(0 0 3px ${clr})` }}
      />
      {paused ? (
        <g>
          <rect x="18" y="16" width="3" height="16" fill={clr} rx="1" />
          <rect x="27" y="16" width="3" height="16" fill={clr} rx="1" />
        </g>
      ) : (
        <text
          x="24"
          y="28"
          textAnchor="middle"
          fill={clr}
          fontSize="11"
          fontWeight="700"
          fontFamily="'JetBrains Mono',monospace"
        >
          {s}
        </text>
      )}
    </svg>
  );
}
