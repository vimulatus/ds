import { Menu as Base } from '@base-ui/react/menu';
import { Check } from '@phosphor-icons/react';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/cn';
import { fromPlacement, type Placement } from '@/lib/placement';
import { Button, type ButtonProps } from './Button';
import type { Depth } from './Layer';
import { Layer } from './Layer';
import { SURFACE_CLASS, surfaceStyle } from './Surface';

/*
<Dropdown>
  <Dropdown.Trigger>Filter</Dropdown.Trigger>
  <Dropdown.Content>
    <Dropdown.Group>
      <Dropdown.Item></Dropdown.Item>
    </Dropdown.Group>
  </Dropdown.Content>
</Dropdown>
*/

type Positioning = { placement: Placement; gutter: number; shift: number };

const PositionContext = createContext<Positioning>({ placement: 'bottom-start', gutter: 4, shift: 0 });

type PortalMount = HTMLElement | null | undefined;
type DropdownPortalScope = 'local';

export type DropdownProps = ComponentProps<typeof Base.Root> & {
  /** Where the content opens against the trigger. */
  placement?: Placement;
  /** Distance between the trigger and the content, in px. */
  gutter?: number;
  /** Offset along the trigger's edge, in px. */
  shift?: number;
};

function DropdownRoot({ placement = 'bottom-start', gutter = 4, shift = 0, ...props }: DropdownProps) {
  return (
    <PositionContext.Provider value={{ placement, gutter, shift }}>
      <Base.Root {...props} />
    </PositionContext.Provider>
  );
}

type Classed<T> = Omit<T, 'className'> & { className?: string };

export type DropdownContentProps = Classed<ComponentProps<typeof Base.Popup>> & {
  depth?: Depth;
  /** The element to portal into. */
  mount?: PortalMount;
  /** `local` portals into the closest `.portal-scope`, such as an open dialog. */
  portalScope?: DropdownPortalScope;
  /** Block pointer interaction behind the menu with a transparent backdrop. */
  blockingBackdrop?: boolean;
};
export type DropdownSubContentProps = Omit<DropdownContentProps, 'blockingBackdrop'>;

// Text size is inherited from `Dropdown.Content` (defaults to `text-sm`) so a
// menu can be resized by passing a `text-*` class to the content.
const ROW_CLASS =
  'group rounded-lg w-full flex items-center gap-1.5 p-1.5 px-2 text-left font-normal cursor-default outline-none data-highlighted:bg-ink/5 data-disabled:opacity-50 data-disabled:cursor-not-allowed';

// Paint the same surface as context menus, including custom contents
// (calendar month lists) without a Dropdown.Group.
const CONTENT_CLASS =
  'rounded-xl size-auto z-action-menu menu-open-animation glass bg-menu-glass text-sm [--color-surface:var(--color-menu)]';

/** Resolves the portal container: `mount`, or the closest `.portal-scope` when `portalScope` is local. */
function usePortalContainer(mount: PortalMount, portalScope: DropdownPortalScope | undefined) {
  const [scope, setScope] = useState<HTMLElement | null>(null);
  const sentinel = useCallback(
    (el: HTMLDivElement | null) => setScope(el?.closest<HTMLElement>('.portal-scope') ?? null),
    []
  );
  const container = mount ?? (portalScope === 'local' ? scope : undefined);
  return { sentinel, container: container ?? undefined };
}

/** Ctrl+J/K/H/L move through the items like the arrow keys. */
const CTRL_KEYS: Record<string, string> = { j: 'ArrowDown', k: 'ArrowUp', h: 'ArrowLeft', l: 'ArrowRight' };

function onCtrlNavigation(event: React.KeyboardEvent) {
  const key = event.ctrlKey && !event.metaKey && !event.altKey ? CTRL_KEYS[event.key] : undefined;
  if (!key) return;
  event.preventDefault();
  event.target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

/**
 * A menu opened by pointer starts with its first item lit, as a keyboard
 * open does. A tap-opened menu starts plain.
 */
function useHighlightFirstItem(popup: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (document.documentElement.dataset.touchDevice === 'true') return;
    const frame = requestAnimationFrame(() => {
      const el = popup.current;
      if (!el || el.querySelector('[data-highlighted]')) return;
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    });
    return () => cancelAnimationFrame(frame);
  }, [popup]);
}

