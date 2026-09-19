import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/**
 * The one content pane: a rounded `bg-panel` sheet on a hairline edge,
 * filling the space it is given. There is one canvas and no splits. On touch
 * it runs edge to edge with no radius.
 */
export function Canvas({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn(
        'flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl border border-edge-muted bg-panel',
        'touch:rounded-none touch:border-0',
        className
      )}
    />
  );
}
