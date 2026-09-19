import { Popover as Base } from '@base-ui/react/popover';
import { type ComponentProps, createContext, type CSSProperties, useContext, useState } from 'react';
import { cn } from '@/lib/cn';
import { fromPlacement, type Placement } from '@/lib/placement';
import { type Depth, Layer } from './Layer';
import { SURFACE_CLASS, surfaceStyle } from './Surface';

type Classed<T> = Omit<T, 'className'> & { className?: string };

type Positioning = {
  placement: Placement;
  gutter: number;
  anchor: HTMLElement | null;
  setAnchor: (el: HTMLElement | null) => void;
};

const PositionContext = createContext<Positioning>({
  placement: 'bottom',
  gutter: 0,
  anchor: null,
  setAnchor: () => {},
});

export type PopoverProps = ComponentProps<typeof Base.Root> & {
  /** Where the content opens against the trigger or `Popover.Anchor`. */
  placement?: Placement;
  /** Distance between the trigger and the content, in px. */
  gutter?: number;
};

function PopoverRoot({ placement = 'bottom', gutter = 0, ...props }: PopoverProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <PositionContext.Provider value={{ placement, gutter, anchor, setAnchor }}>
      <Base.Root {...props} />
    </PositionContext.Provider>
  );
}

/** Positions the content against this element instead of the trigger. */
function PopoverAnchor(props: ComponentProps<'div'>) {
  const { setAnchor } = useContext(PositionContext);
  return <div {...props} ref={setAnchor} />;
}

export type PopoverContentProps = Classed<ComponentProps<typeof Base.Popup>> & {
  depth?: Depth;
};

/**
 * Anchored floating content, in the exact surface the dropdown menus paint:
 * a glass pane on the menu color, depth 2, opening with the menu animation.
 */
function PopoverContent({ depth = 2, className, style, ...props }: PopoverContentProps) {
  const { placement, gutter, anchor } = useContext(PositionContext);
  return (
    <Base.Portal>
      <Base.Positioner {...fromPlacement(placement)} sideOffset={gutter} anchor={anchor ?? undefined} className="z-action-menu">
        <Layer depth={depth}>
          <Base.Popup
            {...props}
            data-surface=""
            style={surfaceStyle({ style: style as CSSProperties })}
            className={cn(
              SURFACE_CLASS,
              'rounded-xl size-auto z-action-menu menu-open-animation glass bg-menu-glass text-sm [--color-surface:var(--color-menu)]',
              'max-w-80 p-3 outline-none',
              className
            )}
          />
        </Layer>
      </Base.Positioner>
    </Base.Portal>
  );
}

function PopoverTitle({ className, ...props }: Classed<ComponentProps<typeof Base.Title>>) {
  return <Base.Title {...props} className={cn('text-sm font-semibold text-ink', className)} />;
}

function PopoverDescription({ className, ...props }: Classed<ComponentProps<typeof Base.Description>>) {
  return <Base.Description {...props} className={cn('text-sm text-ink-muted', className)} />;
}

/**
 * @do Use for rich, interactive content anchored to a trigger (filters, pickers).
 * @do Use Tooltip for a short text hint; it has no interactive content.
 * @dont Put a whole form in a popover; open a Dialog instead.
 */
export const Popover = Object.assign(PopoverRoot, {
  Trigger: Base.Trigger,
  Anchor: PopoverAnchor,
  CloseButton: Base.Close,
  Content: PopoverContent,
  Title: PopoverTitle,
  Description: PopoverDescription,
});
