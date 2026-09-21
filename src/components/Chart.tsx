import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { ArrowCounterClockwise, X } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import { Hotkey } from '@/components/Hotkey';
import { Legend, SeriesKey, TooltipBody, formatChange, seriesColor, type TooltipRow } from '@/lib/chart/parts';
import { Plot, type PlotGeometry, type PlotSeries } from '@/lib/chart/tanstack';
import {
  isZoomed,
  panBy,
  rangeOf,
  span,
  step,
  windowOf,
  zoomAt,
  type ChartRange,
  type ChartWindow,
} from '@/lib/chart/window';
import { useOutsidePress } from '@/lib/chart/outside';
import { cn } from '@/lib/cn';
import { useTouch } from '@/lib/touch';

export type ChartMark<Row> = {
  kind: 'line' | 'area' | 'bar';
  label: string;
  value: (row: Row) => number | null;
};

type NumericKey<Row> = { [K in keyof Row]: Row[K] extends number | null | undefined ? K : never }[keyof Row] & string;

/** `y` names a numeric field, or derives the number. */
type MarkOptions<Row> = { y: NumericKey<Row> | ((row: Row) => number | null); label: string };

function markOf<Row>(kind: ChartMark<Row>['kind'], { y, label }: MarkOptions<Row>): ChartMark<Row> {
  return {
    kind,
    label,
    value: typeof y === 'function' ? y : (row) => (row[y] as number | null | undefined) ?? null,
  };
}

/** A line per series. */
export function line<Row>(options: MarkOptions<Row>) {
  return markOf('line', options);
}

/** A line per series over a fill that fades to the baseline; bands that add up when the chart is `stacked`. */
export function area<Row>(options: MarkOptions<Row>) {
  return markOf('area', options);
}

/** A bar per series in each position's band: side by side, or one bar of segments when the chart is `stacked`. */
export function bar<Row>(options: MarkOptions<Row>) {
  return markOf('bar', options);
}

export type ChartProps<Row> = {
  data: readonly Row[];
  /** When a row happened. Rows are sorted by it. */
  x: (row: Row) => Date;
  /** Marks of one kind: all `line()`, all `area()` or all `bar()`. */
  marks: readonly ChartMark<Row>[];
  /** Areas and bars add up, each series on top of the one before it. A line chart ignores it. */
  stacked?: boolean;
  /** The chart's accessible name: what is measured, in what unit. */
  label: string;
  title?: ReactNode;
  description?: ReactNode;
  /** The plot's height in px. Default 320. */
  height?: number;
  /** A position in a tooltip and on the crosshair: "Mon 17 Aug". */
  formatX?: (at: Date) => string;
  /** A position on the axis: "17 Aug". */
  formatTick?: (at: Date) => string;
  /** A value in a tooltip: "5,955 L". */
  formatValue?: (value: number) => string;
  /** A value on the axis: "6k". */
  formatValueTick?: (value: number) => string;
  /** A selected range: "12 – 18 Aug · 7 days". `count` is the rows inside it. */
  formatRange?: (start: Date, end: Date, count: number) => string;
  className?: string;
};

const DAY = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
const TICK = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' });
const NUMBER = new Intl.NumberFormat();
const COMPACT = new Intl.NumberFormat(undefined, { notation: 'compact' });

/** Zoom stops at a window this many steps wide. For bars a step is a band. */
const MIN_ZOOM_STEPS = { line: 3, area: 3, bar: 2 };
/** Side by side, more fills than this turn to mud, so the chart draws lines only. */
const MAX_FADING_FILLS = 3;
const END_LABEL_ROOM = 68;
const BAR_EDGE_ROOM = 12;
const DRAG_THRESHOLD = 4;
const DOUBLE_CLICK_MS = 400;

type Drag =
  | { kind: 'pending'; x: number; shift: boolean }
  | { kind: 'select'; from: number }
  | { kind: 'pan'; x: number; window: ChartWindow }
  | { kind: 'handle'; fixed: number };

