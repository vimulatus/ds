import { useEffect, useRef, useState } from 'react';
import { motion } from '@tanstack/charts/motion';
import { CHART_CHANGE_MS, CHART_ENTER_MS, CHART_TOGGLE_MS, chartEase } from './motion';

/** The renderer that reads a definition's `motion`. It snaps under reduced motion. */
export const RENDERER = motion();

/** How long the last bar waits to start growing. The vendor's own stagger has no bound, and 40 bars took over a second. */
const STAGGER_MS = 160;

type Context = { phase: 'enter' | 'update' | 'exit'; role: string; datumIndex: number; datumCount: number };

const tween = (duration: number) => ({ type: 'tween' as const, duration, easing: chartEase });

/**
 * A definition's motion. On the chart's entrance (`entering`) marks grow in, the later ones a little after the first;
 * a series that comes or goes later does so quickly. Views glide. Lines the CSS draws on (`drawn`) get no entrance here.
 */
export function chartMotion(entering: () => boolean, drawn: () => boolean = () => false) {
  return ({ phase, role, datumIndex, datumCount }: Context) => {
    if (phase === 'update') return { transition: tween(CHART_CHANGE_MS) };
    if (!entering()) return { delay: 0, transition: tween(CHART_TOGGLE_MS) };
    if (role === 'line' && drawn()) return false;
    return { delay: (datumIndex / Math.max(1, datumCount - 1)) * STAGGER_MS, transition: tween(CHART_ENTER_MS) };
  };
}

/**
 * Holds a chart back until the font it inherits has loaded, then counts its entrance. The vendor renders again when a
 * font finishes loading, and that second render cancels the entrance. Put `holder` on a placeholder while `ready` is
 * false; `entering` stays true until the marks have grown in.
 */
export function useChartMount() {
  const holder = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [entering, setEntering] = useState(true);
  useEffect(() => {
    if (ready || !holder.current) return;
    const style = getComputedStyle(holder.current);
    void document.fonts.load(`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`).finally(() => setReady(true));
  }, [ready]);
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => setEntering(false), CHART_ENTER_MS + STAGGER_MS + CHART_CHANGE_MS);
    return () => clearTimeout(timer);
  }, [ready]);
  return { holder, ready, entering };
}
