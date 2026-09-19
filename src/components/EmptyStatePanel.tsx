import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type EmptyStateTone = 'neutral' | 'accent' | 'warning' | 'failure';

const TONE: Record<EmptyStateTone, string> = {
  neutral: 'text-ink-subtle',
  accent: 'text-accent',
  warning: 'text-warning',
  failure: 'text-failure',
};

export type EmptyStatePanelProps = Omit<ComponentProps<'div'>, 'title'> & {
  /** A small drawing above the title. It takes the tone through `currentColor`. */
  illustration?: ReactNode;
  tone?: EmptyStateTone;
  title: ReactNode;
  description?: ReactNode;
  /** One way forward: a retry, a clear-filters button. */
  action?: ReactNode;
  /** Centers the panel in its container instead of sitting near the top. */
  centered?: boolean;
};

/**
 * What a view shows when it has nothing to show: a small drawing, a title
 * that says what happened, a line on what to do, and at most one action.
 * The drawing rises in as the panel mounts.
 */
export function EmptyStatePanel({
  illustration,
  tone = 'accent',
  title,
  description,
  action,
  centered,
  className,
  ...props
}: EmptyStatePanelProps) {
  return (
    <div
      {...props}
      className={cn(
        'flex w-full flex-col items-center px-6 text-center',
        centered ? 'flex-1 justify-center py-8' : 'pt-[18vh] pb-8',
        className
      )}
    >
      {illustration && (
        <div
          aria-hidden
          className={cn(
            'mb-5 flex size-24 items-center justify-center transition-[opacity,translate] duration-500 ease-out starting:translate-y-2 starting:opacity-0',
            TONE[tone]
          )}
        >
          {illustration}
        </div>
      )}
      <h2 className="text-sm font-medium text-ink">{title}</h2>
      {description && <p className="mt-1 max-w-xs text-sm text-ink-subtle">{description}</p>}
      {action && <div className="mt-4 flex items-center gap-2">{action}</div>}
    </div>
  );
}
