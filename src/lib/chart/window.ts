/** The visible stretch of the x axis, in the axis's own numbers (a Date is its epoch ms). */
export type ChartWindow = { start: number; end: number };

/** Both ends included. A range always snaps to data positions. */
export type ChartRange = { start: number; end: number };

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export const span = (w: ChartWindow) => w.end - w.start;

export const isZoomed = (w: ChartWindow, extent: ChartWindow) => span(w) < span(extent) - 1e-9;

/**
 * Zooms by `factor` (below 1 zooms in) while the value under the pointer
 * stays under the pointer. `at` is the pointer's place across the plot, 0 to 1.
 */
export function zoomAt(w: ChartWindow, extent: ChartWindow, at: number, factor: number, minSpan: number): ChartWindow {
  const next = clamp(span(w) * factor, Math.min(minSpan, span(extent)), span(extent));
  const anchor = w.start + at * span(w);
  const start = clamp(anchor - at * next, extent.start, extent.end - next);
  return { start, end: start + next };
}

export function panBy(w: ChartWindow, extent: ChartWindow, by: number): ChartWindow {
  const shift = clamp(by, extent.start - w.start, extent.end - w.end);
  return { start: w.start + shift, end: w.end + shift };
}

/** The data position nearest to `value`. `positions` is sorted ascending. */
export function snap(positions: readonly number[], value: number): number {
  let best = positions[0] ?? value;
  for (const p of positions) if (Math.abs(p - value) < Math.abs(best - value)) best = p;
  return best;
}

/** The data position one step from `value`, or `value` at either end. */
export function step(positions: readonly number[], value: number, by: 1 | -1): number {
  const i = positions.indexOf(snap(positions, value));
  return positions[clamp(i + by, 0, positions.length - 1)] ?? value;
}

/** A range from two dragged ends, in order. Null when both land on one position. */
export function rangeOf(positions: readonly number[], a: number, b: number): ChartRange | null {
  const start = snap(positions, Math.min(a, b));
  const end = snap(positions, Math.max(a, b));
  return end > start ? { start, end } : null;
}

/** Zooming into a range never goes below `minSpan`; a narrow range is centred in it. */
export function windowOf(range: ChartRange, extent: ChartWindow, minSpan: number): ChartWindow {
  const width = Math.max(range.end - range.start, Math.min(minSpan, span(extent)));
  const start = clamp((range.start + range.end) / 2 - width / 2, extent.start, extent.end - width);
  return { start, end: start + width };
}
