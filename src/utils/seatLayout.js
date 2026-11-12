export const SEAT_W = 100;
export const SEAT_H = 98;
const MIN_SCALE = 0.45;

// ── Lower row (bottom-left / bottom-right) ─────────────────────────
// Fractions of the ring radius.
const LOWER_PUSH_X = 0.18; // lower-left → further left, lower-right → further right
const LOWER_PUSH_Y = 0.35; // lower seats move up

// ── Second row (left / right seats above the lower row) ────────────
// Fractions of rx / ry, so it scales with the table.
// One config, mirrored for each side, so left and right always match.
//   dx: pushes outward   dy: negative = up
const ROW2 = { dx: 0.38, dy: -0.11 };

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
// Removes floating-point noise so mirrored seats get identical values
const round = (n) => Math.round(n * 1e6) / 1e6;

export function computeSeatLayout(count, width, height) {
  if (!width || !height || count <= 0) {
    return { scale: 1, centerScale: 1, cy: (height || 0) / 2, seats: [] };
  }

  const size = Math.min(width, height);
  const pad = clamp(size * 0.03, 6, 20);

  // Seat scale: shrink on small stages
  const rows = count >= 4 ? 3.0 : 2.2;
  const byWidth = width / (SEAT_W * 2.8);
  const byHeight = height / (SEAT_H * rows);
  const scale = clamp(Math.min(byWidth, byHeight), MIN_SCALE, 1);

  // Centre cluster (deck, bet, timer, effects) shrinks with the table too
  const centerScale = clamp(size / 520, 0.6, 1);

  const halfW = (SEAT_W * scale) / 2;
  const halfH = (SEAT_H * scale) / 2;

  const cx = width / 2;
  const cy = height / 2;
  const rx = Math.max(0, width / 2 - halfW - pad);
  const ry = Math.max(0, height / 2 - halfH - pad);

  // Keep seats fully inside the stage after nudging
  const minX = halfW + pad;
  const maxX = width - halfW - pad;
  const minY = halfH + pad;
  const maxY = height - halfH - pad;

  // Even steps around the ring, centred on the top (270°).
  const step = 360 / count;
  const seats = Array.from({ length: count }, (_, i) => {
    const deg = 270 + step * (i - (count - 1) / 2);
    const rad = (deg * Math.PI) / 180;
    const cos = round(Math.cos(rad));
    const sin = round(Math.sin(rad)); // > 0 means the lower half

    let x = cx + rx * cos;
    let y = cy + ry * sin;

    const side = Math.abs(cos) < 0.05 ? 0 : Math.sign(cos); // -1 left, +1 right

    const isLowerRow = sin > 0;
    const isSecondRow = sin <= 0 && sin > -0.95 && side !== 0;

    if (isLowerRow) {
      x += side * rx * LOWER_PUSH_X * sin;
      y -= ry * LOWER_PUSH_Y * sin;
    } else if (isSecondRow) {
      x += side * rx * ROW2.dx;
      y += ry * ROW2.dy;
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

  return { scale, centerScale, cy, seats };
}