/**
 * A chart with the behaviour every chart shares: a grouped tooltip and
 * crosshair on hover, a click that pins a position so the next hover compares
 * against it, a drag that selects a range, and zoom on the x axis. Marks say
 * what is drawn: `line()`, `area()` or `bar()`.
 */
export function Chart<Row>({
  data,
  x,
  marks,
  stacked = false,
  label,
  title,
  description,
  height = 320,
  className,
  ...format
}: ChartProps<Row>) {
  const touch = useTouch();

  const kind = marks[0]?.kind ?? 'line';
  if (marks.some((mark) => mark.kind !== kind)) throw new Error('A chart has marks of one kind');
  const stacks = stacked && kind !== 'line';
  const bars = kind === 'bar';
  const keyShape = bars || stacks ? 'block' : 'line';

  const { positions, series, yMax, extent, minSpan, interval, halfBand } = useMemo(() => {
    const rows = [...data].sort((a, b) => Number(x(a)) - Number(x(b)));
    const positions = rows.map((row) => Number(x(row)));
    const series = marks.map((mark, i) => ({
      id: mark.label,
      label: mark.label,
      color: seriesColor(i),
      values: rows.map(mark.value),
    }));
    const heights = stacks
      ? positions.map((_, i) => series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0))
      : series.flatMap((s) => s.values.map((v) => v ?? 0));
    const first = positions[0] ?? 0;
    const last = positions[positions.length - 1] ?? 1;
    const interval = (last - first) / Math.max(1, positions.length - 1);
    const halfBand = bars ? interval / 2 : 0;
    return {
      positions,
      series,
      yMax: niceCeil(Math.max(1, ...heights)),
      extent: { start: first - halfBand, end: last + halfBand },
      minSpan: interval * MIN_ZOOM_STEPS[kind],
      interval,
      halfBand,
    };
  }, [data, x, marks, kind, stacks, bars]);

  const [win, setWin] = useState<ChartWindow>(extent);
  const [pin, setPin] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [selection, setSelection] = useState<ChartRange | null>(null);
  const [draft, setDraft] = useState<ChartRange | null>(null);
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const [, setGeometryTick] = useState(0);

  useEffect(() => setWin(extent), [extent]);

  const root = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const geometry = useRef<PlotGeometry | null>(null);
  const drag = useRef<Drag | null>(null);
  const dragged = useRef(false);
  const pinnedAt = useRef(0);

  useOutsidePress(root, () => {
    setPin(null);
    setSelection(null);
  });

  const formatX = (position: number) => format.formatX?.(new Date(position)) ?? DAY.format(position);
  const formatTick = (position: number) => format.formatTick?.(new Date(position)) ?? TICK.format(position);
  const formatValue = format.formatValue ?? ((value: number) => NUMBER.format(value));
  const formatValueTick = format.formatValueTick ?? ((value: number) => COMPACT.format(value));
  const formatRange = (range: ChartRange) => {
    const count = positions.filter((p) => p >= range.start && p <= range.end).length;
    return (
      format.formatRange?.(new Date(range.start), new Date(range.end), count) ??
      `${formatTick(range.start)} – ${formatTick(range.end)}`
    );
  };

  // Stacked, a series rides on the visible ones before it, so hiding one lets the rest settle down.
  const visible = useMemo(() => {
    const height = positions.map(() => 0);
    return series
      .filter((s) => !hidden.has(s.id))
      .map((s): PlotSeries => {
        const floors = [...height];
        if (stacks) s.values.forEach((value, i) => (height[i] = (height[i] ?? 0) + (value ?? 0)));
        return { ...s, floors };
      });
  }, [positions, series, hidden, stacks]);
  const zoomed = isZoomed(win, extent);
  const shown = draft ?? selection;

  const plot = () => {
    const g = geometry.current;
    const el = wrapper.current;
    if (!g || !el) return null;
    const surface = g.surface.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    return { g, left: surface.left - box.left + g.left, top: surface.top - box.top + g.top, clientLeft: surface.left + g.left };
  };
  const positionAt = (clientX: number) => {
    const p = plot();
    return p ? p.g.toPosition(clientX - p.clientLeft + p.g.left) : null;
  };
  const pixelOf = (position: number) => {
    const p = plot();
    return p ? p.left + clamp(p.g.toPixel(position) - p.g.left, 0, p.g.width) : 0;
  };
  /** A position's band, or its point when the marks have no bands. A range runs from its first band's left to its last band's right. */
  const leftOf = (position: number) => pixelOf(position - halfBand);
  const rightOf = (position: number) => pixelOf(position + halfBand);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    dragged.current = false;
    if (e.button !== 0 || e.pointerType === 'touch') return;
    if ((e.target as Element).closest('[data-chart-ui]')) return;
    const p = plot();
    if (!p || e.clientX < p.clientLeft || e.clientX > p.clientLeft + p.g.width) return;
    drag.current = { kind: 'pending', x: e.clientX, shift: e.shiftKey };
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    const p = plot();
    if (!d || !p) return;
    if (d.kind === 'pending') {
      if (Math.abs(e.clientX - d.x) < DRAG_THRESHOLD) return;
      // The wrapper takes the pointer, so the vendor's hover rests while a drag runs.
      e.currentTarget.setPointerCapture(e.pointerId);
      dragged.current = true;
      setHover(null);
      drag.current =
        d.shift && zoomed ? { kind: 'pan', x: d.x, window: win } : { kind: 'select', from: positionAt(d.x) ?? win.start };
      return;
    }
    if (d.kind === 'pan') setWin(panBy(d.window, extent, ((d.x - e.clientX) / p.g.width) * span(d.window)));
    if (d.kind === 'select') setDraft(rangeOf(positions, d.from, positionAt(e.clientX) ?? d.from));
    if (d.kind === 'handle') setDraft(rangeOf(positions, d.fixed, positionAt(e.clientX) ?? d.fixed));
  }

  function onPointerUp() {
    const d = drag.current;
    drag.current = null;
    if (d && (d.kind === 'select' || d.kind === 'handle')) {
      setSelection(draft);
      setDraft(null);
    }
  }

  function grabHandle(e: PointerEvent<HTMLButtonElement>, fixed: number) {
    if (e.button !== 0 || !wrapper.current) return;
    e.preventDefault();
    e.stopPropagation();
    wrapper.current.setPointerCapture(e.pointerId);
    dragged.current = true;
    drag.current = { kind: 'handle', fixed };
    setDraft(selection);
  }

  function nudgeHandle(e: KeyboardEvent<HTMLButtonElement>, end: 'start' | 'end') {
    const by = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!by || !selection) return;
    e.preventDefault();
    e.stopPropagation();
    const moved = step(positions, selection[end], by);
    const next = end === 'start' ? { start: moved, end: selection.end } : { start: selection.start, end: moved };
    if (next.end > next.start) setSelection(next);
  }

  // A click, Enter or Space on the plot. With a range selected it only lets the range go.
  function onActivate(position: number) {
    if (dragged.current || touch) return;
    if (selection) return setSelection(null);
    const now = performance.now();
    const secondOfDoubleClick = now - pinnedAt.current < DOUBLE_CLICK_MS;
    pinnedAt.current = now;
    setPin((current) => (current === position && !secondOfDoubleClick ? null : position));
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      if (selection) setSelection(null);
      else setPin(null);
    }
    if (e.key === '0' && (e.metaKey || e.ctrlKey) && zoomed) {
      e.preventDefault();
      setWin(extent);
    }
  }

  // React listens to wheel passively, so only a native listener can keep the page from zooming too.
  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const at = (clientX: number) => {
      const g = geometry.current;
      if (!g) return null;
      const left = g.surface.getBoundingClientRect().left + g.left;
      return clientX < left || clientX > left + g.width ? null : (clientX - left) / g.width;
    };
    const onWheel = (e: WheelEvent) => {
      const place = at(e.clientX);
      if (place === null) return;
      if (e.ctrlKey || e.metaKey) {
        // A trackpad pinch arrives as ctrl + wheel.
        e.preventDefault();
        const factor = Math.exp(Math.max(-30, Math.min(30, e.deltaY)) * 0.01);
        setWin((w) => zoomAt(w, extent, place, factor, minSpan));
      } else if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        const width = geometry.current?.width ?? 1;
        setWin((w) => {
          if (!isZoomed(w, extent)) return w;
          e.preventDefault();
          return panBy(w, extent, (e.deltaX / width) * span(w));
        });
      }
    };
    // Safari reports a pinch as gesture events, with the scale since the gesture began.
    let scale = 1;
    const onGesture = (e: Event) => {
      const g = e as Event & { scale: number; clientX: number };
      const place = at(g.clientX);
      if (place === null) return;
      e.preventDefault();
      if (e.type === 'gesturestart') scale = 1;
      else setWin((w) => zoomAt(w, extent, place, scale / g.scale, minSpan));
      scale = g.scale;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('gesturestart', onGesture, { passive: false });
    el.addEventListener('gesturechange', onGesture, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('gesturestart', onGesture);
      el.removeEventListener('gesturechange', onGesture);
    };
  }, [extent, minSpan]);

  /** The visible series with a value at a position, in the legend's order. `top` is where the value ends on the y axis. */
  const valuesAt = (position: number) => {
    const i = positions.indexOf(position);
    return visible
      .map((s) => ({ series: s, value: s.values[i] ?? null, top: (s.floors[i] ?? 0) + (s.values[i] ?? 0) }))
      .filter((r): r is { series: PlotSeries; value: number; top: number } => r.value !== null);
  };
  /** A tooltip's rows. A stack reads top to bottom as it is drawn; side by side, the largest leads. */
  const rowsAt = (position: number) =>
    stacks ? valuesAt(position).reverse() : valuesAt(position).sort((a, b) => b.value - a.value);
  /** The phone readout runs left to right, so a stack keeps the legend's order there. */
  const readoutAt = stacks ? valuesAt : rowsAt;
  const totalAt = (position: number) => valuesAt(position).reduce((sum, r) => sum + r.value, 0);

  const tooltipBody = (position: number, against: number | null, close?: () => void) => {
    const base = against === null ? null : new Map(valuesAt(against).map((r) => [r.series.id, r.value]));
    const rows: TooltipRow[] = rowsAt(position).map(({ series: s, value }) => ({
      id: s.id,
      label: s.label,
      color: s.color,
      value: formatValue(value),
      change: base ? formatChange(value - (base.get(s.id) ?? value)) : undefined,
    }));
    const total = {
      value: formatValue(totalAt(position)),
      change: against === null ? undefined : formatChange(totalAt(position) - totalAt(against)),
    };
    return (
      <TooltipBody
        heading={formatX(position)}
        versus={against === null ? undefined : formatTick(against)}
        rows={rows}
        total={stacks ? total : undefined}
        shape={keyShape}
        onClose={close}
      />
    );
  };

  // The position on the axis, under a crosshair with a dot on every series, or under a washed band for bars.
  // Dashed, or bare, follows the pointer; solid, or edged, is pinned.
  const focusMarks = (position: number, pinned: boolean) => {
    const at = plot();
    if (!at) return null;
    const left = pixelOf(position);
    return (
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {bars ? (
          <span
            className={cn('absolute rounded border bg-ink/6', pinned ? 'border-edge' : 'border-transparent')}
            style={{ left: leftOf(position), width: rightOf(position) - leftOf(position), top: at.top, height: at.g.height }}
          />
        ) : (
          <>
            <span
              className={cn('absolute border-l', pinned ? 'border-ink-muted' : 'border-dashed border-ink-disabled')}
              style={{ left, top: at.top, height: at.g.height }}
            />
            {valuesAt(position).map(({ series: s, top }) => (
              <span
                key={s.id}
                className="absolute size-2.5 -translate-1/2 rounded-full ring-2 ring-panel"
                style={{ left, top: at.top + at.g.toPixelY(top) - at.g.top, backgroundColor: s.color }}
              />
            ))}
          </>
        )}
        <span
          className="absolute -translate-x-1/2 whitespace-nowrap rounded-md border border-edge bg-menu px-2 py-0.5 text-xs font-medium tabular-nums text-ink"
          style={{ left, top: at.top + at.g.height + 5 }}
        >
          {formatX(position)}
        </span>
      </div>
    );
  };

  // A name at the end of each line, or at the middle of each band, so a series never rests on colour alone. Labels keep 16px apart.
  const endLabels = () => {
    const at = plot();
    if (!at || touch || bars) return null;
    const after = positions.findIndex((position) => position >= win.end);
    const i = after < 0 ? positions.length - 1 : after;
    const from = positions[Math.max(0, i - 1)] ?? win.end;
    const to = positions[i] ?? win.end;
    const t = to === from ? 1 : (win.end - from) / (to - from);
    const labels = visible
      .map((s) => {
        const anchor = (n: number) => {
          const value = s.values[n];
          return value == null ? null : (s.floors[n] ?? 0) + value * (stacks ? 0.5 : 1);
        };
        const a = anchor(Math.max(0, i - 1));
        const b = anchor(i);
        return a === null || b === null ? null : { s, top: at.top + at.g.toPixelY(a + (b - a) * t) - at.g.top - 8 };
      })
      .filter((l) => l !== null)
      .sort((a, b) => a.top - b.top);
    labels.forEach((l, n) => {
      const above = labels[n - 1];
      if (above && l.top - above.top < 16) l.top = above.top + 16;
    });
    return labels.map(({ s, top }) => (
      <span
        key={s.id}
        className="pointer-events-none absolute text-xs text-ink-muted"
        style={{ left: at.left + at.g.width + 8, top }}
        aria-hidden
      >
        {s.label}
      </span>
    ));
  };

  const p = plot();
  const pinInView = pin !== null && pin >= win.start && pin <= win.end;
  const pinLeft = pin === null ? 0 : pixelOf(pin);
  const pinFlips = p !== null && pinLeft > p.left + p.g.width * 0.58;

  return (
    <div ref={root} data-slot="chart" className={cn('flex flex-col gap-3 touch:gap-2.5', className)}>
      <div className="flex min-h-8 items-center gap-3">
        <div className="flex min-w-0 grow flex-col gap-0.5">
          {title && <div className="text-sm font-medium text-ink">{title}</div>}
          {description && <div className="text-xs text-ink-subtle">{description}</div>}
        </div>
        {!touch && (
          <div className="flex items-center gap-1.5 text-xs text-ink-subtle">
            Hold <Hotkey shortcut={zoomed ? 'shift' : 'mod'} />
            {zoomed ? 'to move around' : 'and scroll to zoom'}
          </div>
        )}
        {(!touch || zoomed) && (
          <Button variant="outlined" size="sm" disabled={!zoomed} shortcut="mod+0" onClick={() => setWin(extent)}>
            <ArrowCounterClockwise />
            Reset zoom
          </Button>
        )}
      </div>

      {touch && (
        <div className="flex min-h-9 items-baseline gap-3 rounded-lg bg-hover px-2.5 py-2 text-xs">
          <span className="grow text-ink-subtle">{hover === null ? 'Tap a point' : formatX(hover)}</span>
          {hover !== null &&
            readoutAt(hover).map(({ series: s, value }) => (
              <span key={s.id} className="flex items-center gap-1 tabular-nums text-ink">
                <SeriesKey color={s.color} shape={keyShape} />
                {formatValue(value)}
              </span>
            ))}
        </div>
      )}

      <Legend
        entries={series}
        hidden={hidden}
        onToggle={(id) => setHidden((h) => toggled(h, id))}
        shape={keyShape}
        className="touch:order-last"
      />

      <div
        ref={wrapper}
        className={cn(
          'chart relative touch-pan-y select-none',
          !touch && 'cursor-crosshair',
          drag.current?.kind === 'pan' && 'cursor-grabbing',
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <Plot
          label={label}
          height={height}
          positions={positions}
          series={visible}
          mark={kind === 'area' && !stacks && marks.length > MAX_FADING_FILLS ? 'line' : kind}
          stacked={stacks}
          step={interval}
          window={win}
          yMax={yMax}
          marginRight={touch ? 8 : bars ? BAR_EDGE_ROOM : END_LABEL_ROOM}
          tooltip={!touch}
          tooltipSlot={pinInView ? 'bottom' : 'top'}
          formatTick={formatTick}
          formatValueTick={formatValueTick}
          renderTooltip={(position) => (position === pin ? null : tooltipBody(position, pinInView ? pin : null))}
          onFocus={setHover}
          onActivate={onActivate}
          onGeometry={(g) => {
            const before = geometry.current;
            geometry.current = g;
            const overlaysAreStale =
              !before ||
              (['left', 'top', 'width', 'height'] as const).some((k) => before[k] !== g[k]) ||
              before.toPixel(extent.start) !== g.toPixel(extent.start) ||
              before.toPixel(extent.end) !== g.toPixel(extent.end);
            if (overlaysAreStale) setGeometryTick((n) => n + 1);
          }}
        />

        {endLabels()}
        {pinInView && pin !== null && focusMarks(pin, true)}
        {hover !== null && hover !== pin && !draft && focusMarks(hover, false)}

        {p && shown && !touch && (
          <>
            <div
              className="pointer-events-none absolute border-x border-accent bg-accent-bg"
              style={{ left: leftOf(shown.start), width: rightOf(shown.end) - leftOf(shown.start), top: p.top, height: p.g.height }}
            />
            {(['start', 'end'] as const).map((end) => (
              <button
                key={end}
                type="button"
                data-chart-ui=""
                aria-label={end === 'start' ? 'Range start' : 'Range end'}
                aria-valuetext={formatX(shown[end])}
                className="chart-handle absolute flex w-4 -translate-x-1/2 cursor-ew-resize items-center justify-center rounded"
                style={{ left: end === 'start' ? leftOf(shown.start) : rightOf(shown.end), top: p.top, height: p.g.height }}
                onPointerDown={(e) => grabHandle(e, shown[end === 'start' ? 'end' : 'start'])}
                onKeyDown={(e) => nudgeHandle(e, end)}
              >
                <span className="h-7 w-[5px] rounded-full bg-accent" />
              </button>
            ))}
          </>
        )}

        {p && selection && !draft && !touch && (
          <div
            data-chart-ui=""
            className="glass absolute flex -translate-x-1/2 cursor-default items-center gap-2 rounded-[10px] border border-edge-muted bg-menu-glass py-1 pr-1 pl-2.5"
            style={{
              left: clamp((leftOf(selection.start) + rightOf(selection.end)) / 2, p.left + 118, p.left + p.g.width - 118),
              top: p.top + 8,
            }}
          >
            <span className="whitespace-nowrap text-xs tabular-nums text-ink-muted">{formatRange(selection)}</span>
            <Button
              variant="accent"
              size="sm"
              onClick={() => {
                setWin(windowOf({ start: selection.start - halfBand, end: selection.end + halfBand }, extent, minSpan));
                setSelection(null);
              }}
            >
              Zoom in
            </Button>
            <Button size="icon-sm" label="Clear selection" shortcut="esc" onClick={() => setSelection(null)}>
              <X />
            </Button>
          </div>
        )}

        {p && pinInView && pin !== null && !touch && (
          <div
            data-chart-ui=""
            role="status"
            className={cn(
              'glass absolute cursor-default select-text rounded-xl border border-edge-muted bg-menu-glass text-sm',
              pinFlips && '-translate-x-full',
            )}
            style={{ left: pinLeft + (pinFlips ? -16 : 16), top: p.top + (selection ? 48 : 4) }}
            onPointerEnter={() => setHover(null)}
          >
            {tooltipBody(pin, null, () => setPin(null))}
          </div>
        )}
      </div>
    </div>
  );
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function toggled(set: ReadonlySet<string>, id: string) {
  const next = new Set(set);
  if (!next.delete(id)) next.add(id);
  return next;
}

/** The next 1, 1.2, 1.6, 2, 4, 5 or 8 times a power of ten, so four even ticks land on round numbers. */
function niceCeil(max: number) {
  const power = 10 ** Math.floor(Math.log10(max));
  const lead = [10, 12, 16, 20, 40, 50, 80, 100].find((n) => (n * power) / 10 >= max) ?? 100;
  return (lead * power) / 10;
}
