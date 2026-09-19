import { ScrollArea } from '@base-ui/react/scroll-area';
import type { ComponentProps, Ref } from 'react';

const THUMB_WIDTH = 2;
const GUTTER_WIDTH = 8;
const MIN_THUMB_HEIGHT = 24;
const THUMB_INSET = (GUTTER_WIDTH - THUMB_WIDTH) * 0.5;

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
      <ScrollArea.Viewport ref={scrollRef} style={{ height: '100%' }}>
        <ScrollArea.Content>{children}</ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        orientation="vertical"
        className="opacity-0 data-scrolling:opacity-100"
        style={{
          width: GUTTER_WIDTH,
          touchAction: 'none',
          paddingBlock: THUMB_INSET,
          transition: 'opacity 150ms ease-in-out',
        }}
      >
        <ScrollArea.Thumb
          style={{
            marginLeft: THUMB_INSET,
            width: THUMB_WIDTH,
            minHeight: MIN_THUMB_HEIGHT,
            borderRadius: THUMB_WIDTH * 0.5,
            backgroundColor: 'var(--color-content-4)',
          }}
        />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
