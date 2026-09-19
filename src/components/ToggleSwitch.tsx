import { Switch as Base } from '@base-ui/react/switch';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type SwitchSize = 'sm' | 'md';

const TRACK: Record<SwitchSize, string> = {
  sm: 'h-4 w-7',
  md: 'h-5 w-9 touch:h-6 touch:w-11',
};

const THUMB: Record<SwitchSize, string> = {
  sm: 'size-3 data-checked:translate-x-3',
  md: 'size-4 data-checked:translate-x-4 touch:size-5 touch:data-checked:translate-x-5',
};

export type SwitchProps = Omit<ComponentProps<typeof Base.Root>, 'className'> & {
  className?: string;
  /** The setting, named in its on state: "Read receipts", not "Disable read receipts". */
  label?: ReactNode;
  description?: ReactNode;
  size?: SwitchSize;
};

/**
 * Turns a setting on or off, and the change applies at once. A change that
 * waits for a Save button is a Checkbox. With a label, the label and the
 * gap are part of the hit target.
 */
export function Switch({ label, description, size = 'md', className, ...props }: SwitchProps) {
  const control = (
    <Base.Root
      {...props}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full bg-ink-muted/40 p-0.5 outline-none transition-colors duration-150',
        'focus-visible:focus-ring data-checked:bg-accent',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        TRACK[size],
        !label && className
      )}
    >
      <Base.Thumb
        className={cn(
          'block rounded-full bg-surface shadow-sm transition-transform duration-150 ease-out',
          THUMB[size]
        )}
      />
    </Base.Root>
  );
  if (!label) return control;
  return (
    <label
      className={cn(
        'flex items-center gap-2 text-sm text-ink has-data-disabled:cursor-not-allowed has-data-disabled:text-ink-disabled',
        description && 'items-start',
        className
      )}
    >
      {control}
      <span className="flex flex-col gap-0.5">
        {label}
        {description && <span className="text-xs text-ink-subtle">{description}</span>}
      </span>
    </label>
  );
}
