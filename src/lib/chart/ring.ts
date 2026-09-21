/**
 * Ring maths for the donut. Angles are radians, clockwise from 12 o'clock.
 * Points are px from the ring's centre, x to the right and y down.
 */

const TURN = Math.PI * 2;

/** How far past the ring's edges the pointer still counts as on it: the grown slice and its pin arc outside, a little slack inside. */
const REACH = { inside: 4, outside: 10 };

export type RingSpan = { from: number; to: number };

/** Shares one turn among the values, in order. A total of zero gives every value an empty span. */
export function ringSpans(values: readonly number[]): RingSpan[] {
  if (values.some((value) => value < 0)) throw new Error('A ring takes values of zero or more');
  const total = values.reduce((sum, value) => sum + value, 0);
  let at = 0;
  return values.map((value) => {
    const from = at;
    if (total > 0) at += (value / total) * TURN;
    return { from, to: at };
  });
}

/** The SVG path of a span between two radii around `centre`, cut back by half of `gap` radians at each end. Null when the gap leaves nothing. */
export function sectorPath(centre: number, span: RingSpan, outer: number, inner: number, gap: number) {
  const from = span.from + gap / 2;
  const to = span.to - gap / 2;
  if (to <= from) return null;
  const at = (radius: number, angle: number) =>
    `${(centre + radius * Math.sin(angle)).toFixed(2)} ${(centre - radius * Math.cos(angle)).toFixed(2)}`;
  const large = to - from > Math.PI ? 1 : 0;
  return `M${at(outer, from)} A${outer} ${outer} 0 ${large} 1 ${at(outer, to)} L${at(inner, to)} A${inner} ${inner} 0 ${large} 0 ${at(inner, from)} Z`;
}

/** Which span a point is on, or -1 off the ring. The surface between two slices counts as the nearer one. */
export function spanAt(spans: readonly RingSpan[], x: number, y: number, outer: number, inner: number) {
  const distance = Math.hypot(x, y);
  if (distance < inner - REACH.inside || distance > outer + REACH.outside) return -1;
  const angle = (Math.atan2(x, -y) + TURN) % TURN;
  return spans.findIndex((span) => angle >= span.from && angle < span.to);
}
