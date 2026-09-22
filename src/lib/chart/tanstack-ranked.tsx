import { useMemo, useRef } from 'react';
import { barX, defineChart, group, type ChartFocusStrategy } from '@tanstack/charts';
import { Chart as VendorChart } from '@tanstack/charts/react/core';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import type { PlotSeries } from './tanstack';
import { RENDERER, chartMotion, useChartMount } from './tanstack-motion';

/**
 * Horizontal bars on a band of rows, drawn with TanStack's own `barX`. The
 * vendor owns the bars, the value axis, keyboard focus and click reporting.
 * The component draws what sits around a row: its wash, its name, its total
 * and both tooltips, which open beside a row in a direction the vendor's
 * tooltip cannot be told per row.
 */

/** A row's measurements in px. The bars take `barRoom` of the row's height, starting `barTop` under its top edge. */
export type RankedLayout = {
  rowHeight: number;
  barTop: number;
  barRoom: number;
  /** Room left of the plot for the row names, and right of it for the totals. */
  left: number;
  right: number;
};

export type RankedGeometry = {
  /** The element the plot rectangle is measured from. */
  surface: Element;
  left: number;
  top: number;
  width: number;
  height: number;
  toPixel: (value: number) => number;
};

export type RankedPlotProps = {
  label: string;
  /** The rows, top to bottom. Each name is unique. */
  categories: readonly string[];
  /** One value per category. Stacked, `floors` is where each value starts. */
  series: readonly PlotSeries[];
  stacked: boolean;
  /** The value axis runs from 0 to `max`, labelled at `ticks`. */
  max: number;
  ticks: readonly number[];
  layout: RankedLayout;
  formatValueTick: (value: number) => string;
  onGeometry: (geometry: RankedGeometry) => void;
  /** Where each row's bars end right now, in px from the surface's left, on every frame while they move. */
  onEnds: (ends: ReadonlyMap<string, number>) => void;
  onFocus: (category: string | null) => void;
  onActivate: (category: string) => void;
};

type Bar = { category: string; series: string; color: string; from: number; to: number; freeEnd: boolean };

const TOP = 4;
const AXIS_ROOM = 28;
const GAP = 2;
const STACKED_THICKNESS = 24;
const FREE_END_RADIUS = [0, 4, 4, 0] as const;

/**
 * The vendor's `group-y` focus keys a group by pixel, so side-by-side bars in
 * one row each become their own group, and it walks the keyboard by bar
 * length. A row is the unit here: the pointer takes the row it is in, and the
 * arrow keys walk the rows top to bottom.
 */
function focusRows(categories: readonly string[], rowHeight: number): ChartFocusStrategy<Bar, number, string> {
  return {
    resolve: (points, { y }) => {
      const category = categories[Math.floor((y - TOP) / rowHeight)];
      return points.filter((point) => point.yValue === category);
    },
    group: (points, { point }) => [point, ...points.filter((other) => other.yValue === point.yValue && other !== point)],
    navigation: (points) => categories.flatMap((category) => points.find((point) => point.yValue === category) ?? []),
  };
}

export function RankedPlot(props: RankedPlotProps) {
  const { categories, series, stacked, max, ticks, layout } = props;
  // The formatter changes identity every render; the definition reads the latest without rebuilding for it.
  const latest = useRef(props);
  latest.current = props;
  // The surface publishes its points as they move; one subscription per surface follows them.
  const followed = useRef<unknown>(null);

  const definition = useMemo(() => {
    const bars: Bar[] = categories.flatMap((category, i) => {
      const drawn = series.filter((s) => s.values[i] != null);
      const top = drawn.filter((s) => !s.collapsed);
      return drawn.map((s) => {
        const from = stacked ? (s.floors[i] ?? 0) : 0;
        return {
          category,
          series: s.id,
          color: s.color,
          from,
          to: from + (s.values[i] as number),
          freeEnd: !stacked || s === top[top.length - 1],
        };
      });
    });

    const { rowHeight, barTop, barRoom } = layout;
    const between = rowHeight - barRoom;
    const rows = scaleBand<string>()
      .domain(categories)
      .paddingInner(between / rowHeight)
      .paddingOuter(between / rowHeight / 2)
      .align(barTop / between);
    const each = (barRoom - GAP * (series.length - 1)) / series.length;
    const sideBySide = scaleBand<string>()
      .domain(series.map((s) => s.id))
      .paddingInner(GAP / (each + GAP));

    return defineChart({
      // Every series entrance here is the full one: rows hold their place, so a returning series grows back in.
      motion: chartMotion(() => true),
      focus: focusRows(categories, rowHeight),
      chart: ({ width }) => {
        // Segments are authored in values, so the surface between them is 2px turned into a value.
        const gap = (GAP * max) / Math.max(1, width - layout.left - layout.right);
        return {
          marks: [
            barX(bars, {
              id: 'bars',
              y: 'category',
              x1: (bar) => bar.from + (bar.from > 0 && bar.to > bar.from ? gap : 0),
              x2: 'to',
              z: 'series',
              key: (bar) => `${bar.series}:${bar.category}`,
              fill: (bar) => bar.color,
              radius: (bar) => (bar.freeEnd ? FREE_END_RADIUS : 0),
              ...(stacked ? { maxThickness: STACKED_THICKNESS } : { layout: group({ scale: sideBySide }) }),
            }),
          ],
          scales: {
            x: {
              scale: scaleLinear().domain([0, max]),
              grid: { stroke: 'var(--color-edge-muted)', strokeOpacity: 1 },
              axis: {
                line: false as const,
                ticks: {
                  values: [...ticks],
                  size: 0,
                  padding: 8,
                  format: (value: number) => latest.current.formatValueTick(value),
                },
              },
            },
            y: {
              scale: rows,
              axis: { line: { stroke: 'var(--color-edge)' }, ticks: false as const },
            },
          },
          margin: { top: TOP, right: layout.right, bottom: AXIS_ROOM, left: layout.left },
          theme: {
            foreground: 'var(--color-ink-subtle)',
            muted: 'var(--color-ink-subtle)',
            grid: 'var(--color-edge-muted)',
            background: 'transparent',
            focusRing: false as const,
          },
        };
      },
    });
  }, [categories, series, stacked, max, ticks, layout]);

  const mount = useChartMount();
  if (!mount.ready) return <div ref={mount.holder} style={{ height: TOP + categories.length * layout.rowHeight + AXIS_ROOM }} />;

  return (
    <VendorChart
      renderer={RENDERER}
      definition={definition}
      height={TOP + categories.length * layout.rowHeight + AXIS_ROOM}
      ariaLabel={props.label}
      className="chart-plot relative"
      onFocusGroupChange={(points) => props.onFocus(points[0] ? points[0].yValue : null)}
      onSelect={(point) => {
        if (point) props.onActivate(point.yValue);
      }}
      onRender={({ surface, scene }) => {
        const x = scene.scales.x;
        if (!x) return;
        if (surface !== followed.current) {
          followed.current = surface;
          surface.subscribePresentationPoints?.((points) => {
            const ends = new Map<string, number>();
            for (const point of points) ends.set(point.yValue, Math.max(ends.get(point.yValue) ?? 0, point.x));
            latest.current.onEnds(ends);
          });
        }
        props.onGeometry({
          surface: surface.element,
          left: scene.chart.x,
          top: scene.chart.y,
          width: scene.chart.width,
          height: scene.chart.height,
          toPixel: (value) => x.map(value),
        });
      }}
    />
  );
}
