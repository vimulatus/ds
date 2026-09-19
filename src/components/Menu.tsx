import { Menu as Base } from '@base-ui/react/menu';
import { CaretRight, Check } from '@phosphor-icons/react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { type ButtonSize, type ButtonVariant, buttonClasses } from './Button';
import { Tooltip, type TooltipProps } from './Tooltip';

/**
 * A list of actions or choices behind a trigger. Group related rows, put the
 * destructive one last, and keep a menu short enough to scan. Arrow keys,
 * type-ahead and Escape work out of the box.
 */
export const Menu = Base.Root;
export const MenuGroup = Base.Group;
export const MenuRadioGroup = Base.RadioGroup;
export const MenuSub = Base.SubmenuRoot;

export type MenuTriggerProps = Omit<ComponentProps<typeof Base.Trigger>, 'className'> & {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** The accessible name and tooltip. Required for an icon-only trigger. */
  label?: string;
  /** Which side of the trigger the tooltip opens on. */
  tooltipSide?: TooltipProps['side'];
};

/** Opens the menu. Styled as a `Button`, and lit while the menu is open. */
export function MenuTrigger({
  variant = 'outlined',
  size = 'md',
  label,
  tooltipSide,
  className,
  ...props
}: MenuTriggerProps) {
  const trigger = (
    <Base.Trigger
      aria-label={label}
      {...props}
      className={cn(buttonClasses({ variant, size }), className)}
    />
  );
  if (!label) return trigger;
  return (
    <Tooltip content={label} side={tooltipSide}>
      {trigger}
    </Tooltip>
  );
}

const SURFACE =
  'glass flex flex-col rounded-lg border border-edge-muted bg-menu-glass p-1 text-sm text-ink outline-none';

export type MenuContentProps = Omit<ComponentProps<typeof Base.Popup>, 'className'> & {
  className?: string;
  side?: ComponentProps<typeof Base.Positioner>['side'];
  align?: ComponentProps<typeof Base.Positioner>['align'];
};

/** The glass popup. It grows from the trigger and flips to stay on screen. */
export function MenuContent({ side, align = 'start', className, ...props }: MenuContentProps) {
  return (
    <Base.Portal>
      <Base.Positioner side={side} align={align} sideOffset={4} className="z-action-menu outline-none">
        <Base.Popup {...props} className={cn(SURFACE, 'menu-open-animation min-w-44', className)} />
      </Base.Positioner>
    </Base.Portal>
  );
}

/** A submenu's popup. It opens beside its row, on the same surface. */
export function MenuSubContent({ className, ...props }: Omit<MenuContentProps, 'side' | 'align'>) {
  return (
    <Base.Portal>
      <Base.Positioner sideOffset={2} alignOffset={-4} className="z-action-menu outline-none">
        <Base.Popup {...props} className={cn(SURFACE, 'menu-open-animation min-w-40', className)} />
      </Base.Positioner>
    </Base.Portal>
  );
}

const ROW = cn(
  'flex h-8 cursor-default select-none items-center gap-2 rounded-md px-2 outline-none touch:h-10 touch:text-base',
  'data-highlighted:bg-hover data-disabled:pointer-events-none data-disabled:text-ink-disabled',
  '[&_svg]:size-4 [&_svg]:shrink-0'
);

const ICON = 'flex text-ink-muted';

function Shortcut({ keys }: { keys?: string }) {
  if (!keys) return null;
  return <kbd className="ml-auto pl-4 font-sans text-xs text-ink-subtle">{keys}</kbd>;
}

export type MenuItemProps = Omit<ComponentProps<typeof Base.Item>, 'className'> & {
  className?: string;
  icon?: ReactNode;
  /** A key combination shown at the row's end, such as "⌘D". */
  shortcut?: string;
  /** Red text for an action that removes something. */
  destructive?: boolean;
};

export function MenuItem({ icon, shortcut, destructive, className, children, ...props }: MenuItemProps) {
  return (
    <Base.Item
      {...props}
      className={cn(ROW, destructive && 'text-failure-ink', className)}
    >
      {icon && <span className={cn(ICON, destructive && 'text-failure-ink')}>{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
      <Shortcut keys={shortcut} />
    </Base.Item>
  );
}

/** A heading for the group it sits in. */
export function MenuLabel({ className, ...props }: Omit<ComponentProps<typeof Base.GroupLabel>, 'className'> & { className?: string }) {
  return (
    <Base.GroupLabel
      {...props}
      className={cn('px-2 pt-1.5 pb-1 text-xs font-medium text-ink-subtle', className)}
    />
  );
}

export function MenuSeparator({ className }: { className?: string }) {
  return <Base.Separator className={cn('-mx-1 my-1 h-px bg-edge-muted', className)} />;
}

export type MenuCheckboxItemProps = Omit<ComponentProps<typeof Base.CheckboxItem>, 'className'> & {
  className?: string;
};

/** A toggle row. It keeps the menu open, so a person can flip several. */
export function MenuCheckboxItem({ className, children, ...props }: MenuCheckboxItemProps) {
  return (
    <Base.CheckboxItem {...props} className={cn(ROW, className)}>
      <span className="flex size-4 text-accent">
        <Base.CheckboxItemIndicator>
          <Check weight="bold" />
        </Base.CheckboxItemIndicator>
      </span>
      <span className="flex-1 truncate">{children}</span>
    </Base.CheckboxItem>
  );
}

export type MenuRadioItemProps = Omit<ComponentProps<typeof Base.RadioItem>, 'className'> & {
  className?: string;
};

/** One choice in a `MenuRadioGroup`. The chosen row carries a dot. */
export function MenuRadioItem({ className, children, ...props }: MenuRadioItemProps) {
  return (
    <Base.RadioItem {...props} className={cn(ROW, className)}>
      <span className="flex size-4 items-center justify-center">
        <Base.RadioItemIndicator className="size-1.5 rounded-full bg-accent" />
      </span>
      <span className="flex-1 truncate">{children}</span>
    </Base.RadioItem>
  );
}

export type MenuSubTriggerProps = Omit<ComponentProps<typeof Base.SubmenuTrigger>, 'className'> & {
  className?: string;
  icon?: ReactNode;
};

/** The row that opens a submenu. It stays lit while the submenu is open. */
export function MenuSubTrigger({ icon, className, children, ...props }: MenuSubTriggerProps) {
  return (
    <Base.SubmenuTrigger {...props} className={cn(ROW, 'data-popup-open:bg-hover', className)}>
      {icon && <span className={ICON}>{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
      <CaretRight className="size-3! text-ink-muted" />
    </Base.SubmenuTrigger>
  );
}
