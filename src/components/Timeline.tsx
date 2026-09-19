import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * A vertical list of events, newest first, on a hairline spine. Holds only
 * `TimelineEvent`s. For rows the user acts on one by one, use a list.
 */
export function Timeline({ className, ...props }: ComponentProps<'ol'>) {
  return <ol {...props} className={cn('flex flex-col', className)} />;
}

export type TimelineEventProps = Omit<ComponentProps<'li'>, 'title'> & {
  title: ReactNode;
  /** Short, and relative when recent: "2 h ago". */
  time: ReactNode;
  description?: ReactNode;
  /** Who or what did it. */
  meta?: ReactNode;
};

/** One event. The spine runs from its dot to the next one; the last event ends it. */
export function TimelineEvent({ title, time, description, meta, className, ...props }: TimelineEventProps) {
  return (
    <li {...props} className={cn('group/event relative flex gap-3 pb-5 last:pb-0', className)}>
      <span
        aria-hidden
        className="absolute top-4 bottom-0 left-[3px] w-px bg-edge group-last/event:hidden"
      />
      <span aria-hidden className="mt-1.5 size-[7px] shrink-0 rounded-full bg-ink-subtle" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate text-sm font-medium text-ink">{title}</span>
          <span className="shrink-0 text-xs text-ink-subtle">{time}</span>
        </div>
        {description && <p className="text-sm text-ink-muted">{description}</p>}
        {meta && <p className="text-xs text-ink-subtle">{meta}</p>}
      </div>
    </li>
  );
}
