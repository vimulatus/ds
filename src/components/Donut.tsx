import { useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { X } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import { useOutsidePress } from '@/lib/chart/outside';
import { Legend, formatChange, seriesColor } from '@/lib/chart/parts';
import { useGlide } from '@/lib/chart/motion';
import { ringSpans, sectorPath, spanAt } from '@/lib/chart/ring';
import { cn } from '@/lib/cn';
import { useTouch } from '@/lib/touch';

export type DonutProps<Row> = {
  /** One row per slice, in ring order. Fold a long tail into one "Other" row first: there are six hues. */
  data: readonly Row[];
  /** What a slice is called. Each name is unique. */
  category: (row: Row) => string;
  /** A slice's size, zero or more. */
  value: (row: Row) => number;
  /** The chart's accessible name: what is measured, in what unit. */
  label: string;
  title?: ReactNode;
  description?: ReactNode;
  /** What the whole is called, above the total in the hole: "Sales". A slice's share is worded from it: "40% of sales". */
  total: string;
  /** The line under the total: "August 2026". */
  note?: string;
  /** A value in the hole: "₹38.4 L". */
  formatValue?: (value: number) => string;
  className?: string;
};

const NUMBER = new Intl.NumberFormat();

const DESKTOP_RING = { size: 260, thickness: 34 };
const PHONE_RING = { size: 232, thickness: 30 };
/** Room outside the ring, inside its square, for a slice in focus to grow into and for the pin arc beyond it. */
const MARGIN = 10;
const GAP = 2;
const GROWTH = 4;
const PIN_ARC = { from: 7, to: 9 };

/**
 * Parts of one whole, as a ring. The hole is the readout: the total, then the
 * slice in focus with its share. A click pins a slice, and the next hover
 * compares against the pin. Hiding a slice from the legend re-sums the whole.
 */
export function Donut<Row>({
  data,
  category,
  value,
  label,
  title,
  description,
  total,
  note,
  className,
  ...format
}: DonutProps<Row>) {
  const touch = useTouch();
  const [hover, setHover] = useState<string | null>(null);
  const [pin, setPin] = useState<string | null>(null);
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());

  const root = useRef<HTMLDivElement>(null);
  // On a phone a tap holds the focus with no pin, so an outside press lets go of both.
  useOutsidePress(root, () => {
    setPin(null);
    setHover(null);
  });

  const formatValue = format.formatValue ?? ((n: number) => NUMBER.format(n));

  const entries = useMemo(
    () => data.map((row, i) => ({ id: category(row), label: category(row), color: seriesColor(i), value: value(row) })),
    [data, category, value],
  );
  const slices = useMemo(() => {
    const showing = entries.filter((entry) => !hidden.has(entry.id));
    const spans = ringSpans(showing.map((entry) => entry.value));
    return showing.map((entry, i) => ({ ...entry, span: spans[i] as (typeof spans)[number] }));
  }, [entries, hidden]);
  const sum = slices.reduce((all, slice) => all + slice.value, 0);

  // What is drawn glides: the ring sweeps open once, and a hidden slice closes to nothing while the others take its room.
  const weights = entries.map((entry) => (hidden.has(entry.id) ? 0 : entry.value));
  const [sweep = 1, ...drawnWeights] = useGlide([1, ...weights], [0, ...weights]);
  const drawn = ringSpans(drawnWeights).map((span, i) => ({
    entry: entries[i] as (typeof entries)[number],
    span: { from: span.from * sweep, to: span.to * sweep },
  }));

  const { size, thickness } = touch ? PHONE_RING : DESKTOP_RING;
  const centre = size / 2;
  const outer = centre - MARGIN;
  const inner = outer - thickness;
  const gap = GAP / ((outer + inner) / 2);

  const pinned = touch ? undefined : slices.find((slice) => slice.id === pin);
  const focus = slices.find((slice) => slice.id === hover) ?? pinned;
  const compared = focus && pinned && focus !== pinned;

  const sliceUnder = (e: MouseEvent) => {
    const box = e.currentTarget.getBoundingClientRect();
    const i = spanAt(slices.map((slice) => slice.span), e.clientX - box.left - centre, e.clientY - box.top - centre, outer, inner);
    return slices[i]?.id ?? null;
  };

  function onClick(e: MouseEvent) {
    const id = sliceUnder(e);
    setHover(id);
    if (touch) return;
    const secondOfDoubleClick = e.detail > 1;
    setPin((current) => (id === current && !secondOfDoubleClick ? null : id));
  }

  function onKeyDown(e: KeyboardEvent) {
    const at = focus ? slices.indexOf(focus) : -1;
    const step = (by: 1 | -1) => {
      const start = by === 1 ? -1 : 0;
      setHover(slices[((at < 0 ? start : at) + by + slices.length) % slices.length]?.id ?? null);
    };
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') step(1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') step(-1);
    else if ((e.key === 'Enter' || e.key === ' ') && focus) {
      setPin(pin === focus.id ? null : focus.id);
      setHover(focus.id);
    } else return;
    e.preventDefault();
  }

  function toggle(id: string) {
    setHidden((h) => {
      const next = new Set(h);
      if (!next.delete(id)) next.add(id);
      return next;
    });
    setHover(null);
    if (pin === id) setPin(null);
  }

  return (
    <div
      ref={root}
      data-slot="donut"
      className={cn('flex flex-col gap-4 touch:gap-3', className)}
      onKeyDown={(e) => {
        if (e.key !== 'Escape') return;
        setPin(null);
        setHover(null);
      }}
    >
      <div className="flex min-h-8 items-center gap-3">
        <div className="flex grow flex-col gap-0.5">
          {title && <div className="text-sm font-medium text-ink">{title}</div>}
          {description && <div className="text-xs text-ink-subtle">{description}</div>}
        </div>
        {pinned && (
          <Button variant="outlined" size="sm" label="Unpin" shortcut="esc" onClick={() => setPin(null)}>
            <X />
            Unpin
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 touch:gap-3">
        <div
          data-slot="donut-ring"
          className="relative shrink-0"
          style={{ width: size, height: size }}
          onMouseMove={touch ? undefined : (e) => setHover(sliceUnder(e))}
          onMouseLeave={touch ? undefined : () => setHover(null)}
          onClick={onClick}
        >
          <svg width={size} height={size} className="absolute inset-0" aria-hidden>
            {drawn.map(({ entry, span }) => {
              const held = entry.id === focus?.id || entry.id === pinned?.id;
              return (
                <g key={entry.id}>
                  <path
                    d={sectorPath(centre, span, outer + (held ? GROWTH : 0), inner, gap) ?? undefined}
                    className="transition-opacity duration-120 motion-reduce:transition-none"
                    style={{ fill: entry.color, opacity: focus && !held ? 0.35 : 1 }}
                  />
                  {entry.id === pinned?.id && (
                    <path
                      d={sectorPath(centre, span, outer + PIN_ARC.to, outer + PIN_ARC.from, gap) ?? undefined}
                      className="fill-ink-muted"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          <div
            data-slot="donut-hole"
            role="status"
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-center text-xs"
          >
            <div className="text-ink-subtle">{focus ? focus.label : total}</div>
            <div className="text-2xl/[30px] font-semibold tracking-[-0.01em] tabular-nums text-ink">
              {formatValue(focus ? focus.value : sum)}
            </div>
            <div className="text-ink-muted">
              {focus ? `${Math.round((focus.value / sum) * 100)}% of ${total.toLowerCase()}` : note}
            </div>
            {compared && (
              <div className="tabular-nums text-ink-subtle">
                {formatChange(focus.value - pinned.value, formatValue)} vs {pinned.label}
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label={`${label}. Arrow keys move between slices. Enter pins a slice`}
            className="absolute inset-0 cursor-default rounded-full focus-visible:focus-ring"
            onKeyDown={onKeyDown}
            // Firefox clicks a button on Space's keyup, whatever keydown did.
            onKeyUp={(e) => {
              if (e.key === ' ') e.preventDefault();
            }}
          />
        </div>

        <Legend
          entries={entries}
          hidden={hidden}
          held={new Set([focus?.id, pinned?.id].filter((id) => id !== undefined))}
          onToggle={toggle}
          onHover={touch ? undefined : (id) => setHover(id !== null && hidden.has(id) ? null : id)}
          shape="block"
          className="justify-center"
        />
      </div>
    </div>
  );
}
