import { createMark, type ChartPoint, type SceneNode } from '@tanstack/charts';
import type { PlotSeries } from './tanstack';

/**
 * Vertical bars on a time scale, as a TanStack custom mark. The vendor's
 * `barY` groups bars only on a band scale, and on a continuous scale it sizes
 * every bar at 80% of the step. A custom mark renders against the resolved
 * scales, so it can lay a band out in pixels.
 */

type BarDatum = { series: string; position: number; value: number };

const FREE_END_RADIUS = [4, 4, 0, 0] as const;
const SQUARE = [0, 0, 0, 0] as const;
const GAP = 2;
/** The share of a band the bars take, and where that stops growing, in px. */
const GROUPED = { share: 0.8, max: 96 };
const STACKED = { share: 0.6, max: 56 };

export function timeBars({
  positions,
  series,
  step,
  stacked,
}: {
  positions: readonly number[];
  series: readonly PlotSeries[];
  /** The time between two positions: the width of a band. */
  step: number;
  stacked: boolean;
}) {
  return createMark<BarDatum, Date, number>(() => ({
    id: 'bars',
    channels: {
      x: { scale: 'x', values: positions.map((position) => new Date(position)) },
      y: { scale: 'y', values: [0] },
    },
    render({ scales }) {
      const x = scales.x;
      const y = scales.y;
      if (!x || !y) return { nodes: [] };

      const origin = positions[0] ?? 0;
      const band = Math.abs(x.map(new Date(origin + step)) - x.map(new Date(origin)));
      const { share, max } = stacked ? STACKED : GROUPED;
      const group = Math.min(band * share, max);
      const showing = series.filter((s) => !s.collapsed);
      const width = stacked ? group : Math.max(0, (group - GAP * (showing.length - 1)) / showing.length);

      const nodes: SceneNode[] = [];
      const points: ChartPoint<BarDatum, Date, number>[] = [];
      positions.forEach((position, i) => {
        const centre = x.map(new Date(position));
        const drawn = series.filter((s) => s.values[i] != null);
        const top = drawn.filter((s) => !s.collapsed);
        drawn.forEach((s, k) => {
          const value = s.values[i] as number;
          const floor = s.floors[i] ?? 0;
          const end = y.map(floor + value);
          const surfaceBelow = stacked && k > 0 ? GAP : 0;
          const freeEnd = !stacked || s === top[top.length - 1];
          const point: ChartPoint<BarDatum, Date, number> = {
            key: `${s.id}:${position}`,
            markId: 'bars',
            group: s.id,
            groupLabel: s.label,
            datum: { series: s.id, position, value },
            datumIndex: i,
            xValue: new Date(position),
            yValue: value,
            x: centre,
            y: end,
            color: s.color,
          };
          if (!s.collapsed) points.push(point);
          nodes.push({
            kind: 'rect',
            key: point.key,
            x: stacked ? centre - width / 2 : s.collapsed ? centre : centre - group / 2 + showing.indexOf(s) * (width + GAP),
            y: end,
            width: s.collapsed && !stacked ? 0 : width,
            height: Math.max(0, y.map(floor) - end - surfaceBelow),
            // Always given: the motion renderer morphs a bar only between two shapes that both carry radii.
            cornerRadii: freeEnd ? FREE_END_RADIUS : SQUARE,
            style: { fill: s.color },
            interaction: s.collapsed ? undefined : { point, affinity: 'x' },
          });
        });
      });
      return { nodes: [{ kind: 'group', key: 'bars', className: 'ts-chart__bar ts-chart__bar-y', children: nodes }], points };
    },
  }));
}
