/**
 * Seat layout for the oval table.
 *
 * Opponents are spread evenly around the FULL ring (pentagon-style for 5),
 * symmetric about the vertical axis, with the first/middle seat at the top.
 * Positions use the real pixel size of the stage; seats scale down on small
 * screens instead of overlapping or being cropped.
 *
 * Tune SEAT_W / SEAT_H to the natural size of <Seat /> if you change it.
 */
export const SEAT_W = 100;
export const SEAT_H = 98;
const MIN_SCALE = 0.5;
const EDGE_PAD = 20;

export function computeSeatLayout(count, width, height) {
  if (!width || !height || count <= 0) {
    return { scale: 1, cy: (height || 0) / 2, seats: [] };
  }

  // Seats now use the whole ring, so fit them across both width and height.
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

  // Even steps around the ring, centred on the top (270°).
  const step = 360 / count;
  const seats = Array.from({ length: count }, (_, i) => {
    const deg = 270 + step * (i - (count - 1) / 2);
    const rad = (deg * Math.PI) / 180;
    return { x: cx + rx * Math.cos(rad), y: cy + ry * Math.sin(rad) };
  });

  return { scale, cy, seats };
}
