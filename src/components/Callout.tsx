import { Popover } from '@base-ui/react/popover';
import {
  autoUpdate,
  flip as flipMiddleware,
  offset,
  type Placement,
  shift,
  useFloating,
} from '@floating-ui/react-dom';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  type RefObject,
  useContext,
  useLayoutEffect,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import { Surface } from './Surface';
import { tooltipClasses } from './Tooltip';

export type CalloutVariant = 'default' | 'danger';
export type CalloutPlacement = Placement;

const variantClasses: Record<CalloutVariant, string> = {
  default: tooltipClasses(),
  danger:
    'flex items-center rounded-lg bg-tooltip-failure p-2 text-xs text-failure wrap-break-word',
};

const CONTENT_CLASS = 'z-tool-tip max-w-[min(18rem,calc(100vw-32px))]';

type Anchor = RefObject<HTMLElement | null> | HTMLElement | null | undefined;

type CalloutContextValue = {
  pinned: boolean;
  open: boolean;
  anchorRef: Anchor;
  placement: CalloutPlacement;
  flip: boolean | string;
  gutter: number;
  overflowPadding: number;
};

const CalloutContext = createContext<CalloutContextValue>({
  pinned: false,
  open: false,
  anchorRef: undefined,
  placement: 'bottom',
  flip: true,
  gutter: 6,
  overflowPadding: 16,
});

export type CalloutProps = {
  /**
   * Stays open while `open` is true, anchored by `anchorRef`. It is not a
   * popover: no trigger, no focus move, and it never joins the dismiss stack,
   * so a dialog behind it still closes on Escape.
   */
  pinned?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The element a pinned callout points at. */
  anchorRef?: Anchor;
  placement?: CalloutPlacement;
  /** `false` holds the placement; a placement string, or several separated by spaces, is the fallback. */
  flip?: boolean | string;
  gutter?: number;
  overflowPadding?: number;
  children?: ReactNode;
};

function splitPlacement(placement: CalloutPlacement) {
  const [side, align = 'center'] = placement.split('-') as [
    'top' | 'right' | 'bottom' | 'left',
    ('start' | 'end' | 'center')?,
  ];
  return { side, align };
}

/** Opens on hover after a delay, closes when the pointer leaves both the trigger and the content. Touch has no hover, so a tap toggles it through the trigger. */
function CalloutRoot({
  pinned = false,
  open,
  defaultOpen,
  onOpenChange,
  anchorRef,
  placement,
  flip = true,
  gutter = 6,
  overflowPadding = 16,
  children,
}: CalloutProps) {
  const context: CalloutContextValue = {
    pinned,
    open: open ?? false,
    anchorRef,
    placement: placement ?? 'bottom',
    flip,
    gutter,
    overflowPadding,
  };
  if (pinned) {
    return <CalloutContext.Provider value={context}>{open ? children : null}</CalloutContext.Provider>;
  }
  return (
    <CalloutContext.Provider value={context}>
      <Popover.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={(next) => onOpenChange?.(next)}
        modal={false}
      >
        {children}
      </Popover.Root>
    </CalloutContext.Provider>
  );
}

function CalloutSurface({ variant, className, children }: { variant: CalloutVariant; className?: string; children?: ReactNode }) {
  return (
    <Surface depth={3} className={cn(variantClasses[variant], className)}>
      {children}
    </Surface>
  );
}

export type CalloutContentProps = Omit<ComponentProps<'div'>, 'className'> & {
  className?: string;
  variant?: CalloutVariant;
  /** Render in place instead of on `body`. Off, the callout clips and flips within its scrolling ancestor. */
  portal?: boolean;
};

function PinnedContent({ variant = 'default', portal, className, children }: CalloutContentProps) {
  const context = useContext(CalloutContext);
  const fallbacks =
    typeof context.flip === 'string' ? (context.flip.split(' ') as Placement[]) : undefined;
  const { refs, floatingStyles } = useFloating({
    placement: context.placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(context.gutter),
      context.flip !== false &&
        flipMiddleware({ fallbackPlacements: fallbacks, padding: context.overflowPadding }),
      shift({ padding: context.overflowPadding }),
    ],
  });
  const anchor = context.anchorRef;
  // A ref fills after render, so read it after every commit.
  useLayoutEffect(() => {
    refs.setReference((anchor && 'current' in anchor ? anchor.current : anchor) ?? null);
  });

  const positioner = (
    <div ref={refs.setFloating} role="note" className={CONTENT_CLASS} style={floatingStyles}>
      <CalloutSurface variant={variant} className={className}>
        {children}
      </CalloutSurface>
    </div>
  );
  return portal === false ? positioner : createPortal(positioner, document.body);
}

function CalloutContent(props: CalloutContentProps) {
  const context = useContext(CalloutContext);
  if (context.pinned) return <PinnedContent {...props} />;
  const { variant = 'default', portal, className, children, ...rest } = props;
  const { side, align } = splitPlacement(context.placement);
  const positioner = (
    <Popover.Positioner
      side={side}
      align={align}
      sideOffset={context.gutter}
      collisionPadding={context.overflowPadding}
      collisionAvoidance={context.flip === false ? { side: 'none', align: 'none' } : undefined}
      className={CONTENT_CLASS}
    >
      <Popover.Popup
        {...rest}
        role="note"
        initialFocus={false}
        finalFocus={false}
        className="outline-none"
      >
        <CalloutSurface variant={variant} className={className}>
          {children}
        </CalloutSurface>
      </Popover.Popup>
    </Popover.Positioner>
  );
  return portal === false ? positioner : <Popover.Portal>{positioner}</Popover.Portal>;
}

export type CalloutTriggerProps = Omit<ComponentProps<typeof Popover.Trigger>, 'className'> & {
  className?: string;
};

function CalloutTrigger({ className, ...props }: CalloutTriggerProps) {
  return (
    <Popover.Trigger
      openOnHover
      delay={400}
      closeDelay={150}
      {...props}
      className={cn('inline-flex items-center', className)}
    />
  );
}

/**
 * A short note anchored to a control. It opens on hover, like a tooltip,
 * and on tap, so a phone can reach it; a tap away or Escape closes it.
 * Pinned, it stays open while a state holds, which is how every form
 * control shows its error.
 *
 * @do Use `default` for information the user must be able to reach on touch.
 * @do Use `danger` for a validation error, pinned to the invalid control.
 * @do Keep `Tooltip` for a label on hover: rail glyphs, icon buttons.
 * @dont Do not give the trigger a `label` or `tooltip`; the callout is the
 *   hover surface.
 * @dont Do not put controls inside a callout; that is a `Popover`.
 * @dont Do not pin a `default` callout; a note that never leaves is a
 *   `Description`.
 */
export const Callout = Object.assign(CalloutRoot, {
  Trigger: CalloutTrigger,
  Content: CalloutContent,
});
