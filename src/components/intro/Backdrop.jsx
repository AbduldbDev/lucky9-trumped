export default function Backdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
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
  );
}
