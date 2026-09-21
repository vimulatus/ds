import { X } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import { cn } from '@/lib/cn';

/**
 * The series hues, in the order a chart hands them out. Neighbours stay apart
 * for red-green colour blindness, and red, green and amber are left to status.
 * `chart.css` holds the values: the hue itself in dark, capped in lightness in
 * light so a 2px line keeps 3:1 on a white card.
 */
export const CHART_HUES = ['blue', 'orange', 'violet', 'lime', 'pink', 'cyan'] as const;
export type ChartHue = (typeof CHART_HUES)[number];

export const SERIES_COLOR: Record<ChartHue, string> = {
  blue: 'var(--chart-blue)',
  orange: 'var(--chart-orange)',
  violet: 'var(--chart-violet)',
  lime: 'var(--chart-lime)',
  pink: 'var(--chart-pink)',
  cyan: 'var(--chart-cyan)',
};

/** The colour of the nth series. Past the last hue the order starts again. */
export const seriesColor = (n: number) => SERIES_COLOR[CHART_HUES[n % CHART_HUES.length] as ChartHue];

const NUMBER = new Intl.NumberFormat();

/** A change against the pinned position. An arrow carries the direction, because a minus reads as a dash before a number. */
export function formatChange(by: number, format: (size: number) => string = NUMBER.format) {
  return `${by > 0 ? '↑ ' : by < 0 ? '↓ ' : ''}${format(Math.abs(by))}`;
}

/** The key mirrors the mark: a short line for lines, a block for filled shapes. */
export type SeriesKeyShape = 'line' | 'block';

/** A series' swatch in a legend, a tooltip or a readout. A null colour draws it hollow, for a hidden series. */
export function SeriesKey({ color, shape }: { color: string | null; shape: SeriesKeyShape }) {
  return (
    <span
      className={cn(
        'shrink-0',
        shape === 'line' ? 'h-[3px] w-3 rounded-full' : 'size-2.5 rounded-[3px]',
        color === null && 'border border-ink-disabled',
      )}
      style={color === null ? undefined : { backgroundColor: color }}
    />
  );
}

export type LegendEntry = { id: string; label: string; color: string };

/**
 * One toggle per series. A pressed entry is shown; pressing it again hides the series.
 * `onHover` reports the entry under the pointer, and `held` names the entries whose series is in focus or pinned.
 */
export function Legend({
  entries,
  hidden,
  held,
  onToggle,
  onHover,
  shape,
  className,
}: {
  entries: readonly LegendEntry[];
  hidden: ReadonlySet<string>;
  held?: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onHover?: (id: string | null) => void;
  shape: SeriesKeyShape;
  className?: string;
}) {
  return (
    <div role="group" aria-label="Series" className={cn('flex flex-wrap gap-1', className)}>
      {entries.map((entry) => {
        const off = hidden.has(entry.id);
        return (
          <Button
            key={entry.id}
            size="sm"
            aria-pressed={!off}
            onClick={() => onToggle(entry.id)}
            onMouseEnter={onHover && (() => onHover(entry.id))}
            onMouseLeave={onHover && (() => onHover(null))}
          >
            <SeriesKey color={off ? null : entry.color} shape={shape} />
            <span className={off ? 'text-ink-disabled' : held?.has(entry.id) ? 'text-ink' : 'text-ink-muted'}>{entry.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

/** A value in a tooltip, already formatted. `change` fills the column a pinned position opens. */
export type TooltipRow = { id: string; label: string; color: string; value: string; change?: string };

/**
 * What a tooltip and a pinned panel say: the position, then a row per series.
 * `versus` names the pinned position and opens the change column. `total`
 * closes a stack under a hairline. `onClose` adds Unpin.
 */
export function TooltipBody({
  heading,
  versus,
  rows,
  total,
  shape,
  onClose,
}: {
  heading: string;
  versus?: string;
  rows: readonly TooltipRow[];
  total?: { value: string; change?: string };
  shape: SeriesKeyShape;
  onClose?: () => void;
}) {
  const change = (text: string | undefined) =>
    versus !== undefined && <span className="w-15 text-right text-xs tabular-nums text-ink-subtle">{text}</span>;
  return (
    <div className="flex min-w-40 flex-col gap-1.5 px-2.5 py-2">
      <div className="flex min-h-6 items-center gap-2 text-xs text-ink-subtle">
        <span className="grow">{heading}</span>
        {versus !== undefined && <span>vs {versus}</span>}
        {onClose && (
          <Button size="icon-sm" label="Unpin" shortcut="esc" onClick={onClose}>
            <X />
          </Button>
        )}
      </div>
      {rows.map((row) => (
        <div key={row.id} className="flex items-center gap-2">
          <SeriesKey color={row.color} shape={shape} />
          <span className="grow text-xs text-ink-muted">{row.label}</span>
          <span className="text-sm font-medium tabular-nums text-ink">{row.value}</span>
          {change(row.change)}
        </div>
      ))}
      {total && (
        <div className="mt-0.5 flex items-center gap-2 border-t border-edge-muted pt-1.5">
          <span className="grow text-xs text-ink-muted">Total</span>
          <span className="text-sm font-medium tabular-nums text-ink">{total.value}</span>
          {change(total.change)}
        </div>
      )}
    </div>
  );
}
