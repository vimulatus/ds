import { Fieldset } from '@base-ui/react/fieldset';
import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as Base } from '@base-ui/react/radio-group';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Field } from './Field';

export type RadioSize = 'sm' | 'md';

const DOT: Record<RadioSize, string> = {
  sm: 'size-3.5',
  md: 'size-4 touch:size-5',
};

export type RadioProps = Omit<ComponentProps<typeof BaseRadio.Root>, 'className'> & {
  className?: string;
  label?: ReactNode;
  description?: ReactNode;
  size?: RadioSize;
};

/**
 * One choice in a RadioGroup. The checked ring fills with accent at once;
 * the dot, in the color of the surface below, grows in. Hover, label
 * included, turns the ring accent.
 */
export function Radio({ label, description, size = 'md', className, ...props }: RadioProps) {
  return (
    <label
      className={cn(
        'group/radio flex items-start gap-2 text-sm text-ink has-data-disabled:cursor-not-allowed has-data-disabled:text-ink-disabled',
        className
      )}
    >
      <span className="flex h-5 items-center">
        <BaseRadio.Root
          {...props}
          className={cn(
            'flex shrink-0 items-center justify-center rounded-full border border-edge bg-input transition-colors',
            'outline-none focus-visible:focus-ring',
            'not-touch:group-hover/radio:not-data-disabled:border-accent data-checked:border-accent data-checked:bg-accent',
            'data-invalid:border-failure data-invalid:ring-2 data-invalid:ring-failure/20',
            'data-disabled:opacity-50',
            DOT[size]
          )}
        >
          <BaseRadio.Indicator className="size-[40%] rounded-full bg-surface transition-[scale] duration-150 ease-out data-starting-style:scale-0" />
        </BaseRadio.Root>
      </span>
      {(label || description) && (
        <span className="flex flex-col gap-0.5">
          {label}
          {description && <span className="text-xs text-ink-subtle">{description}</span>}
        </span>
      )}
    </label>
  );
}

export type RadioGroupProps = Omit<ComponentProps<typeof Base>, 'className'> & {
  className?: string;
  /** The question the group answers, rendered as a legend. Without it, pass `aria-label`. */
  label?: ReactNode;
  description?: ReactNode;
  /** Pins under the group while it is invalid. */
  error?: ReactNode;
  invalid?: boolean;
  orientation?: 'vertical' | 'horizontal';
};

/**
 * Picks one of a few options that all stay visible. Children are Radios.
 * A short switch between views is Tabs; a long list is a Select.
 */
export function RadioGroup({
  label,
  description,
  error,
  invalid,
  name,
  disabled,
  orientation = 'vertical',
  className,
  children,
  ...props
}: RadioGroupProps) {
  return (
    <Field
      description={description}
      error={error}
      invalid={invalid}
      name={name}
      disabled={disabled}
      errorPlacement="bottom-start"
      className={className}
    >
      <Fieldset.Root render={<Base {...props} disabled={disabled} />} className="flex flex-col gap-2">
        {label && (
          <Fieldset.Legend className="mb-0.5 text-xs font-medium text-ink-muted">
            {label}
          </Fieldset.Legend>
        )}
        <div
          className={cn(
            'flex',
            orientation === 'vertical' ? 'flex-col gap-2' : 'flex-row flex-wrap gap-x-4 gap-y-2'
          )}
        >
          {children}
        </div>
      </Fieldset.Root>
    </Field>
  );
}
