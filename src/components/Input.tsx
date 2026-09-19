import { Input as Base } from '@base-ui/react/input';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { createVariants, type VariantProps } from '@/lib/variants';
import type { ButtonSize } from './Button';

/** Text-bearing Button sizes that also make sense for an input. */
export type InputSize = Exclude<ButtonSize, `icon-${string}`>;

const INPUT_SIZE_VARIANTS: Record<InputSize, string> = {
  sm: 'h-6 px-2 text-xs',
  md: 'h-8 px-2 text-base',
};

/** Shared focus treatment for outlined text-entry controls. */
export const inputOutlineFocusClasses =
  'focus-visible:border-[color-mix(in_oklch,var(--color-edge)_80%,var(--color-ink))] focus-visible:ring-2 focus-visible:ring-edge-muted';

/** Canonical visual variants for standalone inputs. */
export const inputVariants = createVariants(
  cn(
    'w-full min-w-0 rounded-md border text-ink caret-current outline-none transition-[background-color,border-color,box-shadow]',
    'file:inline-flex file:border-0 file:bg-transparent file:text-[inherit] file:font-medium file:text-ink',
    'placeholder:text-ink-placeholder',
    'aria-invalid:border-failure aria-invalid:ring-2 aria-invalid:ring-failure/20',
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
  ),
  {
    variant: {
      outlined: cn('border-edge-muted bg-input', inputOutlineFocusClasses),
      ghost: 'border-transparent bg-transparent',
    },
    size: INPUT_SIZE_VARIANTS,
  },
  { variant: 'outlined', size: 'md' }
);

export type InputVariantProps = VariantProps<typeof inputVariants>;
export type InputVariant = NonNullable<InputVariantProps['variant']>;

export type InputClassOptions = {
  variant?: InputVariant;
  size?: InputSize;
  className?: string;
};

/** Returns canonical classes for a native input. */
export function inputClasses({ variant, size, className }: InputClassOptions = {}): string {
  return cn(inputVariants({ variant, size }), className);
}

export type InputProps = Omit<ComponentProps<typeof Base>, 'className' | 'size'> & {
  className?: string;
  /** A Button-compatible visual size, or the native numeric input size. */
  size?: InputSize | number;
  variant?: InputVariant;
};

/**
 * A thin native input on the control sizes. Use TextField when it needs a
 * label, description or error, and InputGroup when it needs an icon or a
 * button inside the frame. `ghost` is for a parent that owns the frame and
 * the focus treatment.
 */
export function Input({ variant, size, className, ...props }: InputProps) {
  const visualSize: InputSize = typeof size === 'string' ? size : 'md';
  return (
    <Base
      data-input=""
      data-slot="input"
      data-variant={variant ?? 'outlined'}
      data-size={visualSize}
      size={typeof size === 'number' ? size : undefined}
      {...props}
      className={inputClasses({ variant, size: visualSize, className })}
    />
  );
}
