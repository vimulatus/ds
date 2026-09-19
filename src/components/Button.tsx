import { Button as Base } from '@base-ui/react/button';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { createVariants, type VariantProps } from '@/lib/variants';
import { useButtonGroupContext } from './ButtonGroup';
import { type Depth, Layer } from './Layer';
import { Tooltip } from './Tooltip';

/** Shared size classes for controls with text and optional icons. */
export const CONTROL_SIZE_VARIANTS = {
  sm: "h-6 gap-1 px-2 text-xs [&>svg:not([class*='size-'])]:size-3",
  md: "h-8 gap-2 px-2 text-sm [&>svg:not([class*='size-'])]:size-3.5",
} as const;

const BUTTON_TOUCH_STYLES = "touch:min-h-9 touch:min-w-9 touch:[&>svg:not([class*='size-'])]:size-6";

/**
 * Canonical variant classes for buttons and button-like elements. Hover and
 * press paint a translucent scrim over the variant's own background, so a
 * button keeps its full color on hover.
 */
export const buttonVariants = createVariants(
  cn(
    'relative inline-flex shrink-0 items-center justify-center whitespace-nowrap text-sm',
    'rounded-md border-1 border-transparent font-medium outline-none select-none transition-colors [&_*]:select-none',
    'data-disabled:cursor-not-allowed data-disabled:opacity-30',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0'
  ),
  {
    variant: {
      danger:
        'bg-failure-bg text-failure dark:bg-failure-bg not-touch:not-disabled:hover:bg-failure/25 not-touch:not-disabled:active:bg-failure/30',
      outlined:
        'bg-surface/70 text-ink-muted border-edge-muted not-touch:not-disabled:hover:overlay-hover not-touch:not-disabled:hover:text-ink not-touch:not-disabled:active:overlay-active',
      accent: 'bg-accent-bg not-touch:not-disabled:hover:overlay-accent-bg text-accent',
      ghost:
        'bg-transparent text-ink-muted not-touch:not-disabled:hover:overlay-hover not-touch:not-disabled:hover:text-ink not-touch:not-disabled:active:overlay-active',
      cta: 'bg-accent text-accent-contrast focus-visible:ring-accent-contrast/70 [--color-edge:var(--color-accent-contrast-muted)] [--color-edge-muted:var(--color-accent-contrast-muted)] not-touch:not-disabled:hover:overlay-[color-mix(in_oklch,var(--color-surface)_12%,transparent)] not-touch:not-disabled:active:overlay-[color-mix(in_oklch,var(--color-surface)_22%,transparent)]',
    },
    size: {
      sm: CONTROL_SIZE_VARIANTS.sm,
      md: CONTROL_SIZE_VARIANTS.md,
      'icon-md': "size-8 aspect-square p-1.5 [&>svg:not([class*='size-'])]:size-4",
      'icon-sm': "size-6 aspect-square p-1 [&>svg:not([class*='size-'])]:size-3.5",
    },
  },
  { variant: 'ghost', size: 'md' }
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
export type ButtonVariant = NonNullable<ButtonVariantProps['variant']>;
export type ButtonSize = NonNullable<ButtonVariantProps['size']>;

export type ButtonClassOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  noTouchResize?: boolean;
  square?: boolean;
  className?: string;
};

/** Returns the canonical classes for a button-like element. It carries no glass: Button adds that. */
export function buttonClasses({
  variant,
  size,
  fullWidth = false,
  noTouchResize = false,
  square = false,
  className,
}: ButtonClassOptions = {}): string {
  return cn(
    buttonVariants({ variant, size }),
    fullWidth && 'w-full',
    !noTouchResize && BUTTON_TOUCH_STYLES,
    square && 'aspect-square p-0',
    className
  );
}

export type TooltipPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | `${'top' | 'bottom' | 'left' | 'right'}-${'start' | 'end'}`;

export type ButtonProps = Omit<ComponentProps<typeof Base>, 'className' | 'children'> & {
  className?: string;
  children?: ReactNode;
  depth?: Depth;
  tooltipPlacement?: TooltipPlacement;
  /** Stretch the button to fill the available width. */
  fullWidth?: boolean;
  noTouchResize?: boolean;
  square?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Accessible name for the button. Also the tooltip unless `tooltip` says otherwise. */
  label?: string;
  /** Tooltip content. On an icon button it is also the accessible name when no label is set. */
  tooltip?: string;
  /** Shortcut shown in the tooltip, such as "cmd+k". */
  shortcut?: string | string[];
  tooltipDisabled?: boolean;
};

/**
 * The standard way to trigger an action. `variant` carries emphasis and
 * `size` carries density. Every variant except `ghost` is a pane of glass;
 * inside a ButtonGroup the group carries the glass for the whole row.
 */
export function Button({
  variant: variantProp,
  size: sizeProp,
  depth,
  label,
  tooltip,
  shortcut,
  tooltipPlacement = 'bottom',
  tooltipDisabled,
  fullWidth,
  noTouchResize,
  square,
  className,
  'aria-label': ariaLabel,
  ...props
}: ButtonProps) {
  const group = useButtonGroupContext();
  const variant = variantProp ?? group?.variant ?? 'ghost';
  const size = sizeProp ?? group?.size ?? 'md';
  const iconOnly = size.startsWith('icon-') || square;

  const button = (
    <Base
      data-button=""
      data-slot="button"
      data-variant={variant}
      data-size={size}
      aria-label={ariaLabel ?? label ?? (iconOnly ? tooltip : undefined)}
      {...props}
      className={cn(
        buttonClasses({ variant, size, fullWidth, noTouchResize, square }),
        group === undefined && variant !== 'ghost' && 'glass',
        className
      )}
    />
  );

  const tip = tooltip ?? label;
  const content =
    tip === undefined ? (
      button
    ) : (
      <Tooltip label={tip} shortcut={shortcut} placement={tooltipPlacement} disabled={tooltipDisabled}>
        {button}
      </Tooltip>
    );

  if (group !== undefined && depth === undefined) return content;
  return <Layer depth={depth ?? 0}>{content}</Layer>;
}
