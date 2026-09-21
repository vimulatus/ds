import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { ChartMark } from '@/components/Chart';
import { Legend, SeriesKey, TooltipBody, formatChange, seriesColor, type TooltipRow } from '@/lib/chart/parts';
import type { PlotSeries } from '@/lib/chart/tanstack';
import { RankedPlot, type RankedGeometry, type RankedLayout } from '@/lib/chart/tanstack-ranked';
import { useOutsidePress } from '@/lib/chart/outside';
import { cn } from '@/lib/cn';
import { useTouch } from '@/lib/touch';

export type RankedBarsProps<Row> = {
  data: readonly Row[];
  /** What a row is called. Each name is unique. */
  category: (row: Row) => string;
  /** `bar()` marks, one per series. */
  marks: readonly ChartMark<Row>[];
  /** One bar per row, its segments adding up, with the total at its end. */
  stacked?: boolean;
  /** The chart's accessible name: what is measured, in what unit. */
  label: string;
  title?: ReactNode;
  description?: ReactNode;
  /** A value in a tooltip and at a bar's end: "433.7 kL". */
  formatValue?: (value: number) => string;
  /** A value on the axis: "200 kL". */
  formatValueTick?: (value: number) => string;
  className?: string;
};

const NUMBER = new Intl.NumberFormat();
const COMPACT = new Intl.NumberFormat(undefined, { notation: 'compact' });

const DESKTOP_ROW = { rowHeight: 56, barTop: 10, barRoom: 36, right: 72 };
/** On a phone the name sits above its bar, so the bars start lower in the row and the plot starts at the edge. */
const PHONE_ROW = { rowHeight: 58, barTop: 24, barRoom: 22, right: 58, left: 0 };
const NAME_INSET = 4;
const NAME_GAP = 16;
/** A floating panel overlaps the row it belongs to by this much, and may leave the plot by `OVERHANG`. */
const ROW_OVERLAP = 2;
const OVERHANG = 24;
const PANEL_GAP = 8;
const DOUBLE_CLICK_MS = 400;

type Size = { width: number; height: number };
type Box = Size & { left: number; top: number };

/**
 * Categories ranked by value, as horizontal bars. Rows sort by what is
 * showing. Hover reads a row, a click pins it, and the next hover compares
 * against the pin. There is no time axis, so nothing zooms or selects a range.
 */
