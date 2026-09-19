import { Input as Base } from '@base-ui/react/input';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export type InputVariant = 'outlined' | 'ghost';
export type InputSize = 'sm' | 'md';

const VARIANT: Record<InputVariant, string> = {
  outlined:
    'border border-edge bg-input focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 data-invalid:border-failure data-invalid:ring-failure/20',
  ghost:
    '-mx-1.5 bg-transparent hover:bg-hover focus-visible:bg-input focus-visible:ring-2 focus-visible:ring-edge-muted',
};

const SIZE: Record<InputSize, string> = {
  sm: 'h-6 rounded-md px-1.5 text-sm',
  md: 'h-8 rounded-md px-2.5 text-sm touch:h-10 touch:text-base',
};

export type InputProps = Omit<ComponentProps<typeof Base>, 'className' | 'size'> & {
  className?: string;
  variant?: InputVariant;
  size?: InputSize;
};

/**
 * A single-line text control. `outlined` sits in a form; `ghost` is a value
 * that edits in place. Inside a Base UI Field it takes the field's label,
 * description and validity.
 */
export function Input({ variant = 'outlined', size = 'md', className, ...props }: InputProps) {
  return (
    <Base
      {...props}
      className={cn(
        'w-full min-w-0 text-ink outline-none transition-[background-color,border-color,box-shadow]',
        'disabled:cursor-not-allowed disabled:text-ink-disabled',
        VARIANT[variant],
        SIZE[size],
        className
      )}
    />
  );
}
