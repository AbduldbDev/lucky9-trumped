export const SEAT_W = 100;
export const SEAT_H = 98;
const MIN_SCALE = 0.5;
const EDGE_PAD = 20;

// ── Lower row (bottom-left / bottom-right) ─────────────────────────
// Fractions of the ring radius.
const LOWER_PUSH_X = 0.18; // lower-left → further left, lower-right → further right
const LOWER_PUSH_Y = 0.35; // lower seats move up

// ── Second row (the left / right seats above the lower row) ────────
// Pixels. dx: negative = left, positive = right.
//         dy: negative = up,   positive = down.
// Left and right sides are independent.
const ROW2 = {
  left: { dx: -100, dy: -30 }, // e.g. 20px more left, 10px up
  right: { dx: 100, dy: -30 }, // e.g. 20px more right, 10px up
};

export function computeSeatLayout(count, width, height) {
  if (!width || !height || count <= 0) {
    return { scale: 1, cy: (height || 0) / 2, seats: [] };
  }

  const rows = count >= 4 ? 3.0 : 2.2;
  const byWidth = width / (SEAT_W * 2.8);
  const byHeight = height / (SEAT_H * rows);
  const scale = Math.max(MIN_SCALE, Math.min(1, byWidth, byHeight));

  const halfW = (SEAT_W * scale) / 2;
  const halfH = (SEAT_H * scale) / 2;

  const cx = width / 2;
  const cy = height / 2;
  const rx = Math.max(0, width / 2 - halfW - EDGE_PAD);
  const ry = Math.max(0, height / 2 - halfH - EDGE_PAD);

  // Keep seats fully inside the stage after nudging
  const minX = halfW + EDGE_PAD;
  const maxX = width - halfW - EDGE_PAD;
  const minY = halfH + EDGE_PAD;
  const maxY = height - halfH - EDGE_PAD;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  // Even steps around the ring, centred on the top (270°).
  const step = 360 / count;
  const seats = Array.from({ length: count }, (_, i) => {
    const deg = 270 + step * (i - (count - 1) / 2);
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad); // > 0 means the lower half (y grows downward)

    let x = cx + rx * cos;
    let y = cy + ry * sin;

    const side = Math.abs(cos) < 0.05 ? 0 : Math.sign(cos); // -1 left, +1 right

    // Which row is this seat in?
    //   lower  : below the middle line
    //   second : above the middle line but not the very top seat(s)
    //   top    : the top of the ring
    const isLowerRow = sin > 0;
    const isSecondRow = sin <= 0 && sin > -0.95 && side !== 0;

    if (isLowerRow) {
      x += side * rx * LOWER_PUSH_X * sin;
      y -= ry * LOWER_PUSH_Y * sin;
    } else if (isSecondRow) {
      const o = side < 0 ? ROW2.left : ROW2.right;
      x += o.dx;
      y += o.dy;
    }

    x = clamp(x, minX, maxX);
    y = clamp(y, minY, maxY);

    // Lower seats: timer ring on the outer side. Upper seats: faces the centre.
    const isLeft = x < cx - 1;
    const isLower = y > cy;
    const ringSide = isLower
      ? isLeft
        ? "left"
        : "right"
      : isLeft
        ? "right"
        : "left";

    return { x, y, ringSide };
  });

  return { scale, cy, seats };
}
