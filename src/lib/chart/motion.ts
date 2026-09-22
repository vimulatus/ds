import { useEffect, useRef, useState, type CSSProperties } from 'react';

/** How long a chart takes to grow in, and to glide from one view to the next. */
export const CHART_ENTER_MS = 420;
export const CHART_CHANGE_MS = 240;
/** A series shown or hidden from the legend after that. */
export const CHART_TOGGLE_MS = 120;

/** The design system's curve, as the CSS that overlays move on. */
const CHART_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** The timings as CSS variables, set on a chart so `chart.css` moves its overlays in step with the marks. */
export const CHART_MOTION_VARS = {
  '--chart-enter': `${CHART_ENTER_MS}ms`,
  '--chart-change': `${CHART_CHANGE_MS}ms`,
  '--chart-ease': CHART_EASING,
} as CSSProperties;

const X1 = 0.16;
const Y1 = 1;
const X2 = 0.3;
const Y2 = 1;

const bezier = (t: number, a: number, b: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t ** 2 * (1 - t) + t ** 3;

/** `CHART_EASING` as a function of progress, for a renderer that takes no CSS curve. */
export function chartEase(progress: number) {
  let low = 0;
  let high = 1;
  for (let i = 0; i < 24; i++) {
    const t = (low + high) / 2;
    if (bezier(t, X1, X2) < progress) low = t;
    else high = t;
  }
  return bezier((low + high) / 2, Y1, Y2);
}

/**
 * Numbers that glide to `target` on the chart's curve. They start at `from`, take the entrance's time to arrive the
 * first time and a legend toggle's time after that, and snap under reduced motion. `target` keeps its length.
 */
export function useGlide(target: readonly number[], from: readonly number[]) {
  const [shown, setShown] = useState(from);
  const at = useRef(from);
  const arrived = useRef(false);
  const key = target.join(' ');

  useEffect(() => {
    const start = at.current;
    const duration = arrived.current ? CHART_TOGGLE_MS : CHART_ENTER_MS;
    arrived.current = true;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || start.join(' ') === key) {
      at.current = target;
      setShown(target);
      return;
    }
    const began = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const eased = chartEase(Math.min(1, (now - began) / duration));
      at.current = target.map((end, i) => (start[i] ?? end) + (end - (start[i] ?? end)) * eased);
      setShown(at.current);
      if (now - began < duration) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
    // `key` stands for `target`, whose identity changes every render.
  }, [key]);

  return shown;
}
