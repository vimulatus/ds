import { ScrollArea } from '@base-ui/react/scroll-area';
import type { ComponentProps, Ref } from 'react';

export type ScrollProps = Omit<ComponentProps<'div'>, 'ref'> & {
  /** The element that scrolls, for reading or setting its scroll position. */
  scrollRef?: Ref<HTMLDivElement>;
};

/**
 * A vertical scroller that fills its parent. The native scrollbar is hidden;
 * a 2px thumb fades in while you scroll and fades out half a second after,
 * so the content never gives up width to a gutter.
 */
export function Scroll({ children, scrollRef, style, ...props }: ScrollProps) {
  return (
    <ScrollArea.Root
      {...props}
      style={{ position: 'relative', minHeight: 0, minWidth: 0, height: '100%', width: '100%', ...style }}
    >
      <ScrollArea.Viewport ref={scrollRef} className="h-full">
        <ScrollArea.Content>{children}</ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        orientation="vertical"
        className="w-2 touch-none py-[3px] opacity-0 transition-opacity duration-150 ease-in-out data-scrolling:opacity-100"
      >
        <ScrollArea.Thumb className="ml-[3px] w-[2px] min-h-6 rounded-[1px] bg-(--color-content-4)" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