function Popup({
  sub,
  depth = 2,
  mount,
  portalScope,
  blockingBackdrop,
  className,
  style,
  children,
  onKeyDown,
  ...props
}: DropdownContentProps & { sub?: boolean }) {
  const { placement, gutter, shift } = useContext(PositionContext);
  const { sentinel, container } = usePortalContainer(mount, portalScope);
  const popupRef = useRef<HTMLDivElement>(null);
  useHighlightFirstItem(popupRef);
  const position = sub ? { side: 'right' as const, align: 'start' as const, sideOffset: 2, alignOffset: -7 } : { ...fromPlacement(placement), sideOffset: gutter, alignOffset: shift };
  return (
    <>
      <div className="hidden" ref={sentinel} />
      <Base.Portal container={container}>
        {blockingBackdrop && <Base.Backdrop className="fixed inset-0 z-action-menu pointer-events-auto" aria-hidden="true" />}
        <Base.Positioner {...position} className="z-action-menu">
          <Layer depth={depth}>
            <Base.Popup
              {...props}
              ref={popupRef}
              data-surface=""
              style={surfaceStyle({ style: style as React.CSSProperties })}
              className={cn(SURFACE_CLASS, CONTENT_CLASS, className)}
              onKeyDown={(event) => {
                onKeyDown?.(event);
                onCtrlNavigation(event);
              }}
            >
              <div className="flex flex-col gap-(--app-border-width) bg-edge-muted/60 size-full">{children}</div>
            </Base.Popup>
          </Layer>
        </Base.Positioner>
      </Base.Portal>
    </>
  );
}

function DropdownContent(props: DropdownContentProps) {
  return <Popup {...props} />;
}

function DropdownSubContent(props: DropdownSubContentProps) {
  return <Popup {...props} sub />;
}

export type DropdownGroupProps = Classed<ComponentProps<typeof Base.Group>>;

function DropdownGroup({ className, ...props }: DropdownGroupProps) {
  return <Base.Group {...props} className={cn('flex flex-col p-1.5 bg-menu', className)} />;
}

export type DropdownGroupLabelProps = Classed<ComponentProps<typeof Base.GroupLabel>>;

function DropdownGroupLabel({ className, ...props }: DropdownGroupLabelProps) {
  return (
    <Base.GroupLabel
      render={<span />}
      {...props}
      className={cn('px-2 h-7 flex items-center text-xs text-ink-extra-muted', className)}
    />
  );
}

/** Which item an `ItemIndicator` sits in, so it can follow the right checked state. */
const IndicatorContext = createContext<'checkbox' | 'radio'>('checkbox');

const CHECKBOX_ITEM_BOX_CLASS = cn(
  'inline-flex items-center justify-center size-3.5 shrink-0 rounded-sm',
  'border border-transparent text-surface',
  'group-data-highlighted:border-edge-muted',
  'group-data-checked:bg-accent group-data-checked:border-accent'
);

export type DropdownCheckboxItemProps = Classed<
  Omit<ComponentProps<typeof Base.CheckboxItem>, 'onCheckedChange' | 'closeOnClick' | 'onChange'>
> & {
  onChange?: (checked: boolean) => void;
  /** Close the menu when the item is chosen. */
  closeOnSelect?: boolean;
};

function DropdownCheckboxItem({ className, children, onChange, closeOnSelect, ...props }: DropdownCheckboxItemProps) {
  return (
    <IndicatorContext.Provider value="checkbox">
      <Base.CheckboxItem
        {...props}
        onCheckedChange={onChange}
        closeOnClick={closeOnSelect}
        className={cn(ROW_CLASS, className)}
      >
        <div className={CHECKBOX_ITEM_BOX_CLASS}>
          <Base.CheckboxItemIndicator render={<div />}>
            <Check className="size-2.5" />
          </Base.CheckboxItemIndicator>
        </div>
        {children}
      </Base.CheckboxItem>
    </IndicatorContext.Provider>
  );
}

