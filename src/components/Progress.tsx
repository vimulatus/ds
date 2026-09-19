import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export type ProgressStep = { value: string; label: string };

export type ProgressProps = Omit<ComponentProps<'div'>, 'children'> & {
  steps: readonly ProgressStep[];
  /** The current step's `value`. Steps before it read as done. */
  value: string;
  /** The list's accessible name. Defaults to "Progress". */
  label?: string;
};

/**
 * Steps as dots on one hairline. Done and current steps are accent, pending
 * ones the edge color. Below 560px of its own width only the current label
 * shows. A dot is never a target: change the step from a control beside it.
 */
export function Progress({ steps, value, label, className, ...props }: ProgressProps) {
  const index = steps.findIndex((step) => step.value === value);
  return (
    <div {...props} data-slot="progress" className={cn('@container/progress', className)}>
      <ol className="flex items-start" aria-label={label ?? 'Progress'}>
        {steps.map((step, i) => {
          const done = i < index;
          const current = i === index;
          return (
            <li
              key={step.value}
              className="flex min-w-0 flex-1 flex-col items-start gap-1.5"
              aria-current={current ? 'step' : undefined}
            >
              <span className="flex w-full items-center">
                <span
                  className={cn(
                    'size-2.5 shrink-0 rounded-full border',
                    current && 'border-accent bg-accent ring-3 ring-accent/20',
                    done && 'border-accent bg-accent-bg',
                    !done && !current && 'border-edge bg-transparent'
                  )}
                />
                {i < steps.length - 1 && (
                  <span className={cn('h-px flex-1', done ? 'bg-accent' : 'bg-edge-muted')} />
                )}
              </span>
              <span
                className={cn(
                  'truncate text-xs',
                  current ? 'font-medium text-ink' : 'hidden text-ink-subtle @[560px]/progress:block'
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