export function RankedBars<Row>({
  data,
  category,
  marks,
  stacked = false,
  label,
  title,
  description,
  className,
  ...format
}: RankedBarsProps<Row>) {
  const touch = useTouch();
  if (marks.some((mark) => mark.kind !== 'bar')) throw new Error('Ranked bars take bar() marks');

  const [pin, setPin] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const [nameRoom, setNameRoom] = useState(0);
  const [, setGeometryTick] = useState(0);

  const root = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const geometry = useRef<RankedGeometry | null>(null);
  const pinnedAt = useRef(0);

  useOutsidePress(root, () => setPin(null));
  const [tooltip, tooltipSize] = useSize();
  const [panel, panelSize] = useSize();

  const formatValue = format.formatValue ?? ((value: number) => NUMBER.format(value));
  const formatValueTick = format.formatValueTick ?? ((value: number) => COMPACT.format(value));

  const entries = useMemo(() => marks.map((mark, i) => ({ id: mark.label, label: mark.label, color: seriesColor(i) })), [marks]);

  const max = useMemo(() => axisMax(data, marks, stacked), [data, marks, stacked]);

  const { categories, series } = useMemo(() => {
    const shown = marks.filter((mark) => !hidden.has(mark.label));
    const rows = [...data].sort((a, b) => rowTotal(b, shown) - rowTotal(a, shown));
    const height = rows.map(() => 0);
    const series = entries
      .map((entry, i) => ({ ...entry, mark: marks[i] as ChartMark<Row> }))
      .filter((entry) => !hidden.has(entry.id))
      .map(({ mark, ...entry }): PlotSeries => {
        const values = rows.map(mark.value);
        const floors = [...height];
        if (stacked) values.forEach((value, i) => (height[i] = (height[i] ?? 0) + (value ?? 0)));
        return { ...entry, values, floors };
      });
    return { categories: rows.map(category), series };
  }, [data, category, marks, entries, hidden, stacked]);

  const layout = useMemo(
    (): RankedLayout => (touch ? PHONE_ROW : { ...DESKTOP_ROW, left: NAME_INSET + nameRoom + NAME_GAP }),
    [touch, nameRoom],
  );
  const ticks = useMemo(
    () => [0, 1, 2, 3, 4, 5].filter((fifth) => !touch || fifth % 2 === 0).map((fifth) => (max * fifth) / 5),
    [max, touch],
  );

  // A web font that arrives late resizes the names, so they are watched and not read once.
  useLayoutEffect(() => {
    const names = [...(wrapper.current?.querySelectorAll<HTMLElement>('[data-slot=ranked-bars-name]') ?? [])];
    const measure = () => setNameRoom(Math.ceil(Math.max(0, ...names.map((name) => name.offsetWidth))));
    measure();
    const observer = new ResizeObserver(measure);
    names.forEach((name) => observer.observe(name));
    return () => observer.disconnect();
  }, [categories]);

  /** The visible series with a value in a row, in the legend's order. */
  const valuesAt = (name: string) => {
    const i = categories.indexOf(name);
    return series
      .map((s) => ({ series: s, value: s.values[i] ?? null }))
      .filter((r): r is { series: PlotSeries; value: number } => r.value !== null);
  };
  const totalAt = (name: string) => valuesAt(name).reduce((sum, r) => sum + r.value, 0);
  /** Where a row's bars end on the value axis. */
  const endAt = (name: string) => (stacked ? totalAt(name) : Math.max(0, ...valuesAt(name).map((r) => r.value)));

  /** A click, Enter or Space on a row. */
  function onActivate(name: string) {
    if (touch) return;
    const now = performance.now();
    const secondOfDoubleClick = now - pinnedAt.current < DOUBLE_CLICK_MS;
    pinnedAt.current = now;
    setPin((current) => (current === name && !secondOfDoubleClick ? null : name));
  }

  function toggle(id: string) {
    setHidden((h) => {
      const next = new Set(h);
      if (!next.delete(id)) next.add(id);
      return next;
    });
    setPin(null);
    setHover(null);
  }

  const tooltipBody = (name: string, against: string | null, close?: () => void) => {
    const base = against === null ? null : new Map(valuesAt(against).map((r) => [r.series.id, r.value]));
    const values = stacked ? valuesAt(name) : valuesAt(name).sort((a, b) => b.value - a.value);
    const rows: TooltipRow[] = values.map(({ series: s, value }) => ({
      id: s.id,
      label: s.label,
      color: s.color,
      value: formatValue(value),
      change: base ? formatChange(value - (base.get(s.id) ?? value)) : undefined,
    }));
    const total = {
      value: formatValue(totalAt(name)),
      change: against === null ? undefined : formatChange(totalAt(name) - totalAt(against)),
    };
    return (
      <TooltipBody
        heading={name}
        versus={against ?? undefined}
        rows={rows}
        total={stacked ? total : undefined}
        shape="block"
        onClose={close}
      />
    );
  };

  const g = geometry.current;
  const el = wrapper.current;
  const plot = (() => {
    if (!g || !el) return null;
    const surface = g.surface.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    return {
      left: surface.left - box.left + g.left,
      top: surface.top - box.top + g.top,
      chartWidth: box.width,
      chartHeight: box.height,
      toPixel: (value: number) => surface.left - box.left + g.toPixel(value),
    };
  })();

  const pinIndex = pin === null ? -1 : categories.indexOf(pin);
  const hoverIndex = hover === null || hover === pin ? -1 : categories.indexOf(hover);
  const rowTop = (i: number) => (plot?.top ?? 0) + i * layout.rowHeight;

  /** A panel beside row `i`, never over it: on the side asked for while it fits, else on the other. */
  const beside = (i: number, above: boolean, left: number, size: Size): Box => {
    const tops = { above: rowTop(i) - size.height + ROW_OVERLAP, below: rowTop(i) + layout.rowHeight - ROW_OVERLAP };
    const fits = { above: tops.above >= -OVERHANG, below: tops.below + size.height <= (plot?.chartHeight ?? 0) + OVERHANG };
    const side = above ? (fits.above || !fits.below ? 'above' : 'below') : fits.below || !fits.above ? 'below' : 'above';
    return { ...size, left, top: tops[side] };
  };

  /** The pinned panel keeps the right edge. */
  const panelBox =
    plot && pinIndex >= 0
      ? beside(pinIndex, pinIndex >= categories.length / 2, plot.chartWidth - panelSize.width, panelSize)
      : null;
  /** The hover tooltip follows its bar's end, opens away from a pinned row so both stay in view, and steps left of the panel when the two would meet. */
  const tooltipBox = (() => {
    if (!plot || hoverIndex < 0 || hover === null || touch) return null;
    const above = pinIndex >= 0 ? hoverIndex < pinIndex : hoverIndex >= categories.length / 2;
    const centred = plot.toPixel(endAt(hover)) - tooltipSize.width / 2;
    const box = beside(hoverIndex, above, clamp(centred, plot.left, plot.chartWidth - tooltipSize.width), tooltipSize);
    const meets =
      panelBox &&
      box.left + box.width > panelBox.left - PANEL_GAP &&
      box.top < panelBox.top + panelBox.height &&
      panelBox.top < box.top + box.height;
    return meets ? { ...box, left: Math.max(0, panelBox.left - box.width - PANEL_GAP) } : box;
  })();

  return (
    <div ref={root} data-slot="ranked-bars" className={cn('flex flex-col gap-3 touch:gap-2.5', className)}>
      {(title || description) && (
        <div className="flex min-h-8 flex-col justify-center gap-0.5">
          {title && <div className="text-sm font-medium text-ink">{title}</div>}
          {description && <div className="text-xs text-ink-subtle">{description}</div>}
        </div>
      )}

      {touch && (
        <div className="flex min-h-9 items-baseline gap-3 rounded-lg bg-hover px-2.5 py-2 text-xs">
          <span className="grow text-ink-subtle">{hover ?? 'Tap a row'}</span>
          {hover !== null &&
            valuesAt(hover).map(({ series: s, value }) => (
              <span key={s.id} className="flex items-center gap-1 tabular-nums text-ink">
                <SeriesKey color={s.color} shape="block" />
                {formatValue(value)}
              </span>
            ))}
        </div>
      )}

      <Legend entries={entries} hidden={hidden} onToggle={toggle} shape="block" className="touch:order-last" />

      <div
        ref={wrapper}
        className="chart relative touch-pan-y select-none"
        onKeyDown={(e) => {
          if (e.key === 'Escape') setPin(null);
        }}
      >
        {plot &&
          categories.map(
            (name, i) =>
              (name === pin || name === hover) && (
                <span
                  key={name}
                  className={cn(
                    'pointer-events-none absolute inset-x-0 rounded-lg border bg-ink/6',
                    name === pin ? 'border-edge' : 'border-transparent',
                  )}
                  style={{ top: rowTop(i) + 2, height: layout.rowHeight - 4 }}
                  aria-hidden
                />
              ),
          )}

        <RankedPlot
          label={label}
          categories={categories}
          series={series}
          stacked={stacked}
          max={max}
          ticks={ticks}
          layout={layout}
          formatValueTick={formatValueTick}
          onFocus={setHover}
          onActivate={onActivate}
          onGeometry={(next) => {
            const before = geometry.current;
            geometry.current = next;
            const overlaysAreStale =
              !before ||
              (['left', 'top', 'width', 'height'] as const).some((k) => before[k] !== next[k]) ||
              before.toPixel(max) !== next.toPixel(max);
            if (overlaysAreStale) setGeometryTick((n) => n + 1);
          }}
        />

        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {categories.map((name, i) => {
            const held = name === pin || name === hover;
            return (
              <div key={name}>
                <span
                  data-slot="ranked-bars-name"
                  className={cn(
                    'absolute max-w-40 truncate text-xs touch:max-w-full',
                    held ? 'text-ink' : 'text-ink-muted',
                    !plot && 'invisible',
                  )}
                  style={{
                    left: touch ? 0 : NAME_INSET,
                    top: rowTop(i) + (touch ? 4 : layout.rowHeight / 2 - 8),
                  }}
                >
                  {name}
                </span>
                {stacked && plot && (
                  <span
                    data-slot="ranked-bars-total"
                    className="absolute text-xs tabular-nums text-ink-muted"
                    style={{ left: plot.toPixel(totalAt(name)) + 8, top: rowTop(i) + layout.barTop + layout.barRoom / 2 - 8 }}
                  >
                    {formatValue(totalAt(name))}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {tooltipBox && hover !== null && (
          <div
            ref={tooltip}
            data-slot="ranked-bars-tooltip"
            role="status"
            className={cn(
              'glass pointer-events-none absolute z-tool-tip rounded-xl border border-edge-muted bg-menu-glass text-sm text-ink',
              pinIndex >= 0 ? 'min-w-61' : 'min-w-44',
            )}
            style={{ left: tooltipBox.left, top: tooltipBox.top }}
          >
            {tooltipBody(hover, pinIndex >= 0 ? pin : null)}
          </div>
        )}

        {panelBox && pin !== null && !touch && (
          <div
            ref={panel}
            data-chart-ui=""
            role="status"
            className="glass absolute min-w-44 cursor-default select-text rounded-xl border border-edge-muted bg-menu-glass text-sm"
            style={{ left: panelBox.left, top: panelBox.top }}
            onPointerEnter={() => setHover(null)}
          >
            {tooltipBody(pin, null, () => setPin(null))}
          </div>
        )}
      </div>
    </div>
  );
}

/** An element's rendered size, read after every render, so a panel can be placed by its own width and height. */
function useSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && (el.offsetWidth !== size.width || el.offsetHeight !== size.height)) {
      setSize({ width: el.offsetWidth, height: el.offsetHeight });
    }
  });
  return [ref, size] as const;
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/** A row's rank: the sum of what is showing, stacked or not, so both forms of one chart list the rows in one order. */
function rowTotal<Row>(row: Row, marks: readonly ChartMark<Row>[]) {
  return marks.reduce((sum, mark) => sum + (mark.value(row) ?? 0), 0);
}

/** How far a row's bars reach: the total when they stack, the largest when they sit side by side. */
function barLength<Row>(row: Row, marks: readonly ChartMark<Row>[], stacked: boolean) {
  return stacked ? rowTotal(row, marks) : Math.max(0, ...marks.map((mark) => mark.value(row) ?? 0));
}

/**
 * Where the value axis ends: the next 1, 2, 2.5 or 5 times a power of ten past the longest row, so five even ticks
 * land on round numbers. It counts every series, hidden or not, so hiding one re-ranks the rows and the scale holds still.
 */
function axisMax<Row>(data: readonly Row[], marks: readonly ChartMark<Row>[], stacked: boolean) {
  const max = Math.max(1, ...data.map((row) => barLength(row, marks, stacked)));
  const power = 10 ** Math.floor(Math.log10(max));
  const lead = [10, 20, 25, 50, 100].find((n) => (n * power) / 10 >= max) ?? 100;
  return (lead * power) / 10;
}
