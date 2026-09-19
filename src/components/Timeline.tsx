import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * A vertical list of events, newest first. Each `TimelineEvent` draws its dot
 * and the hairline down to the next one; the last event draws no line. For
 * rows the user acts on one by one, use a list.
 */
function TimelineRoot({ className, ...props }: ComponentProps<'ol'>) {
  return <ol {...props} data-slot="timeline" className={cn('flex flex-col', className)} />;
}

export type TimelineEventProps = Omit<ComponentProps<'li'>, 'title'> & {
  title: ReactNode;
  /** When it happened, right-aligned beside the title. */
  time: ReactNode;
  description?: ReactNode;
  /** Who did it, in the quiet `xs` line at the bottom. */
  meta?: ReactNode;
};

export function TimelineEvent({ title, time, description, meta, children, className, ...props }: TimelineEventProps) {
  return (
    <li
      {...props}
      data-slot="timeline-event"
      className={cn('group/timeline-event grid grid-cols-[1rem_1fr] gap-x-3', className)}
    >
      <span className="flex flex-col items-center">
        <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-ink-subtle" />
        <span className="w-px flex-1 bg-edge-muted group-last/timeline-event:hidden" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5 pb-5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-ink">{title}</span>
          <span className="shrink-0 text-xs text-ink-subtle">{time}</span>
        </div>
        {description && <p className="text-sm text-ink-muted">{description}</p>}
        {meta && <p className="text-xs text-ink-subtle">{meta}</p>}
        {children}
      </div>
    </li>
  );
}

export const Timeline = Object.assign(TimelineRoot, { Event: TimelineEvent });
