import { Progress as Base } from '@base-ui/react/progress';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type Step = { value: string; label: string };

export type ProgressProps = {
  steps: Step[];
  /** The current step's value. */
  value: string;
  /** Names the rail for a screen reader: "Launch stages". */
  label: string;
  className?: string;
};

/**
 * A stage rail: one 10px dot per step on a single hairline. The current
 * step is an accent dot with a soft accent ring, a completed step a tinted
 * dot with an accent edge, a pending one an empty dot. Labels show only
 * above 560px of the rail's own width. A dot is never a target: change the
 * step from a control beside the rail.
 */
export function Progress({ steps, value, label, className }: ProgressProps) {
  const current = steps.findIndex((step) => step.value === value);
  return (
    <ol
      aria-label={label}
      className={cn('@container/rail grid w-full', className)}
      style={{ gridTemplateColumns: `repeat(${Math.max(steps.length - 1, 0)}, minmax(0, 1fr)) auto` }}
    >
      {steps.map((step, index) => {
        const done = index < current;
        const now = index === current;
        const last = index === steps.length - 1;
        return (
          <li
            key={step.value}
            aria-current={now ? 'step' : undefined}
            className="flex min-w-0 flex-col gap-1.5"
          >
            <span aria-hidden className="flex items-center">
              <span
                className={cn(
                  'size-2.5 shrink-0 rounded-full border',
                  now && 'border-accent bg-accent ring-[3px] ring-accent/20',
                  done && 'border-accent bg-accent-bg',
                  !now && !done && 'border-edge'
                )}
              />
              {!last && <span className={cn('h-px flex-1', done ? 'bg-accent' : 'bg-edge')} />}
            </span>
            <span
              className={cn(
                'sr-only truncate pr-2 text-xs @[560px]/rail:not-sr-only',
                now ? 'font-medium text-ink' : 'text-ink-subtle'
              )}
            >
              {step.label}
              <span className="sr-only">{done ? ', done' : now ? ', current' : ''}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export type ProgressBarProps = {
  /** 0 to 100, or null while the amount is unknown. */
  value: number | null;
  label?: ReactNode;
  /** Shows the percentage beside the label. */
  showValue?: boolean;
  className?: string;
};

/** A plain progress bar for work that fills up: an upload, an import, a quota. */
export function ProgressBar({ value, label, showValue, className }: ProgressBarProps) {
  return (
    <Base.Root value={value} className={cn('grid w-full grid-cols-[1fr_auto] gap-y-1.5', className)}>
      {label && <Base.Label className="text-xs text-ink-muted">{label}</Base.Label>}
      {showValue && <Base.Value className="col-start-2 text-xs text-ink-subtle tabular-nums" />}
      <Base.Track className="col-span-2 h-1 overflow-hidden rounded-full bg-edge-muted">
        <Base.Indicator className="rounded-full bg-accent transition-[width] duration-500 ease-out data-indeterminate:w-1/3 data-indeterminate:animate-pulse" />
      </Base.Track>
    </Base.Root>
  );
}
