import { useMemo, useRef, type ReactNode } from 'react';
import { scaleTime } from 'd3-scale';
import { curveMonotoneX } from 'd3-shape';
import { areaY, defineChart, lineY } from '@tanstack/charts';
import { decorative } from '@tanstack/charts/mark/decorative';
import { d3Curve } from '@tanstack/charts/d3/shape';
import { Chart as VendorChart } from '@tanstack/charts/react/tooltip';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { timeBars } from './tanstack-bars';
import type { ChartWindow } from './window';

/**
 * TanStack Charts is known only to the files named `tanstack*`. This one draws
 * the plot and reports focus, activation and geometry in the chart's own
 * terms. Pinning, range selection, zoom and the focus marks live in the
 * component: the vendor's zoom and brush controls take the pointer away from
 * its own tooltip, and its crosshair marks one series, not all of them.
 */

export type PlotSeries = {
  id: string;
  label: string;
  /** A CSS color. It may be a `var()`. */
  color: string;
  /** One value per position. Null leaves a gap. */
  values: readonly (number | null)[];
  /** Where each value starts: 0, or the top of the series under it in a stack. */
  floors: readonly number[];
};

/** What is drawn for each series. An area is a line over a fill. */
export type PlotMark = 'line' | 'area' | 'bar';

export type PlotGeometry = {
  /** The element the plot rectangle is measured from. */
  surface: Element;
  left: number;
  top: number;
  width: number;
  height: number;
  toPixel: (position: number) => number;
  toPosition: (pixel: number) => number;
  toPixelY: (value: number) => number;
};

export type PlotProps = {
  label: string;
  height: number;
  /** Epoch milliseconds, ascending. */
  positions: readonly number[];
  series: readonly PlotSeries[];
  mark: PlotMark;
  stacked: boolean;
  /** The time between two positions. A bar's band is this wide. */
  step: number;
  window: ChartWindow;
  yMax: number;
  /** Room right of the plot, in px, for labels the component draws at the line ends. */
  marginRight: number;
  /** Off on touch, where a finger would cover it. */
  tooltip: boolean;
  /** Which end of the plot the hover tooltip hangs from. A pinned panel holds the top. */
  tooltipSlot: 'top' | 'bottom';
  formatTick: (position: number) => string;
  formatValueTick: (value: number) => string;
  renderTooltip: (position: number) => ReactNode;
  onGeometry: (geometry: PlotGeometry) => void;
  onFocus: (position: number | null) => void;
  onActivate: (position: number) => void;
};

type Row = { x: Date; floor: number; top: number | null };

/** A fill's opacity at its top edge and at its bottom. */
const BAND_FILL = { top: 0.42, bottom: 0.1 };
const FADING_FILL = { top: 0.28, bottom: 0 };

const MAX_ROW_TICKS = 14;

/** The one curve lines and areas are drawn with. It passes through every row and never leaves the two rows it joins. */
const CURVE = d3Curve(curveMonotoneX);

const TOOLTIP_CLASS =
  'chart-tooltip glass bg-menu-glass border border-edge-muted rounded-xl text-sm text-ink z-tool-tip';

