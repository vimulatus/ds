import { ScrollArea as Base } from '@base-ui/react/scroll-area';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type ScrollAreaProps = {
  children: ReactNode;
  /** Which way the content scrolls. */
  orientation?: 'vertical' | 'horizontal' | 'both';
  /** Sizes the area. Give it a height (or a width for `horizontal`). */
  className?: string;
  contentClassName?: string;
};

function Scrollbar({ orientation }: { orientation: 'vertical' | 'horizontal' }) {
  return (
    <Base.Scrollbar
      orientation={orientation}
      className={cn(
        'flex touch-none select-none p-0.5 opacity-0 transition-opacity duration-300',
        'pointer-events-none data-hovering:pointer-events-auto data-hovering:opacity-100',
        'data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0',
        orientation === 'vertical' ? 'w-2' : 'h-2 flex-col'
      )}
    >
      <Base.Thumb className="flex-1 rounded-full bg-ink-extra-muted/60 hover:bg-ink-extra-muted" />
    </Base.Scrollbar>
  );
}

/**
 * A scrolling region with a thin scrollbar that floats over the content,
 * shows while you scroll or hover, and fades out after. The content never
 * loses width to a gutter.
 */
export function ScrollArea({ children, orientation = 'vertical', className, contentClassName }: ScrollAreaProps) {
  return (
    <Base.Root className={cn('relative min-h-0 overflow-hidden', className)}>
      <Base.Viewport className="size-full overscroll-contain rounded-[inherit] outline-none focus-visible:focus-ring">
        <Base.Content className={contentClassName}>{children}</Base.Content>
      </Base.Viewport>
      {orientation !== 'horizontal' && <Scrollbar orientation="vertical" />}
      {orientation !== 'vertical' && <Scrollbar orientation="horizontal" />}
      {orientation === 'both' && <Base.Corner />}
    </Base.Root>
  );
}
