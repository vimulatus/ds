import { Checkbox as Base } from '@base-ui/react/checkbox';
import { CheckboxGroup as BaseGroup } from '@base-ui/react/checkbox-group';
import { Fieldset } from '@base-ui/react/fieldset';
import { Check, Minus } from '@phosphor-icons/react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Field } from './Field';

export type CheckboxSize = 'sm' | 'md';

const BOX: Record<CheckboxSize, string> = {
  sm: 'size-3.5 rounded-[3px] [&_svg]:size-2.5',
  md: 'size-4 rounded-[4px] [&_svg]:size-3 touch:size-5 touch:[&_svg]:size-3.5',
};

const BOX_BASE =
  'flex shrink-0 items-center justify-center border border-edge bg-input text-accent-contrast transition-colors';
const BOX_ON = 'border-accent bg-accent';

export type CheckboxProps = Omit<ComponentProps<typeof Base.Root>, 'className'> & {
  className?: string;
  label?: ReactNode;
  description?: ReactNode;
  size?: CheckboxSize;
};

/**
 * A choice the user confirms later, such as a setting saved with a form.
 * An immediate on/off is a Switch. `indeterminate` shows a dash, for a
 * parent whose children are partly checked. The label is part of the hit
 * target.
 */
export function Checkbox({ label, description, size = 'md', className, ...props }: CheckboxProps) {
  const box = (
    <Base.Root
      {...props}
      className={cn(
        BOX_BASE,
        BOX[size],
        'outline-none focus-visible:focus-ring',
        'not-touch:hover:border-accent data-checked:border-accent data-checked:bg-accent data-indeterminate:border-accent data-indeterminate:bg-accent',
        'data-invalid:border-failure data-invalid:ring-2 data-invalid:ring-failure/20',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        !label && className
      )}
    >
      <Base.Indicator
        render={(indicatorProps, state) => (
          <span {...indicatorProps}>
            {state.indeterminate ? <Minus weight="bold" /> : <Check weight="bold" />}
          </span>
        )}
        className="flex"
      />
    </Base.Root>
  );
  if (!label) return box;
  return (
    <label
      className={cn(
        'flex items-start gap-2 text-sm text-ink has-data-disabled:cursor-not-allowed has-data-disabled:text-ink-disabled',
        className
      )}
    >
      <span className="flex h-5 items-center">{box}</span>
      <span className="flex flex-col gap-0.5">
        {label}
        {description && <span className="text-xs text-ink-subtle">{description}</span>}
      </span>
    </label>
  );
}

export type CheckboxGroupProps = Omit<ComponentProps<typeof BaseGroup>, 'className'> & {
  className?: string;
  /** The group's name, rendered as a legend. */
  label?: ReactNode;
  description?: ReactNode;
  /** Pins under the group while it is invalid. */
  error?: ReactNode;
  invalid?: boolean;
  name?: string;
};

/**
 * A set of Checkboxes under one legend, with one value: the checked
 * values. A child Checkbox takes `value`; a Checkbox with `parent` checks
 * them all.
 */
export function CheckboxGroup({
  label,
  description,
  error,
  invalid,
  name,
  disabled,
  className,
  children,
  ...props
}: CheckboxGroupProps) {
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
      <Fieldset.Root
        render={<BaseGroup {...props} disabled={disabled} />}
        className="flex flex-col gap-2"
      >
        {label && (
          <Fieldset.Legend className="mb-0.5 text-xs font-medium text-ink-muted">
            {label}
          </Fieldset.Legend>
        )}
        {children}
      </Fieldset.Root>
    </Field>
  );
}

/**
 * A check for a row that is itself the hit target, in a multi-select list.
 * Visual only: the row handles input and carries the checked state.
 */
export function InlineCheckbox({ checked, size = 'md' }: { checked: boolean; size?: CheckboxSize }) {
  return (
    <span aria-hidden className={cn(BOX_BASE, BOX[size], checked && BOX_ON)}>
      {checked && <Check weight="bold" />}
    </span>
  );
}