export function Plot(props: PlotProps) {
  const { positions, series, mark, stacked, step, window: win, yMax, marginRight } = props;
  const { tooltipSlot } = props;
  // Formatters change identity every render; the definition reads the latest without rebuilding for them.
  const latest = useRef(props);
  latest.current = props;

  const definition = useMemo(() => {
    const toX = (position: number) => new Date(position);
    const rows = (s: PlotSeries): Row[] =>
      positions.map((position, i) => {
        const value = s.values[i] ?? null;
        const floor = s.floors[i] ?? 0;
        return { x: toX(position), floor, top: value === null ? null : floor + value };
      });
    const fill = stacked ? BAND_FILL : FADING_FILL;

    const inView = positions.filter((position) => position >= win.start && position <= win.end);

    return defineChart(
      {
        marks:
          mark === 'bar'
            ? [timeBars({ positions, series, step, stacked })]
            : [
                ...(mark === 'area'
                  ? series.map((s, i) =>
                      decorative(
                        areaY(rows(s), { id: `${s.id} fill`, x: 'x', y1: 'floor', y2: 'top', fill: `url(#fill-${i})`, fillOpacity: 1, curve: CURVE }),
                      ),
                    )
                  : []),
                ...series.map((s) => lineY(rows(s), { id: s.id, x: 'x', y: 'top', stroke: s.color, strokeWidth: 2, curve: CURVE })),
              ],
        gradients:
          mark === 'area'
            ? series.map((s, i) => ({
                id: `fill-${i}`,
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1,
                stops: [
                  { offset: 0, color: s.color, opacity: fill.top },
                  { offset: 1, color: s.color, opacity: fill.bottom },
                ],
              }))
            : [],
        scales: {
          x: {
            scale: scaleTime().domain([new Date(win.start), new Date(win.end)]),
            axis: {
              line: { stroke: 'var(--color-edge)' },
              // Zoomed in, a time scale would tick between the rows and repeat a day; the rows themselves are the ticks.
              ticks: {
                ...(mark === 'bar' || inView.length <= MAX_ROW_TICKS ? { values: inView.map(toX) } : { spacing: 96 }),
                size: 0,
                padding: 10,
                format: (value: unknown) => latest.current.formatTick(Number(value)),
              },
              tickLabels: { thin: true },
            },
          },
          y: {
            scale: scaleLinear().domain([0, yMax]),
            grid: { stroke: 'var(--color-edge-muted)', strokeOpacity: 1 },
            axis: {
              line: false,
              ticks: {
                values: [0, 1, 2, 3, 4].map((quarter) => (yMax * quarter) / 4),
                size: 0,
                padding: 8,
                format: (value: number) => latest.current.formatValueTick(value),
              },
            },
          },
        },
        clip: true,
        margin: { right: marginRight },
        focus: 'group-x',
        maxFocusDistance: Number.POSITIVE_INFINITY,
        theme: {
          foreground: 'var(--color-ink-subtle)',
          muted: 'var(--color-ink-subtle)',
          grid: 'var(--color-edge-muted)',
          background: 'transparent',
          focusRing: false,
        },
      },
      props.tooltip
        ? {
            tooltip: {
              use: tooltip,
              // The vendor pins one tooltip and freezes hover under it; the component pins its own.
              sticky: false,
              className: TOOLTIP_CLASS,
              offset: 16,
              anchor: { x: 'point', y: tooltipSlot === 'top' ? 'plot-top' : 'plot-bottom' },
              placement: tooltipSlot === 'top' ? ['bottom-right', 'bottom-left'] : ['top-right', 'top-left'],
            },
          }
        : {},
    );
  }, [positions, series, mark, stacked, step, win.start, win.end, yMax, marginRight, props.tooltip, tooltipSlot]);

  return (
    <VendorChart
      definition={definition}
      height={props.height}
      ariaLabel={props.label}
      className="chart-plot"
      renderTooltipBody={({ points }) => {
        const first = points[0];
        return first ? props.renderTooltip(Number(first.xValue)) : null;
      }}
      onFocusGroupChange={(points) => props.onFocus(points[0] ? Number(points[0].xValue) : null)}
      onSelect={(point) => {
        if (point) props.onActivate(Number(point.xValue));
      }}
      onRender={({ svg, scene }) => {
        const x = scene.scales.x;
        const y = scene.scales.y;
        if (!x?.invert || !y) return;
        const invert = x.invert;
        props.onGeometry({
          surface: svg,
          left: scene.chart.x,
          top: scene.chart.y,
          width: scene.chart.width,
          height: scene.chart.height,
          toPixel: (position) => x.map(new Date(position)),
          toPosition: (pixel) => Number(invert(pixel)),
          toPixelY: (value) => y.map(value),
        });
      }}
    />
  );
}