export type DropdownItemIndicatorProps = { className?: string; children?: ReactNode };

/** Renders its children only while the enclosing checkbox or radio item is checked. */
function DropdownItemIndicator({ className, children }: DropdownItemIndicatorProps) {
  const kind = useContext(IndicatorContext);
  const Indicator = kind === 'radio' ? Base.RadioItemIndicator : Base.CheckboxItemIndicator;
  return (
    <Indicator render={<div />} className={className}>
      {children}
    </Indicator>
  );
}

export type DropdownSubTriggerProps = Classed<ComponentProps<typeof Base.SubmenuTrigger>>;

function DropdownSubTrigger({ className, ...props }: DropdownSubTriggerProps) {
  return <Base.SubmenuTrigger {...props} className={cn(ROW_CLASS, 'justify-between', className)} />;
}

export type DropdownRadioGroupProps = Omit<ComponentProps<typeof Base.RadioGroup>, 'onValueChange' | 'onChange'> & {
  onChange?: (value: string) => void;
};

function DropdownRadioGroup({ onChange, ...props }: DropdownRadioGroupProps) {
  return <Base.RadioGroup {...props} onValueChange={(value) => onChange?.(value as string)} />;
}

export type DropdownRadioItemProps = Classed<Omit<ComponentProps<typeof Base.RadioItem>, 'closeOnClick'>> & {
  /** Close the menu when the item is chosen. */
  closeOnSelect?: boolean;
};

function DropdownRadioItem({ className, closeOnSelect, ...props }: DropdownRadioItemProps) {
  return (
    <IndicatorContext.Provider value="radio">
      <Base.RadioItem {...props} closeOnClick={closeOnSelect} className={cn(ROW_CLASS, className)} />
    </IndicatorContext.Provider>
  );
}

export type DropdownSubProps = ComponentProps<typeof Base.SubmenuRoot>;

function DropdownSub(props: DropdownSubProps) {
  return <Base.SubmenuRoot {...props} />;
}

export type DropdownItemProps = Classed<Omit<ComponentProps<typeof Base.Item>, 'closeOnClick'>> & {
  /** Runs when the item is chosen, by click or keyboard. */
  onSelect?: () => void;
  /** Close the menu when the item is chosen. Defaults to true. */
  closeOnSelect?: boolean;
};

function DropdownItem({ className, onSelect, onClick, closeOnSelect, ...props }: DropdownItemProps) {
  return (
    <Base.Item
      {...props}
      closeOnClick={closeOnSelect}
      onClick={(event) => {
        onClick?.(event);
        onSelect?.();
      }}
      className={cn(ROW_CLASS, className)}
    />
  );
}

export type DropdownTriggerProps = ButtonProps;

/** Opens the menu. A `Button`, `outlined` and `sm` unless told otherwise. */
function DropdownTrigger({ variant = 'outlined', size = 'sm', ...props }: DropdownTriggerProps) {
  return <Base.Trigger render={<Button variant={variant} size={size} {...props} />} />;
}

export const Dropdown = Object.assign(DropdownRoot, {
  RadioGroup: DropdownRadioGroup,
  Separator: Base.Separator /* passthrough — styled via className at use sites */,
  ItemIndicator: DropdownItemIndicator,
  CheckboxItem: DropdownCheckboxItem,
  SubContent: DropdownSubContent,
  SubTrigger: DropdownSubTrigger,
  GroupLabel: DropdownGroupLabel,
  RadioItem: DropdownRadioItem,
  Content: DropdownContent,
  Trigger: DropdownTrigger,
  Group: DropdownGroup,
  Item: DropdownItem,
  Sub: DropdownSub,
});
