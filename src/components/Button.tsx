import { Button as Base } from '@base-ui/react/button';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { Tooltip } from './Tooltip';

export type ButtonVariant = 'ghost' | 'outlined' | 'accent' | 'danger' | 'cta';
export type ButtonSize = 'sm' | 'md' | 'icon-sm' | 'icon-md';

const VARIANT: Record<ButtonVariant, string> = {
  ghost: 'text-ink-muted hover:bg-hover hover:text-ink data-popup-open:bg-hover data-popup-open:text-ink',
  outlined: 'pane border border-edge bg-surface text-ink hover:bg-hover data-popup-open:bg-hover',
  accent: 'pane bg-accent-bg text-accent-ink hover:bg-accent/25',
  danger: 'pane bg-failure-bg text-failure-ink hover:bg-failure/25',
  cta: 'pane bg-accent text-accent-contrast hover:bg-accent/90',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-6 gap-1 px-2 text-xs [&_svg]:size-3.5',
  md: 'h-8 gap-1.5 px-3 text-sm [&_svg]:size-4',
  'icon-sm': 'size-6 [&_svg]:size-3.5',
  'icon-md': 'size-8 [&_svg]:size-4',
};

/** The classes of a button, for an element that must stay a link or a trigger. */
export function buttonClasses({
  variant = 'ghost',
  size = 'md',
}: { variant?: ButtonVariant; size?: ButtonSize } = {}) {
  return cn(
    'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-md font-medium outline-none transition-colors',
    'focus-visible:focus-ring [&_svg]:shrink-0',
    'disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50',
    VARIANT[variant],
    SIZE[size]
  );
}

export type ButtonProps = Omit<ComponentProps<typeof Base>, 'className'> & {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** The accessible name and tooltip. Required for an icon-only button. */
  label?: string;
  /** A key combination shown in the tooltip, such as "⌘K". */
  shortcut?: string;
};

/**
 * Triggers an action. `variant` carries emphasis, `size` carries density.
 * Give a screen at most one `cta`.
 */
export function Button({ variant, size, label, shortcut, className, ...props }: ButtonProps) {
  const button = (
    <Base
      aria-label={label}
      {...props}
      className={cn(buttonClasses({ variant, size }), className)}
    />
  );
  if (!label) return button;
  return (
    <Tooltip content={label} shortcut={shortcut}>
      {button}
    </Tooltip>
  );
}
