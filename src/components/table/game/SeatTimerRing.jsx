import { GAME_CONFIG } from "../../../config/gameRules.config.js";

const R = 12;
const C = 2 * Math.PI * R;

export default function SeatTimerRing({
  secondsLeft = 0,
  paused = false,
  active = true,
  name = "",
  onClick = null,
}) {
  const { TURN_TIMER, TIMER_WARNING } = GAME_CONFIG;
  const progress =
    TURN_TIMER > 0 ? Math.min(1, Math.max(0, secondsLeft / TURN_TIMER)) : 0;
  const warning = active && !paused && secondsLeft <= TIMER_WARNING;
  const color = !active
    ? "rgba(200,192,170,0.55)"
    : paused
      ? "#fbbf24"
      : warning
        ? "#ef4444"
        : "#c9a84c";

  return (
    <button
      aria-hidden="true"
      onClick={onClick ?? undefined}
      disabled={!onClick}
      title={`View ${name}'s statistics`}
      className={`relative flex h-7 w-7 flex-none items-center justify-center rounded-full bg-black/60 sm:h-8 sm:w-8 ${
        onClick ? "cursor-pointer active:scale-95" : "cursor-default"
      }`}
    >
      <svg
        viewBox="0 0 28 28"
        className={`absolute inset-[-3px] h-[calc(100%+6px)] w-[calc(100%+6px)] ${
          warning ? "animate-beat" : ""
        }`}
        style={{ overflow: "visible" }}
      >
        {/* Track */}
        <circle
          cx="14"
          cy="14"
          r={R}
          fill="none"
          stroke={active ? "rgba(255,255,255,0.08)" : "rgba(201,168,76,0.18)"}
          strokeWidth="1.5"
        />

        {/* Countdown arc (turn only) */}
        {active && (
          <circle
            cx="14"
            cy="14"
            r={R}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={C}
            transform="rotate(-90 14 14)"
            style={{
              stroke: color,
              strokeDashoffset: C * (1 - progress),
              transition: "stroke-dashoffset 1s linear, stroke 0.3s ease",
              filter: `drop-shadow(0 0 3px ${color})`,
            }}
          />
        )}
      </svg>

      <i
        className="fa-solid fa-user relative z-10 text-[9px] sm:text-[11px]"
        style={{ color }}
      />
    </button>
  );
}
